import os
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Your existing OpenAI client
from dearly_agent._openai_client import Client

# Secret guard
from dearly_agent.server.middleware import verify_secret

# ---- App setup ----
# Hide docs/openapi in production; still fine locally.
app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)

# CORS: not strictly needed since we NEVER call the agent from browser in prod.
# Keep localhost origins for local dev/testing.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple holder for OpenAI client
class ServerClient:
    def __init__(self) -> None:
        self.client = None
        self.debug = False

client = ServerClient()

# ---- Startup: load env and init OpenAI client ----
@app.on_event("startup")
def startup_event():
    import openai, httpx
        print("OPENAI VERSION:", getattr(openai, "__version__", "unknown"))
        print("HTTPX VERSION:", getattr(httpx, "__version__", "unknown"))
        try:
            from openai import OpenAI
            _tmp = OpenAI(api_key=key or "sk-...dummy")
            print("HAS RESPONSES:", hasattr(_tmp, "responses"))
        except Exception as e:
            print("OPENAI INIT ERROR:", repr(e))
            
    # On Render, env vars are provided by the platform; load_dotenv is harmless locally.
    load_dotenv()
    key = os.getenv("OPENAI_API_KEY")
    if key:
        client.client = Client(key)
        client.debug = False
    else:
        print("OPENAI_API_KEY not set. The /chat endpoint will return an error.")

# ---- Auth middleware ----
@app.middleware("http")
async def secret_middleware(request: Request, call_next):
    # Block requests if secret missing/invalid (except /health)
    try:
        await verify_secret(request)
    except Exception as e:
        # Always return JSON error
        return JSONResponse(status_code=getattr(e, "status_code", 401),
                            content={"detail": getattr(e, "detail", "Unauthorized")})
    return await call_next(request)

# ---- Models ----
class UserMessage(BaseModel):
    message: str

# ---- Health ----
@app.get("/health")
def health():
    return {"ok": True}

# ---- Image serving ----
@app.get("/image")
def get_image():
    """
    Serves the latest generated image from src/backend/output.png
    (written by _openai_client after generation).
    """
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    backend_dir = os.path.join(project_root, "src", "backend")
    image_path = os.path.join(backend_dir, "output.png")
    if os.path.exists(image_path):
        return FileResponse(image_path, media_type="image/png")
    return JSONResponse(status_code=404, content={"error": "Image not found"})

# ---- Chat ----
@app.post("/chat")
def chat_with_ai(user_message: UserMessage):
    """
    Takes a user message; returns a list of one or two strings.
    If an image is generated, the first entry will be the marker:
      "[Image generated: output.png]"
    """
    if client.client is None:
        return {"response": ["Error: AI client not initialized."]}
    try:
        ai_response = client.client.response(user_message.message, debug=client.debug)
        return {"response": ai_response}
    except Exception as e:
        return {"response": [f"Error: {str(e)}"]}
