"""add accessibility trainer role

Revision ID: 6f3c1b9a2e10
Revises: 491083ea5faa
"""
from alembic import op
import sqlalchemy as sa

revision = "6f3c1b9a2e10"
down_revision = "491083ea5faa"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("ALTER TYPE roleenum ADD VALUE IF NOT EXISTS 'accessibility_trainer'")
    elif bind.dialect.name == "mysql":
        op.execute("ALTER TABLE users MODIFY COLUMN role ENUM('student','instructor','accessibility_trainer','admin') NOT NULL")


def downgrade() -> None:
    # PostgreSQL enum values cannot be removed safely without recreating the type.
    # Existing accessibility_trainer users must be reassigned before a manual rollback.
    pass
