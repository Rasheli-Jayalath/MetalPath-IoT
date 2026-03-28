#!/usr/bin/env python3
"""
Backend API Testing for Metal Sheet Locator App
Tests all API endpoints for functionality and data integrity
"""

import requests
import sys
import json
from datetime import datetime

class MetalSheetAPITester:
    def __init__(self, base_url="https://steel-pathfind.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def test_health_check(self):
        """Test basic health endpoint"""
        try:
            response = requests.get(f"{self.api_url}/health", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Response: {data.get('status', 'unknown')}"
            self.log_test("Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("Health Check", False, str(e))
            return False

    def test_generate_data(self):
        """Test synthetic data generation"""
        try:
            response = requests.post(f"{self.api_url}/generate-data?count=500", timeout=30)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                sheets_generated = data.get('sheets_generated', 0)
                shelves_generated = data.get('shelves_generated', 0)
                details += f", Sheets: {sheets_generated}, Shelves: {shelves_generated}"
                
                # Verify we got expected number of sheets
                if sheets_generated < 400:  # Allow some variance
                    success = False
                    details += " - Too few sheets generated"
            
            self.log_test("Generate Synthetic Data", success, details)
            return success, response.json() if success else {}
        except Exception as e:
            self.log_test("Generate Synthetic Data", False, str(e))
            return False, {}

    def test_get_sheets(self):
        """Test getting all sheets"""
        try:
            response = requests.get(f"{self.api_url}/sheets", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                sheets = data.get('sheets', [])
                total = data.get('total', 0)
                details += f", Total sheets: {total}"
                
                # Verify we have sheets and they have required fields
                if total > 0 and sheets:
                    sample_sheet = sheets[0]
                    required_fields = ['id', 'sheet_id', 'type', 'location_x', 'location_y', 'stock_quantity']
                    missing_fields = [field for field in required_fields if field not in sample_sheet]
                    if missing_fields:
                        success = False
                        details += f" - Missing fields: {missing_fields}"
                else:
                    success = False
                    details += " - No sheets found"
            
            self.log_test("Get All Sheets", success, details)
            return success, response.json() if success else {}
        except Exception as e:
            self.log_test("Get All Sheets", False, str(e))
            return False, {}

    def test_warehouse_stats(self):
        """Test warehouse statistics"""
        try:
            response = requests.get(f"{self.api_url}/warehouse/stats", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                total_sheets = data.get('total_sheets', 0)
                total_stock = data.get('total_stock', 0)
                active_iot = data.get('active_iot_nodes', 0)
                inactive_iot = data.get('inactive_nodes', 0)
                
                details += f", Sheets: {total_sheets}, Stock: {total_stock}, Active IoT: {active_iot}, Inactive IoT: {inactive_iot}"
                
                # Verify stats make sense
                if total_sheets == 0:
                    success = False
                    details += " - No sheets in stats"
                elif active_iot + inactive_iot != total_sheets:
                    success = False
                    details += " - IoT counts don't match total sheets"
            
            self.log_test("Warehouse Stats", success, details)
            return success, response.json() if success else {}
        except Exception as e:
            self.log_test("Warehouse Stats", False, str(e))
            return False, {}

    def test_warehouse_map(self):
        """Test warehouse map data"""
        try:
            response = requests.get(f"{self.api_url}/warehouse/map", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                grid_size = data.get('grid_size', 0)
                positions = data.get('positions', {})
                total_shelves = data.get('total_shelves', 0)
                
                details += f", Grid: {grid_size}x{grid_size}, Shelves: {total_shelves}, Positions: {len(positions)}"
                
                # Verify map data
                if grid_size != 30:
                    success = False
                    details += " - Grid size should be 30x30"
                elif total_shelves == 0:
                    success = False
                    details += " - No shelves found"
                elif len(positions) != total_shelves:
                    success = False
                    details += " - Position count mismatch"
            
            self.log_test("Warehouse Map", success, details)
            return success, response.json() if success else {}
        except Exception as e:
            self.log_test("Warehouse Map", False, str(e))
            return False, {}

    def test_filter_options(self):
        """Test filter options endpoint"""
        try:
            response = requests.get(f"{self.api_url}/filters/options", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                types = data.get('types', [])
                grades = data.get('material_grades', [])
                sizes = data.get('sizes', [])
                
                details += f", Types: {len(types)}, Grades: {len(grades)}, Sizes: {len(sizes)}"
                
                # Verify we have expected metal types
                expected_types = ["Aluminum", "Steel", "Copper", "Stainless Steel", "Galvanized Steel", "Brass", "Titanium"]
                missing_types = [t for t in expected_types if t not in types]
                if missing_types:
                    success = False
                    details += f" - Missing types: {missing_types}"
                elif len(types) < 5:
                    success = False
                    details += " - Too few metal types"
            
            self.log_test("Filter Options", success, details)
            return success, response.json() if success else {}
        except Exception as e:
            self.log_test("Filter Options", False, str(e))
            return False, {}

    def test_search_sheets(self):
        """Test sheet search functionality"""
        try:
            # Test search by type
            search_data = {"type": "Steel"}
            response = requests.post(f"{self.api_url}/sheets/search", json=search_data, timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                sheets = data.get('sheets', [])
                total = data.get('total', 0)
                details += f", Found {total} Steel sheets"
                
                # Verify all returned sheets are Steel
                if sheets:
                    non_steel = [s for s in sheets if s.get('type') != 'Steel']
                    if non_steel:
                        success = False
                        details += f" - Found {len(non_steel)} non-Steel sheets in results"
            
            self.log_test("Search Sheets (by type)", success, details)
            
            # Test search by query
            search_data = {"query": "SH-0001"}
            response = requests.post(f"{self.api_url}/sheets/search", json=search_data, timeout=10)
            query_success = response.status_code == 200
            if query_success:
                data = response.json()
                sheets = data.get('sheets', [])
                details = f"Query search found {len(sheets)} sheets"
            else:
                details = f"Query search failed: {response.status_code}"
            
            self.log_test("Search Sheets (by query)", query_success, details)
            return success and query_success
        except Exception as e:
            self.log_test("Search Sheets", False, str(e))
            return False

    def test_find_duplicates(self):
        """Test duplicate finding functionality"""
        try:
            # Test finding Steel duplicates
            params = {
                "type": "Steel",
                "worker_x": 0,
                "worker_y": 0
            }
            response = requests.post(f"{self.api_url}/find-duplicates", params=params, timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                sheets = data.get('sheets', [])
                nearest = data.get('nearest')
                nearest_distance = data.get('nearest_distance')
                total_duplicates = data.get('total_duplicates', 0)
                
                details += f", Found {total_duplicates} Steel duplicates"
                
                # Verify all sheets are Steel and have distance calculated
                if sheets:
                    non_steel = [s for s in sheets if s.get('type') != 'Steel']
                    no_distance = [s for s in sheets if 'distance' not in s]
                    
                    if non_steel:
                        success = False
                        details += f" - Found {len(non_steel)} non-Steel sheets"
                    elif no_distance:
                        success = False
                        details += f" - {len(no_distance)} sheets missing distance"
                    elif nearest and nearest_distance is not None:
                        details += f", Nearest at distance {nearest_distance}"
                    else:
                        success = False
                        details += " - No nearest sheet identified"
            
            self.log_test("Find Duplicates", success, details)
            return success, response.json() if success else {}
        except Exception as e:
            self.log_test("Find Duplicates", False, str(e))
            return False, {}

    def test_calculate_path(self):
        """Test path calculation"""
        try:
            # Test path from (0,0) to (5,5)
            path_data = {
                "start_x": 0,
                "start_y": 0,
                "target_x": 5,
                "target_y": 5
            }
            response = requests.post(f"{self.api_url}/calculate-path", json=path_data, timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                path = data.get('path', [])
                distance = data.get('distance', 0)
                start = data.get('start', {})
                target = data.get('target', {})
                
                details += f", Distance: {distance}, Path steps: {len(path)}"
                
                # Verify path calculation (Manhattan distance should be 10)
                expected_distance = abs(5-0) + abs(5-0)  # 10
                if distance != expected_distance:
                    success = False
                    details += f" - Expected distance {expected_distance}, got {distance}"
                elif len(path) != expected_distance:
                    success = False
                    details += f" - Path length {len(path)} doesn't match distance {distance}"
                elif start.get('x') != 0 or start.get('y') != 0:
                    success = False
                    details += " - Start position incorrect"
                elif target.get('x') != 5 or target.get('y') != 5:
                    success = False
                    details += " - Target position incorrect"
            
            self.log_test("Calculate Path", success, details)
            return success
        except Exception as e:
            self.log_test("Calculate Path", False, str(e))
            return False

    def test_get_sheet_by_id(self, sheet_id=None):
        """Test getting specific sheet by ID"""
        if not sheet_id:
            # First get a sheet ID from the sheets list
            try:
                response = requests.get(f"{self.api_url}/sheets", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    sheets = data.get('sheets', [])
                    if sheets:
                        sheet_id = sheets[0]['id']
                    else:
                        self.log_test("Get Sheet by ID", False, "No sheets available for testing")
                        return False
                else:
                    self.log_test("Get Sheet by ID", False, "Could not get sheets list")
                    return False
            except Exception as e:
                self.log_test("Get Sheet by ID", False, f"Error getting sheets: {e}")
                return False
        
        try:
            response = requests.get(f"{self.api_url}/sheets/{sheet_id}", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                sheet = response.json()
                details += f", Sheet ID: {sheet.get('sheet_id', 'unknown')}"
                
                # Verify sheet has required fields
                required_fields = ['id', 'sheet_id', 'type', 'location_x', 'location_y']
                missing_fields = [field for field in required_fields if field not in sheet]
                if missing_fields:
                    success = False
                    details += f" - Missing fields: {missing_fields}"
            
            self.log_test("Get Sheet by ID", success, details)
            return success
        except Exception as e:
            self.log_test("Get Sheet by ID", False, str(e))
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🔍 Starting Metal Sheet Locator API Tests...")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test basic connectivity first
        if not self.test_health_check():
            print("❌ Health check failed - stopping tests")
            return False
        
        # Generate test data
        data_success, data_response = self.test_generate_data()
        if not data_success:
            print("❌ Data generation failed - stopping tests")
            return False
        
        # Test all endpoints
        self.test_get_sheets()
        self.test_warehouse_stats()
        self.test_warehouse_map()
        self.test_filter_options()
        self.test_search_sheets()
        self.test_find_duplicates()
        self.test_calculate_path()
        self.test_get_sheet_by_id()
        
        # Print summary
        print("=" * 60)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    """Main test runner"""
    tester = MetalSheetAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    results = {
        "timestamp": datetime.now().isoformat(),
        "total_tests": tester.tests_run,
        "passed_tests": tester.tests_passed,
        "success_rate": (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
        "test_details": tester.test_results
    }
    
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())