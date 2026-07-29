"""
Password Hashing & Verification Module (Scaffold - Phase 1).

Future Responsibilities:
- Hash plain-text user passwords using passlib with bcrypt context.
- Verify user password attempts against stored hash.
"""


def hash_password(password: str) -> str:
    """Placeholder signature for bcrypt password hashing."""
    raise NotImplementedError("Authentication logic is reserved for Phase 2+")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Placeholder signature for verifying password hash."""
    raise NotImplementedError("Authentication logic is reserved for Phase 2+")
