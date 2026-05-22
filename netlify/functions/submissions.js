// GET /.netlify/functions/submissions
// Returns all signup submissions for the admin page.
// Protected by a shared passphrase:
//   - send header `x-admin-key: <key>` OR query string `?key=<key>`
//
// Required env vars (set in Netlify → Site settings → Environment variables):
//   NETLIFY_AUTH_TOKEN  — Personal Access Token
//   SITE_ID             — Site API ID
//   ADMIN_KEY           — A passphrase you choose (any string)
//
// Hardening: rate-limited by Netlify automatically; key is checked in constant-ish time.

const FORM_NAME = "jjp-signup";

const safeEq = (a, b) => {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

export default async (req, context) => {
  const token = process.env.NETLIFY_AUTH_TOKEN;
  const siteId = process.env.SITE_ID || context?.site?.id;
  const adminKey = process.env.ADMIN_KEY;

  const url = new URL(req.url);
  const presented = req.headers.get("x-admin-key") || url.searchParams.get("key") || "";

  if (!adminKey || !token || !siteId) {
    return Response.json(
      { error: "Server not configured. Set NETLIFY_AUTH_TOKEN, SITE_ID, ADMIN_KEY in env." },
      { status: 503 }
    );
  }

  if (!safeEq(presented, adminKey)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find the form
    const formsRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/forms`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!formsRes.ok) {
      return Response.json({ error: `Netlify API forms ${formsRes.status}` }, { status: 502 });
    }
    const forms = await formsRes.json();
    const form = Array.isArray(forms) ? forms.find((f) => f.name === FORM_NAME) : null;
    if (!form) return Response.json({ count: 0, submissions: [] });

    // Fetch submissions for that form
    const subRes = await fetch(
      `https://api.netlify.com/api/v1/forms/${form.id}/submissions?per_page=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!subRes.ok) {
      return Response.json({ error: `Netlify API subs ${subRes.status}` }, { status: 502 });
    }
    const subs = await subRes.json();

    // Trim payload to what the admin page needs
    const trimmed = (Array.isArray(subs) ? subs : []).map((s) => ({
      id: s.id,
      created_at: s.created_at,
      data: s.data || {},
    }));

    return Response.json({ count: form.submission_count, submissions: trimmed });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
};

export const config = {
  path: "/.netlify/functions/submissions",
};
