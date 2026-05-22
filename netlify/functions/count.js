// GET /.netlify/functions/count
// Returns the live submission count for the "jjp-signup" Netlify form.
//
// Required env vars (set in Netlify → Site settings → Environment variables):
//   NETLIFY_AUTH_TOKEN  — Personal Access Token from app.netlify.com/user/applications
//   SITE_ID             — Auto-injected by Netlify; falls back to context.site.id
//
// If env vars are missing or the API fails, returns 0 so the page still renders.

const FORM_NAME = "jjp-signup";

export default async (req, context) => {
  const token = process.env.NETLIFY_AUTH_TOKEN;
  const siteId = process.env.SITE_ID || context?.site?.id;

  const headers = {
    "content-type": "application/json",
    "cache-control": "public, max-age=30",
    "access-control-allow-origin": "*",
  };

  if (!token || !siteId) {
    return new Response(
      JSON.stringify({ count: 0, source: "fallback", note: "Set NETLIFY_AUTH_TOKEN in Netlify env vars to show real count." }),
      { status: 200, headers }
    );
  }

  try {
    const res = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/forms`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ count: 0, source: "fallback", error: `Netlify API ${res.status}` }),
        { status: 200, headers }
      );
    }

    const forms = await res.json();
    const form = Array.isArray(forms) ? forms.find((f) => f.name === FORM_NAME) : null;
    const realCount = form?.submission_count ?? 0;

    return new Response(
      JSON.stringify({ count: realCount, source: "netlify-forms" }),
      { status: 200, headers }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ count: 0, source: "fallback", error: String(err) }),
      { status: 200, headers }
    );
  }
};

export const config = {
  path: "/.netlify/functions/count",
};
