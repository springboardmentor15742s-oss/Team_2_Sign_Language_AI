from fastapi import Header
from typing import Optional


async def get_user_agent(user_agent: Optional[str] = Header(None)) -> Optional[str]:
    """Dependency provider for extracting User-Agent header."""
    return user_agent


async def get_client_ip() -> str:
    """Placeholder dependency for client IP resolution."""
    return "127.0.0.1"
