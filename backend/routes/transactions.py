from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

from models.transaction import Transaction, TransactionCreate, TransactionUpdate
from auth.dependencies import get_current_active_user, check_travel_mode, TokenData

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

router = APIRouter()

# Get database connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
collection = db.transactions

@router.get("/transactions", response_model=List[Transaction])
async def get_transactions(
    type: Optional[str] = Query(None, description="Filter by type: income or expense"),
    category: Optional[str] = Query(None, description="Filter by category"),
    month: Optional[int] = Query(None, description="Filter by month (1-12)"),
    year: Optional[int] = Query(None, description="Filter by year"),
    limit: int = Query(100, le=1000, description="Maximum number of transactions to return")
):
    """Get transactions with optional filters"""
    try:
        # Build filter query
        filter_query = {}
        
        if type and type in ["income", "expense"]:
            filter_query["type"] = type
            
        if category:
            filter_query["category"] = category
            
        # Date filtering
        if month and year:
            # Filter by specific month and year
            start_date = f"{year}-{month:02d}-01"
            if month == 12:
                end_date = f"{year + 1}-01-01"
            else:
                end_date = f"{year}-{month + 1:02d}-01"
            
            filter_query["date"] = {
                "$gte": start_date,
                "$lt": end_date
            }
        elif year:
            # Filter by year only
            filter_query["date"] = {
                "$gte": f"{year}-01-01",
                "$lt": f"{year + 1}-01-01"
            }
        
        # Get transactions from database
        cursor = collection.find(filter_query).sort("created_at", -1).limit(limit)
        transactions = await cursor.to_list(length=limit)
        
        return [Transaction(**transaction) for transaction in transactions]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching transactions: {str(e)}")

@router.post("/transactions", response_model=Transaction)
async def create_transaction(transaction: TransactionCreate):
    """Create a new transaction"""
    try:
        # Create transaction object
        transaction_obj = Transaction(**transaction.dict())
        transaction_dict = transaction_obj.dict()
        
        # Insert into database
        result = await collection.insert_one(transaction_dict)
        
        if result.inserted_id:
            return transaction_obj
        else:
            raise HTTPException(status_code=500, detail="Failed to create transaction")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating transaction: {str(e)}")

@router.get("/transactions/{transaction_id}", response_model=Transaction)
async def get_transaction(transaction_id: str):
    """Get a specific transaction by ID"""
    try:
        transaction = await collection.find_one({"id": transaction_id})
        
        if transaction:
            return Transaction(**transaction)
        else:
            raise HTTPException(status_code=404, detail="Transaction not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching transaction: {str(e)}")

@router.put("/transactions/{transaction_id}", response_model=Transaction)
async def update_transaction(transaction_id: str, transaction_update: TransactionUpdate):
    """Update a transaction"""
    try:
        # Get existing transaction
        existing_transaction = await collection.find_one({"id": transaction_id})
        
        if not existing_transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        # Update only provided fields
        update_data = transaction_update.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        # Update in database
        result = await collection.update_one(
            {"id": transaction_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 1:
            # Return updated transaction
            updated_transaction = await collection.find_one({"id": transaction_id})
            return Transaction(**updated_transaction)
        else:
            raise HTTPException(status_code=500, detail="Failed to update transaction")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating transaction: {str(e)}")

@router.delete("/transactions/{transaction_id}")
async def delete_transaction(transaction_id: str):
    """Delete a transaction"""
    try:
        result = await collection.delete_one({"id": transaction_id})
        
        if result.deleted_count == 1:
            return {"message": "Transaction deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Transaction not found")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting transaction: {str(e)}")

@router.get("/transactions/summary/monthly")
async def get_monthly_summary(
    month: int = Query(..., ge=1, le=12, description="Month (1-12)"),
    year: int = Query(..., ge=2000, le=2100, description="Year")
):
    """Get monthly summary of income and expenses"""
    try:
        # Build date filter
        start_date = f"{year}-{month:02d}-01"
        if month == 12:
            end_date = f"{year + 1}-01-01"
        else:
            end_date = f"{year}-{month + 1:02d}-01"
        
        # Aggregate transactions
        pipeline = [
            {
                "$match": {
                    "date": {
                        "$gte": start_date,
                        "$lt": end_date
                    }
                }
            },
            {
                "$group": {
                    "_id": {
                        "type": "$type",
                        "category": "$category"
                    },
                    "total": {"$sum": "$amount"},
                    "count": {"$sum": 1}
                }
            }
        ]
        
        cursor = collection.aggregate(pipeline)
        results = await cursor.to_list(length=None)
        
        # Process results
        summary = {
            "month": month,
            "year": year,
            "total_income": 0,
            "total_expenses": 0,
            "net_balance": 0,
            "categories": {}
        }
        
        for result in results:
            type_name = result["_id"]["type"]
            category = result["_id"]["category"]
            total = result["total"]
            
            if type_name == "income":
                summary["total_income"] += total
            else:
                summary["total_expenses"] += total
            
            if category not in summary["categories"]:
                summary["categories"][category] = {"income": 0, "expense": 0}
            
            summary["categories"][category][type_name] = total
        
        summary["net_balance"] = summary["total_income"] - summary["total_expenses"]
        
        return summary
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating monthly summary: {str(e)}")