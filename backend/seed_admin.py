#!/usr/bin/env python3
"""
SignSpeak Administrator Seeding Utility

Provisions or resets the platform administrator account in the database.
Reads ADMIN_EMAIL and ADMIN_PASSWORD from environment variables / .env,
or accepts optional CLI arguments.

Usage:
    python seed_admin.py
    python seed_admin.py --email admin@custom.local --password "SecretPass123!"
    python seed_admin.py --reset
"""

import sys
import os
import argparse
import logging

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.core.security import hash_password
from app.database.database import SessionLocal, engine, Base
import app.models  # noqa: F401
from app.models.user import User, RoleEnum

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("seed_admin")


def seed_admin(
    email: str = None,
    password: str = None,
    full_name: str = None,
    reset_if_exists: bool = False,
) -> bool:
    # Ensure database schema is ready
    Base.metadata.create_all(bind=engine)

    target_email = (email or settings.ADMIN_EMAIL or "admin@signspeak.com").strip().lower()
    target_password = password or settings.ADMIN_PASSWORD or "admin123"
    target_name = full_name or settings.ADMIN_FULL_NAME or "SignSpeak Administrator"

    if not target_email or not target_password:
        logger.error("ADMIN_EMAIL and ADMIN_PASSWORD must be provided.")
        return False

    db = SessionLocal()
    try:
        # Check if user with this email exists
        user = db.query(User).filter(User.email == target_email).first()

        if user:
            if user.role != RoleEnum.admin or reset_if_exists:
                user.role = RoleEnum.admin
                user.is_active = True
                user.full_name = target_name
                user.hashed_password = hash_password(target_password)
                db.commit()
                logger.info(f"Updated existing user '{target_email}' to Administrator with new password.")
            else:
                logger.info(f"Administrator account '{target_email}' already exists. No changes needed.")
            return True

        # Create brand new admin user
        new_admin = User(
            full_name=target_name,
            email=target_email,
            hashed_password=hash_password(target_password),
            role=RoleEnum.admin,
            is_active=True,
            bio="Platform Administrator",
        )
        db.add(new_admin)
        db.commit()
        logger.info(f"Administrator account successfully created: {target_email}")
        return True

    except Exception as e:
        logger.error(f"Failed to seed administrator account: {e}")
        db.rollback()
        return False
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="SignSpeak Admin Seeding Tool")
    parser.add_argument("--email", type=str, default=None, help="Administrator email address")
    parser.add_argument("--password", type=str, default=None, help="Administrator password")
    parser.add_argument("--name", type=str, default=None, help="Administrator full name")
    parser.add_argument("--reset", action="store_true", help="Force reset password if account exists")

    args = parser.parse_args()
    success = seed_admin(
        email=args.email,
        password=args.password,
        full_name=args.name,
        reset_if_exists=args.reset,
    )
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
