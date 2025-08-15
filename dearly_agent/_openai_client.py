# dearly_agent/_openai_client.py
from openai import OpenAI
import base64
import os
import json

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
                    "description": "Text prompt to guide image generation"
                }
            },
            "required": ["prompt"],
            "additionalProperties": False
        }
    }
]

class Client:
    """
    OpenAI Client Instance

    - api_key: API Key from OpenAI
    - model: default model name for Responses API
    """
    def __init__(self, api_key: str, model: str = "gpt-4.1-nano-2025-04-14") -> None:
        self._key = api_key
        self._model = model
        self._client = OpenAI(api_key=api_key)
        self._context = []

        # Load the developer prompt into context
        module_dir = os.path.dirname(os.path.abspath(__file__))
        prompt_path = os.path.join(module_dir, 'prompt')
        with open(prompt_path, 'r') as f:
            self._context.append({"role": "developer", "content": f.read()})

    def _generate_image(self, prompt: str):
        img = self._client.images.generate(
            model="gpt-image-1",
            prompt=prompt,
            n=1,
            size="1024x1024",
            quality="low"
        )

        image_bytes = base64.b64decode(img.data[0].b64_json)
        # Save image to src/backend/output.png so it matches the server's /image endpoint
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        backend_dir = os.path.join(project_root, "src", "backend")
        os.makedirs(backend_dir, exist_ok=True)
        image_path = os.path.join(backend_dir, "output.png")
        with open(image_path, "wb") as f:
            f.write(image_bytes)
        return "output.png"

    def encode_image(self, image_path):
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")

    def response(self, message: str = None, debug=False):
        # Append user message + ensure developer prompt present
        if message:
            if not self._context or (len(self._context) == 1 and self._context[0].get("role") == "developer"):
                self._context = []
                module_dir = os.path.dirname(os.path.abspath(__file__))
                prompt_path = os.path.join(module_dir, 'prompt')
                with open(prompt_path, 'r') as f:
                    self._context.append({"role": "developer", "content": f.read()})
            self._context.append({"role": "user", "content": message})
            print(f"[User]: {message}")

        # Helper: compress long assistant image contents into a marker
        def summarize_img_tag(msg):
            if isinstance(msg, dict) and "content" in msg and isinstance(msg["content"], str):
                if msg.get("role") == "assistant" and '<img src="data:image/png;base64,' in msg["content"]:
                    msg = msg.copy()
                    msg["content"] = "[Image generated: output.png]"
                elif len(msg["content"]) > 1200:
                    msg = msg.copy()
                    msg["content"] = msg["content"][:1200]
            return msg

        # Keep only a short rolling context
        self._context = [summarize_img_tag(m) for m in self._context[-6:]]

        print("\n[DEBUG] Context sent to model:")
        for i, msg in enumerate(self._context):
            print(f"  [{i}] {msg}")

        # Heuristic: did the user “confirm” to proceed? (then we’ll force an image)
        def user_confirmed(text: str) -> bool:
            t = (text or "").lower().strip()
            return any(p in t for p in [
                "i'd like that", "id like that", "looks good", "let's do it", "lets do it",
                "proceed", "go ahead", "yes please", "yes, please", "that works", "make it",
                "generate it", "create it", "ship it"
            ])

        latest_user = ""
        for m in reversed(self._context):
            if m.get("role") == "user" and isinstance(m.get("content"), str):
                latest_user = m["content"]
                break

        use_responses = hasattr(self._client, "responses") and hasattr(self._client.responses, "create")

        # ==== 1) Try the Responses API with tools (your current flow) ====
        tried_tool = False
        if use_responses:
            response = self._client.responses.create(
                model=self._model,
                input=self._context,
                tools=TOOLS,
                tool_choice="auto",  # model may or may not choose the tool
            )

            # Look for tool/function calls
            for item in (getattr(response, "output", []) or []):
                if getattr(item, "type", None) == "function_call":
                    tried_tool = True
                    tool_call = item
                    print(f"[Tool Call]: {tool_call}")

                    if tool_call.name == "_generate_image":
                        args = json.loads(tool_call.arguments or "{}")
                        prompt = args.get("prompt", "") or latest_user
                        image_path = self._generate_image(prompt)

                        result_message = "[Image generated: output.png]"
                        print(f"[Tool Call Output]: {result_message}")
                        self._context.append({
                            "type": "function_call_output",
                            "call_id": tool_call.call_id,
                            "output": result_message
                        })

                        # Follow-up nudge
                        filtered_context = []
                        for msg in self._context:
                            if isinstance(msg, dict) and msg.get("type") == "function_call_output":
                                continue
                            elif isinstance(msg, dict):
                                filtered_context.append(summarize_img_tag(msg))
                        filtered_context = filtered_context[-6:]
                        filtered_context.append({
                            "role": "system",
                            "content": ("You have just generated and shown an image to the user. "
                                        "Now ask for feedback and whether they want any edits. "
                                        "Do not generate another image until they respond.")
                        })

                        follow = self._client.responses.create(
                            model=self._model,
                            input=filtered_context,
                        )
                        follow_text = getattr(follow, "output_text", "") or "Would you like any changes?"
                        self._context.append({"role": "assistant", "content": follow_text})
                        return [result_message, follow_text]

            # If no tool call, but we got text — return it (we may still force image below)
            text = getattr(response, "output_text", "") or ""
            if text:
                self._context.append({"role": "assistant", "content": text})
                print(f"[Assistant]: {text}")

                # ==== 2) If user confirmed AND model didn’t call the tool, force-generate ====
                if user_confirmed(latest_user) and not tried_tool:
                    # Use last assistant design text as the image brief if available
                    assist_text = ""
                    for m in reversed(self._context):
                        if m.get("role") == "assistant" and isinstance(m.get("content"), str):
                            assist_text = m["content"]
                            break
                    img_prompt = (assist_text or latest_user or "A printable design for the requested mug")
                    self._generate_image(img_prompt)
                    result_message = "[Image generated: output.png]"
                    self._context.append({"role": "assistant", "content": result_message})

                    # Gentle follow-up
                    follow_text = "Image created! Would you like any tweaks before we proceed?"
                    self._context.append({"role": "assistant", "content": follow_text})
                    print(f"[Forced Generation]: {img_prompt}")
                    return [result_message, follow_text]

                return [text]

        # ==== 3) Fallback: Chat Completions (text only) if Responses API is unavailable ====
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
        chat = self._client.chat.completions.create(
            model=fallback_model,
            messages=chat_messages
        )
        text = (chat.choices[0].message.content or "").strip()
        self._context.append({"role": "assistant", "content": text})

        # If user confirmed in fallback, force-generate too
        if user_confirmed(latest_user):
            self._generate_image(text or latest_user)
            result_message = "[Image generated: output.png]"
            self._context.append({"role": "assistant", "content": result_message})
            follow_text = "Image created! Would you like any tweaks before we proceed?"
            self._context.append({"role": "assistant", "content": follow_text})
            return [result_message, follow_text]

        print(f"[Assistant/Fallback]: {text}")
        return [text]
