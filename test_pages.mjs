import fs from 'fs';

const BASE_URL = 'http://localhost:3000';

async function login(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const cookies = res.headers.getSetCookie();
  const cookieStr = cookies.map(c => c.split(';')[0]).join('; ');
  return cookieStr;
}

const GUEST_PAGES = [
  '/', '/login', '/register', '/product', '/contact', '/faq', '/privacy', '/terms'
];

const CUSTOMER_PAGES = [
  '/dashboard', '/products', '/history', '/topup', '/checkout', '/settings'
];

const ADMIN_PAGES = [
  '/admin/dashboard', '/admin/customers', '/admin/plans', '/admin/transactions', '/admin/orders'
];

async function testPage(url, cookie = '') {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { Cookie: cookie }
  });
  console.log(`[${res.status}] ${url}`);
  if (!res.ok) {
     const text = await res.text();
     // Extract error message if it's a next.js error page
     let errorMsg = text.substring(0, 500);
     const match = text.match(/<title>(.*?)<\/title>/);
     if (match) {
         errorMsg = match[1];
     }
     console.log(`   -> ERROR on ${url}:`, errorMsg);
  }
}

async function run() {
  console.log('Testing GUEST pages...');
  for (const page of GUEST_PAGES) await testPage(page);

  console.log('\\nLogging in as CUSTOMER...');
  const customerCookie = await login('budi@student.univ.ac.id', 'Password123!');
  console.log('Testing CUSTOMER pages...');
  for (const page of CUSTOMER_PAGES) await testPage(page, customerCookie);

  console.log('\\nLogging in as ADMIN...');
  const adminCookie = await login('admin@rupacloud.id', 'Admin123!');
  console.log('Testing ADMIN pages...');
  for (const page of ADMIN_PAGES) await testPage(page, adminCookie);
}

run().catch(console.error);
