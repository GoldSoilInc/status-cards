# GoldSoil Team Status Cards — Reference Doc

**Last updated:** May 29, 2026
**Owner of rollout:** Leslie
**KPI/target owner:** Anshul
**Live system:** GitHub Pages under `goldsoilinc` org, repo `status-cards`

---

## 1. Purpose

Four GoldSoil teams (LIM, Comps, Marketing, Sales) post status updates 5×/day into **GoldSoil Hub** (Slack). Each team has a branded HTML report card that auto-pulls live numbers from Google Sheets (which sync from Salesforce). The poster screenshots the card, adds context, drops it in Hub.

---

## 2. Decision Rights

| Owner | Decides |
|---|---|
| **Leslie** | Layout tweaks, workflow, rollout, posting schedule |
| **Anshul** | Which KPIs make the cut, targets, what counts as a flag |

Don't change KPI definitions, thresholds, or flag rules without Anshul. Don't change posting cadence or layout patterns without Leslie.

---

## 3. Brand Spec (locked)

| Color | Hex | Use |
|---|---|---|
| Dark Green | `#1A472A` | Headers, numbers, hero strip |
| Gold | `#C4A22F` | H2 labels, accents, borders |
| Cream | `#F5F0E1` | Accent cells, stat boxes |

**Fonts:** Georgia (display, numbers, H2 labels), Arial (body)
**CSS variables:** `--gs-dark-green`, `--gs-gold`, `--gs-cream`, `--gs-faint`, `--gs-border`, `--gs-border-soft`, `--font-display`, `--font-body`

---

## 4. Card Skeleton (every team, every post)

```
Header (logo, team, date)
  ↓
Time-slot strip (10am · 12pm · 2pm · 4pm · 5pm+, current slot highlighted)
  ↓
Hero KPIs (4 cells, one is accent gold, one is hero dark green)
  ↓
Breakdown sections (team-specific tables)
  ↓
By Person · Today (table — counts only, not task lists)
  ↓
Flags / Needs Anshul (editable on page; "None right now." is the default signal)
  ↓
Footer
```

### Five rules every card follows
1. Same five sections, same order, every post
2. Zeros stay visible — never omit a KPI line
3. Flags section is mandatory; "None right now" is the signal
4. By Person table at the bottom — counts, not task lists
5. Time-slot strip shows which of the five daily updates this is

---

## 5. Posting Cadence

5 updates per day, Central Time:
- 10 AM
- 12 PM
- 2 PM
- 4 PM
- 5 PM+ (final EOD)

---

## 6. Architecture

```
Salesforce
  ↓ (SF Connector add-on, free tier, syncs every 4 hrs)
Google Sheets (source tabs + per-team `metrics` tabs)
  ↓ (File → Share → Publish to web → CSV)
GitHub Pages static HTML cards (read CSV via fetch)
  ↓
Screenshot → drop in GoldSoil Hub
```

- Pure static HTML/CSS/JS. No build step. No backend.
- Each card lives at `https://[username].github.io/status-cards/[team].html`
- Each card fetches one CSV URL on load
- Flags textarea is local-only (lives in screenshot, not persisted)

---

## 7. Repo Structure

```
status-cards/
├── index.html               ← Landing page (links to all 4 cards)
├── lim.html                 ← LIM Outreach (Juan)
├── comps.html               ← Comps (Edcel)
├── marketing.html           ← Marketing (Ellyse)
├── sales.html               ← Sales (Jose & Gabriel)
├── README.md
├── shared/
│   ├── brand.css            ← All brand vars + component styles
│   └── sheet-loader.js      ← CSV fetcher + renderFlags + renderFooter
└── sheet-templates/         ← Starter CSVs for reference
```

**`sheet-loader.js` exports:**
- `loadSheet(csvUrl)` — fetches & parses CSV into `{metric: value}` dict
- `val(data, key, fallback)` — safe lookup
- `renderFlags(flagsText)` — produces editable Flags box (EDIT → textarea → SAVE/CANCEL)
- `renderFooter()` — standard timestamp footer
- `renderLoading()` — loading state

CSV parser handles multi-line quoted cells via character-level quote-state tracking (don't break this).

---

## 8. Per-Team Reference

### 8a. LIM Outreach — Juan Pablo Larrea
**Team:** Juan Pablo Larrea, Martina Misheal, Maryam Selim, Ahmed Abdelbaset
**Daily target:** 30 qualified
**Hero KPIs:** Qualified vs Target · Sourced · Qualify Rate
**Breakdown:** Phone Q vs Text Q

**KPI rule (locked by Anshul):**
- Qualified = Phone Fully Q + Phone Semi Q + Text Fully Q
- **Text Semi Q is EXCLUDED**

**Source tab:** `LIM` — Col A=Sourcer, Col B=AILeadCategory, Col I=County

---

### 8b. Comps — Edcel Abalos
**Team:** Edcel Abalos, Nathaniel Oaing, Erl Timothy Gutierrez, Rezello Perez
**Hero KPIs:** Processed · Analyzed · Offers Prepared (accent) · Offer Rate (hero %)
**Breakdown:** By Person (7 cols) + Subdivides (below table)

**KPI rules (locked by Anshul):**
- Processed = rows in Processed tab with "Date moved to For Analysis" = today
- Analyzed = rows in Analyzed tab with "Date Processed" = today (includes No Contract)
- Offers Prepared = Contract Creation Date = today, **EXCLUDING** AI SMSCategory = "Fantasyland" OR "Lala Land"
- Fantasyland = today's rows where AI SMSCategory IN ("Fantasyland", "Lala Land")
- Rejected = Analyzed today where Property Comped Status = "No Contract"
- Offer Rate = Offers Prepared / Analyzed (rounded %)

**Source tabs:**
- `Processed`: A=Date moved to For Analysis, B=Property Processed By, C=Full Name, D=APN, E=Company, F=Lead Source
- `Analyzed`: A=Date Processed, B=Owner Name, C=Property Comped Status, D=Comps Analysis Name, E=Date Completed, F=Property APN, G=Comps Status, H=Date moved to No Contract, K=Comps Time (min), L=Date moved to For Analysis
- `Offers Prepared`: A=AI SMSCategory, D=Contract Creation Date, P=Property Analyst
- `Subdivide`: A=Date, B=Counties/State Scraped, C=Fresh Lead, D=Listed on MLS

**Subdivides section** sits *below* the By Person table — 3 cream stat cards (counties scraped · fresh leads · listed on MLS) with gold left borders.

---

### 8c. Marketing — Ellyse
**Team:** Ellyse, Shiela
**Hero KPIs:** Campaigns Launched · Listings Touched · Price Drops · In Progress
**Breakdown:** By Person

**KPI rules (locked by Anshul):**
- Launched = Time Out filled (col I > 0)
- Listings Touched = **UNIQUE** by SF Link or Property ID, **full lifecycle** including: Listing Prep, Posting Listings, Listing Revisions/Issues, Mark Pending, Delisting (Sold)
- Price Drops = rows tagged as price drop work category
- In Progress = Time Out empty

**Source tabs:** `Ellyse` and `Shiela` (time-tracker rows)
**Columns:** A=Date, C=Work Category, D=Sub-Category, E=Property ID, F=SF Link, G=Time In, H=Time Out, I=Hours

---

### 8d. Sales — Jose & Gabriel
**Hero KPIs:** Sourced · Appt Set · Qualified (accent) · UC w/ EMD (hero)
**Pipeline row:** Negotiation · Contract Sent · UC w/o EMD
**Breakdowns:** Leads by Source · Campaigns & Counties Worked Today · By Person

**KPI rules (per Gabriel, approved by Anshul):**
- Net New = Sourced = Hot Leads — **all the same number**, no separate tracking
- Attribution via POD Team Name (col AA)

**Source tab:** `Sales`
**Columns:** A=Market Hub#, B=Campaign Objective, C=Campaign Run Date, D=Campaign Name, E=First Name, F=Last Name, G=Buyer Lead Source, H=Lead Status, I-O=funnel flags (Sourced, Appt Set, Qualified, Negotiation, Contract Sent, UC w/o EMD, UC w/ EMD), P=Appt Sched, Q=Lead URL, R=Buyer's Feedback, S=Sales Notes, T-Z=Date columns, **AA=POD Team Name** (Jose/Gabriel), **AB=State** (full name e.g. "Illinois"), **AC=County** (e.g. "Logan County")

**Special notes:**
- LEADS BY SOURCE uses `UNIQUE` + `COUNTIFS` (not `QUERY` — `QUERY` injects "count" auto-headers)
- CAMPAIGNS & COUNTIES uses `FILTER` + `VLOOKUP`

---

## 9. Google Sheets Reference

**Shared workbook** for LIM, Comps, Sales:
- Tabs: `LIM`, `Sales`, `Processed`, `Analyzed`, `Offers Prepared`, `Subdivide`
- Per-team metrics tabs: `LIM_metrics`, `sales_metrics`, `comps_metrics`

**Marketing workbook (separate):**
`https://docs.google.com/spreadsheets/d/1O2C7ZhICWDzolg9fFYsRzu0ZVl7Tvti2q4JaBE1AOOE`
- Tabs: `Ellyse`, `Shiela`, `metrics`

**Published CSV URLs (live):**
- **Marketing metrics:** `https://docs.google.com/spreadsheets/d/e/2PACX-1vSMUBPWS464Rq_ID_Zjoj-PU5QuDeIj2PK6pSKV22rEZ8_0_zxjYagl4SYM3TZckmIkaxhyr_QtyUk9/pub?gid=1101423418&single=true&output=csv`
- **Sales metrics:** same base URL, `gid=332866919`
- **Comps metrics:** same base URL, `gid=1539306527`

Each metrics tab is `metric,value` (2 columns). The card fetches the whole CSV and reads by metric name.

---

## 10. Common Formula Patterns

**Date filter (handles date-time cells):**
```
COUNTIFS(tab!col, ">="&TODAY(), tab!col, "<"&TODAY()+1)
```

**Unique source list (avoids QUERY auto-headers):**
```
=UNIQUE(FILTER(Sales!G:G, Sales!G:G<>""))
```

**Per-source funnel counts:**
```
=COUNTIFS(Sales!G:G, A2, Sales!I:I, TRUE, ...date filter...)
```

**Comps offer rate:**
```
=IFERROR(ROUND(offers_prepared/analyzed*100, 0), 0)
```

---

## 11. How to Update / Deploy

**To change a card:**
1. Edit the relevant `.html` in the repo (or have Claude rebuild)
2. Commit + push to `main`
3. GitHub Pages redeploys in ~30 sec
4. Refresh the card URL to verify

**To add a KPI:**
1. Get Anshul's approval on definition + target
2. Add formula to the team's `metrics` tab
3. Add a new row in metrics with `metric_name,formula`
4. Reference it in the card via `val(data, 'metric_name', '0')`
5. Decide placement (hero strip / breakdown / by person)

**To roll out to a new team:**
1. Build a `metrics` tab in their workbook
2. Publish to web as CSV
3. Copy an existing card (e.g. `comps.html`), swap CSV URL + column structure
4. Update README and `index.html`

---

## 12. SOP Document

A 3-page Word SOP exists: `GoldSoil-Team-Status-SOP.docx`. Version 1.0 (May 28, 2026) covers LIM + Marketing KPI definitions. **Pending:** v1.1 needs Sales + Comps KPI definitions added before final handoff to Leslie.

---

## 13. Pending / Future Work

- [ ] Update SOP doc to v1.1 with Sales + Comps definitions
- [ ] Hand full system to Leslie for rollout to teams
- [ ] Verify all 4 cards render correctly on Anshul's review
- [ ] Consider Apps Script auto-refresh if 4hr SF sync lag becomes a problem
- [ ] Optional: add date stamp to CSV output so we know when last sync ran

---

## 14. Key Conventions / Gotchas

- **Display names use first name only** in the By Person table (via TEAM array mapping). Full names live in the Sheet.
- **CSV parser must handle multi-line cells** — don't simplify it.
- **`UNIQUE` + `COUNTIFS` > `QUERY`** for source lists — QUERY adds a "count" header row that breaks layouts.
- **Date filtering uses `>=TODAY()` AND `<TODAY()+1`** — Salesforce exports include time components.
- **Flags box is local-only.** Edits live in the screenshot, not in the sheet.
- **Subdivides on Comps card sits BELOW the By Person table** (decided May 29).
- **Anshul prefers step-by-step debugging.** Wait for "done" before next step. When paste errors hit, redo the whole column.
