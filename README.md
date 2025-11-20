# LinkedIn Sales Navigator Scraper

A powerful Chrome extension that scrapes LinkedIn Sales Navigator search results and exports to CSV format. Built with reliability and safety in mind - runs 100% client-side using your LinkedIn session.

## 🚀 Features

### Current (MVP)
- ✅ **Client-side scraping** - Runs in your browser, zero ban risk
- ✅ **Automatic pagination** - Scrapes all pages via URL navigation
- ✅ **Smart data extraction** - Name, title, company, location, and more
- ✅ **CSV export** - Compatible with Evaboot format
- ✅ **Lazy-load handling** - Scrolls to load all leads on page
- ✅ **Robust selectors** - Multiple fallbacks for reliability
- ✅ **Real-time progress** - See how many leads scraped

### Data Fields Extracted
- ✅ Name (First, Last, Full)
- ✅ Current Job Title
- ✅ Company Name
- ✅ Location
- ✅ Time in Role/Company
- ✅ LinkedIn Sales Navigator URLs
- ✅ Connections (1st/2nd/3rd degree)
- 🔜 Company Website (coming soon)
- 🔜 Company Industry (coming soon)
- 🔜 Company LinkedIn URL (coming soon)
- 🔜 Email Enrichment via BetterContact API (coming soon)

### Coming Soon (Phase 2)
- 🔜 Email enrichment via BetterContact API
- 🔜 Deduplication across searches
- 🔜 Company details (website, industry, LinkedIn URL)
- 🔜 Progress bar with time estimates
- 🔜 Resume interrupted scrapes
- 🔜 Export format options

## 📦 Installation

### Prerequisites
- Chrome browser (or Chromium-based like Edge, Brave)
- LinkedIn Sales Navigator account
- Basic understanding of Chrome extensions

### Quick Setup (5 minutes)

1. **Download the extension**
   ```bash
   git clone <repository-url>
   cd linkedinscraper
   ```

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable **"Developer mode"** (toggle in top-right)
   - Click **"Load unpacked"**
   - Select the `linkedinscraper` folder
   - Extension should appear with a checkmark ✅

3. **Verify installation**
   - You should see the extension in your extensions list
   - Icon should appear in Chrome toolbar
   - Click icon to see popup with instructions

## 🎯 How to Use

### Step-by-Step Guide

1. **Navigate to Sales Navigator**
   ```
   https://www.linkedin.com/sales/search/people
   ```

2. **Perform a search**
   - Set your filters (title, location, company, etc.)
   - Click "Search"
   - Wait for results to load

3. **Start scraping**
   - Look for the blue **"📥 Scrape Leads to CSV"** button (top-right of search results)
   - Click the button
   - Confirm the popup

4. **Wait for completion**
   - Extension will scrape current page
   - Automatically navigate to next page
   - Continue until all pages scraped
   - **Keep the browser tab open during scraping**

5. **Download CSV**
   - CSV automatically downloads when complete
   - Filename: `linkedin_sales_nav_leads_YYYY-MM-DDTHH-MM-SS.csv`
   - Open in Excel, Google Sheets, or any CSV reader

### Important Notes
- ⚠️ **Keep tab open** - Scraping stops if you close the tab
- ⚠️ **Don't navigate away** - Stay on the Sales Nav search page
- ⚠️ **Be patient** - Large searches (100+ pages) can take 5-10 minutes
- ✅ **Safe scraping** - Uses your IP and session, no bot detection risk

## 🔧 Technical Details

### Architecture
```
User clicks button
    ↓
Extension waits for page load
    ↓
Scrapes visible leads from DOM
    ↓
Scrolls to load lazy-loaded content (if any)
    ↓
Navigates to next page via URL change
    ↓
Repeat until last page
    ↓
Export all leads to CSV
```

### Technology Stack
- **Manifest V3** - Latest Chrome extension standard
- **Vanilla JavaScript** - No dependencies, lightweight
- **CSS3** - Modern, responsive UI
- **Client-side only** - No backend, no server

### DOM Selectors Used
All selectors are documented in [`SELECTORS_REFERENCE.md`](./SELECTORS_REFERENCE.md) with:
- Stable `data-*` attributes
- Multiple fallback selectors
- Notes on LinkedIn's HTML structure
- Guidance for updating if LinkedIn changes

### Pagination Strategy
Instead of clicking "Next" button, we use **URL-based navigation**:
- More reliable than clicking
- Handles dynamic page changes
- Example: `?page=1` → `?page=2` → `?page=3`

### Rate Limiting
- 3 seconds between page navigations
- 0.5 seconds between processing leads
- Configurable in `content.js` (`CONFIG` object)

## 📊 CSV Format

The exported CSV matches Evaboot's format with these columns:

```csv
First Name,Last Name,Full Name,Current Job,Title,Company Name,Location,...
John,Doe,John Doe,CEO,CEO,Acme Corp,San Francisco CA,...
```

All columns:
- Personal: First Name, Last Name, Full Name
- Professional: Current Job, Title, Profile Headline
- Company: Company Name, Company Website, Company Industry
- Social: LinkedIn URL, Sales Navigator URL, Connections
- Tenure: Years/Months in Position, Years/Months in Company
- Enrichment: Email, Email Status (empty in MVP)

## 🐛 Troubleshooting

### Button doesn't appear
**Solution:**
1. Refresh the page (Ctrl/Cmd + R)
2. Make sure you're on `linkedin.com/sales/search/people`
3. Check if extension is enabled in `chrome://extensions/`
4. Open console (F12) and look for errors

### No leads scraped
**Possible causes:**
- LinkedIn changed their HTML structure
- Page didn't fully load
- Wrong page type (not a search results page)

**Solution:**
1. Open console (F12)
2. Look for logs starting with `[SalesNav]`
3. Check `SELECTORS_REFERENCE.md` for selector updates
4. Report issue with console logs

### Scraping stops mid-way
**Possible causes:**
- Tab was closed
- Browser went to sleep
- Network interruption

**Solution:**
- Keep browser active
- Disable sleep mode during long scrapes
- Start scraping again (extension won't duplicate, just continues)

### CSV has missing data
**Expected:**
- Email fields are empty (enrichment coming in Phase 2)
- Some company details missing (requires visiting company pages)

**Fixable:**
- Check console for extraction errors
- Verify selectors match current LinkedIn HTML
- Update selectors in `content.js` if needed

## 🔐 Privacy & Security

### What data is collected?
**None.** This extension:
- ❌ Does NOT send data to any server
- ❌ Does NOT track your activity
- ❌ Does NOT store credentials
- ✅ Runs 100% in your browser
- ✅ Open source - inspect the code yourself

### How does it work without getting banned?
- Uses YOUR LinkedIn session cookies
- Uses YOUR IP address
- Mimics normal browsing behavior
- Adds delays between actions
- LinkedIn sees it as you manually browsing

### Is it safe to use?
✅ **Yes**, because:
1. Client-side only (no external servers)
2. Uses your existing session (no bot behavior)
3. Respects rate limits
4. Same as manually copying data

⚠️ **However:**
- Don't scrape thousands of profiles per day
- LinkedIn may have terms against automated scraping
- Use responsibly and at your own risk

## 📝 Development

### File Structure
```
linkedinscraper/
├── manifest.json          # Extension configuration
├── content.js             # Core scraping logic
├── styles.css             # Button styling
├── popup.html             # Extension popup UI
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── SELECTORS_REFERENCE.md # DOM selectors documentation
├── README.md              # This file
└── setup-test.md          # Quick testing guide
```

### Configuration
Edit `CONFIG` object in `content.js`:
```javascript
const CONFIG = {
  DELAY_BETWEEN_PAGES: 3000,     // 3 seconds
  DELAY_BETWEEN_LEADS: 500,      // 0.5 seconds
  MAX_RETRIES: 3,
  WAIT_FOR_LOAD_TIMEOUT: 10000   // 10 seconds
};
```

### Debugging
1. Open console: `F12` or `Ctrl+Shift+J` (Windows) / `Cmd+Option+J` (Mac)
2. Filter logs by typing: `SalesNav`
3. All extension logs start with emoji indicators:
   - ✅ Success
   - ❌ Error
   - ⚠️ Warning
   - 📄 Page info
   - 🔍 Search/find
   - 📜 Scroll action

### Updating After LinkedIn Changes
If LinkedIn updates their HTML:
1. Inspect the page (F12 → Elements tab)
2. Find new selectors for each data field
3. Update `content.js` → `extractLeadData()` function
4. Update `SELECTORS_REFERENCE.md` with new selectors
5. Test thoroughly
6. Submit PR or update your local copy

## 🗺️ Roadmap

### Phase 1: MVP (Current) ✅
- [x] Basic scraping
- [x] CSV export
- [x] Pagination
- [x] Client-side only

### Phase 2: Email Enrichment 🚧
- [ ] BetterContact API integration
- [ ] Email verification status
- [ ] Bulk enrichment
- [ ] Cost tracking

### Phase 3: Deduplication 📋
- [ ] Check for duplicate profiles
- [ ] Skip already-scraped leads
- [ ] Merge across searches
- [ ] Refresh old leads option

### Phase 4: Company Details 🏢
- [ ] Visit company pages automatically
- [ ] Extract website, industry, size
- [ ] Get company LinkedIn URLs
- [ ] Handle missing company pages

### Phase 5: Pro Features 🚀
- [ ] Resume interrupted scrapes
- [ ] Progress bar with ETA
- [ ] Export format options (JSON, Excel)
- [ ] CRM integrations (HubSpot, Salesforce)
- [ ] Bulk scraping multiple searches
- [ ] Scheduled scraping

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Test thoroughly
4. Submit a pull request
5. Document any selector changes

## 📄 License

MIT License - see LICENSE file for details

## ⚠️ Disclaimer

This tool is for educational purposes. Use responsibly and in accordance with LinkedIn's Terms of Service. The authors are not responsible for any misuse or violations of LinkedIn's policies.

**Use at your own risk.**

---

## 📞 Support

- 🐛 **Bug reports:** Open an issue on GitHub
- 💡 **Feature requests:** Open an issue with `[Feature]` tag
- 📖 **Documentation:** See `SELECTORS_REFERENCE.md` for technical details
- 🧪 **Testing:** See `setup-test.md` for quick testing guide

---

**Built with ❤️ for sales teams and growth hackers**

Last updated: 2025-11-18
Version: 1.0.0 (MVP)

