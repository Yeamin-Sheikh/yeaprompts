# YeaPrompts

A complete replica and prompt library for YeaPrompts. All 279 prompt pages, master prompt instructions, and 385 media assets are stored and accessible both online and offline.

Live online site: https://yeamin-sheikh.github.io/yeaprompts/

Browse prompts online: https://yeamin-sheikh.github.io/yeaprompts/browse.html

## Features

- Creator studio landing page with asymmetrical split hero, prompt search bar, quick filter chips, interactive prompt terminal deck with tab switching, 4-column curated grid, high-retention tagline reveal, 3-step workflow, and creator FAQ.
- Fontem motion architecture: cubic bezier easing tokens, sub-300ms transitions, transform and opacity only, nested border radius formula.
- All 279 prompts with full text, categories, updated dates, and storyboard reference images.
- Dual theme engine supporting default dark mode and light mode with persistent local storage settings.
- Instant live search with debounced filtering across prompt IDs (for example #18), titles, and categories.
- Four-column responsive grid with subtle non-washing hover overlays, instant one-click clipboard copying, and direct prompt navigation.
- Sequential prompt navigation across all static pages with previous and next buttons and keyboard shortcuts.
- Keyboard controls: forward slash to focus search, escape to dismiss modals, left and right arrow keys to navigate prompts.
- Storyboard and reference asset viewer with image zoom lightbox and direct download actions.
- Individual static pages for all 279 prompts with word count, character count, and one-click clipboard copying.
- Replicated pages for home, community feed, pricing, contact, privacy policy, terms of service, and refund policy.
- Zero external image dependencies. All 385 thumbnail and storyboard images and 5 site assets are stored locally.
- All JSON databases and static pages normalized to use local paths, with zero external soniprompts.com requests.
- Dual server support with zero third-party dependencies (Node.js HTTP server and Python 3 HTTP server).
- Direct file mode. Open browse.html or index.html directly in any browser without running a server.

## Directory structure

```text
brave-hertz/
|-- index.html                   # Creator studio landing page with live prompt terminal deck
|-- browse.html                  # Catalog page with search, filters, and pagination
|-- prompt.html                  # Dynamic prompt viewer (accepts ?id=X parameter)
|-- community.html               # Social corner and community posts
|-- pricing.html                 # Community membership tiers
|-- contact.html                 # Contact support form
|-- account.html                 # Replicated user account and membership page
|-- privacy.html                 # Privacy policy
|-- terms.html                   # Terms of service
|-- refund.html                  # Refund policy
|-- server.js                    # Node.js zero-dependency HTTP server with SQLite REST API
|-- server.py                    # Python 3 zero-dependency HTTP server with SQLite REST API
|-- test_suite.mjs               # Automated verification suite (43 checks)
|-- generate_site.mjs            # HTML generator script
|-- all_prompts_index.json       # Catalog index of all 279 prompts
|-- README.md                    # Project documentation
|-- scripts/
|   |-- append_styles.mjs        # Script to append Fontem landing styles to style.css
|   └── generate_index.mjs       # Script to generate redesigned index.html
|-- api/
|   └── load_more_data.json      # Mock response for community load-more requests
|-- db/
|   |-- index.js                 # Node.js SQLite repository (getPrompts, getCategories, etc.)
|   └── database.py              # Python SQLite repository
|-- assets/
|   |-- css/style.css            # Site stylesheet
|   |-- js/main.js               # Client scripts (slider, copy prompt, lightbox)
|   └── img/                     # Logo, cover, avatar, and banner images
|-- data/
|   |-- database.sqlite          # SQLite relational database (prompts, categories, media, posts)
|   |-- prompts.csv              # CSV spreadsheet export of all 279 prompts
|   |-- prompts.json             # Complete dataset for all 279 prompts
|   |-- other_pages.json         # Scraped page data
|   |-- image_urls.json          # Index of image URLs
|   |-- images_to_download.json  # Mapping of remote URLs to local paths
|   └── prompts/                 # 279 individual prompt JSON files
|-- prompts/                     # 279 standalone HTML pages (1.html to 281.html)
└── uploads/                     # 385 local thumbnails, storyboards, and community images
```

## Running the local site

### Option 1: Node.js server (recommended)

Start the built-in HTTP server:

```powershell
node server.js
```

Open http://localhost:3000 or http://localhost:3000/browse.php in your browser.

The server handles both original PHP URLs (/browse.php, /prompt.php?id=281, /community.php, /api/load_more.php), extensionless URLs (/browse, /pricing), and standard .html URLs.

### Option 2: Python 3 server

Run the Python HTTP server:

```powershell
python server.py
```

Open http://localhost:8000 or http://localhost:8000/browse.php in your browser.

### Option 3: Direct file access (no server required)

Double click browse.html or index.html to view the website directly in Chrome, Edge, or Firefox via file:/// protocol. All prompt cards, search filters, static prompt links, and images function properly without any web server.

## Adding new prompts

When a new prompt is published on the official site, you can tell the assistant to fetch and add it, or add it directly via CLI:

```powershell
node sync_prompt.mjs --json '{"id": 282, "title": "New Prompt Title", "category": "General", "thumbnail": "https://...", "promptText": "..."}'
```

Or pass a JSON file:

```powershell
node sync_prompt.mjs --file new_prompt.json
```

The script downloads any remote image assets to `uploads/`, updates `data/prompts.json` and `data/database.sqlite`, and regenerates all static pages, search indices, and category counts.

## Verification


Run the automated test suite to verify routes, assets, and data integrity:

```powershell
node test_suite.mjs
```

The test suite runs 43 checks and validates:
- HTTP status 200 on all primary routes, extensionless aliases, and query parameter variants.
- Graceful handling of form POST requests on contact and community endpoints.
- Availability and non-empty status of CSS, JS, logos, banners, and thumbnail assets.
- Existence of all 279 static prompt HTML pages in prompts/.
- Zero broken relative links across all 289 HTML files.
- Zero remaining external soniprompts.com references in HTML and JSON datasets.
- Verification that all 381 referenced image assets exist locally on disk.
- Prompt text completeness across all 279 entries in data/prompts.json.
- Complete catalog index integration and search-by-ID support in browse.html.
- Social Corner community hub structure, interactive like and comment engines, and creator channels.
- SQLite relational database file at data/database.sqlite schema, tables, and record integrity.
- REST API endpoints at /api/stats, /api/categories, /api/prompts, and /api/prompts/:id.
- CSV export file at data/prompts.csv integrity.
- Database repository modules at db/index.js and db/database.py.

