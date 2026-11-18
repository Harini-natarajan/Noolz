
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import app from './app.js';
import { connectDB } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `[NOOLZ Server] Running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error('[NOOLZ Startup Error]', error.message);
    process.exitCode = 1;
  }
};

startServer();
