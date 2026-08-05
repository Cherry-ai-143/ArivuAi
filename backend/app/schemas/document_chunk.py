from datetime import datetime

from pydantic import BaseModel, ConfigDict


# Create Chunk
class DocumentChunkCreate(BaseModel):
    uploaded_file_id: int
    chunk_index: int
    chunk_text: str


# Response Chunk
class DocumentChunkResponse(BaseModel):
    id: int
    uploaded_file_id: int
    chunk_index: int
    chunk_text: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )