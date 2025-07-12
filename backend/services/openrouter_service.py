from openai import OpenAI
import os
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class OpenRouterService:
    def __init__(self):
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY")
        )
    
    async def chat_with_context(self, messages: List[Dict], user_financial_data: Optional[Dict] = None) -> str:
        """Chat with AI using user's financial context"""
        try:
            # Build system message with financial context
            system_content = """You are a helpful financial assistant for a budget planner app. 
            You provide personalized financial advice, help analyze spending patterns, and assist with budgeting decisions.
            
            Keep your responses concise but helpful. Focus on actionable advice and insights.
            """
            
            if user_financial_data:
                system_content += f"""
                
User's Current Financial Context:
- Monthly Income: ${user_financial_data.get('monthly_income', 'N/A')}
- Monthly Expenses: ${user_financial_data.get('monthly_expenses', 'N/A')}
- Net Balance: ${user_financial_data.get('net_balance', 'N/A')}
- Total Budget Set: ${user_financial_data.get('total_budget', 'N/A')}

Recent Transactions:
{chr(10).join(user_financial_data.get('recent_transactions', []))}

Budget Categories:
{chr(10).join(user_financial_data.get('budget_categories', []))}

Use this context to provide personalized financial advice. Reference specific numbers when relevant.
"""
            
            # Prepare messages for OpenRouter
            full_messages = [
                {"role": "system", "content": system_content}
            ] + messages
            
            # Call OpenRouter API
            response = await self._make_api_call(full_messages)
            return response
            
        except Exception as e:
            logger.error(f"Error in chat_with_context: {str(e)}")
            return "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment."
    
    async def _make_api_call(self, messages: List[Dict]) -> str:
        """Make the actual API call to OpenRouter"""
        try:
            response = self.client.chat.completions.create(
                model="deepseek/deepseek-r1-0528:free",
                messages=messages,
                max_tokens=800,
                temperature=0.7,
                top_p=0.9
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"OpenRouter API error: {str(e)}")
            raise e