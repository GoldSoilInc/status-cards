# GoldSoil Status Cards

Live, branded status cards for the four GoldSoil teams. Data flows from **Salesforce → Google Sheets → these pages**. Team leads open their page, refresh, screenshot, and post to **GoldSoil Hub** five times a day.

> For KPI definitions, formula patterns, column maps, and team-specific rules, see **[REFERENCE.md](./REFERENCE.md)**.

---

## Live cards

| Team | Lead | URL |
|---|---|---|
| LIM Outreach | Juan | `/lim.html` |
| Comps | Edcel | `/comps.html` |
| Marketing | Ellyse | `/marketing.html` |
| Sales | Jose & Gabriel | `/sales.html` |

Base URL: `https://goldsoilinc.github.io/status-cards/`

---

## Daily workflow

1. At your scheduled slot (10am · 12pm · 2pm · 4pm · 5pm+ CT), open your team's card
2. Click **↻ REFRESH**
3. Add a flag if needed (EDIT → write → SAVE) — default is "None right now."
4. Screenshot
5. Post in **GoldSoil Hub**

The active time-slot pill auto-highlights based on US Central time.

---

## Repo map

```
status-cards/
├── index.html              ← Landing page (links to all 4)
├── lim.html                ← LIM Outreach card
├── comps.html              ← Comps card
├── marketing.html          ← Marketing card
├── sales.html              ← Sales card
├── README.md               ← This file
├── REFERENCE.md            ← KPI rules, formulas, column maps, gotchas
├── shared/
│   ├── brand.css           ← GoldSoil colors, fonts, components
│   └── sheet-loader.js     ← CSV fetcher + Flags + Footer
└── sheet-templates/        ← Starter CSVs per team
```

---

## Decision rights

| Owner | Decides |
|---|---|
| **Leslie** | Layout, workflow, rollout |
| **Anshul** | KPIs, targets, what counts as a flag |

Don't change KPI definitions without Anshul. Don't change layout patterns or cadence without Leslie.

---

## Updating a card

1. Edit the relevant `.html` (or have Claude rebuild it)
2. Commit + push to `main`
3. GitHub Pages redeploys in ~30 seconds
4. Refresh the card URL to verify

For everything else — adding KPIs, rolling out a new team, formula patterns, the Salesforce → Sheets path — see **[REFERENCE.md](./REFERENCE.md)**.

---

## Notes

- **No backend.** Pure static HTML/CSS/JS on GitHub Pages.
- **No auth.** Anyone with the URL can view — keep PII out of published columns.
- **Refresh = re-fetch.** Pages call the CSV endpoint fresh on each load (`cache: 'no-store'`).
- **Flags are local-only.** Edits live in the screenshot, not in the Sheet.
