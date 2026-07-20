require('dotenv').config();
const express = require('express');
const session = require('express-session');
const fetch = require('node-fetch');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();

const {
  VATSIM_CLIENT_ID,
  VATSIM_CLIENT_SECRET,
  VATSIM_AUTH_URL,
  REDIRECT_URI,
  SESSION_SECRET,
  PORT,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
} = process.env;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

app.use(express.json());

console.log('VATSIM_AUTH_URL:', VATSIM_AUTH_URL);
console.log('VATSIM_CLIENT_ID:', VATSIM_CLIENT_ID);
console.log('REDIRECT_URI:', REDIRECT_URI);

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 8 } // 8h
}));

// login.html lives in overrides/ — serve it directly, no auth needed
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'overrides', 'login.html'));
});

// Public assets for the login page (background image, etc.) — no auth needed
app.use('/assets', express.static(path.join(__dirname, 'overrides', 'assets')));

// Step 1: kick off VATSIM OAuth
app.get('/auth/vatsim', (req, res) => {
  const params = new URLSearchParams({
    client_id: VATSIM_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'full_name vatsim_details email'
  });
  const authorizeUrl = `${VATSIM_AUTH_URL}/oauth/authorize?${params}`;
  console.log('Redirecting to:', authorizeUrl);
  res.redirect(authorizeUrl);
});

// Step 2: VATSIM redirects back here with ?code=
app.get('/auth/vatsim/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect('/login');

  try {
    const tokenRes = await fetch(`${VATSIM_AUTH_URL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: VATSIM_CLIENT_ID,
        client_secret: VATSIM_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code
      })
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('No access token returned: ' + JSON.stringify(tokenData));

    const userRes = await fetch(`${VATSIM_AUTH_URL}/api/user`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();
    const cid = userData.data.cid;

    // Check the CID against the allowlist in Supabase
    const { data: allowedUser, error: dbError } = await supabase
      .from('allowed_users')
      .select('cid, is_admin')
      .eq('cid', cid)
      .maybeSingle();

    if (dbError) {
      console.error('Supabase lookup failed:', dbError);
      return res.redirect('/login?error=server');
    }

    if (!allowedUser) {
      console.log(`Access denied for CID ${cid} (not on allowlist)`);
      return res.redirect('/login?error=unauthorized');
    }

    req.session.user = {
      cid,
      name: userData.data.personal?.name_full,
      isAdmin: !!allowedUser.is_admin
    };

    res.redirect('/');
  } catch (err) {
    console.error('VATSIM auth failed:', err);
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// --- Admin dashboard (add/remove allowed CIDs) ---
function requireAdmin(req, res, next) {
  if (req.session.user && req.session.user.isAdmin) return next();
  return res.status(403).send('Forbidden — admin access only');
}

app.get('/admin', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'overrides', 'admin.html'));
});

app.get('/admin/api/me', requireAdmin, (req, res) => {
  res.json(req.session.user);
});

// List all allowed users
app.get('/admin/api/users', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('allowed_users')
    .select('cid, name, is_admin, added_at')
    .order('added_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Add a new allowed CID
app.post('/admin/api/users', requireAdmin, async (req, res) => {
  const { cid, name, is_admin } = req.body;
  if (!cid) return res.status(400).json({ error: 'cid is required' });

  const { error } = await supabase
    .from('allowed_users')
    .insert({ cid: String(cid), name: name || null, is_admin: !!is_admin });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Remove an allowed CID
app.delete('/admin/api/users/:cid', requireAdmin, async (req, res) => {
  const { error } = await supabase
    .from('allowed_users')
    .delete()
    .eq('cid', req.params.cid);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Everything below requires a session
app.use((req, res, next) => {
  if (req.session.user) return next();
  res.redirect('/login');
});

// mkdocs build outputs to ./site by default — unchanged
app.use(express.static(path.join(__dirname, 'site')));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));