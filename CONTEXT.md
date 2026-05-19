# Soundtrackd — Project Context

## What It Is

Soundtrackd is a **Letterboxd-style social platform for music** — specifically for rating, reviewing, and discovering albums and songs. The core idea is to give music the same treatment Letterboxd gives film: community-driven ratings, personal reviews, curated lists, and social discovery. Users can rate albums and individual tracks on a 5-star half-star system, write reviews, follow each other, browse global charts, and build collaborative lists.

The project is live at **soundtrackd.org**, hosted on Netlify, and in active development.

---

## Why It Exists

There's no good community-first album ratings platform. RateYourMusic is the closest but it's dated and opaque. Last.fm tracks listening but doesn't center reviews or social curation. The gap is a clean, modern platform where music fans can do what Letterboxd users do for movies: log what they've heard, share opinions, discover through friends, and build taste profiles.

Soundtrackd is being built to fill that gap with a focus on clean design, social features, and community discovery rather than comprehensive cataloguing.

---

## Tech Stack

**Frontend:** Vanilla HTML, CSS, JavaScript — no frameworks. All pages are `.html` files with inline JS. Deliberately kept simple and fast.

**Backend/Data:**
- **Supabase** (PostgreSQL + Auth) — all user data: profiles, ratings, reviews, lists, follows, notifications
- **Deezer API** — primary music catalog: album/artist/track metadata, cover art, search. Routed through a Cloudflare Worker to bypass CORS.
- **Last.fm API** — trending albums, charts, weekly top artists for the featured scroll
- **Spotify API** — secondary, only used in list creation for album search (token served via Netlify function)
- **lyrics.ovh** — song lyrics on the song detail page

**Infrastructure:**
- **Netlify** — hosting + serverless function (`spotify-token.js`)
- **Cloudflare Worker** (`cloudflare-worker.js`) — Deezer API proxy at `throbbing-meadow-440e.spacedemon324.workers.dev`
- Domain: `soundtrackd.org` (CNAME configured)

**Design:**
- Dark theme: background `#0a0f0b`, accent green `#4a9e6b`, secondary purple `#7c6fcd`
- Fonts: Playfair Display (serif, headings) + Nunito (sans-serif, body)
- Fully responsive with CSS Grid/Flexbox

---

## File Structure

```
soundtrackd/
├── index.html           # Public landing page (auto-redirects logged-in users to dash)
├── dash.html            # Logged-in home: personalized feed, featured scroll, activity
├── login.html           # Sign in / sign up
├── search.html          # Search albums, songs, artists via Deezer
├── album.html           # Album detail: metadata, community rating chart, tracklist, reviews
├── song.html            # Song detail: lyrics, ratings, reviews
├── artist.html          # Artist: bio, top tracks, full discography grid
├── profile.html         # User profile: stats, favorites, review history, follow/unfollow
├── lists.html           # Community lists directory with create-list modal
├── list.html            # List detail: view, edit, add/remove items
├── charts.html          # Global charts: highest rated, most reviewed, trending (Last.fm)
├── members.html         # Members directory: all users, searchable
├── cloudflare-worker.js # Deezer proxy + Spotify token (deployed to Cloudflare)
├── spotify-token.js     # Netlify function: serves Spotify client_credentials token
├── favicon.svg          # Brand icon (green music note)
├── netlify.toml         # Netlify build/redirect config
├── CNAME                # soundtrackd.org
└── README.md            # Placeholder
```

---

## Database Schema (Supabase)

**profiles**
- `id` — user UUID (FK from auth.users)
- `username` — unique, set on signup
- `bio`, `website`, `pronouns`, `avatar_url`
- `created_at`

**ratings** (album ratings + reviews)
- `id`, `user_id`, `album_id`
- `rating` — 0.5 to 5.0 in half-star increments
- `review` — optional text
- `album_title`, `album_cover` — denormalized for display performance
- `created_at`
- Unique on `(album_id, user_id)`

**track_ratings** (per-song ratings)
- `id`, `user_id`, `track_id`, `album_id`
- `rating`, `review`
- `track_title`, `track_cover`
- `created_at`

**lists**
- `id`, `user_id`, `title`, `description`
- `type` — `"albums"`, `"songs"`, or `"mixed"`
- `items` — JSON array: `[{ id, type, title, artist, cover, albumId }]`
- `created_at`, `updated_at`

**review_likes**
- `user_id`, `rating_id` (FK to ratings)

**notifications**
- `id`, `user_id`, `type`, `from_user_id`, `read`, `created_at`

---

## Pages & Features in Detail

### index.html — Public Landing Page
The marketing/discovery page for logged-out visitors. Contains:
- Featured scroll: auto-advancing cards of trending albums (from Last.fm weekly chart), with community rating and attribution. Auto-scrolls every 5s, pauses on hover.
- "Opinion Starters" grid: notable albums to prompt engagement
- Recent reviews: latest community reviews pulled from Supabase
- Popular lists: top user-created lists
- Hero background: randomized album grid of ~60 artworks, scrolls slowly
- CTA to sign up / log in
- Auto-redirects logged-in users to `dash.html`

### dash.html — Logged-In Home
Mirrors index.html structure but is personalized:
- Greeting with username
- Friends' activity feed (recent ratings/reviews from followed users)
- Same featured scroll, album grid, and popular lists as index
- Starting point after login

### album.html — Album Detail
Core page of the product. Shows:
- Album cover, title, artist, label, release date, runtime, track count
- Community average rating with star display
- Rating distribution chart (bar chart by star value)
- Full tracklist with Deezer track data, individual track ratings (average + trophy for top 3)
- Reviews section: Recent and Top tabs, like buttons per review
- User's own rating editor (shows current rating or prompt to rate)
- Rate modal: hover-preview half-stars, optional review text, submit

### song.html — Song Detail
- Links back to parent album
- Lyrics via lyrics.ovh API
- Community rating for the track
- Reviews for the track
- User rating/review for the track

### artist.html — Artist Page
- Hero section with artist name and blurred background
- Top 5 tracks (most rated or top-rated)
- Full discography grid (album covers, link to album pages)
- Pulled from Deezer artist endpoint

### profile.html — User Profile
- Avatar, username, bio, pronouns, website
- Stats: total reviews, lists created, followers, following
- Favorite albums (up to 4, displayed prominently)
- Favorite artists (up to 4)
- Full review history
- Follow/unfollow button (for other users' profiles)
- Edit modal for own profile (bio, pronouns, website, avatar URL, favorites picker)

### search.html — Search
- Deezer-powered search across albums, songs, artists
- Filter tabs by type
- Instant results grid with cover art, link to detail pages

### lists.html / list.html — Lists
- Community lists directory with grid view
- Create list modal: title, description, type (albums/songs/mixed)
- List detail: display items, edit mode for list owner (add/remove items)
- Add-item modal: search albums/songs (uses both Deezer and Spotify)

### charts.html — Charts
- Highest rated albums (from Supabase aggregate ratings)
- Most reviewed albums
- Trending (from Last.fm API)
- Score distribution stats

### members.html — Members
- All registered users, searchable
- Username, join date, review count

---

## Current State (v0.10)

**Working and live:**
- Full auth flow (signup, login, session persistence, redirect logic)
- Album/song/artist browsing and search
- Half-star album and track ratings
- Reviews with like system
- User profiles with follow/unfollow
- Lists (create, edit, add items)
- Charts (highest rated, trending)
- Dashboard with friend activity feed
- Notifications system
- Featured scroll with real Last.fm data

**Known architecture notes:**
- All API credentials are embedded in frontend HTML (Supabase anon key is public by design; Deezer key is via proxy; Spotify token is served by worker)
- No build step — raw HTML files, works with any static host
- Caching: sessionStorage for album grids (30 min TTL), localStorage for featured albums (6 hr TTL)

---

## Where It's Going

The project is in active feature development. Based on trajectory:

**Near-term priorities (inferred from recent commits and missing features):**
- Richer social features: notifications UI, activity feed polish, follower/following pages
- Profile completeness: better favorites UX, listening stats
- Discovery improvements: recommendations, "users who rated this also rated..."
- List features: collaborative editing, list comments, ranking within lists
- Mobile responsiveness polish
- Performance: the featured scroll and album grid are cache-heavy, could be improved

**Longer-term direction:**
- Make the community layer the core differentiator — everything should connect back to what your network thinks of an album
- Potentially introduce scrobbling or listening history import (Last.fm already integrated as a data source)
- Charts and leaderboards expansion

---

## Recent Git History (last 30 commits)

```
5e9d954 Fix album images on dash, featured card ratio, add popular lists
a26c946 Rebuild dash.html as full logged-in home page; auto-redirect from index
8e2e057 Add dashboard page (dash.html) for logged-in members
d8e5356 Featured scroll: remove 'Last.fm' from label, attribution outside box, real rating curve
894156b Fix featured scroll: real weekly albums, working links, autoscroll
eca032c Randomize hero bg column and image order per page load
f93ba21 Expand hero background album pool to ~60 entries
372c734 Fix hero background scroll: squares, clean fade, 22-album set
491a235 fix artist discography grid sizing using padding-top:100% technique
53654e1 fix ratingLabels redeclaration conflict on album page
22a59b0 add per-track ratings + trophies on album page; fix artist hero blur and remove fan count
85f743e fix uneven album cover sizes in artist discography grid
d3f09b8 add artist page, favorite artists to profile, link artist names throughout
3a01e63 add song page with ratings, lyrics, and reviews; link tracks from album and search
83f14c6 store album_title and album_cover in ratings, use directly in reviews
d0b015f route all Deezer calls through Cloudflare Worker proxy to fix CORS
be91a11 switch search, album, profile, charts from Spotify to Deezer
0deef8a switch album grid and reviews to Deezer, fix featured scroll
2f3d794 wire Last.fm API into featured scroll and charts trending tab
f02151f add favicon to all pages
87d000d remove dead auth modal code and authOverlay references
0ae0d68 bump to v0.10, update footer release note
```

---

## Working With This Codebase

- **No build step.** Edit HTML files directly. Changes are live on push to main (Netlify auto-deploys).
- **Supabase schema changes** require using the Supabase dashboard or SQL editor — there are no migration files in the repo.
- **Cloudflare Worker** (`cloudflare-worker.js`) is deployed separately to Cloudflare — changes there need to be pushed via Cloudflare dashboard or Wrangler CLI.
- **All pages share the same nav/footer pattern** — nav is duplicated inline in each HTML file (no templating system).
- **JS is inline in each HTML file** — no modules, no bundler. Globals and `const` at top of `<script>` blocks.
- The Cloudflare worker URL and Supabase credentials appear in multiple HTML files — if they change, they need to be updated everywhere.
