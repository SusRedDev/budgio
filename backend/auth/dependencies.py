from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os
from dotenv import load_dotenv
from pathlib import Path

from .security import verify_token
from ..models.user import User, TokenData

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# Database connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security scheme
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> TokenData:
    """Get current authenticated user from JWT token"""
    token = credentials.credentials
    
    # Verify token
    token_data = verify_token(token)
    
    # Get user from database
    user = await db.users.find_one({"id": token_data["user_id"]})
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return TokenData(
        username=token_data["username"],
        user_id=token_data["user_id"],
        is_panic_mode=token_data["is_panic_mode"]
    )

async def get_current_active_user(
    current_user: TokenData = Depends(get_current_user)
) -> TokenData:
    """Get current active user"""
    return current_user

async def check_travel_mode(
    current_user: TokenData = Depends(get_current_user)
) -> bool:
    """Check if user is in travel mode and if access should be restricted"""
    user = await db.users.find_one({"id": current_user.user_id})
    
    if not user:
        return False
    
    travel_mode_enabled = user.get("settings", {}).get("travel_mode", {}).get("travel_mode_enabled", False)
    
    # If travel mode is enabled and user is NOT in panic mode, restrict access
    if travel_mode_enabled and not current_user.is_panic_mode:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not Found"
        )
    
    return travel_mode_enabled

async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[TokenData]:
    """Get current user if authenticated, otherwise return None"""
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        token_data = verify_token(token)
        
        # Get user from database
        user = await db.users.find_one({"id": token_data["user_id"]})
        
        if user is None or not user.get("is_active", True):
            return None
        
        return TokenData(
            username=token_data["username"],
            user_id=token_data["user_id"],
            is_panic_mode=token_data["is_panic_mode"]
        )
    except:
        return None

async def check_public_access():
    """Check if public access is allowed based on travel mode settings"""
    # Get all users to check if any have travel mode enabled
    users_cursor = db.users.find({
        "settings.travel_mode.travel_mode_enabled": True
    })
    
    travel_mode_users = await users_cursor.to_list(length=1)
    
    # If any user has travel mode enabled, block public access
    if travel_mode_users:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not Found"
        )
    
    return True