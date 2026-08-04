import { next } from '@vercel/functions';

export const config = { runtime: 'edge' };

const COOKIE_NAME = 'vatsim_session';
const PROFILE_COOKIE_NAME = 'vatsim_profile';
const SESSION_HOURS = 8;

// Paths accessible to everyone, no sign-in required.
// Edit these to match your actual site's URL structure exactly
// (check by hovering the nav links on the live site).
const PUBLIC_EXACT = ['/', '/index.html'];
const PUBLIC_PREFIXES = [
  '/Briefing%28s%29/',
  '/Published-Documents/',
  '/search/'
];

function isPublic(pathname) {
  return PUBLIC_EXACT.includes(pathname) || PUBLIC_PREFIXES.some(p => pathname.startsWith(p));
}

export default async function middleware(req) {
  const url = new URL(req.url);
  const origin = url.origin;
  const pathname = url.pathname.replace(/\/+$/, '') || '/';

  if (pathname === '/auth/vatsim') return startLogin(url);
  if (pathname === '/auth/vatsim/callback') return handleCallback(req, url);
  if (pathname === '/logout') return logout();
  if (pathname === '/login.html') return next();
  if (pathname.startsWith('/assets/') || pathname.startsWith('/stylesheets/')) return next();
  if (isPublic(pathname)) return next();

  const session = await getSession(req);

  if (pathname.startsWith('/admin')) {
    if (!session) {
      return Response.redirect(`${origin}/login.html?restricted=1&to=admin`, 302);
    }
    if (!session.isAdmin) return new Response('Forbidden', { status: 403 });
    if (pathname === '/admin/api/users') return adminUsersApi(req);
    if (pathname.startsWith('/admin/api/users/')) return adminDeleteApi(req, url);
    if (pathname === '/admin' || pathname === '/admin/') {
      return Response.redirect(`${origin}/admin.html`, 302);
    }
    return next();
  }

  if (!session) {
    return Response.redirect(`${origin}/login.html?restricted=1`, 302);
  }

  return next();
}

function startLogin(url) {
  const to = url.searchParams.get('to') === 'admin' ? 'admin' : '';
  const params = new URLSearchParams({
    client_id: process.env.VATSIM_CLIENT_ID,
    redirect_uri: process.env.REDIRECT_URI,
    response_type: 'code',
    scope: 'full_name vatsim_details email',
    state: to
  });
  return Response.redirect(`${process.env.VATSIM_AUTH_URL}/oauth/authorize?${params}`, 302);
}

async function handleCallback(req, url) {
  try {
    const code = url.searchParams.get('code');
    if (!code) return Response.redirect(`${url.origin}/login.html`, 302);

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
      return Response.redirect(`${url.origin}/login.html?error=server`, 302);
    }

    const userRes = await fetch(`${process.env.VATSIM_AUTH_URL}/api/user`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();
    const cid = userData?.data?.cid;
    if (!cid) {
      return Response.redirect(`${url.origin}/login.html?error=no_cid`, 302);
    }

    const allowedUser = await supabaseFetch(`allowed_users?cid=eq.${cid}&select=cid,is_admin`);
    if (!allowedUser || allowedUser.__error) {
      return Response.redirect(`${url.origin}/login.html?error=supabase_unreachable&debug_cid=${cid}&debug_status=${allowedUser?.status}`, 302);
    }
    if (allowedUser.length === 0) {
      return Response.redirect(`${url.origin}/login.html?error=unauthorized&debug_cid=${cid}`, 302);
    }

    const cookie = await createSessionCookie({
      cid,
      isAdmin: !!allowedUser[0].is_admin,
      exp: Date.now() + SESSION_HOURS * 60 * 60 * 1000
    });
    const profileCookie = await createProfileCookie({
      cid,
      displayName: getDisplayName(userData),
      isAdmin: !!allowedUser[0].is_admin,
      exp: Date.now() + SESSION_HOURS * 60 * 60 * 1000
    });

    const state = url.searchParams.get('state');
    const destination = (state === 'admin' && allowedUser[0].is_admin) ? '/admin.html' : '/';
    const headers = new Headers();
    headers.set('Location', `${url.origin}${destination}`);
    headers.append('Set-Cookie', `${COOKIE_NAME}=${cookie}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_HOURS * 3600}`);
    headers.append('Set-Cookie', `${PROFILE_COOKIE_NAME}=${profileCookie}; Path=/; SameSite=Lax; Max-Age=${SESSION_HOURS * 3600}`);

    return new Response(null, {
      status: 302,
      headers
    });
  } catch (err) {
    return Response.redirect(`${url.origin}/login.html?error=exception&debug_msg=${encodeURIComponent(err.message).slice(0, 150)}`, 302);
  }
}

function logout() {
  const headers = new Headers();
  headers.set('Location', '/login.html');
  headers.append('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; Max-Age=0`);
  headers.append('Set-Cookie', `${PROFILE_COOKIE_NAME}=; Path=/; SameSite=Lax; Max-Age=0`);

  return new Response(null, {
    status: 302,
    headers
  });
}

async function createSessionCookie(payload) {
  const data = btoa(JSON.stringify(payload));
  const sig = await hmac(process.env.COOKIE_SECRET, data);
  return `${data}.${sig}`;
}

async function createProfileCookie(payload) {
  return btoa(JSON.stringify(payload));
}

function getDisplayName(userData) {
  const data = userData?.data || {};
  return data.full_name || data.name || data.personal?.name || data.cid || '';
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
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    return { __error: true, status: res.status, body: body.slice(0, 200) };
  }
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
    const result = await supabaseFetch('allowed_users', {
      method: 'POST',
      body: JSON.stringify({ cid: String(body.cid), name: body.name || null, is_admin: !!body.is_admin })
    });
    if (result && result.__error) {
      return Response.json({ error: `Supabase error ${result.status}: ${result.body}` }, { status: 500 });
    }
    return Response.json({ success: true });
  }
  return new Response('Method not allowed', { status: 405 });
}

async function adminDeleteApi(req, url) {
  if (req.method !== 'DELETE') return new Response('Method not allowed', { status: 405 });
  const cid = url.pathname.split('/').pop();
  const result = await supabaseFetch(`allowed_users?cid=eq.${cid}`, { method: 'DELETE' });

  if (result && result.__error) {
    return Response.json({ error: `Supabase error ${result.status}: ${result.body}. Contact an admin for immediate removal` }, { status: 500 });
  }
  return Response.json({ success: true });
}