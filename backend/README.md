# Ex Revolution Technology Backend API

This is the backend API for the Ex Revolution Technology website. It provides endpoints for contact form submissions, quote requests, newsletter subscriptions, and user authentication.

## Technology Stack

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT**: JSON Web Tokens for authentication
- **Nodemailer**: For sending emails

## Project Structure

```
backend/
├── src/
│   ├── controllers/    # Route controllers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── config/         # Configuration files
│   ├── utils/          # Utility functions
│   └── server.js       # Main server file
├── .env                # Environment variables
└── package.json        # Project dependencies
```

## API Endpoints

### Public Endpoints

- `POST /api/contact` - Submit a contact form
- `POST /api/quote` - Submit a quote request
- `POST /api/newsletter` - Subscribe to newsletter
- `POST /api/auth/login` - User login
- `POST /api/auth/forgotpassword` - Request password reset

### Protected Endpoints (Requires Authentication)

- `GET /api/auth/me` - Get current user profile

### Admin-Only Endpoints

- `GET /api/contact` - Get all contact submissions
- `GET /api/contact/:id` - Get a specific contact submission
- `PUT /api/contact/:id` - Update contact status
- `GET /api/quote` - Get all quote requests
- `GET /api/quote/:id` - Get a specific quote request
- `PUT /api/quote/:id` - Update quote status
- `POST /api/auth/register` - Register a new user

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   EMAIL_FROM=your_email@gmail.com
   ```
4. Start the server:
   ```
   npm run dev
   ```

## Connecting to the Frontend

To connect this API to the frontend, update the form submission handlers in the frontend JavaScript files to make API calls to the appropriate endpoints. For example:

```javascript
// Example of updating the contact form submission
document.querySelector('.contact-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  const formDataObj = Object.fromEntries(formData.entries());
  
  try {
    const response = await fetch('http://localhost:5000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formDataObj)
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Show success message
      showSuccessMessage('Thank you for your message. We will get back to you soon!');
      this.reset();
    } else {
      // Show error message
      showErrorMessage(data.message || 'Something went wrong. Please try again.');
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    showErrorMessage('Network error. Please check your connection and try again.');
  }
});
```

## Authentication

This API uses JWT (JSON Web Tokens) for authentication. To access protected routes, include the token in the Authorization header:

```
Authorization: Bearer your_jwt_token
```

## Error Handling

All API endpoints return consistent error responses in the following format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "error": "Detailed error information (only in development mode)"
}
```
