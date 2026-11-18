
import serverless from 'serverless-http';

import app from '../../backend/app.js';
import { connectDB } from '../../backend/config/db.js';

// Create the Express serverless handler once
const expressHandler = serverless(app);

// Netlify Function
export const handler = async (event, context) => {
  try {
    // Connect to MongoDB before handling the API request
    await connectDB();

    return await expressHandler(event, context);
  } catch (error) {
    console.error('[Netlify API Error]', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        message: 'Internal Server Error',
      }),
    };
  }
};
