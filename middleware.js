export const config = { runtime: 'edge' };

const COOKIE_NAME = 'vatsim_session';
const SESSION_HOURS = 8;

export default async function middleware(req) {
  const url = new URL(req.url);
  const { pathname, origin } = url;

  if (pathname === '/auth/vatsim') return startLogin();
  if (pathname === '/auth/vatsim/callback') return handleCallback(req, url);
  if (pathname === '/logout') return logout();
  if (pathname === '/login' || pathname === '/login.html') return fetch(req);

  const session = await getSession(req);

  if (pathname.startsWith('/admin')) {
    if (!session || !session.isAdmin) return new Response('Forbidden', { status: 403 });
    if (pathname === '/admin/api/users') return adminUsersApi(req);
    if (pathname.startsWith('/admin/api/users/')) return adminDeleteApi(req, url);
    return fetch(req);
  }

  if (!session) {
    return Response.redirect(`${origin}/login`, 302);
  }

  return fetch(req);
}

function startLogin() {
  const params = new URLSearchParams({
    client_id: process.env.VATSIM_CLIENT_ID,
    redirect_uri: process.env.REDIRECT_URI,
    response_type: 'code',
    scope: 'full_name vatsim_details email'
  });
  return Response.redirect(`${process.env.VATSIM_AUTH_URL}/oauth/authorize?${params}`, 302);
}

async function handleCallback(req, url) {
  const code = url.searchParams.get('code');
  if (!code) return Response.redirect(`${url.origin}/login`, 302);

  const tokenRes = await fetch(`${process.env.VATSIM_AUTH_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.VATSIM_CLIENT_ID,
      client_secret: process.env.VATSIM_CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      code
    })
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return Response.redirect(`${url.origin}/login?error=server`, 302);
  }

  const userRes = await fetch(`${process.env.VATSIM_AUTH_URL}/api/user`, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  const userData = await userRes.json();
  const cid = userData.data.cid;

  const allowedUser = await supabaseFetch(`allowed_users?cid=eq.${cid}&select=cid,is_admin`);
  if (!allowedUser || allowedUser.length === 0) {
    return Response.redirect(`${url.origin}/login?error=unauthorized`, 302);
  }

  const cookie = await createSessionCookie({
    cid,
    isAdmin: !!allowedUser[0].is_admin,
    exp: Date.now() + SESSION_HOURS * 60 * 60 * 1000
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `${url.origin}/`,
      'Set-Cookie': `${COOKIE_NAME}=${cookie}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_HOURS * 3600}`
    }
  });
}

function logout() {
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/login',
      'Set-Cookie': `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; Max-Age=0`
    }
  });
}

async function createSessionCookie(payload) {
  const data = btoa(JSON.stringify(payload));
  const sig = await hmac(process.env.COOKIE_SECRET, data);
  return `${data}.${sig}`;
}

async function getSession(req) {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;

  const [data, sig] = match[1].split('.');
  if (!data || !sig) return null;

  const expectedSig = await hmac(process.env.COOKIE_SECRET, data);
  if (sig !== expectedSig) return null;

  const payload = JSON.parse(atob(data));
  if (Date.now() > payload.exp) return null;

  return payload;
}

async function hmac(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function supabaseFetch(path, options = {}) {
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers || {})
    }
  });
  if (!res.ok) return null;
  return res.json();
}

async function adminUsersApi(req) {
  if (req.method === 'GET') {
    const data = await supabaseFetch('allowed_users?select=cid,name,is_admin,added_at&order=added_at.desc');
    return Response.json(data || []);
  }
  if (req.method === 'POST') {
    const body = await req.json();
    if (!body.cid) return Response.json({ error: 'cid is required' }, { status: 400 });
    await supabaseFetch('allowed_users', {
      method: 'POST',
      body: JSON.stringify({ cid: String(body.cid), name: body.name || null, is_admin: !!body.is_admin })
    });
    return Response.json({ success: true });
  }
  return new Response('Method not allowed', { status: 405 });
}

async function adminDeleteApi(req, url) {
  if (req.method !== 'DELETE') return new Response('Method not allowed', { status: 405 });
  const cid = url.pathname.split('/').pop();
  await supabaseFetch(`allowed_users?cid=eq.${cid}`, { method: 'DELETE' });
  return Response.json({ success: true });
}