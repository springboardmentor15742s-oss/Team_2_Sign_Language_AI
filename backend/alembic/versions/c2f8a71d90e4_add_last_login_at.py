"""add last_login_at to users

Revision ID: c2f8a71d90e4
Revises: b1e7f4a9c3d0
"""
from alembic import op
import sqlalchemy as sa

revision = "c2f8a71d90e4"
down_revision = "b1e7f4a9c3d0"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True))


def downgrade():
    op.drop_column("users", "last_login_at")
