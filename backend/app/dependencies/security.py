"""
SignLearn Security & Authentication Dependencies Foundation.
Do NOT implement active authentication logic in Phase 1.
This file provides reusable dependency injection signatures for future authentication/authorization guards.
"""

from typing import Optional


async def get_current_user_placeholder() -> Optional[dict]:
    """
    Placeholder dependency for fetching authenticated user context in future modules.
    """
    return None


async def require_roles_placeholder(roles: list[str]):
    """
    Placeholder dependency generator for RBAC guards (Learner, Instructor, Accessibility Trainer, Administrator).
    """
    async def role_checker():
        return True
    return role_checker
