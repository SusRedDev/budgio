from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import os

from models.budget import Budget, BudgetCreate, BudgetUpdate

router = APIRouter()

# Get database connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
collection = db.budgets

@router.get("/budgets", response_model=List[Budget])
async def get_budgets():
    """Get all budgets"""
    try:
        cursor = collection.find({}).sort("category", 1)
        budgets = await cursor.to_list(length=None)
        
        return [Budget(**budget) for budget in budgets]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching budgets: {str(e)}")

@router.post("/budgets", response_model=Budget)
async def create_budget(budget: BudgetCreate):
    """Create a new budget"""
    try:
        # Check if budget for this category already exists
        existing_budget = await collection.find_one({"category": budget.category})
        
        if existing_budget:
            raise HTTPException(
                status_code=400, 
                detail=f"Budget for category '{budget.category}' already exists"
            )
        
        # Create budget object
        budget_obj = Budget(**budget.dict())
        budget_dict = budget_obj.dict()
        
        # Insert into database
        result = await collection.insert_one(budget_dict)
        
        if result.inserted_id:
            return budget_obj
        else:
            raise HTTPException(status_code=500, detail="Failed to create budget")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating budget: {str(e)}")

@router.get("/budgets/{category}")
async def get_budget_by_category(category: str):
    """Get budget by category"""
    try:
        budget = await collection.find_one({"category": category})
        
        if budget:
            return Budget(**budget)
        else:
            raise HTTPException(status_code=404, detail="Budget not found")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching budget: {str(e)}")

@router.put("/budgets/{category}", response_model=Budget)
async def update_budget(category: str, budget_update: BudgetUpdate):
    """Update or create a budget for a category"""
    try:
        # Check if budget exists
        existing_budget = await collection.find_one({"category": category})
        
        if existing_budget:
            # Update existing budget
            update_data = budget_update.dict(exclude_unset=True)
            update_data["updated_at"] = datetime.utcnow()
            
            result = await collection.update_one(
                {"category": category},
                {"$set": update_data}
            )
            
            if result.modified_count == 1:
                updated_budget = await collection.find_one({"category": category})
                return Budget(**updated_budget)
            else:
                raise HTTPException(status_code=500, detail="Failed to update budget")
        else:
            # Create new budget
            budget_data = {"category": category, **budget_update.dict(exclude_unset=True)}
            budget_obj = Budget(**budget_data)
            budget_dict = budget_obj.dict()
            
            result = await collection.insert_one(budget_dict)
            
            if result.inserted_id:
                return budget_obj
            else:
                raise HTTPException(status_code=500, detail="Failed to create budget")
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating budget: {str(e)}")

@router.delete("/budgets/{category}")
async def delete_budget(category: str):
    """Delete a budget"""
    try:
        result = await collection.delete_one({"category": category})
        
        if result.deleted_count == 1:
            return {"message": "Budget deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Budget not found")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting budget: {str(e)}")

@router.get("/budgets/status/summary")
async def get_budget_status_summary(
    month: int = None,
    year: int = None
):
    """Get budget status summary comparing budgets with actual spending"""
    try:
        # Default to current month/year if not provided
        if not month or not year:
            now = datetime.utcnow()
            month = month or now.month
            year = year or now.year
        
        # Get all budgets
        budget_cursor = collection.find({})
        budgets = await budget_cursor.to_list(length=None)
        
        # Get spending data from transactions
        transactions_collection = db.transactions
        
        # Build date filter for transactions
        start_date = f"{year}-{month:02d}-01"
        if month == 12:
            end_date = f"{year + 1}-01-01"
        else:
            end_date = f"{year}-{month + 1:02d}-01"
        
        # Aggregate spending by category
        spending_pipeline = [
            {
                "$match": {
                    "type": "expense",
                    "date": {
                        "$gte": start_date,
                        "$lt": end_date
                    }
                }
            },
            {
                "$group": {
                    "_id": "$category",
                    "total_spent": {"$sum": "$amount"},
                    "transaction_count": {"$sum": 1}
                }
            }
        ]
        
        spending_cursor = transactions_collection.aggregate(spending_pipeline)
        spending_results = await spending_cursor.to_list(length=None)
        
        # Convert spending results to dictionary
        spending_by_category = {}
        for result in spending_results:
            spending_by_category[result["_id"]] = {
                "spent": result["total_spent"],
                "transactions": result["transaction_count"]
            }
        
        # Build budget status summary
        budget_status = []
        total_budgeted = 0
        total_spent = 0
        
        for budget in budgets:
            category = budget["category"]
            budget_amount = budget["amount"]
            spent = spending_by_category.get(category, {}).get("spent", 0)
            
            total_budgeted += budget_amount
            total_spent += spent
            
            percentage = (spent / budget_amount * 100) if budget_amount > 0 else 0
            remaining = budget_amount - spent
            
            status = "over" if percentage >= 100 else "warning" if percentage >= 80 else "good"
            
            budget_status.append({
                "category": category,
                "budget_amount": budget_amount,
                "spent": spent,
                "remaining": remaining,
                "percentage": round(percentage, 2),
                "status": status,
                "transaction_count": spending_by_category.get(category, {}).get("transactions", 0)
            })
        
        # Sort by percentage (highest first)
        budget_status.sort(key=lambda x: x["percentage"], reverse=True)
        
        return {
            "month": month,
            "year": year,
            "summary": {
                "total_budgeted": total_budgeted,
                "total_spent": total_spent,
                "total_remaining": total_budgeted - total_spent,
                "overall_percentage": round((total_spent / total_budgeted * 100) if total_budgeted > 0 else 0, 2)
            },
            "budget_status": budget_status
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating budget status summary: {str(e)}")