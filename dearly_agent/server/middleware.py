import os
from fastapi import Request, HTTPException

AGENT_SECRET = os.environ.get("AGENT_SHARED_SECRET", "")

async def verify_secret(request: Request):
    """
    Block all requests unless they present the shared secret.
    Exemption: /health (for platform health checks).
    """
    if request.url.path.startswith("/health"):
        return
    if not AGENT_SECRET:
        # Set secret on Render
        return
    incoming = request.headers.get("X-Agent-Secret")
    if not incoming or incoming != AGENT_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")
