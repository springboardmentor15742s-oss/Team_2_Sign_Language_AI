"""
JWT Token Management Module (Scaffold - Phase 1).
Do NOT implement authentication logic now.

Future Responsibilities:
- Encode access tokens with user ID, role, and expiration claim.
- Encode refresh tokens for session prolongation.
- Decode and validate JWT signatures using JWT_SECRET.
"""


def create_access_token(data: dict) -> str:
    """Placeholder signature for creating JWT access token."""
    raise NotImplementedError("Authentication logic is reserved for Phase 2+")


def decode_access_token(token: str) -> dict:
    """Placeholder signature for decoding and verifying JWT token."""
    raise NotImplementedError("Authentication logic is reserved for Phase 2+")
