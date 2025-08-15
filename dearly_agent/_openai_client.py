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
        # Append user message + re-load prompt if context was reset
        if message:
            if not self._context or (len(self._context) == 1 and self._context[0].get("role") == "developer"):
                # reset & re-add prompt
                self._context = []
                module_dir = os.path.dirname(os.path.abspath(__file__))
                prompt_path = os.path.join(module_dir, 'prompt')
                with open(prompt_path, 'r') as f:
                    self._context.append({"role": "developer", "content": f.read()})
            self._context.append({"role": "user", "content": message})
            print(f"[User]: {message}")

        # Limit context to last 5 messages, and summarize image markers/long texts
        def summarize_img_tag(msg):
            if isinstance(msg, dict) and "content" in msg and isinstance(msg["content"], str):
                if msg.get("role") == "assistant" and '<img src="data:image/png;base64,' in msg["content"]:
                    msg = msg.copy()
                    msg["content"] = "[Image generated: output.png]"
                elif len(msg["content"]) > 200:
                    msg = msg.copy()
                    msg["content"] = msg["content"][-200:]
            return msg

        self._context = [summarize_img_tag(m) for m in self._context[-5:]]

        print("\n[DEBUG] Context sent to model:")
        for i, msg in enumerate(self._context):
            print(f"  [{i}] {msg}")

        # ==== Primary path: use the Responses API when available ====
        use_responses = hasattr(self._client, "responses") and hasattr(self._client.responses, "create")

        if use_responses:
            response = self._client.responses.create(
                model=self._model,
                input=self._context,   # supports developer/user/assistant roles
                tools=TOOLS,
            )

            # Handle tool/function calls
            for tool_call in getattr(response, "output", []) or []:
                if getattr(tool_call, "type", None) == "function_call":
                    print(f"[Tool Call]: {tool_call}")
                    self._context.append(tool_call)

                    if tool_call.name == "_generate_image":
                        args = json.loads(tool_call.arguments or "{}")
                        prompt = args.get("prompt", "")
                        image_path = self._generate_image(prompt)

                        # Return only plain text marker for the UI
                        result_message = "[Image generated: output.png]"
                        print(f"[Tool Call Output]: {result_message}")
                        self._context.append({
                            "type": "function_call_output",
                            "call_id": tool_call.call_id,
                            "output": result_message
                        })

                        # Build filtered context for a follow-up prompt
                        filtered_context = []
                        for msg in self._context:
                            if isinstance(msg, dict) and msg.get("type") == "function_call_output":
                                continue
                            elif isinstance(msg, dict):
                                filtered_context.append(summarize_img_tag(msg))
                        filtered_context = filtered_context[-5:]

                        print("\n[DEBUG] Filtered context for follow-up model call:")
                        for i, msg in enumerate(filtered_context):
                            print(f"  [{i}] {msg}")

                        filtered_context.append({
                            "role": "system",
                            "content": (
                                "You have just generated and shown an image to the user. "
                                "Now, you must ask the user for feedback about the image and specifically inquire if "
                                "they would like any changes or edits. Do not proceed to generate another image until "
                                "the user has responded with their feedback or requested edits."
                            )
                        })

                        followup_response = self._client.responses.create(
                            model=self._model,
                            input=filtered_context,
                            tools=TOOLS,
                        )
                        followup_text = getattr(followup_response, "output_text", "") or ""
                        self._context.append({"role": "assistant", "content": followup_text})

                        if not followup_text.strip():
                            followup_text = "Would you like to edit or improve this design? Let me know your suggestions!"

                        return [result_message, followup_text]

            # Default text response via Responses API
            text = getattr(response, "output_text", "") or ""
            self._context.append({"role": "assistant", "content": text})
            print(f"[Assistant]: {text}")
            return [text]

        # ==== Fallback path: Chat Completions (text-only), if `.responses` isn't present ====
        # Map developer -> system for Chat Completions compatibility
        def map_roles_for_chat(msg):
            if not isinstance(msg, dict):
                return None
            role = msg.get("role")
            content = msg.get("content")
            if role == "developer":
                role = "system"
            if role not in ("system", "user", "assistant"):
                # skip unknown roles (e.g., tool structures) for the fallback
                return None
            if not isinstance(content, str):
                return None
            return {"role": role, "content": content}

        chat_messages = [m for m in (map_roles_for_chat(m) for m in self._context) if m is not None]

        # Use a safe chat model for the fallback (your Responses model may not be valid for chat.completions)
        fallback_model = os.getenv("FALLBACK_CHAT_MODEL", "gpt-4o-mini")

        chat = self._client.chat.completions.create(
            model=fallback_model,
            messages=chat_messages
        )
        text = (chat.choices[0].message.content or "").strip()
        self._context.append({"role": "assistant", "content": text})
        print(f"[Assistant/Fallback]: {text}")
        return [text]
