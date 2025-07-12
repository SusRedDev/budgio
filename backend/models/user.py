from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Literal
from datetime import datetime
import uuid

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)
    confirm_password: str = Field(..., min_length=6, max_length=100)

class UserLogin(BaseModel):
    username: str
    password: str

class PanicCredentials(BaseModel):
    panic_username: str = Field(..., min_length=3, max_length=50)
    panic_password: str = Field(..., min_length=6, max_length=100)

class TravelModeSettings(BaseModel):
    travel_mode_enabled: bool = False
    hide_stats: bool = False
    panic_username: Optional[str] = None
    panic_password_hash: Optional[str] = None

class UserSettings(BaseModel):
    travel_mode: TravelModeSettings = Field(default_factory=TravelModeSettings)

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    password_hash: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    settings: UserSettings = Field(default_factory=UserSettings)

    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    settings: UserSettings

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[str] = None
    is_panic_mode: bool = False

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6, max_length=100)
    confirm_new_password: str = Field(..., min_length=6, max_length=100)

class TravelModeUpdate(BaseModel):
    travel_mode_enabled: bool
    hide_stats: bool = False
    panic_username: Optional[str] = None
    panic_password: Optional[str] = None