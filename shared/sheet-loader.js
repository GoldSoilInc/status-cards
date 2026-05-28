// ============================================
// GoldSoil Status Cards — Sheet Loader
// Reads a published Google Sheet (CSV) and
// returns a flat key-value object for the card.
// ============================================

/**
 * Fetch a published Google Sheet as CSV and parse to {metric: value} object.
 * Expects the sheet to have two columns: "metric" and "value" (header row).
 * Any other columns in the sheet are ignored — you can keep extra data there.
 *
 * @param {string} csvUrl - Published-to-web CSV URL from Google Sheets
 * @returns {Promise<Object>} - { campaigns_launched: "7", listings_touched: "5", ... }
 */
async function loadSheetData(csvUrl) {
  const response = await fetch(csvUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet (${response.status})`);
  }
  const csv = await response.text();
  return parseCSV(csv);
}

/**
 * Parses a 2-column CSV (metric, value) into a key-value object.
 * Handles quoted fields, commas inside quotes, escaped quotes, AND
 * newlines embedded inside quoted cells (which Google Sheets emits
 * when a cell contains line breaks).
 */
function parseCSV(csv) {
  const rows = parseAllRows(csv);
  if (rows.length < 2) return {};

  const data = {};
  // Skip the header row (index 0)
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i];
    if (cells.length >= 2) {
      const key = cells[0].trim();
      const value = cells[1].trim();
      if (key) data[key] = value;
    }
  }
  return data;
}

/**
 * Parse a full CSV string into rows, character-by-character, respecting
 * quoted cells that span multiple lines. Returns an array of arrays.
 */
function parseAllRows(csv) {
  const rows = [];
  let current = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const c = csv[i];
    if (c === '"' && csv[i + 1] === '"') {
      // Escaped quote inside a quoted cell
      current += '"';
      i++;
    } else if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      row.push(current);
      current = '';
    } else if ((c === '\n' || c === '\r') && !inQuotes) {
      // End of row (only outside quotes)
      // Handle \r\n: skip the \n that follows \r
      if (c === '\r' && csv[i + 1] === '\n') i++;
      row.push(current);
      rows.push(row);
      row = [];
      current = '';
    } else {
      current += c;
    }
  }
  // Push the last row if there's leftover content
  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }
  return rows;
}

/**
 * Get a value from the data object, with a fallback if missing.
 * Treats missing keys as the fallback (default: 0 for numbers, "—" for text).
 */
function val(data, key, fallback = '') {
  const v = data[key];
  if (v === undefined || v === null || v === '') return fallback;
  return v;
}

function num(data, key, fallback = 0) {
  const v = data[key];
  if (v === undefined || v === null || v === '') return fallback;
  const parsed = parseFloat(v);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Determine the active time slot based on US Central time.
 * Returns one of: '10am', '12pm', '2pm', '4pm', '5pm', or null if outside window.
 */
function getCurrentTimeSlot() {
  const now = new Date();
  // Get current time in Central Time (US)
  const ctString = now.toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });
  const [hourStr, minStr] = ctString.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minStr, 10);
  const totalMinutes = hour * 60 + minute;

  // Each slot is "active" from its time until the next slot
  // 10:00-11:59 = 10am, 12:00-13:59 = 12pm, 14:00-15:59 = 2pm,
  // 16:00-16:59 = 4pm, 17:00 onward = 5pm
  if (totalMinutes >= 17 * 60) return '5pm';
  if (totalMinutes >= 16 * 60) return '4pm';
  if (totalMinutes >= 14 * 60) return '2pm';
  if (totalMinutes >= 12 * 60) return '12pm';
  if (totalMinutes >= 10 * 60) return '10am';
  return null; // Before 10 AM CT
}

/** Format the current date as "Wed · Jan 15" */
function getFormattedDate() {
  const now = new Date();
  const opts = { timeZone: 'America/Chicago', weekday: 'short', month: 'short', day: 'numeric' };
  const parts = now.toLocaleDateString('en-US', opts).replace(',', '').split(' ');
  // parts = ["Wed", "Jan", "15"] → "Wed · Jan 15"
  return `${parts[0]} · ${parts[1]} ${parts[2]}`;
}

/** Render the time slot pill strip. */
function renderTimeStrip(activeSlot) {
  const slots = [
    { id: '10am', label: '10 AM' },
    { id: '12pm', label: '12 PM' },
    { id: '2pm', label: '2 PM' },
    { id: '4pm', label: '4 PM' },
    { id: '5pm', label: '5 PM+' }
  ];
  const date = getFormattedDate();
  const pills = slots.map(s => {
    const isActive = s.id === activeSlot;
    return `<div class="pill${isActive ? ' active' : ''}">${s.label}${isActive ? ' ←' : ''}</div>`;
  }).join('');
  return `
    <div class="time-strip">
      <div style="display: flex; align-items: center;">
        <span class="label">Update</span>
        <div class="pills">${pills}</div>
      </div>
      <div class="date">${date}</div>
    </div>
  `;
}

/** Render header */
function renderHeader(teamName, leadName) {
  return `
    <div class="card-header">
      <div>
        <div class="brand">GOLDSOIL · TEAM REPORT</div>
        <h1>${teamName}</h1>
      </div>
      <div class="lead-block">
        <div class="lead-label">Lead</div>
        <div class="lead-name">${leadName}</div>
      </div>
    </div>
  `;
}

/** Render footer */
function renderFooter() {
  return `
    <div class="card-footer">
      <div class="org">GoldSoil Inc. · Round Rock, TX</div>
      <div class="posted">POSTED IN GOLDSOIL HUB</div>
    </div>
  `;
}

/** Render Flags section */
function renderFlags(flagsText) {
  const text = flagsText && flagsText.trim() ? flagsText : 'None right now.';
  return `
    <div class="flags">
      <div class="flag-label">⚑ FLAGS / NEEDS ANSHUL</div>
      <div class="flag-body">${text}</div>
    </div>
  `;
}

/** Render last-updated text in the refresh bar */
function renderRefreshBar() {
  const time = new Date().toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  return `
    <div class="refresh-bar">
      <div class="last-updated">Last refreshed: ${time} CT</div>
      <button onclick="location.reload()">↻ REFRESH</button>
    </div>
  `;
}

/** Wrap card content with refresh bar above */
function wrapCard(cardHtml) {
  return `${renderRefreshBar()}<div class="card">${cardHtml}</div>`;
}

/** Display an error state */
function renderError(message) {
  return `
    <div class="card">
      <div class="error-state">
        <strong>Could not load data.</strong><br>
        ${message}<br><br>
        Check that the Google Sheet is published to the web as CSV
        and the URL is correct in this page's config.
      </div>
    </div>
  `;
}

/** Display a loading state */
function renderLoading() {
  return `<div class="card"><div class="loading-state">Loading latest numbers from Google Sheet…</div></div>`;
}
