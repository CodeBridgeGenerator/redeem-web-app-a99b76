# API Documentation

## 🔗 Base URL
```
Development: http://localhost:3030
Production: https://your-domain.com
```

## 🔐 Authentication

All API requests require authentication unless specified otherwise. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📋 API Endpoints

### **Authentication**

#### **POST /authentication**
Login with email and password.

**Request Body:**
```json
{
  "strategy": "local",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "authentication": {
    "strategy": "local"
  },
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "john_doe",
    "points": 1000,
    "role": "user"
  }
}
```

#### **POST /authentication/logout**
Logout and invalidate token.

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### **Users**

#### **GET /users**
Get current user profile.

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "username": "john_doe",
  "points": 1000,
  "role": "user",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### **PATCH /users/:id**
Update user profile.

**Request Body:**
```json
{
  "username": "new_username",
  "email": "newemail@example.com"
}
```

### **Vouchers**

#### **GET /vouchers**
Get all vouchers with pagination and filtering.

**Query Parameters:**
- `$limit`: Number of items per page (default: 10)
- `$skip`: Number of items to skip (default: 0)
- `$sort`: Sort field (e.g., `createdAt: -1`)
- `categoryId`: Filter by category
- `isActive`: Filter by active status

**Response:**
```json
{
  "total": 50,
  "limit": 10,
  "skip": 0,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Coffee Voucher",
      "description": "Free coffee at Starbucks",
      "points": 100,
      "image": "https://example.com/image.jpg",
      "categoryId": "507f1f77bcf86cd799439012",
      "isActive": true,
      "termsAndCondition": "Valid for 30 days",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### **GET /vouchers/:id**
Get specific voucher details.

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Coffee Voucher",
  "description": "Free coffee at Starbucks",
  "points": 100,
  "image": "https://example.com/image.jpg",
  "categoryId": "507f1f77bcf86cd799439012",
  "isActive": true,
  "termsAndCondition": "Valid for 30 days",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### **POST /vouchers** (Admin Only)
Create new voucher.

**Request Body:**
```json
{
  "title": "New Voucher",
  "description": "Voucher description",
  "points": 150,
  "image": "https://example.com/image.jpg",
  "categoryId": "507f1f77bcf86cd799439012",
  "isActive": true,
  "termsAndCondition": "Terms and conditions"
}
```

#### **PATCH /vouchers/:id** (Admin Only)
Update voucher.

**Request Body:**
```json
{
  "title": "Updated Voucher Title",
  "points": 200
}
```

#### **DELETE /vouchers/:id** (Admin Only)
Delete voucher.

**Response:**
```json
{
  "message": "Voucher deleted successfully"
}
```

### **Categories**

#### **GET /category**
Get all categories.

**Response:**
```json
{
  "total": 5,
  "limit": 10,
  "skip": 0,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Food & Beverage",
      "description": "Restaurants and cafes",
      "image": "https://example.com/category.jpg",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### **GET /category/:id**
Get specific category.

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Food & Beverage",
  "description": "Restaurants and cafes",
  "image": "https://example.com/category.jpg",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### **Cart Items**

#### **GET /cartItemHistory**
Get user's cart items.

**Query Parameters:**
- `userId`: Filter by user ID
- `status`: Filter by status (pending, completed)

**Response:**
```json
{
  "total": 3,
  "limit": 10,
  "skip": 0,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "userId": "507f1f77bcf86cd799439011",
      "voucherId": "507f1f77bcf86cd799439011",
      "quantity": 1,
      "status": "pending",
      "addedAt": "2024-01-01T00:00:00.000Z",
      "voucher": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Coffee Voucher",
        "points": 100,
        "image": "https://example.com/image.jpg"
      }
    }
  ]
}
```

#### **POST /cartItemHistory**
Add item to cart.

**Request Body:**
```json
{
  "voucherId": "507f1f77bcf86cd799439011",
  "quantity": 1
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439011",
  "voucherId": "507f1f77bcf86cd799439011",
  "quantity": 1,
  "status": "pending",
  "addedAt": "2024-01-01T00:00:00.000Z"
}
```

#### **PATCH /cartItemHistory/:id**
Update cart item.

**Request Body:**
```json
{
  "quantity": 2,
  "status": "completed"
}
```

#### **DELETE /cartItemHistory/:id**
Remove item from cart.

**Response:**
```json
{
  "message": "Item removed from cart"
}
```

### **File Upload**

#### **POST /api/upload-image**
Upload image file.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `image` file

**Response:**
```json
{
  "success": true,
  "imageUrl": "/uploads/filename.jpg",
  "filename": "filename.jpg"
}
```

### **AI Chat**

#### **POST /api/chat**
Send message to AI chatbot.

**Request Body:**
```json
{
  "message": "How do I redeem a voucher?",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "response": "To redeem a voucher, first add it to your cart...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔄 Error Responses

### **400 Bad Request**
```json
{
  "name": "BadRequest",
  "message": "Invalid request data",
  "code": 400,
  "className": "bad-request",
  "data": {
    "field": "error message"
  }
}
```

### **401 Unauthorized**
```json
{
  "name": "NotAuthenticated",
  "message": "Not authenticated",
  "code": 401,
  "className": "not-authenticated"
}
```

### **403 Forbidden**
```json
{
  "name": "Forbidden",
  "message": "Access denied",
  "code": 403,
  "className": "forbidden"
}
```

### **404 Not Found**
```json
{
  "name": "NotFound",
  "message": "Resource not found",
  "code": 404,
  "className": "not-found"
}
```

### **500 Internal Server Error**
```json
{
  "name": "GeneralError",
  "message": "Internal server error",
  "code": 500,
  "className": "general-error"
}
```

## 📊 Rate Limiting

API requests are rate-limited to prevent abuse:
- **Authentication endpoints**: 5 requests per minute
- **Other endpoints**: 100 requests per minute

## 🔒 Security

### **CORS Configuration**
```javascript
// Allowed origins
origins: ['http://localhost:3000', 'https://yourdomain.com']

// Allowed methods
methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

// Allowed headers
headers: ['Content-Type', 'Authorization']
```

### **Input Validation**
All input is validated using Joi schemas:
- Required fields are enforced
- Data types are validated
- String lengths are limited
- Email formats are validated

### **SQL Injection Protection**
- MongoDB queries use parameterized queries
- Input is sanitized before database operations
- No raw SQL queries are used

## 📝 Testing

### **Test API Endpoints**
```bash
# Install test dependencies
npm install --save-dev jest supertest

# Run tests
npm test

# Run specific test
npm test -- --grep "vouchers"
```

### **Example Test**
```javascript
describe('Vouchers API', () => {
  it('should get all vouchers', async () => {
    const response = await request(app)
      .get('/vouchers')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
  });
});
```

## 📚 SDK Examples

### **JavaScript/Node.js**
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3030',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get vouchers
const vouchers = await api.get('/vouchers');

// Add to cart
const cartItem = await api.post('/cartItemHistory', {
  voucherId: '507f1f77bcf86cd799439011',
  quantity: 1
});
```

### **Python**
```python
import requests

api_url = 'http://localhost:3030'
headers = {'Authorization': f'Bearer {token}'}

# Get vouchers
response = requests.get(f'{api_url}/vouchers', headers=headers)
vouchers = response.json()

# Add to cart
cart_data = {
    'voucherId': '507f1f77bcf86cd799439011',
    'quantity': 1
}
response = requests.post(f'{api_url}/cartItemHistory', 
                       json=cart_data, headers=headers)
```

### **cURL Examples**
```bash
# Login
curl -X POST http://localhost:3030/authentication \
  -H "Content-Type: application/json" \
  -d '{"strategy":"local","email":"user@example.com","password":"password123"}'

# Get vouchers
curl -X GET http://localhost:3030/vouchers \
  -H "Authorization: Bearer YOUR_TOKEN"

# Add to cart
curl -X POST http://localhost:3030/cartItemHistory \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"voucherId":"507f1f77bcf86cd799439011","quantity":1}'
```

## 📞 Support

For API support:
- Check the [Setup Guide](./SETUP.md)
- Create an issue on GitHub
- Contact the development team 