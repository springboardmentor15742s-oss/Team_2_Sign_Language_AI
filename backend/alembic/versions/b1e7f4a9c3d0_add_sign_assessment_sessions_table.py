"""add sign assessment sessions table

Revision ID: b1e7f4a9c3d0
Revises: a8d29b01c3f2
"""
from alembic import op
import sqlalchemy as sa

revision = "b1e7f4a9c3d0"
down_revision = "a8d29b01c3f2"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "sign_assessment_sessions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("assessment_type", sa.String(length=30), nullable=False, server_default="single"),
        sa.Column("attempt_ids", sa.JSON(), nullable=False),
        sa.Column("total_questions", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("correct_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("incorrect_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("accuracy", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("average_confidence", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("strong_signs", sa.JSON(), nullable=True),
        sa.Column("weak_signs", sa.JSON(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_sign_assessment_sessions_id"), "sign_assessment_sessions", ["id"], unique=False)
    op.create_index(op.f("ix_sign_assessment_sessions_user_id"), "sign_assessment_sessions", ["user_id"], unique=False)


def downgrade():
    op.drop_index(op.f("ix_sign_assessment_sessions_user_id"), table_name="sign_assessment_sessions")
    op.drop_index(op.f("ix_sign_assessment_sessions_id"), table_name="sign_assessment_sessions")
    op.drop_table("sign_assessment_sessions")
