from datetime import datetime
from typing import Generic, Optional, TypeVar, List
from pydantic import BaseModel, Field

DataT = TypeVar("DataT")


class StandardResponse(BaseModel, Generic[DataT]):
    success: bool = True
    message: str = "Operation completed successfully"
    data: DataT
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class PaginatedResponse(BaseModel, Generic[DataT]):
    items: List[DataT]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_more: bool
