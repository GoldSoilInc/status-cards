# GoldSoil Status Cards

Live, branded status cards for the four GoldSoil teams. Data flows from Salesforce → Google Sheets → these pages. Team leads open their page, refresh, screenshot, and post to GoldSoil Hub on the every-two-hour schedule.

---

## Setup (one-time)

### 1. Push this repo to your GoldSoil GitHub account

```bash
git init
git add .
git commit -m "Initial GoldSoil status cards"
git remote add origin https://github.com/goldsoil/status-cards.git
git branch -M main
git push -u origin main
```

### 2. Enable GitHub Pages

In the repo on GitHub:
- **Settings → Pages**
- Source: **Deploy from a branch**
- Branch: **main** / folder: **/ (root)**
- Save

Your cards will be live at:
```
https://goldsoil.github.io/status-cards/marketing.html
https://goldsoil.github.io/status-cards/comps.html
https://goldsoil.github.io/status-cards/lim.html
https://goldsoil.github.io/status-cards/sales.html
```

### 3. Set up each team's Google Sheet

For each team, create a Sheet with **two columns: `metric` and `value`**. You can keep other columns alongside (calculations, source data, notes) — only the first two are read.

Templates for each team are in `/sheet-templates/` (see below).

Each Sheet must be **published to web as CSV**:
- File → Share → **Publish to web**
- Choose the specific sheet/tab
- Format: **Comma-separated values (.csv)**
- Click Publish, copy the URL

### 4. Wire each Sheet URL into the page

Open each HTML file and replace the placeholder at the top:

**marketing.html:**
```js
const SHEET_URL = "https://docs.google.com/spreadsheets/d/.../pub?gid=0&single=true&output=csv";
```

Do the same for `comps.html`, `lim.html`, `sales.html`.

Commit and push. The Pages will update in ~30 seconds.

---

## Daily workflow for team leads

1. At your scheduled time slot, open your team's page (bookmark it)
2. Click **↻ REFRESH** (or browser refresh)
3. Take a screenshot
4. Post in **GoldSoil Hub**

The active time slot pill auto-highlights based on US Central time.

---

## Sheet structure per team

See `/sheet-templates/` folder. Each `.csv` is a starter you can paste directly into a new Google Sheet — the page reads it as-is.

### Common to all teams
| metric | value |
|---|---|
| flags | "None right now" or a short flag message |

### Marketing (Ellyse)
- KPIs: `campaigns_launched`, `listings_touched`, `price_drops`, `in_progress`
- Per-person: `ellyse_campaigns`, `ellyse_listings`, `ellyse_price_drops`, `ellyse_wip`, same for `shiela_`
- Campaign rows: `campaign_1_listing`, `campaign_1_location`, `campaign_1_channels` (repeat _2, _3 up to _10)

### Comps (Edcel)
- KPIs: `processed`, `analyzed`, `offers_prepared`, `fantasyland`, `rejected`, `pending`
- Per-person: `nathan_processed`, `nathan_analyzed`, `nathan_offers`, `nathan_fantasy`, `nathan_rejected` (same for `erl_`, `edcel_`, `rezello_`)
- Subdivides: `subdivides_counties_scraped`, `subdivides_fresh_leads`, `subdivides_listed_mls`
- Offer Rate auto-calculates from `offers_prepared / analyzed`

### LIM Outreach (Juan)
- KPIs: `qualified_total`, `qualified_target`, `sourced_total`, `phone_q`, `text_q`
- Per-agent: `aladdin_sourced`, `aladdin_phone_q`, `aladdin_text_q` (same for `juan_`, `maryam_`, `tina_`)
- Top counties: `county_1_name`, `county_1_count` (repeat 2-5); `counties_other_count` for the rollup
- Target hit/miss + qualify rate auto-calculate

### Sales (Jose / Gabriel)
- Funnel: `net_new`, `sourced`, `appt_set`, `qualified`, `hot_leads`
- Mid-funnel: `hot_with_phone`, `obj_handling`, `price_neg`
- By source: `fb_mkt_net_new`, `fb_mkt_sourced`, `fb_mkt_appt_set`, `fb_mkt_qualified` (same for `realtor_`, `mls_`, `investor_base_`)
- Campaigns worked: `campaign_1_name`, `campaign_1_county`, `campaign_1_leads`, `campaign_1_stage` (repeat 2-10)
- Per-person: `jose_dials`, `jose_convos`, `jose_appts`, `jose_qual`, `jose_contracts` (same for `gabriel_`)

---

## Connecting Salesforce → Google Sheets

Options, ranked easiest first:

**1. Salesforce native "Subscribe to Report"**
Sends report results to email; not great for live data, but works for daily snapshots.

**2. Salesforce Connector for Google Sheets** (Workspace Marketplace)
Free add-on. Lets you pull SF reports directly into a Sheet on a schedule. Best for v1.

**3. Salesforce → Zapier/Make → Sheets**
More control, paid.

**4. Apps Script + SF REST API**
Custom, robust, free. Worth it if v2 needs more flexibility.

Whatever you use, the Sheet structure is the contract — keep the `metric`/`value` columns at the front, populate them from your SF data using formulas or paste, and the cards will render.

---

## Customizing

**Brand changes:** Edit `shared/brand.css` — colors, fonts, spacing all live there as CSS variables.

**Card structure:** Each team's HTML page has its own render function. Add/remove sections by editing the `renderCard(data)` function in `marketing.html`, `comps.html`, etc.

**New team:** Copy any team's HTML file, change the constants at the top, add a card link to `index.html`.

---

## Notes

- **No backend.** Pure static HTML/CSS/JS. Free to host on GitHub Pages.
- **No authentication.** Anyone with the URL can view. Don't put sensitive info in the Sheet — keep PII out of the published columns.
- **Refresh = re-fetch.** The page calls Google's CSV endpoint fresh on each load (`cache: 'no-store'`), so the latest values always appear.
- **Time slot highlighting** uses US Central time regardless of viewer location.
