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

    - api_key = API Key from OpenAI
    - model = model name for LLM
    
    """
    def __init__(self, api_key: str, model: str = "gpt-4.1-nano-2025-04-14") -> None:
        self._key = api_key
        self._model = model
        self._client = OpenAI(api_key=api_key)
        self._context = []
        
        # Get the directory where this module is located
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
        # Limit context size to last 5 messages and truncate long message contents to prevent overflow
        def summarize_img_tag(msg):
            if isinstance(msg, dict) and "content" in msg and isinstance(msg["content"], str):
                # If assistant message contains base64 image tag, summarize for context
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
                    image_path = self._generate_image(prompt)
                    # Return only plain text for image generation
                    result_message = "[Image generated: output.png]"
                    print(f"[Tool Call Output]: {result_message}")
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

                    print("\n[DEBUG] Filtered context for follow-up model call:")
                    for i, msg in enumerate(filtered_context):
                        print(f"  [{i}] {msg}")

                    filtered_context.append({
                        "role": "system",
                        "content": (
                            "You have just generated and shown an image to the user. "
                            "Now, you must ask the user for feedback about the image and specifically inquire if they would like any changes or edits. "
                            "Do not proceed to generate another image until the user has responded with their feedback or requested edits."
                        )
                    })
                    followup_response = self._client.responses.create(
                        model=self._model,
                        input=filtered_context,
                        tools=TOOLS,
                    )
                    followup_text = followup_response.output_text
                    self._context.append({"role": "assistant", "content": followup_text})
                    # Always return image marker and edit suggestion prompt after image generation
                    edit_prompt = "Would you like to edit or improve this design? Let me know your suggestions!"
                    # If followup_text is empty, use edit_prompt
                    if not followup_text or followup_text.strip() == "":
                        followup_text = edit_prompt
                    return [result_message, followup_text]

        # Default: add the assistant's text response
        self._context.append({"role": "assistant", "content": response.output_text})
        print(f"[Assistant]: {response.output_text}")
        return [response.output_text]
    