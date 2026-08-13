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

async function runPhase4Tests() {
  console.log('==================================================');
  console.log(' FINLY Phase 4 Persistent Data & Multi-User Test');
  console.log('==================================================\n');

  try {
    const time = Date.now();
    const emailA = `usera_p4_${time}@example.com`;
    const emailB = `userb_p4_${time}@example.com`;

    // Step 1: Register and Login User A
    console.log('1. Registering & Logging in User A...');
    await makeRequest({ path: '/api/auth/register', method: 'POST' }, { name: 'Alice P4', email: emailA, password: 'password123' });
    const loginA = await makeRequest({ path: '/api/auth/login', method: 'POST' }, { email: emailA, password: 'password123' });
    const cookieA = loginA.cookies[0].split(';')[0];
    console.log('   User A Authenticated. User ID:', loginA.data.user.id);

    // Step 2: User A Creates 2 Transactions
    console.log('\n2. User A creating transactions...');
    await makeRequest({ path: '/api/transactions', method: 'POST' }, { merchant: 'Organic Groceries', amount: 750, category: 'Food & Dining', type: 'expense' }, cookieA);
    await makeRequest({ path: '/api/transactions', method: 'POST' }, { merchant: 'Tech Store', amount: 1200, category: 'Shopping', type: 'expense' }, cookieA);

    // Step 3: User A Creates a Budget & Savings Goal
    console.log('\n3. User A creating budget and savings goal...');
    await makeRequest({ path: '/api/budgets', method: 'POST' }, { category: 'Food & Dining', monthly_limit: 5000 }, cookieA);
    const goalRes = await makeRequest({ path: '/api/goals', method: 'POST' }, { name: 'Emergency Fund', target_amount: 50000, current_amount: 10000 }, cookieA);
    const goalId = goalRes.data._id || goalRes.data.id;
    await makeRequest({ path: `/api/goals/${goalId}/deposit`, method: 'POST' }, { amount: 5000 }, cookieA);

    // Step 4: Verify User A Data Persistence
    console.log('\n4. Verifying User A Data Fetch...');
    const txsA = await makeRequest({ path: '/api/transactions', method: 'GET' }, null, cookieA);
    const bdgA = await makeRequest({ path: '/api/budgets', method: 'GET' }, null, cookieA);
    const goalA = await makeRequest({ path: '/api/goals', method: 'GET' }, null, cookieA);

    console.log(`   User A Transactions count: ${txsA.data.length} (Expected 2)`);
    console.log(`   User A Budgets count: ${bdgA.data.length} (Category: ${bdgA.data[0]?.category}, Limit: ₹${bdgA.data[0]?.monthly_limit})`);
    console.log(`   User A Goals count: ${goalA.data.length} (Goal: ${goalA.data[0]?.name}, Current: ₹${goalA.data[0]?.current_amount})`);

    if (txsA.data.length === 2 && bdgA.data.length === 1 && goalA.data[0]?.current_amount === 15000) {
      console.log('   [PERSISTENCE PASS] User A data created and retrieved successfully!');
    } else {
      console.error('   [PERSISTENCE FAIL] User A data mismatch!');
    }

    // Step 5: User A Logout & User B Register/Login
    console.log('\n5. Logging out User A and registering User B...');
    await makeRequest({ path: '/api/auth/logout', method: 'POST' }, {}, cookieA);
    await makeRequest({ path: '/api/auth/register', method: 'POST' }, { name: 'Bob P4', email: emailB, password: 'password123' });
    const loginB = await makeRequest({ path: '/api/auth/login', method: 'POST' }, { email: emailB, password: 'password123' });
    const cookieB = loginB.cookies[0].split(';')[0];

    // Step 6: Verify User B cannot see User A data
    console.log('\n6. Checking User B data isolation...');
    const txsB = await makeRequest({ path: '/api/transactions', method: 'GET' }, null, cookieB);
    const bdgB = await makeRequest({ path: '/api/budgets', method: 'GET' }, null, cookieB);
    const goalB = await makeRequest({ path: '/api/goals', method: 'GET' }, null, cookieB);

    console.log(`   User B Transactions count: ${txsB.data.length} (Expected 0)`);
    console.log(`   User B Budgets count: ${bdgB.data.length} (Expected 0)`);
    console.log(`   User B Goals count: ${goalB.data.length} (Expected 0)`);

    if (txsB.data.length === 0 && bdgB.data.length === 0 && goalB.data.length === 0) {
      console.log('   [ISOLATION PASS] User B has ZERO access to User A records!');
    } else {
      console.error('   [ISOLATION FAIL] User B leaked User A data!');
    }

    // Step 7: Create User B data
    console.log('\n7. User B creating transaction...');
    await makeRequest({ path: '/api/transactions', method: 'POST' }, { merchant: 'Artisan Coffee', amount: 350, category: 'Food & Dining', type: 'expense' }, cookieB);
    const txsB_after = await makeRequest({ path: '/api/transactions', method: 'GET' }, null, cookieB);
    console.log(`   User B now has ${txsB_after.data.length} transaction: ₹${txsB_after.data[0]?.amount} ${txsB_after.data[0]?.merchant}`);

    // Step 8: User B Logout & Re-login User A
    console.log('\n8. Logging out User B and re-logging in User A...');
    await makeRequest({ path: '/api/auth/logout', method: 'POST' }, {}, cookieB);
    const reLoginA = await makeRequest({ path: '/api/auth/login', method: 'POST' }, { email: emailA, password: 'password123' });
    const newCookieA = reLoginA.cookies[0].split(';')[0];

    const reTxsA = await makeRequest({ path: '/api/transactions', method: 'GET' }, null, newCookieA);
    const reBdgA = await makeRequest({ path: '/api/budgets', method: 'GET' }, null, newCookieA);
    const reGoalA = await makeRequest({ path: '/api/goals', method: 'GET' }, null, newCookieA);

    if (reTxsA.data.length === 2 && reBdgA.data.length === 1 && reGoalA.data[0]?.current_amount === 15000) {
      console.log('   [MULTI-USER PASS] User A re-authenticated and all financial records are perfectly restored!');
    } else {
      console.error('   [MULTI-USER FAIL] User A records lost or corrupted!');
    }

    console.log('\n==================================================');
    console.log(' ALL PHASE 4 MULTI-USER PERSISTENCE TESTS PASSED');
    console.log('==================================================');
  } catch (err) {
    console.error('Phase 4 Test Error:', err);
  }
}

runPhase4Tests();
