from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

from models.chat import ChatSession, ChatMessage, ChatRequest, ChatResponse, ChatSessionResponse
from services.openrouter_service import OpenRouterService
from auth.dependencies import get_current_active_user, TokenData

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

router = APIRouter()

# Database connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize OpenRouter service
openrouter_service = OpenRouterService()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Chat with AI assistant using user's financial context"""
    try:
        # Get or create session
        if request.session_id:
            session = await db.chat_sessions.find_one({
                "session_id": request.session_id,
                "user_id": current_user.user_id
            })
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")
        else:
            # Create new session
            session_obj = ChatSession(user_id=current_user.user_id)
            session_dict = session_obj.dict()
            await db.chat_sessions.insert_one(session_dict)
            session = session_dict
        
        # Get user's financial context
        user_financial_data = await get_user_financial_context(current_user.user_id)
        
        # Prepare conversation history
        conversation_messages = []
        if session.get("messages"):
            # Get last 10 messages to stay within context limits
            recent_messages = session["messages"][-10:]
            conversation_messages = [
                {"role": msg["role"], "content": msg["content"]} 
                for msg in recent_messages
            ]
        
        # Add current user message
        conversation_messages.append({"role": "user", "content": request.message})
        
        # Get AI response
        ai_response = await openrouter_service.chat_with_context(
            conversation_messages, 
            user_financial_data
        )
        
        # Create message objects
        user_msg = ChatMessage(role="user", content=request.message)
        ai_msg = ChatMessage(role="assistant", content=ai_response)
        
        # Update session title if it's the first message
        update_data = {
            "$push": {"messages": {"$each": [user_msg.dict(), ai_msg.dict()]}},
            "$set": {"last_accessed": datetime.utcnow()}
        }
        
        if not session.get("messages"):
            # Generate title from first message
            title = request.message[:50] + "..." if len(request.message) > 50 else request.message
            update_data["$set"]["title"] = title
        
        # Save to database
        await db.chat_sessions.update_one(
            {"session_id": session["session_id"], "user_id": current_user.user_id},
            update_data
        )
        
        return ChatResponse(
            response=ai_response,
            session_id=session["session_id"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@router.get("/sessions", response_model=List[ChatSessionResponse])
async def get_chat_sessions(current_user: TokenData = Depends(get_current_active_user)):
    """Get all chat sessions for the current user"""
    try:
        sessions = await db.chat_sessions.find(
            {"user_id": current_user.user_id}
        ).sort("last_accessed", -1).limit(20).to_list(20)
        
        return [
            ChatSessionResponse(
                session_id=session["session_id"],
                title=session.get("title", "New Chat"),
                created_at=session["created_at"],
                last_accessed=session["last_accessed"],
                message_count=len(session.get("messages", []))
            )
            for session in sessions
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching sessions: {str(e)}")

@router.get("/sessions/{session_id}/messages")
async def get_chat_history(
    session_id: str,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Get chat history for a specific session"""
    try:
        session = await db.chat_sessions.find_one({
            "session_id": session_id,
            "user_id": current_user.user_id
        })
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            "session_id": session["session_id"],
            "title": session.get("title", "New Chat"),
            "messages": session.get("messages", [])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching chat history: {str(e)}")

@router.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Delete a chat session"""
    try:
        result = await db.chat_sessions.delete_one({
            "session_id": session_id,
            "user_id": current_user.user_id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {"message": "Session deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting session: {str(e)}")

async def get_user_financial_context(user_id: str) -> dict:
    """Get user's financial data for AI context"""
    try:
        # Get current month's data
        current_month = datetime.utcnow().month
        current_year = datetime.utcnow().year
        
        # Get transactions
        transactions = await db.transactions.find({
            "user_id": user_id
        }).sort("date", -1).limit(10).to_list(10)
        
        # Calculate monthly totals
        start_date = f"{current_year}-{current_month:02d}-01"
        if current_month == 12:
            end_date = f"{current_year + 1}-01-01"
        else:
            end_date = f"{current_year}-{current_month + 1:02d}-01"
        
        # Monthly income and expenses
        monthly_transactions = await db.transactions.find({
            "user_id": user_id,
            "date": {"$gte": start_date, "$lt": end_date}
        }).to_list(None)
        
        monthly_income = sum(t["amount"] for t in monthly_transactions if t["type"] == "income")
        monthly_expenses = sum(t["amount"] for t in monthly_transactions if t["type"] == "expense")
        
        # Get budgets
        budgets = await db.budgets.find({"user_id": user_id}).to_list(None)
        total_budget = sum(b["amount"] for b in budgets)
        
        # Format recent transactions
        recent_transactions = [
            f"• {t['description']}: ${t['amount']:.2f} ({t['category']}, {t['type']})"
            for t in transactions[:5]
        ]
        
        # Format budget categories
        budget_categories = [
            f"• {b['category']}: ${b['amount']:.2f} budget"
            for b in budgets
        ]
        
        return {
            "monthly_income": f"{monthly_income:.2f}",
            "monthly_expenses": f"{monthly_expenses:.2f}",
            "net_balance": f"{monthly_income - monthly_expenses:.2f}",
            "total_budget": f"{total_budget:.2f}",
            "recent_transactions": recent_transactions,
            "budget_categories": budget_categories
        }
        
    except Exception as e:
        return {
            "monthly_income": "N/A",
            "monthly_expenses": "N/A", 
            "net_balance": "N/A",
            "total_budget": "N/A",
            "recent_transactions": [],
            "budget_categories": []
        }