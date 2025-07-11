#!/usr/bin/env python3
"""
Backend API Test Suite for Budget Planner
Tests all API endpoints with comprehensive validation
"""

import requests
import json
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE_URL = f"{BACKEND_URL}/api"

print(f"Testing Backend API at: {API_BASE_URL}")

class BudgetPlannerAPITest:
    def __init__(self):
        self.base_url = API_BASE_URL
        self.test_results = {
            'health_check': False,
            'api_root': False,
            'transaction_create': False,
            'transaction_get_all': False,
            'transaction_get_by_id': False,
            'transaction_update': False,
            'transaction_delete': False,
            'transaction_monthly_summary': False,
            'budget_create': False,
            'budget_get_all': False,
            'budget_get_by_category': False,
            'budget_update': False,
            'budget_delete': False,
            'budget_status_summary': False,
            'data_validation': False
        }
        self.created_transaction_id = None
        self.created_budget_category = None
        
    def log_test(self, test_name, success, message=""):
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}: {message}")
        self.test_results[test_name] = success
        
    def test_health_check(self):
        """Test health check endpoint"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'healthy' and data.get('database') == 'connected':
                    self.log_test('health_check', True, "Database connected successfully")
                    return True
                else:
                    self.log_test('health_check', False, f"Unhealthy response: {data}")
                    return False
            else:
                self.log_test('health_check', False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test('health_check', False, f"Exception: {str(e)}")
            return False
    
    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if 'message' in data:
                    self.log_test('api_root', True, f"Message: {data['message']}")
                    return True
                else:
                    self.log_test('api_root', False, "No message in response")
                    return False
            else:
                self.log_test('api_root', False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test('api_root', False, f"Exception: {str(e)}")
            return False
    
    def test_transaction_create(self):
        """Test creating a new transaction"""
        try:
            # Test income transaction
            transaction_data = {
                "type": "income",
                "category": "Salary",
                "amount": 5000.00,
                "description": "Monthly salary payment",
                "date": "2024-01-15"
            }
            
            response = requests.post(
                f"{self.base_url}/transactions",
                json=transaction_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and data['type'] == 'income':
                    self.created_transaction_id = data['id']
                    self.log_test('transaction_create', True, f"Created transaction ID: {data['id']}")
                    return True
                else:
                    self.log_test('transaction_create', False, f"Invalid response data: {data}")
                    return False
            else:
                self.log_test('transaction_create', False, f"Status code: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test('transaction_create', False, f"Exception: {str(e)}")
            return False
    
    def test_transaction_get_all(self):
        """Test getting all transactions with filters"""
        try:
            # Test without filters
            response = requests.get(f"{self.base_url}/transactions", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Test with filters
                    filter_response = requests.get(
                        f"{self.base_url}/transactions?type=income&month=1&year=2024",
                        timeout=10
                    )
                    
                    if filter_response.status_code == 200:
                        filter_data = filter_response.json()
                        self.log_test('transaction_get_all', True, f"Retrieved {len(data)} transactions, {len(filter_data)} filtered")
                        return True
                    else:
                        self.log_test('transaction_get_all', False, f"Filter request failed: {filter_response.status_code}")
                        return False
                else:
                    self.log_test('transaction_get_all', False, "Response is not a list")
                    return False
            else:
                self.log_test('transaction_get_all', False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test('transaction_get_all', False, f"Exception: {str(e)}")
            return False
    
    def test_transaction_get_by_id(self):
        """Test getting a specific transaction by ID"""
        if not self.created_transaction_id:
            self.log_test('transaction_get_by_id', False, "No transaction ID available")
            return False
            
        try:
            response = requests.get(
                f"{self.base_url}/transactions/{self.created_transaction_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data['id'] == self.created_transaction_id:
                    self.log_test('transaction_get_by_id', True, f"Retrieved transaction: {data['description']}")
                    return True
                else:
                    self.log_test('transaction_get_by_id', False, "ID mismatch in response")
                    return False
            else:
                self.log_test('transaction_get_by_id', False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test('transaction_get_by_id', False, f"Exception: {str(e)}")
            return False
    
    def test_transaction_update(self):
        """Test updating a transaction"""
        if not self.created_transaction_id:
            self.log_test('transaction_update', False, "No transaction ID available")
            return False
            
        try:
            update_data = {
                "amount": 5500.00,
                "description": "Updated monthly salary payment"
            }
            
            response = requests.put(
                f"{self.base_url}/transactions/{self.created_transaction_id}",
                json=update_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data['amount'] == 5500.00 and 'Updated' in data['description']:
                    self.log_test('transaction_update', True, f"Updated amount to {data['amount']}")
                    return True
                else:
                    self.log_test('transaction_update', False, f"Update not reflected: {data}")
                    return False
            else:
                self.log_test('transaction_update', False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test('transaction_update', False, f"Exception: {str(e)}")
            return False
    
    def test_transaction_monthly_summary(self):
        """Test monthly summary endpoint"""
        try:
            response = requests.get(
                f"{self.base_url}/transactions/summary/monthly?month=1&year=2024",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['month', 'year', 'total_income', 'total_expenses', 'net_balance', 'categories']
                
                if all(field in data for field in required_fields):
                    self.log_test('transaction_monthly_summary', True, f"Summary: Income={data['total_income']}, Expenses={data['total_expenses']}")
                    return True
                else:
                    self.log_test('transaction_monthly_summary', False, f"Missing required fields in response: {data}")
                    return False
            else:
                self.log_test('transaction_monthly_summary', False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test('transaction_monthly_summary', False, f"Exception: {str(e)}")
            return False
    
    def test_budget_create(self):
        """Test creating a new budget"""
        try:
            budget_data = {
                "category": "Groceries",
                "amount": 800.00
            }
            
            response = requests.post(
                f"{self.base_url}/budgets",
                json=budget_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and data['category'] == 'Groceries':
                    self.created_budget_category = data['category']
                    self.log_test('budget_create', True, f"Created budget for {data['category']}: ${data['amount']}")
                    return True
                else:
                    self.log_test('budget_create', False, f"Invalid response data: {data}")
                    return False
            else:
                self.log_test('budget_create', False, f"Status code: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test('budget_create', False, f"Exception: {str(e)}")
            return False
    
    def test_budget_get_all(self):
        """Test getting all budgets"""
        try:
            response = requests.get(f"{self.base_url}/budgets", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test('budget_get_all', True, f"Retrieved {len(data)} budgets")
                    return True
                else:
                    self.log_test('budget_get_all', False, "Response is not a list")
                    return False
            else:
                self.log_test('budget_get_all', False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test('budget_get_all', False, f"Exception: {str(e)}")
            return False
    
    def test_budget_get_by_category(self):
        """Test getting budget by category"""
        if not self.created_budget_category:
            self.log_test('budget_get_by_category', False, "No budget category available")
            return False
            
        try:
            response = requests.get(
                f"{self.base_url}/budgets/{self.created_budget_category}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data['category'] == self.created_budget_category:
                    self.log_test('budget_get_by_category', True, f"Retrieved budget for {data['category']}")
                    return True
                else:
                    self.log_test('budget_get_by_category', False, "Category mismatch in response")
                    return False
            else:
                self.log_test('budget_get_by_category', False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test('budget_get_by_category', False, f"Exception: {str(e)}")
            return False
    
    def test_budget_update(self):
        """Test updating a budget"""
        if not self.created_budget_category:
            self.log_test('budget_update', False, "No budget category available")
            return False
            
        try:
            update_data = {
                "amount": 900.00
            }
            
            response = requests.put(
                f"{self.base_url}/budgets/{self.created_budget_category}",
                json=update_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data['amount'] == 900.00:
                    self.log_test('budget_update', True, f"Updated budget amount to ${data['amount']}")
                    return True
                else:
                    self.log_test('budget_update', False, f"Update not reflected: {data}")
                    return False
            else:
                self.log_test('budget_update', False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test('budget_update', False, f"Exception: {str(e)}")
            return False
    
    def test_budget_status_summary(self):
        """Test budget status summary endpoint"""
        try:
            response = requests.get(
                f"{self.base_url}/budgets/status/summary?month=1&year=2024",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['month', 'year', 'summary', 'budget_status']
                
                if all(field in data for field in required_fields):
                    summary = data['summary']
                    self.log_test('budget_status_summary', True, f"Budget status: {summary['total_budgeted']} budgeted, {summary['total_spent']} spent")
                    return True
                else:
                    self.log_test('budget_status_summary', False, f"Missing required fields in response: {data}")
                    return False
            else:
                self.log_test('budget_status_summary', False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test('budget_status_summary', False, f"Exception: {str(e)}")
            return False
    
    def test_data_validation(self):
        """Test data validation with invalid inputs"""
        try:
            # Test negative amount
            invalid_transaction = {
                "type": "income",
                "category": "Test",
                "amount": -100.00,
                "description": "Invalid amount",
                "date": "2024-01-15"
            }
            
            response = requests.post(
                f"{self.base_url}/transactions",
                json=invalid_transaction,
                timeout=10
            )
            
            # Should return 422 for validation error
            if response.status_code == 422:
                # Test invalid transaction type
                invalid_type = {
                    "type": "invalid_type",
                    "category": "Test",
                    "amount": 100.00,
                    "description": "Invalid type",
                    "date": "2024-01-15"
                }
                
                response2 = requests.post(
                    f"{self.base_url}/transactions",
                    json=invalid_type,
                    timeout=10
                )
                
                if response2.status_code == 422:
                    self.log_test('data_validation', True, "Validation errors properly handled")
                    return True
                else:
                    self.log_test('data_validation', False, f"Invalid type not caught: {response2.status_code}")
                    return False
            else:
                self.log_test('data_validation', False, f"Negative amount not caught: {response.status_code}")
                return False
        except Exception as e:
            self.log_test('data_validation', False, f"Exception: {str(e)}")
            return False
    
    def test_transaction_delete(self):
        """Test deleting a transaction (run last to clean up)"""
        if not self.created_transaction_id:
            self.log_test('transaction_delete', False, "No transaction ID available")
            return False
            
        try:
            response = requests.delete(
                f"{self.base_url}/transactions/{self.created_transaction_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data and 'deleted' in data['message'].lower():
                    self.log_test('transaction_delete', True, "Transaction deleted successfully")
                    return True
                else:
                    self.log_test('transaction_delete', False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test('transaction_delete', False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test('transaction_delete', False, f"Exception: {str(e)}")
            return False
    
    def test_budget_delete(self):
        """Test deleting a budget (run last to clean up)"""
        if not self.created_budget_category:
            self.log_test('budget_delete', False, "No budget category available")
            return False
            
        try:
            response = requests.delete(
                f"{self.base_url}/budgets/{self.created_budget_category}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data and 'deleted' in data['message'].lower():
                    self.log_test('budget_delete', True, "Budget deleted successfully")
                    return True
                else:
                    self.log_test('budget_delete', False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test('budget_delete', False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test('budget_delete', False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all tests in order"""
        print("=" * 60)
        print("BUDGET PLANNER BACKEND API TEST SUITE")
        print("=" * 60)
        
        # Health and basic tests
        self.test_health_check()
        self.test_api_root()
        
        # Transaction tests
        self.test_transaction_create()
        self.test_transaction_get_all()
        self.test_transaction_get_by_id()
        self.test_transaction_update()
        self.test_transaction_monthly_summary()
        
        # Budget tests
        self.test_budget_create()
        self.test_budget_get_all()
        self.test_budget_get_by_category()
        self.test_budget_update()
        self.test_budget_status_summary()
        
        # Validation tests
        self.test_data_validation()
        
        # Cleanup tests (run last)
        self.test_transaction_delete()
        self.test_budget_delete()
        
        # Summary
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results.values() if result)
        total = len(self.test_results)
        
        print(f"Tests Passed: {passed}/{total}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("🎉 ALL TESTS PASSED!")
        else:
            print("❌ Some tests failed. Check the details above.")
            
        return self.test_results

if __name__ == "__main__":
    tester = BudgetPlannerAPITest()
    results = tester.run_all_tests()