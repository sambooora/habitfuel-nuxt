# Finance Dashboard API Security Test

This script tests all secure API endpoints to ensure they work correctly with authentication.

## Test User Credentials
- Email: richiesambora9029@gmail.com
- Password: Slash929

## Available Test Endpoints

### Authentication Endpoints
- `GET /api/auth/me` - Check current user authentication
- `GET /api/auth/verify-token` - Verify authentication token

### Finance Dashboard Endpoints
- `GET /api/finance/dashboard` - Get dashboard summary data
- `GET /api/finance/transactions` - Get all transactions
- `POST /api/finance/transactions` - Create new transaction
- `GET /api/finance/investments` - Get all investments
- `POST /api/finance/investments` - Create new investment
- `GET /api/finance/debts` - Get all debts
- `POST /api/finance/debts` - Create new debt
- `GET /api/finance/assets` - Get all assets
- `POST /api/finance/assets` - Create new asset

## How to Test

1. **Manual Testing**: Visit http://localhost:3001/test-api in your browser
2. **Automated Testing**: Use the API testing page to run all tests
3. **Individual Testing**: Use curl commands with proper authentication

## Expected Results

All secure endpoints should:
- ✅ Return 401 Unauthorized for requests without authentication
- ✅ Return proper data for authenticated requests
- ✅ Apply rate limiting to prevent abuse
- ✅ Validate input data properly
- ✅ Return appropriate error messages

## Security Features Tested

- JWT-based authentication
- Rate limiting per endpoint
- Input validation and sanitization
- Data encryption for sensitive fields
- Audit logging for financial operations
- CORS and security headers