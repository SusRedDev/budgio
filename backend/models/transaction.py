from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
import uuid

class TransactionBase(BaseModel):
    type: Literal["income", "expense"]
    category: str
    amount: float = Field(..., gt=0)
    description: str
    date: str  # ISO date string (YYYY-MM-DD)

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    type: Optional[Literal["income", "expense"]] = None
    category: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None
    date: Optional[str] = None

class Transaction(TransactionBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True