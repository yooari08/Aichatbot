from pydantic import BaseModel, Field


class CategorySummary(BaseModel):
    name: str
    document_count: int


class CategoryRenameRequest(BaseModel):
    new_name: str = Field(min_length=1, max_length=64)


class CategoryCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=64)
