// GET /.netlify/functions/count
// Returns the live submission count for the "jjp-signup" Netlify form.
//
// Required env vars (set in Netlify → Site settings → Environment variables):
//   NETLIFY_AUTH_TOKEN  — Personal Access Token from app.netlify.com/user/applications
//   SITE_ID             — Your site's API ID (Site settings → General → Site information)
//
// If env vars are missing, returns a fallback count so the page still works.

const FALLBACK_COUNT = 342108;
const FORM_NAME = "jjp-signup";

export default async (req, context) => {
  const token = process.env.NETLIFY_AUTH_TOKEN;
  // SITE_ID is reserved/auto-injected by Netlify into functions; fall back to context.site.id.
  const siteId = process.env.SITE_ID || context?.site?.id;

  const headers = {
    "content-type": "application/json",
    "cache-control": "public, max-age=30",
    "access-control-allow-origin": "*",
  };

  if (!token || !siteId) {
    return new Response(
      JSON.stringify({ count: FALLBACK_COUNT, source: "fallback", note: "Set NETLIFY_AUTH_TOKEN and SITE_ID in Netlify env vars to show real count." }),
      { status: 200, headers }
    );
  }

  try {
    const res = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/forms`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ count: FALLBACK_COUNT, source: "fallback", error: `Netlify API ${res.status}` }),
        { status: 200, headers }
      );
    }

    const forms = await res.json();
    const form = Array.isArray(forms) ? forms.find((f) => f.name === FORM_NAME) : null;
    const realCount = form?.submission_count ?? 0;

    // Add a small flair so the public number stays a satisfying big number,
    // while still being driven by real signups. (It's a parody site.)
    const displayed = FALLBACK_COUNT + realCount;

    return new Response(
      JSON.stringify({ count: displayed, real: realCount, source: "netlify-forms" }),
      { status: 200, headers }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ count: FALLBACK_COUNT, source: "fallback", error: String(err) }),
      { status: 200, headers }
    );
  }
};

export const config = {
  path: "/.netlify/functions/count",
};
