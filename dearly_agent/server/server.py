
import sys
import os
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dearly_agent._openai_client import Client
import uvicorn
from dotenv import load_dotenv


class ServerClient():
    def __init__(self) -> None:
        self.client = None
        self.debug = False




app = FastAPI()
client = ServerClient()
# Allow CORS for frontend (localhost:5176) and any origin for dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client at startup
@app.on_event("startup")
def startup_event():
    env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src/backend/.env'))
    load_dotenv()
    key = os.getenv("OPENAI_API_KEY")
    if key:
        client.client = Client(key)
        client.debug = False
    else:
        print("OPENAI_API_KEY not found in .env file.")


class UserMessage(BaseModel):
            message: str



class AIResponse(BaseModel):
    response: str

class ModelInfo(BaseModel):
    model: str
@app.get("/model", response_model=ModelInfo)
def get_model():
    """
    Endpoint to get the current GPT model name used by the AI client.
    """
    if client.client is None:
        return ModelInfo(model="Error: AI client not initialized.")
    # Try to get the model name from the client
    model_name = getattr(client.client, "_model", None)
    if model_name is None:
        return ModelInfo(model="Unknown")
    return ModelInfo(model=model_name)



# Endpoint to serve generated image
@app.get("/image")
def get_image():
    backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "src", "backend")
    image_path = os.path.join(backend_dir, "output.png")
    if os.path.exists(image_path):
        return FileResponse(image_path, media_type="image/png")
    else:
        return {"error": "Image not found"}

@app.get("/")
def read_root():
    # Get the directory where this module is located
    module_dir = os.path.dirname(os.path.abspath(__file__))
    public_dir = os.path.join(module_dir, "public")
    index_path = os.path.join(public_dir, "index.html")
    return FileResponse(index_path)

@app.post("/chat", response_model=AIResponse)
@app.post("/chat")
def chat_with_ai(user_message: UserMessage):
    """
    Endpoint to chat with the AI art designer.
    Takes a user message and returns an AI response.
    """
    try:
        if client.client is None:
            return {"response": ["Error: AI client not initialized."]}
        # Get response from the AI
        ai_response = client.client.response(user_message.message, debug=client.debug)
        return {"response": ai_response}
    except Exception as e:
        # Always return a valid JSON response
        return {"response": [f"Error: {str(e)}"]}


def serve(key, debug=False):
    client.client = Client(key)
    client.debug = debug
    # Run the server (no reload with class approach)
    # changed to 8001 to avoid conflicts, should change back
    uvicorn.run("dearly_agent.server.server:app", host="127.0.0.1", port=8004, reload=False)


