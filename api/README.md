# Ex Revolution API

This is the backend API for the Ex Revolution website, handling newsletter subscriptions, contact forms, and quote requests.

## Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_gmail_address
   EMAIL_PASSWORD=your_gmail_app_password
   NODE_ENV=development
   PORT=5000
   ```

3. Start the server:
   ```
   npm start
   ```

4. For development with auto-restart:
   ```
   npm run server
   ```

## Deployment to Vercel

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   npx vercel login
   ```

3. Set up environment variables:
   ```
   npx vercel env add MONGO_URI
   npx vercel env add JWT_SECRET
   npx vercel env add EMAIL_USER
   npx vercel env add EMAIL_PASSWORD
   ```

4. Deploy to Vercel:
   ```
   npx vercel
   ```

5. For production deployment:
   ```
   npx vercel --prod
   ```

## Setting Up a Custom Domain

1. Add your domain in the Vercel dashboard
2. Configure DNS settings as instructed by Vercel
3. Update the API URLs in the frontend code to use your custom domain

## Creating an Admin User

Run the following command to create an admin user:
```
node create-admin.js
```

This will create an admin user with the following credentials:
- Email: admin@exrevolution.com
- Password: Admin@123

## API Endpoints

### Newsletter
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/newsletter/unsubscribe` - Unsubscribe from newsletter
- `GET /api/newsletter/subscribers` - Get all subscribers (admin only)
- `POST /api/newsletter/send` - Send newsletter to all subscribers (admin only)
- `POST /api/newsletter/template` - Create a newsletter template (admin only)
- `GET /api/newsletter/templates` - Get all newsletter templates (admin only)

### Authentication
- `POST /api/auth` - Login
- `GET /api/auth` - Get logged in user

### Users
- `POST /api/users` - Register a user
- `POST /api/users/admin` - Create an admin user (admin only)

### Contact
- `POST /api/contact` - Send contact form

### Quote
- `POST /api/quote` - Send quote request
