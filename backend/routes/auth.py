from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer
from typing import Optional
from datetime import timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

from ..models.user import (
    User, UserCreate, UserLogin, UserResponse, Token, 
    TravelModeUpdate, PasswordUpdate, PanicCredentials
)
from ..auth.security import (
    verify_password, get_password_hash, create_access_token, 
    validate_password_strength, ACCESS_TOKEN_EXPIRE_MINUTES
)
from ..auth.dependencies import get_current_active_user, TokenData

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

router = APIRouter()
security = HTTPBearer()

# Database connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate):
    """Register a new user"""
    # Check if travel mode is enabled globally (blocks registration)
    travel_mode_users = await db.users.find_one({
        "settings.travel_mode.travel_mode_enabled": True
    })
    
    if travel_mode_users:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not Found"
        )
    
    # Validate password confirmation
    if user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Validate password strength
    if not validate_password_strength(user_data.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters and contain both letters and numbers"
        )
    
    # Check if user already exists
    existing_user = await db.users.find_one({
        "$or": [
            {"username": user_data.username},
            {"email": user_data.email}
        ]
    })
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        password_hash=hashed_password
    )
    
    user_dict = user.dict()
    
    # Insert user into database
    await db.users.insert_one(user_dict)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user.username,
            "user_id": user.id,
            "is_panic_mode": False
        },
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user_dict)
    )

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """Login with normal credentials"""
    # Find user by username
    user = await db.users.find_one({"username": user_credentials.username})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(user_credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account deactivated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if travel mode is enabled - if yes, block normal login
    travel_mode_enabled = user.get("settings", {}).get("travel_mode", {}).get("travel_mode_enabled", False)
    if travel_mode_enabled:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not Found"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user["username"],
            "user_id": user["id"],
            "is_panic_mode": False
        },
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user)
    )

@router.post("/panic-login", response_model=Token)
async def panic_login(user_credentials: UserLogin):
    """Login with panic credentials"""
    # Find user by panic username
    user = await db.users.find_one({
        "settings.travel_mode.panic_username": user_credentials.username
    })
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get panic password hash
    panic_password_hash = user.get("settings", {}).get("travel_mode", {}).get("panic_password_hash")
    if not panic_password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Panic credentials not configured",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify panic password
    if not verify_password(user_credentials.password, panic_password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account deactivated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token with panic mode flag
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user["username"],
            "user_id": user["id"],
            "is_panic_mode": True
        },
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(**user)
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: TokenData = Depends(get_current_active_user)):
    """Get current user information"""
    user = await db.users.find_one({"id": current_user.user_id})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(**user)

@router.post("/travel-mode", response_model=dict)
async def update_travel_mode(
    travel_settings: TravelModeUpdate,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Update travel mode settings"""
    update_data = {
        "settings.travel_mode.travel_mode_enabled": travel_settings.travel_mode_enabled,
        "settings.travel_mode.hide_stats": travel_settings.hide_stats,
        "updated_at": datetime.utcnow()
    }
    
    # If panic credentials are provided, hash and store them
    if travel_settings.panic_username and travel_settings.panic_password:
        # Validate panic password
        if not validate_password_strength(travel_settings.panic_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Panic password must be at least 6 characters and contain both letters and numbers"
            )
        
        # Check if panic username is different from normal username
        user = await db.users.find_one({"id": current_user.user_id})
        if user and user["username"] == travel_settings.panic_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Panic username must be different from normal username"
            )
        
        update_data["settings.travel_mode.panic_username"] = travel_settings.panic_username
        update_data["settings.travel_mode.panic_password_hash"] = get_password_hash(travel_settings.panic_password)
    
    # Update user settings
    result = await db.users.update_one(
        {"id": current_user.user_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "Travel mode settings updated successfully"}

@router.post("/change-password", response_model=dict)
async def change_password(
    password_data: PasswordUpdate,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Change user password"""
    # Validate password confirmation
    if password_data.new_password != password_data.confirm_new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New passwords do not match"
        )
    
    # Validate new password strength
    if not validate_password_strength(password_data.new_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters and contain both letters and numbers"
        )
    
    # Get current user
    user = await db.users.find_one({"id": current_user.user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify current password
    if not verify_password(password_data.current_password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Update password
    new_password_hash = get_password_hash(password_data.new_password)
    result = await db.users.update_one(
        {"id": current_user.user_id},
        {
            "$set": {
                "password_hash": new_password_hash,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to update password"
        )
    
    return {"message": "Password updated successfully"}