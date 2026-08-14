import http from 'http';

function makeRequest(options, postData = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (cookie) {
      headers['Cookie'] = cookie;
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: options.path,
        method: options.method,
        headers
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(body);
          } catch {
            parsed = body;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            cookies: res.headers['set-cookie'],
            data: parsed
          });
        });
      }
    );

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runAuthTests() {
  console.log('==================================================');
  console.log(' Finova Phase 1 Backend Auth Verification Test Suite');
  console.log('==================================================\n');

  try {
    // 1. Health check
    console.log('1. GET /api/health');
    const health = await makeRequest({ path: '/api/health', method: 'GET' });
    console.log(`   Status: ${health.status}`, health.data);

    // Unique user test email using timestamp
    const testEmail = `testuser_${Date.now()}@example.com`;

    // 2. Register user
    console.log(`\n2. POST /api/auth/register (New User: ${testEmail})`);
    const reg = await makeRequest(
      { path: '/api/auth/register', method: 'POST' },
      { name: 'Finova Test User', email: testEmail, password: 'securePassword123' }
    );
    console.log(`   Status: ${reg.status}`, reg.data);

    // 3. Duplicate register
    console.log(`\n3. POST /api/auth/register (Duplicate Email Test)`);
    const dupReg = await makeRequest(
      { path: '/api/auth/register', method: 'POST' },
      { name: 'Finova Test User', email: testEmail, password: 'securePassword123' }
    );
    console.log(`   Status: ${dupReg.status} (Expected 400)`, dupReg.data);

    // 4. Login with wrong password
    console.log(`\n4. POST /api/auth/login (Wrong Password Test)`);
    const wrongLogin = await makeRequest(
      { path: '/api/auth/login', method: 'POST' },
      { email: testEmail, password: 'wrongPassword' }
    );
    console.log(`   Status: ${wrongLogin.status} (Expected 401)`, wrongLogin.data);

    // 5. Login with correct password
    console.log(`\n5. POST /api/auth/login (Correct Password Test)`);
    const login = await makeRequest(
      { path: '/api/auth/login', method: 'POST' },
      { email: testEmail, password: 'securePassword123' }
    );
    const rawCookie = login.cookies ? login.cookies[0] : null;
    const authCookie = rawCookie ? rawCookie.split(';')[0] : null;
    console.log(`   Status: ${login.status}`, login.data);
    console.log(`   Set-Cookie Received:`, rawCookie ? 'YES (HttpOnly token cookie set)' : 'NO');

    // 6. GET /api/auth/me WITH Cookie
    console.log(`\n6. GET /api/auth/me (With HttpOnly Auth Cookie)`);
    const me = await makeRequest({ path: '/api/auth/me', method: 'GET' }, null, authCookie);
    console.log(`   Status: ${me.status}`, me.data);

    // 7. GET /api/auth/me WITHOUT Cookie
    console.log(`\n7. GET /api/auth/me (Without Cookie / Unauthenticated)`);
    const meUnauth = await makeRequest({ path: '/api/auth/me', method: 'GET' });
    console.log(`   Status: ${meUnauth.status} (Expected 401)`, meUnauth.data);

    // 8. Logout
    console.log(`\n8. POST /api/auth/logout (Clearing Cookie)`);
    const logout = await makeRequest({ path: '/api/auth/logout', method: 'POST' }, null, authCookie);
    const clearedCookie = logout.cookies ? logout.cookies[0] : null;
    console.log(`   Status: ${logout.status}`, logout.data);
    console.log(`   Cleared Cookie Received:`, clearedCookie);

    // 9. GET /api/auth/me after logout
    console.log(`\n9. GET /api/auth/me (After Logout)`);
    const meAfterLogout = await makeRequest({ path: '/api/auth/me', method: 'GET' }, null, clearedCookie);
    console.log(`   Status: ${meAfterLogout.status} (Expected 401)`, meAfterLogout.data);

    console.log('\n==================================================');
    console.log(' ALL PHASE 1 AUTHENTICATION TESTS COMPLETED');
    console.log('==================================================');
  } catch (err) {
    console.error('Test Suite Failed:', err);
  }
}

runAuthTests();
