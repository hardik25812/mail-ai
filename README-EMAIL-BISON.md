# Email Bison Integration

This project integrates with the Email Bison API to fetch and display workspace and inbox data.

## Project Structure

- **Backend**: Express.js API with TypeScript that communicates with Email Bison API
- **Frontend**: Next.js application with React components to display Email Bison data

## Setup Instructions

### Backend Setup

1. Navigate to the API directory:
   ```
   cd api
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the `api` directory with the following content:
   ```
   # Server Configuration
   PORT=4000
   NODE_ENV=development

   # Frontend URL for CORS
   FRONTEND_URL=http://localhost:3000

   # Email Bison API Configuration
   BISON_API_KEY=your_bison_api_key_here
   ```

4. Replace `your_bison_api_key_here` with your actual Email Bison API key.

5. Compile TypeScript:
   ```
   npm run build
   ```

6. Start the development server:
   ```
   npm run dev
   ```

The backend server will be running at http://localhost:4000.

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies (if not already installed):
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

The frontend will be running at http://localhost:3000. Visit http://localhost:3000/email-bison to see the Email Bison integration.

## API Endpoints

### Backend to Email Bison API:

- **GET /api/inboxes** - Fetch all inboxes from Email Bison
- **GET /api/inboxes/:id** - Fetch a specific inbox by ID
- **GET /api/workspaces** - Fetch all workspaces from Email Bison
- **GET /api/workspaces/:id** - Fetch a specific workspace by ID

## Troubleshooting

- Ensure both servers are running simultaneously
- Check that your Email Bison API key is correctly set in the `.env` file
- If CORS errors occur, verify that the `FRONTEND_URL` in `.env` matches your frontend URL
- Check browser console and server logs for detailed error messages
