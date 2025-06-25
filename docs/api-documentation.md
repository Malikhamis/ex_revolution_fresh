# API Documentation

## 🔗 Base URL
```
Development: http://localhost:3000
Production: https://exrevolution.com
```

## 🔐 Authentication

Most endpoints require authentication using JWT tokens. Include the token in the request header:

```http
Authorization: Bearer <jwt-token>
```

Or use the custom header:
```http
x-auth-token: <jwt-token>
```

## 📊 Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error information"
  }
}
```

## 🔑 Authentication Endpoints

### POST /api/auth
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "admin@exrevolution.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "admin@exrevolution.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

**Error Codes:**
- `INVALID_CREDENTIALS` - Wrong email or password
- `VALIDATION_ERROR` - Missing required fields

## 📝 Content Management

### Blog Posts

#### GET /api/blog-posts
Get all blog posts (authenticated).

**Query Parameters:**
- `status` (optional) - Filter by status: `published`, `draft`
- `limit` (optional) - Number of posts to return
- `offset` (optional) - Number of posts to skip

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Blog Post Title",
      "excerpt": "Short description...",
      "content": "Full content...",
      "author": "Author Name",
      "category": "Technology",
      "tags": ["web", "development"],
      "status": "published",
      "featured": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "slug": "blog-post-title"
    }
  ]
}
```

#### POST /api/blog-posts
Create new blog post (authenticated).

**Request Body:**
```json
{
  "title": "New Blog Post",
  "excerpt": "Short description of the post",
  "content": "Full content of the blog post",
  "author": "Author Name",
  "category": "Technology",
  "tags": ["web", "development"],
  "status": "published",
  "featured": false,
  "imageUrl": "/uploads/image.jpg"
}
```

#### PUT /api/blog-posts/:id
Update existing blog post (authenticated).

#### DELETE /api/blog-posts/:id
Delete blog post (authenticated).

### Case Studies

#### GET /api/case-studies
Get all case studies (authenticated).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Case Study Title",
      "excerpt": "Brief description...",
      "content": "Detailed case study...",
      "client": "Client Name",
      "industry": "Technology",
      "projectType": "Website Development",
      "technologies": ["React", "Node.js"],
      "duration": "3 months",
      "teamSize": 5,
      "status": "published",
      "featured": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "slug": "case-study-title"
    }
  ]
}
```

#### POST /api/case-studies
Create new case study (authenticated).

### Contacts

#### GET /api/contacts
Get all contact submissions (authenticated).

**Query Parameters:**
- `status` (optional) - Filter by status: `new`, `responded`, `closed`
- `priority` (optional) - Filter by priority: `low`, `medium`, `high`

#### POST /api/contacts
Submit contact form (public).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "General Inquiry",
  "message": "Hello, I'm interested in your services...",
  "phone": "+1234567890",
  "company": "Example Corp"
}
```

#### PUT /api/contacts/:id/status
Update contact status (authenticated).

### Quotes

#### GET /api/quotes
Get all quote requests (authenticated).

#### POST /api/quotes
Submit quote request (public).

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "projectType": "Website Development",
  "description": "I need a new website for my business...",
  "budget": "$5,000 - $15,000",
  "timeline": "1 month",
  "company": "Smith Business",
  "phone": "+1234567890"
}
```

## 🌐 Public Endpoints

### GET /api/public/blog-posts
Get published blog posts (no authentication required).

### GET /api/public/case-studies
Get published case studies (no authentication required).

### GET /api/health
System health check.

**Response:**
```json
{
  "status": "OK",
  "message": "Ex Revolution API operational",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "2.0.0",
  "uptime": 3600,
  "database": {
    "status": "connected",
    "type": "MongoDB"
  },
  "memory": {
    "used": "45.2 MB",
    "total": "128 MB"
  }
}
```

## 📁 File Management

### POST /api/upload/image
Upload image file (authenticated).

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `image`
- Max file size: 5MB
- Allowed types: JPEG, PNG, GIF, WebP

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "imageUrl": "/uploads/img_1640995200000_abc12345.jpg",
    "filename": "img_1640995200000_abc12345.jpg",
    "originalName": "my-image.jpg",
    "size": 1024000,
    "mimetype": "image/jpeg",
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/images
List uploaded images (authenticated).

### DELETE /api/images/:filename
Delete image file (authenticated).

## 📊 Analytics & Monitoring

### POST /api/analytics
Submit analytics events (public).

**Request Body:**
```json
{
  "events": [
    {
      "event": "page_view",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "page": {
        "url": "https://exrevolution.com/",
        "title": "Ex Revolution - Home"
      },
      "user": {
        "id": "user_123",
        "sessionId": "session_456"
      }
    }
  ]
}
```

### GET /api/analytics/dashboard
Get analytics dashboard data (authenticated).

### GET /api/monitoring/performance
Get system performance metrics (authenticated).

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": {
      "process": 3600,
      "system": 86400
    },
    "memory": {
      "rss": "64 MB",
      "heapUsed": "32 MB",
      "heapTotal": "48 MB"
    },
    "performance": {
      "requests": 1000,
      "averageResponseTime": "150ms",
      "errorRate": "0.5%"
    }
  }
}
```

### GET /api/monitoring/advanced
Get advanced monitoring metrics (authenticated).

### GET /api/monitoring/logs
Get system logs (authenticated).

### POST /api/monitoring/export
Export metrics to file (authenticated).

## 💾 Backup System

### POST /api/backup/create
Create system backup (authenticated).

**Request Body:**
```json
{
  "type": "manual"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Backup created successfully",
  "data": {
    "backupId": "backup-manual-2024-01-01T00-00-00-000Z",
    "manifest": {
      "id": "backup-manual-2024-01-01T00-00-00-000Z",
      "type": "manual",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "totalSize": 10485760
    }
  }
}
```

### GET /api/backup/list
List available backups (authenticated).

## 🚨 Error Codes

### Authentication Errors
- `AUTHENTICATION_ERROR` - Invalid or missing token
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `TOKEN_EXPIRED` - JWT token has expired

### Validation Errors
- `VALIDATION_ERROR` - Input validation failed
- `INVALID_ID` - Invalid ID format
- `DUPLICATE_FIELD` - Duplicate field value

### File Upload Errors
- `FILE_TOO_LARGE` - File exceeds size limit
- `INVALID_FILE_TYPE` - Unsupported file type
- `UPLOAD_ERROR` - General upload error

### System Errors
- `INTERNAL_ERROR` - Server error
- `DATABASE_ERROR` - Database connection issue
- `RATE_LIMIT_EXCEEDED` - Too many requests

## 📈 Rate Limiting

API endpoints are rate limited to prevent abuse:

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **File Upload**: 10 requests per hour

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🔧 Development

### Testing API Endpoints

Use curl or Postman to test endpoints:

```bash
# Health check
curl -X GET http://localhost:3000/api/health

# Authentication
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@exrevolution.com","password":"Admin@123"}'

# Get blog posts (with auth)
curl -X GET http://localhost:3000/api/blog-posts \
  -H "x-auth-token: your-jwt-token"
```

### API Client Examples

#### JavaScript (Fetch)
```javascript
// Authenticate
const response = await fetch('/api/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@exrevolution.com',
    password: 'password'
  })
});

const { token } = await response.json();

// Use token for authenticated requests
const blogPosts = await fetch('/api/blog-posts', {
  headers: { 'x-auth-token': token }
});
```

#### Python (requests)
```python
import requests

# Authenticate
auth_response = requests.post('http://localhost:3000/api/auth', json={
    'email': 'admin@exrevolution.com',
    'password': 'password'
})

token = auth_response.json()['token']

# Get blog posts
blog_response = requests.get('http://localhost:3000/api/blog-posts', 
    headers={'x-auth-token': token})
```

---

For more information, see the [main documentation](./README.md).
