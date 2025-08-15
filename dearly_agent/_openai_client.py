# dearly_agent/_openai_client.py
from openai import OpenAI
import base64
import os
import json

# Single tool your model can call
TOOLS = [
    {
        "type": "function",
        "name": "_generate_image",
        "description": "Generates an image based on your prompt",
        "parameters": {
            "type": "object",
            "properties": {
                "prompt": {
                    "type": "string",
                    "description": "Short, printable design description for the product"
                }
            },
            "required": ["prompt"],
            "additionalProperties": False
        }
    }
]

class Client:
    """
    OpenAI Client wrapper with:
      - Responses API + tool-calling (primary)
      - Fallback to Chat Completions if Responses attr isn't present
      - Forced image generation if the user explicitly asks to generate
    """
    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        self._key = api_key
        self._model = model
        self._client = OpenAI(api_key=api_key)
        self._context = []
        # Load developer prompt once
        self._add_developer_prompt()

    def _add_developer_prompt(self):
        module_dir = os.path.dirname(os.path.abspath(__file__))
        prompt_path = os.path.join(module_dir, 'prompt')
        if os.path.exists(prompt_path):
            with open(prompt_path, 'r') as f:
                self._context.append({"role": "developer", "content": f.read()})

    # ==== Image generation (writes src/backend/output.png) ====
    def _generate_image(self, prompt: str):
        img = self._client.images.generate(
            model="gpt-image-1",
            prompt=prompt,
            n=1,
            size="1024x1024",
            quality="low"
        )
        image_bytes = base64.b64decode(img.data[0].b64_json)
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        backend_dir = os.path.join(project_root, "src", "backend")
        os.makedirs(backend_dir, exist_ok=True)
        out_path = os.path.join(backend_dir, "output.png")
        with open(out_path, "wb") as f:
            f.write(image_bytes)
        return "output.png"

    def encode_image(self, image_path):
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")

    # ==== Chat entrypoint ====
    def response(self, message: str = None, debug: bool = False):
        # Ensure prompt present & append user
        if message:
            if not self._context or self._context[0].get("role") != "developer":
                self._context = []
                self._add_developer_prompt()
            self._context.append({"role": "user", "content": message})
            print(f"[User]: {message}")

        # Truncate / sanitize rolling context
        def summarize_img_tag(msg):
            if isinstance(msg, dict) and isinstance(msg.get("content"), str):
                if msg.get("role") == "assistant" and '<img src="data:image/png;base64,' in msg["content"]:
                    msg = msg.copy()
                    msg["content"] = "[Image generated: output.png]"
                elif len(msg["content"]) > 1200:
                    m = msg.copy()
                    m["content"] = msg["content"][:1200]
                    return m
            return msg

        self._context = [summarize_img_tag(m) for m in self._context[-6:]]

        print("\n[DEBUG] Context sent to model:")
        for i, msg in enumerate(self._context):
            print(f"  [{i}] {msg}")

        # Heuristic: user explicitly asked to generate
        def user_wants_image(text: str) -> bool:
            if not text:
                return False
            t = text.lower()
            triggers = [
                "use the image generation tool", "generate the image", "make an image",
                "create the image", "proceed", "let's do it", "lets do it",
                "i'd like that", "id like that", "yes please", "ship it", "go ahead"
            ]
            return any(p in t for p in triggers)

        latest_user = next(
            (m["content"] for m in reversed(self._context) if m.get("role") == "user" and isinstance(m.get("content"), str)),
            ""
        )

        # ==== Primary: Responses + tools ====
        use_responses = hasattr(self._client, "responses") and hasattr(self._client.responses, "create")
        if use_responses:
            response = self._client.responses.create(
                model=self._model,
                input=self._context,     # supports developer/user/assistant roles
                tools=TOOLS,
                tool_choice="auto",
            )

            # Handle function calls if present
            called_tool = False
            for item in (getattr(response, "output", []) or []):
                if getattr(item, "type", None) == "function_call":
                    called_tool = True
                    print(f"[Tool Call]: {item}")
                    self._context.append(item)
                    if item.name == "_generate_image":
                        try:
                            args = json.loads(item.arguments or "{}")
                        except Exception:
                            args = {}
                        prompt = (args.get("prompt") or latest_user or "A printable design for the requested product")
                        self._generate_image(prompt)

                        marker = "[Image generated: output.png]"
                        self._context.append({"role": "assistant", "content": marker})

                        # Short follow-up nudging edits
                        follow_ctx = [summarize_img_tag(m) for m in self._context[-6:]]
                        follow_ctx.append({
                            "role": "system",
                            "content": "You have just generated and shown an image. Ask the user if they want any changes. Do not generate another image until they respond."
                        })
                        follow = self._client.responses.create(model=self._model, input=follow_ctx)
                        follow_text = getattr(follow, "output_text", "") or "Image created! Would you like any tweaks?"
                        self._context.append({"role": "assistant", "content": follow_text})
                        return [marker, follow_text]

            # No tool call — we may still get text
            text = getattr(response, "output_text", "") or ""
            if text:
                self._context.append({"role": "assistant", "content": text})
                print(f"[Assistant]: {text}")

            # If user explicitly asked to generate and model didn’t call the tool → force generate
            if user_wants_image(latest_user) and not called_tool:
                # Use last assistant description if available
                last_assistant = next(
                    (m["content"] for m in reversed(self._context) if m.get("role") == "assistant" and isinstance(m.get("content"), str)),
                    ""
                )
                img_prompt = last_assistant or latest_user or "A printable design for the requested product"
                self._generate_image(img_prompt)
                marker = "[Image generated: output.png]"
                self._context.append({"role": "assistant", "content": marker})
                follow = "Image created! Would you like any tweaks before we proceed?"
                self._context.append({"role": "assistant", "content": follow})
                print(f"[Forced Generation]: {img_prompt}")
                return [marker, follow]

            # Otherwise return text (or empty string)
            return [text]

        # ==== Fallback: Chat Completions (text only) ====
        def map_roles_for_chat(msg):
            if not isinstance(msg, dict):
                return None
            role = msg.get("role")
            content = msg.get("content")
            if role == "developer":
                role = "system"
            if role not in ("system", "user", "assistant") or not isinstance(content, str):
                return None
            return {"role": role, "content": content}

        chat_messages = [m for m in (map_roles_for_chat(m) for m in self._context) if m is not None]
        fallback_model = os.getenv("FALLBACK_CHAT_MODEL", "gpt-4o-mini")
        chat = self._client.chat.completions.create(model=fallback_model, messages=chat_messages)
        text = (chat.choices[0].message.content or "").strip()
        self._context.append({"role": "assistant", "content": text})

        if user_wants_image(latest_user):
            # Use the assistant's text as the image brief if available
            img_prompt = text or latest_user or "A printable design for the requested product"
            self._generate_image(img_prompt)
            marker = "[Image generated: output.png]"
            self._context.append({"role": "assistant", "content": marker})
            follow = "Image created! Would you like any tweaks before we proceed?"
            self._context.append({"role": "assistant", "content": follow})
            return [marker, follow]

        print(f"[Assistant/Fallback]: {text}")
        return [text]
