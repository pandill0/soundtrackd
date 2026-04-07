export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: { ...corsHeaders, 'Access-Control-Allow-Methods': 'GET, OPTIONS' }
      });
    }

    // Root path → Spotify token (kept for legacy, may be removed later)
    if (url.pathname === '/' || url.pathname === '') {
      try {
        const credentials = btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`);
        const res = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
        });
        const data = await res.json();
        return new Response(JSON.stringify({ access_token: data.access_token }), { headers: corsHeaders });
      } catch {
        return new Response(JSON.stringify({ error: 'token fetch failed' }), { headers: corsHeaders });
      }
    }

    // All other paths → proxy to Deezer
    try {
      const deezerUrl = `https://api.deezer.com${url.pathname}${url.search}`;
      const res = await fetch(deezerUrl);
      const data = await res.json();
      return new Response(JSON.stringify(data), { headers: corsHeaders });
    } catch {
      return new Response(JSON.stringify({ error: 'deezer fetch failed' }), { headers: corsHeaders });
    }
  }
};
