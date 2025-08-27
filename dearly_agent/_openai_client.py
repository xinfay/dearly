from openai import OpenAI
import base64
import os
import json
import uuid
import time
import requests  # If you prefer stdlib only, see the commented alt in _upload_b64_direct_to_blob()


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

    - api_key = API Key from OpenAI
    - model = model name for LLM
    """
    def __init__(self, api_key: str, model: str = "gpt-4.1-nano-2025-04-14") -> None:
        self._key = api_key
        self._model = model
        self._client = OpenAI(
            api_key=api_key,
            base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
        )
        self._context = []

        # Get the directory where this module is located
        module_dir = os.path.dirname(os.path.abspath(__file__))
        prompt_path = os.path.join(module_dir, 'prompt')

        with open(prompt_path, 'r') as f:
            self._context.append({"role": "developer", "content": f.read()})

    # --- NEW: direct upload to Vercel Blob; returns the final public URL
    def _upload_b64_direct_to_blob(self, b64_data: str, ext: str = "png") -> str:
        token = os.getenv("BLOB_READ_WRITE_TOKEN")
        if not token:
            raise RuntimeError("Missing BLOB_READ_WRITE_TOKEN")

        ext = (ext or "png").lstrip(".").lower()
        if ext not in ("png", "jpg", "jpeg", "webp"):
            ext = "png"

        content_type = (
            "image/png" if ext == "png"
            else "image/webp" if ext == "webp"
            else "image/jpeg"
        )

        # Create a reasonably unique path
        name = f"generated/{int(time.time())}-{uuid.uuid4().hex}.{ext}"

        # Decode base64 to bytes
        data = base64.b64decode(b64_data)

        # Vercel Blob REST v1: PUT with Bearer token
        # Docs expect:
        #   Authorization: Bearer <token>
        #   x-vercel-blob-version: 1
        # Response JSON includes { "url": "https://..." }
        resp = requests.put(
            f"https://blob.vercel-storage.com/{name}",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": content_type,
                "x-vercel-blob-version": "1",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
            data=data,
            timeout=30,
        )
        resp.raise_for_status()
        payload = resp.json()
        url = payload.get("url")
        if not url:
            raise RuntimeError("Vercel Blob did not return a 'url'.")
        return url

        # --- If you prefer stdlib only (no requests), replace the call above with this:
        # import http.client, json as _json
        # conn = http.client.HTTPSConnection("blob.vercel-storage.com", timeout=30)
        # path = f"/{name}"
        # headers = {
        #     "Authorization": f"Bearer {token}",
        #     "Content-Type": content_type,
        #     "x-vercel-blob-version": "1",
        #     "Cache-Control": "public, max-age=31536000, immutable",
        # }
        # conn.request("PUT", path, body=data, headers=headers)
        # r = conn.getresponse()
        # body = r.read()
        # if r.status < 200 or r.status >= 300:
        #     raise RuntimeError(f"Blob upload failed: {r.status} {body.decode('utf-8', 'ignore')}")
        # payload = _json.loads(body.decode("utf-8"))
        # url = payload.get("url")
        # if not url:
        #     raise RuntimeError("Vercel Blob did not return a 'url'.")
        # return url

    # --- CHANGED: now returns a URL instead of writing output.png
    def _generate_image(self, prompt: str):
        img = self._client.images.generate(
            model="gpt-image-1",
            prompt=prompt,
            n=1,
            size="1024x1024",
            quality="low"
        )
        b64 = img.data[0].b64_json
        image_url = self._upload_b64_direct_to_blob(b64, ext="png")
        return image_url

    # (kept: might still be useful elsewhere in your app)
    def encode_image(self, image_path):
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")

    def response(self, message: str = None, debug=False) -> str:
        if message:
            # If context is empty or only contains the prompt, reset and re-add prompt
            if not self._context or (len(self._context) == 1 and self._context[0].get("role") == "developer"):
                self._context = []
                # Re-add prompt
                module_dir = os.path.dirname(os.path.abspath(__file__))
                prompt_path = os.path.join(module_dir, 'prompt')
                with open(prompt_path, 'r') as f:
                    self._context.append({"role": "developer", "content": f.read()})
            self._context.append({"role": "user", "content": message})
            print(f"[User]: {message}")

        # Limit context size to last 5 messages and truncate long message contents
        def summarize_img_tag(msg):
            if isinstance(msg, dict) and "content" in msg and isinstance(msg["content"], str):
                c = msg["content"]
                # If assistant message contains a URL marker, replace with a short tag
                if msg.get("role") == "assistant" and "[Image URL:" in c:
                    msg = msg.copy()
                    msg["content"] = "[Image URL shown]"
                elif len(c) > 200:
                    msg = msg.copy()
                    msg["content"] = c[-200:]
            return msg

        self._context = [summarize_img_tag(m) for m in self._context[-5:]]

        if debug:
            print("\n[DEBUG] Context sent to model:")
            for i, msg in enumerate(self._context):
                print(f"  [{i}] {msg}")

        response = self._client.responses.create(
            model=self._model,
            input=self._context,
            tools=TOOLS,
        )

        # Check for tool/function call in the response
        for tool_call in response.output:
            if tool_call.type == "function_call":
                print(f"[Tool Call]: {tool_call}")
                self._context.append(tool_call)

                if tool_call.name == "_generate_image":
                    args = json.loads(tool_call.arguments)
                    prompt = args["prompt"]

                    image_url = self._generate_image(prompt)

                    # Return a URL (not local file)
                    result_message = f"[Image URL: {image_url}]"
                    print(f"[Tool Call Output]: {result_message}")

                    # Record function output for traceability (kept out of the next input)
                    self._context.append({
                        "type": "function_call_output",
                        "call_id": tool_call.call_id,
                        "output": result_message
                    })

                    # Continue with followup prompt as before
                    filtered_context = []
                    for msg in self._context:
                        if isinstance(msg, dict) and msg.get("type") == "function_call_output":
                            continue  # skip function_call_output
                        elif isinstance(msg, dict):
                            filtered_context.append(summarize_img_tag(msg))
                    filtered_context = filtered_context[-5:]

                    if debug:
                        print("\n[DEBUG] Filtered context for follow-up model call:")
                        for i, msg in enumerate(filtered_context):
                            print(f"  [{i}] {msg}")

                    filtered_context.append({
                        "role": "system",
                        "content": (
                            "You have just generated and shown an image to the user via a URL. "
                            "Ask for feedback and whether they'd like any changes or edits. "
                            "Do not generate another image until they respond with feedback."
                        )
                    })
                    followup_response = self._client.responses.create(
                        model=self._model,
                        input=filtered_context,
                        tools=TOOLS,
                    )
                    followup_text = (followup_response.output_text or "").strip()
                    if not followup_text:
                        followup_text = "Would you like to edit or improve this design? Let me know what to change!"

                    self._context.append({"role": "assistant", "content": followup_text})
                    return [result_message, followup_text]

        # Default: add the assistant's text response
        self._context.append({"role": "assistant", "content": response.output_text})
        print(f"[Assistant]: {response.output_text}")
        return [response.output_text]
