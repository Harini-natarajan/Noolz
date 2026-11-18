import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import Admin from './models/Admin.js';
import authRoutes from './routes/authRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from './utils/generateToken.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const runTests = async () => {
  console.log('\n======================================================');
  console.log('NOOLZ Admin Authentication & Route Protection Test Suite');
  console.log('======================================================\n');

  await connectDB();

  // Create temporary in-memory express instance for direct testing
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/stock', stockRoutes);

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  let testPassed = 0;
  let testFailed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(`  ✓ PASSED: ${title}`);
      testPassed++;
    } else {
      console.error(`  ✗ FAILED: ${title}`);
      testFailed++;
    }
  };

  try {
    // ----------------------------------------------------
    // Scenario 2: Login with valid credentials
    // ----------------------------------------------------
    console.log('\n--- Scenario 2: Login with valid credentials ---');
    const validLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'Hellonoolz.in@gmail.com',
        password: process.env.ADMIN_PASSWORD,
      }),
    });
    const validLoginData = await validLoginRes.json();
    const setCookieHeader = validLoginRes.headers.get('set-cookie');

    assert(validLoginRes.status === 200, 'Returns HTTP 200 on valid credentials');
    assert(Boolean(validLoginData.accessToken), 'Returns valid accessToken');
    assert(validLoginData.admin?.role === 'admin', 'Admin role is "admin"');
    assert(
      Boolean(setCookieHeader && setCookieHeader.includes('refreshToken=')),
      'Sets HttpOnly refreshToken cookie'
    );

    const accessToken = validLoginData.accessToken;
    // Extract raw cookie string for subsequent tests
    const cookieString = setCookieHeader ? setCookieHeader.split(';')[0] : '';
    const refreshTokenValue = cookieString.replace('refreshToken=', '');

    // ----------------------------------------------------
    // Scenario 3: Login with incorrect credentials
    // ----------------------------------------------------
    console.log('\n--- Scenario 3: Login with incorrect credentials ---');
    const invalidLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'Hellonoolz.in@gmail.com',
        password: 'WrongPassword@999',
      }),
    });
    const invalidLoginData = await invalidLoginRes.json();
    assert(invalidLoginRes.status === 401, 'Returns HTTP 401 on incorrect password');
    assert(invalidLoginData.success === false, 'success is false');

    // ----------------------------------------------------
    // Scenario 4: Access protected APIs without a token
    // ----------------------------------------------------
    console.log('\n--- Scenario 4: Access protected APIs without a token ---');
    const noTokenRes = await fetch(`${baseUrl}/stock/overview`);
    const noTokenData = await noTokenRes.json();
    assert(noTokenRes.status === 401, 'Returns HTTP 401 without token');
    assert(noTokenData.code === 'NO_TOKEN', 'Error code is NO_TOKEN');

    // ----------------------------------------------------
    // Scenario 5: Access protected APIs with an invalid token
    // ----------------------------------------------------
    console.log('\n--- Scenario 5: Access protected APIs with an invalid token ---');
    const invalidTokenRes = await fetch(`${baseUrl}/stock/overview`, {
      headers: { Authorization: 'Bearer this.is.an.invalid.token' },
    });
    const invalidTokenData = await invalidTokenRes.json();
    assert(invalidTokenRes.status === 401, 'Returns HTTP 401 with invalid token');
    assert(invalidTokenData.code === 'INVALID_TOKEN', 'Error code is INVALID_TOKEN');

    // ----------------------------------------------------
    // Scenario 6: Access protected APIs with an expired access token
    // ----------------------------------------------------
    console.log('\n--- Scenario 6: Access protected APIs with an expired access token ---');
    const expiredToken = jwt.sign(
      { id: validLoginData.admin.id, role: 'admin', username: 'admin' },
      process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
      { expiresIn: '-1s' } // Expired 1 second ago
    );
    const expiredRes = await fetch(`${baseUrl}/stock/overview`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    const expiredData = await expiredRes.json();
    assert(expiredRes.status === 401, 'Returns HTTP 401 with expired access token');
    assert(expiredData.code === 'TOKEN_EXPIRED', 'Error code is TOKEN_EXPIRED');

    // ----------------------------------------------------
    // Scenario 7: Refresh expired access token using valid refresh token
    // ----------------------------------------------------
    console.log('\n--- Scenario 7: Refresh access token using valid refresh token ---');
    const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieString,
      },
    });
    const refreshData = await refreshRes.json();
    const newCookieHeader = refreshRes.headers.get('set-cookie');

    assert(refreshRes.status === 200, 'Returns HTTP 200 on valid token refresh');
    assert(Boolean(refreshData.accessToken), 'Returns new access token');
    assert(
      refreshData.accessToken !== accessToken,
      'Rotated access token is fresh and distinct'
    );
    assert(
      Boolean(newCookieHeader && newCookieHeader.includes('refreshToken=')),
      'Rotated refresh token cookie is set'
    );

    const rotatedCookie = newCookieHeader ? newCookieHeader.split(';')[0] : '';
    const newAccessToken = refreshData.accessToken;

    // Verify the new access token can successfully access protected APIs
    const accessWithNewTokenRes = await fetch(`${baseUrl}/stock/overview`, {
      headers: { Authorization: `Bearer ${newAccessToken}` },
    });
    assert(
      accessWithNewTokenRes.status === 200,
      'Newly rotated access token successfully accesses protected endpoint'
    );

    // ----------------------------------------------------
    // Scenario 8: Access admin APIs using a non-admin account
    // ----------------------------------------------------
    console.log('\n--- Scenario 8: Access admin APIs using non-admin account (Role Authorization) ---');
    // Generate token with role: 'customer'
    const customerToken = jwt.sign(
      { id: validLoginData.admin.id, role: 'customer', username: 'regular_user' },
      process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    // Create or mock non-admin in check:
    // Let's test the requireAdmin middleware
    const { requireAdmin } = await import('./middleware/authMiddleware.js');
    let reqMock = { admin: { role: 'customer' } };
    let resMock = {
      statusCode: null,
      jsonBody: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.jsonBody = data;
        return this;
      },
    };
    let nextMockCalled = false;
    requireAdmin(reqMock, resMock, () => {
      nextMockCalled = true;
    });

    assert(resMock.statusCode === 403, 'requireAdmin rejects non-admin with HTTP 403');
    assert(resMock.jsonBody?.code === 'FORBIDDEN', 'Error code is FORBIDDEN');
    assert(!nextMockCalled, 'next() is NOT called for unauthorized role');

    // ----------------------------------------------------
    // Scenario 9: Logout and revoke session
    // ----------------------------------------------------
    console.log('\n--- Scenario 9: Logout and revoke session ---');
    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: rotatedCookie,
      },
    });
    const logoutData = await logoutRes.json();
    const logoutCookieHeader = logoutRes.headers.get('set-cookie');

    assert(logoutRes.status === 200, 'Returns HTTP 200 on logout');
    assert(logoutData.success === true, 'Logout success is true');
    assert(
      Boolean(logoutCookieHeader && (logoutCookieHeader.includes('refreshToken=;') || logoutCookieHeader.includes('Expires='))),
      'Clears refreshToken cookie'
    );

    // ----------------------------------------------------
    // Scenario 10: Try using a revoked refresh token
    // ----------------------------------------------------
    console.log('\n--- Scenario 10: Try using a revoked / reused refresh token ---');
    // The previous refreshTokenValue was already rotated and superseded in Scenario 7
    const revokedRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refreshToken=${refreshTokenValue}`,
      },
    });
    const revokedData = await revokedRes.json();

    assert(
      revokedRes.status === 403 || revokedRes.status === 401,
      'Reused/revoked refresh token is rejected with HTTP 403 / 401'
    );
    assert(
      revokedData.code === 'REVOKED_TOKEN' || revokedData.success === false,
      'Token reuse detection triggered'
    );

    console.log('\n======================================================');
    console.log(`Results: ${testPassed} Passed, ${testFailed} Failed`);
    console.log('======================================================\n');

    server.close();
    process.exit(testFailed > 0 ? 1 : 0);
  } catch (error) {
    console.error('[Test Suite Error]', error);
    server.close();
    process.exit(1);
  }
};

runTests();
