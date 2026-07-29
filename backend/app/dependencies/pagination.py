from fastapi import Query
from pydantic import BaseModel, Field


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1, description="Page number starting from 1")
    page_size: int = Field(default=10, ge=1, le=100, description="Items per page (max 100)")


def get_pagination_params(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page")
) -> PaginationParams:
    """Dependency provider for standard list pagination."""
    return PaginationParams(page=page, page_size=page_size)
