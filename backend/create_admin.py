"""Promote an existing user to admin.
Usage: python scripts/create_admin.py user@example.com
"""
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parents[1]))
from app.database.database import SessionLocal
from app.models.user import User, RoleEnum

if len(sys.argv) != 2:
    raise SystemExit("Usage: python scripts/create_admin.py user@example.com")

db = SessionLocal()
try:
    user = db.query(User).filter(User.email == sys.argv[1]).first()
    if not user:
        raise SystemExit("User not found. Register the account first.")
    user.role = RoleEnum.admin
    user.is_active = True
    db.commit()
    print(f"Admin role assigned to {user.email}")
finally:
    db.close()
