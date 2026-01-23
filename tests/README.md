# Testing Guide

## Running Tests

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Run All Tests
```bash
pytest
```

### Run Specific Test Files
```bash
# Test only product routes
pytest tests/test_products.py

# Test only analysis routes
pytest tests/test_analysis.py

# Test only services
pytest tests/test_services.py
```

### Run with Coverage
```bash
pytest --cov=Backend --cov-report=html
```

### Run Specific Test Classes or Functions
```bash
# Run specific test class
pytest tests/test_products.py::TestProductRoutes

# Run specific test function
pytest tests/test_products.py::TestProductRoutes::test_search_products_success
```

## Test Structure

```
tests/
├── __init__.py           # Package initialization
├── conftest.py           # Shared fixtures and configuration
├── test_products.py      # Tests for product routes
├── test_analysis.py      # Tests for analysis routes
└── test_services.py      # Unit tests for services
```

## Test Coverage

### Backend Tests
- **Product Routes**: Search, detail retrieval, barcode lookup
- **Analysis Routes**: Ingredient analysis, product analysis, OCR processing
- **Services**: OpenFoodFacts, Watson AI, Watson OCR
- **Error Handling**: Invalid inputs, missing data, API failures
- **Data Validation**: Response structure validation

### Frontend Tests
Frontend testing can be added using Jest and React Testing Library:
```bash
cd Frontend
npm test
```

## Notes

- Tests mock external API calls where appropriate
- Some integration tests require internet connectivity
- Watson AI/OCR tests will run in mock mode without credentials
- Use `-m "not slow"` to skip slow integration tests
