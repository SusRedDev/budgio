from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
import uuid

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str = "New Chat"
    messages: List[ChatMessage] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_accessed: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

class ChatSessionResponse(BaseModel):
    session_id: str
    title: str
    created_at: datetime
    last_accessed: datetime
    message_count: int