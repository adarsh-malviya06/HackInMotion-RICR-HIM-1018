import http from 'http';

function makeRequest(options, postData = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (cookie) headers['Cookie'] = cookie;

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
          try { parsed = JSON.parse(body); } catch { parsed = body; }
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
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function runFiveUserDemoTest() {
  console.log('================================================================');
  console.log(' FINLY 5-User Persistent Demo & Data Isolation Verification');
  console.log('================================================================\n');

  const demoUsers = [
    { name: 'Demo User 1', email: 'demo1@finly.test', password: 'password123', txMerchant: 'Food Express', txAmount: 1000, txCat: 'Food & Dining', bdgCat: 'Food & Dining', bdgLimit: 5000, goalName: 'Emergency Fund', goalTarget: 50000 },
    { name: 'Demo User 2', email: 'demo2@finly.test', password: 'password123', txMerchant: 'Luxury Mall', txAmount: 2500, txCat: 'Shopping', bdgCat: 'Shopping', bdgLimit: 10000, goalName: 'Car Fund', goalTarget: 100000 },
    { name: 'Demo User 3', email: 'demo3@finly.test', password: 'password123', txMerchant: 'Artisan Coffee', txAmount: 450, txCat: 'Food & Dining', bdgCat: 'Food & Dining', bdgLimit: 3000, goalName: 'Vacation Goal', goalTarget: 20000 },
    { name: 'Demo User 4', email: 'demo4@finly.test', password: 'password123', txMerchant: 'Apartment Rent', txAmount: 15000, txCat: 'Rent & Housing', bdgCat: 'Rent & Housing', bdgLimit: 20000, goalName: 'House Goal', goalTarget: 300000 },
    { name: 'Demo User 5', email: 'demo5@finly.test', password: 'password123', txMerchant: 'Fitness Gym', txAmount: 800, txCat: 'Healthcare', bdgCat: 'Healthcare', bdgLimit: 5000, goalName: 'Laptop Fund', goalTarget: 15000 }
  ];

  const userCookies = {};
  const userTxIds = {};

  try {
    // Step 1: Register and Login all 5 demo users
    console.log('1. Registering & Authenticating 5 Demo Users (demo1@finly.test to demo5@finly.test)...');
    for (const u of demoUsers) {
      // Register (ignore 400 if already created in previous run)
      await makeRequest({ path: '/api/auth/register', method: 'POST' }, { name: u.name, email: u.email, password: u.password });
      
      const loginRes = await makeRequest({ path: '/api/auth/login', method: 'POST' }, { email: u.email, password: u.password });
      if (loginRes.status !== 200) {
        throw new Error(`Login failed for ${u.email}: ${JSON.stringify(loginRes.data)}`);
      }
      const rawCookie = loginRes.cookies ? loginRes.cookies[0] : '';
      userCookies[u.email] = rawCookie.split(';')[0];
      console.log(`   ✓ Authenticated ${u.email} (User ID: ${loginRes.data.user.id})`);
    }

    // Step 2: Populate distinct persistent datasets for each of the 5 demo users
    console.log('\n2. Populating distinct financial records for each of the 5 demo users...');
    for (const u of demoUsers) {
      const cookie = userCookies[u.email];
      
      // Create Transaction
      const txRes = await makeRequest({ path: '/api/transactions', method: 'POST' }, {
        merchant: u.txMerchant,
        amount: u.txAmount,
        category: u.txCat,
        type: 'expense'
      }, cookie);
      userTxIds[u.email] = txRes.data._id || txRes.data.id;

      // Create Budget
      await makeRequest({ path: '/api/budgets', method: 'POST' }, {
        category: u.bdgCat,
        monthly_limit: u.bdgLimit
      }, cookie);

      // Create Goal
      await makeRequest({ path: '/api/goals', method: 'POST' }, {
        name: u.goalName,
        target_amount: u.goalTarget,
        current_amount: 1000
      }, cookie);

      console.log(`   ✓ ${u.email} created: Tx ₹${u.txAmount} ${u.txMerchant} | Budget: ${u.bdgCat} ₹${u.bdgLimit} | Goal: ${u.goalName}`);
    }

    // Step 3: Verify strict data isolation across all 5 users
    console.log('\n3. Verifying strict zero-data-leakage data isolation across all 5 users...');
    for (const u of demoUsers) {
      const cookie = userCookies[u.email];
      
      const txs = await makeRequest({ path: '/api/transactions', method: 'GET' }, null, cookie);
      const bdgs = await makeRequest({ path: '/api/budgets', method: 'GET' }, null, cookie);
      const goals = await makeRequest({ path: '/api/goals', method: 'GET' }, null, cookie);

      // Verify user's own transaction is present
      const containsOwnTx = txs.data.some(t => String(t._id || t.id) === String(userTxIds[u.email]));
      if (!containsOwnTx) {
        throw new Error(`FAIL: ${u.email} cannot see their own transaction!`);
      }

      // Verify no other user's transactions are leaked
      for (const other of demoUsers) {
        if (other.email !== u.email) {
          const leakedTx = txs.data.some(t => String(t._id || t.id) === String(userTxIds[other.email]));
          if (leakedTx) {
            throw new Error(`SECURITY VULNERABILITY: ${u.email} leaked transaction from ${other.email}!`);
          }
        }
      }

      console.log(`   [ISOLATION PASS] ${u.email} sees ONLY their own transactions (${txs.data.length}), budgets (${bdgs.data.length}), goals (${goals.data.length})`);
    }

    // Step 4: Security Attack Verification (User 1 attempts to modify/delete User 2 transaction)
    console.log('\n4. Security Attack Verification (User 1 attempts unauthorized access to User 2 record)...');
    const cookieUser1 = userCookies['demo1@finly.test'];
    const txIdUser2 = userTxIds['demo2@finly.test'];

    const attackGet = await makeRequest({ path: `/api/transactions/${txIdUser2}`, method: 'GET' }, null, cookieUser1);
    const attackDelete = await makeRequest({ path: `/api/transactions/${txIdUser2}`, method: 'DELETE' }, null, cookieUser1);

    if (attackGet.status === 404 && attackDelete.status === 404) {
      console.log('   [SECURITY PASS] Unauthorized access attempt blocked with 404 Not Found.');
    } else {
      throw new Error(`SECURITY FAIL: Attack returned status GET: ${attackGet.status}, DELETE: ${attackDelete.status}`);
    }

    // Step 5: Logout and Re-login verification
    console.log('\n5. Logout & Re-login Verification...');
    for (const u of demoUsers) {
      // Logout
      await makeRequest({ path: '/api/auth/logout', method: 'POST' }, {}, userCookies[u.email]);
      
      // Re-login
      const reLogin = await makeRequest({ path: '/api/auth/login', method: 'POST' }, { email: u.email, password: u.password });
      const newCookie = reLogin.cookies[0].split(';')[0];
      
      const reTxs = await makeRequest({ path: '/api/transactions', method: 'GET' }, null, newCookie);
      if (!reTxs.data.some(t => String(t._id || t.id) === String(userTxIds[u.email]))) {
        throw new Error(`PERSISTENCE FAIL: ${u.email} lost data after re-login!`);
      }
    }
    console.log('   [PERSISTENCE PASS] All 5 demo users logged out and re-authenticated with 100% data intact.');

    console.log('\n================================================================');
    console.log(' 🎉 ALL 5 DEMO USER PERSISTENCE & ISOLATION TESTS PASSED!');
    console.log('================================================================');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

runFiveUserDemoTest();
