# Quick Setup & Testing Guide

Get the LinkedIn Sales Navigator Scraper running in 5 minutes.

## 🎯 Goal

Verify the extension loads correctly and can scrape lead data from Sales Navigator.

## 📋 Prerequisites

- ✅ Chrome browser installed
- ✅ LinkedIn Sales Navigator account
- ✅ Extension files downloaded/cloned

## 🚀 Step 1: Load Extension in Chrome

### 1.1 Open Chrome Extensions Page
```
Method 1: Navigate to chrome://extensions/
Method 2: Menu (⋮) → Extensions → Manage Extensions
Method 3: Window → Extensions (on Mac)
```

### 1.2 Enable Developer Mode
- Look for the **"Developer mode"** toggle in the top-right corner
- Click to enable it
- You should see new buttons appear: "Load unpacked", "Pack extension", etc.

### 1.3 Load the Extension
1. Click **"Load unpacked"** button
2. Navigate to your `linkedinscraper` folder
3. Select the folder (the one containing `manifest.json`)
4. Click "Select Folder" or "Open"

### 1.4 Verify Installation
You should see:
- ✅ Extension card with name "LinkedIn Sales Nav Scraper"
- ✅ Version "1.0.0"
- ✅ "Errors" button should show 0 errors
- ✅ Extension icon in Chrome toolbar (puzzle piece icon)

**If you see errors:**
- Click the "Errors" button to see details
- Common issue: Missing icon files - not critical, extension will still work
- Check all files are present in the folder

## 🧪 Step 2: Test on Sales Navigator

### 2.1 Navigate to Sales Navigator
```
https://www.linkedin.com/sales/search/people
```

**Login if needed** with your Sales Navigator credentials.

### 2.2 Perform a Test Search

For quick testing, use these filters:
- **Title:** "CEO" or "Marketing Director" or any common title
- **Location:** Pick any country/region
- **Company headcount:** Any
- Click **"Search"**

Wait for results to load (you should see a list of people).

### 2.3 Look for the Scrape Button

The extension should automatically inject a button:
- **Location:** Top-right of the search results area
- **Look:** Blue button with text "📥 Scrape Leads to CSV"
- **Style:** Rounded corners, gradient background

**If button doesn't appear:**
1. Refresh the page (Ctrl/Cmd + R)
2. Wait 2-3 seconds for page to fully load
3. Check console for errors (F12 → Console tab)
4. Look for logs starting with "✅ Sales Nav Scraper"

### 2.4 Test Scraping

**For initial test, limit to 1-2 pages:**

1. Click the **"📥 Scrape Leads to CSV"** button
2. Confirm the popup dialog
3. Watch the button text change:
   - "⏳ Initializing... 0 leads"
   - "⏳ Scraping... X leads (Page 1)"
   - Button will navigate to next page automatically
4. **Keep the tab open** - don't navigate away

**Expected behavior:**
- Page should navigate to Page 2 after ~3 seconds
- Button should re-appear and continue scraping
- This continues until all pages are scraped

**To test only 1 page:** 
- After starting scrape, wait for Page 1 to complete
- Manually stop by closing/refreshing tab
- CSV will still download with scraped data

### 2.5 Verify CSV Download

When scraping completes:
1. CSV file automatically downloads
2. Filename format: `linkedin_sales_nav_leads_2025-11-18T20-30-00.csv`
3. Open the file in Excel, Google Sheets, or text editor

**Check the CSV contains:**
- ✅ Header row with column names
- ✅ Data rows (one per lead)
- ✅ First Name, Last Name, Full Name populated
- ✅ Current Job, Company Name, Location populated
- ✅ Sales Navigator URLs populated

**Fields that will be empty (expected):**
- Email, Email Status (enrichment not implemented yet)
- Company Website, Industry (requires visiting company pages)
- Some optional fields

## 🔍 Step 3: Debugging (If Issues)

### 3.1 Open Developer Console
```
Windows/Linux: F12 or Ctrl + Shift + J
Mac: Cmd + Option + J
```

### 3.2 Check Console Logs

Filter logs by typing: `SalesNav`

**Look for these key messages:**

✅ **Success indicators:**
```
✅ Sales Nav Scraper Extension Loaded!
📍 Detected Sales Nav search page
✅ Scrape button injected successfully
📄 === Scraping Page 1 ===
✅ Found X leads on page
✅ Scraped X leads from page 1
```

❌ **Error indicators:**
```
❌ No "Next" button found
⚠️ No leads found on page X
❌ Error on page X: [error message]
```

### 3.3 Common Issues & Fixes

#### Issue: Button doesn't appear
**Possible causes:**
- Not on a Sales Nav search page
- Page structure changed
- Extension didn't load

**Fix:**
1. Verify URL contains `/sales/search/`
2. Refresh page
3. Check extension is enabled
4. Look for injection errors in console

#### Issue: "No leads found"
**Possible causes:**
- LinkedIn changed HTML structure
- Page didn't fully load
- Selectors need updating

**Fix:**
1. Wait longer (5-10 seconds) for page load
2. Check if leads are visible on page
3. Inspect a lead card (F12 → Elements)
4. Compare selectors in `SELECTORS_REFERENCE.md`
5. Update `content.js` if needed

#### Issue: Scraping stops after 1 page
**Possible causes:**
- Only 1 page of results
- "Next" button not found
- URL navigation failed

**Fix:**
1. Check if there's actually a "Next" button on the page
2. Look at console logs for navigation messages
3. Verify URL changed to include `?page=2`

#### Issue: CSV has missing data
**Expected:**
- Email fields empty (not implemented yet)
- Some company details missing (requires company page visit)

**Actual issues:**
- If Name, Title, Company are empty → selectors need updating
- Check console for extraction errors
- Inspect HTML structure (F12 → Elements)

## 📊 Step 4: Test Different Scenarios

Once basic scraping works, test:

### Scenario 1: Single Page (25 results)
- Perform a very specific search (few results)
- Scrape and verify all leads captured

### Scenario 2: Multiple Pages (50-100 results)
- Perform broader search
- Let it scrape 2-3 pages
- Verify pagination works correctly
- Check CSV has leads from all pages

### Scenario 3: Empty Search
- Perform search with no results
- Extension should handle gracefully
- Check for appropriate error message

### Scenario 4: Large Search (Optional)
- Broad search (500+ results)
- Let scrape for ~5-10 pages
- Stop manually if it takes too long
- Verify performance and reliability

## ✅ Success Criteria

Your setup is successful if:

1. ✅ Extension loads without errors
2. ✅ Button appears on Sales Nav search page
3. ✅ Clicking button starts scraping
4. ✅ Can scrape at least 1 page (25 leads)
5. ✅ CSV downloads automatically
6. ✅ CSV contains valid lead data
7. ✅ Pagination works (navigates to next page)

## 🎓 Understanding the Logs

### Log Emojis & Meaning

| Emoji | Type | Meaning |
|-------|------|---------|
| ✅ | Success | Action completed successfully |
| ❌ | Error | Something failed |
| ⚠️ | Warning | Non-critical issue |
| 📄 | Page | Page-related info |
| 🔍 | Search | Finding elements |
| 📜 | Scroll | Scrolling action |
| 🔗 | URL | URL navigation |
| ⏳ | Progress | Operation in progress |
| 🎉 | Complete | Task finished |

### Example Log Flow (Successful)
```
✅ Sales Nav Scraper Extension Loaded!
📍 Detected Sales Nav search page
✅ Scrape button injected successfully
📄 === Scraping Page 1 ===
✅ Found 25 lead elements on page
📜 Found scrollable leads container, scrolling to load all...
✅ Loaded more content (1200px → 1400px)
🔍 Found 25 potential lead cards
  ✓ Lead 1: John Doe
  ✓ Lead 2: Jane Smith
  ...
✅ Scraped 25 leads from page 1
✅ Next button available, navigating to next page via URL...
📄 Incrementing from page 1 to page 2
🔗 Current URL: https://linkedin.com/sales/search/people?query=...
🔗 Next URL: https://linkedin.com/sales/search/people?page=2&query=...
```

## 🐛 Reporting Issues

If something doesn't work:

1. **Collect information:**
   - Chrome version: `chrome://version`
   - Extension version: Check `manifest.json`
   - Console logs: Copy all relevant messages
   - Screenshot of the issue

2. **Try to isolate:**
   - Does button appear? Yes/No
   - Does scraping start? Yes/No
   - At what point does it fail?

3. **Check selectors:**
   - Open `SELECTORS_REFERENCE.md`
   - Compare with actual LinkedIn HTML (F12 → Elements)
   - Note any differences

4. **Submit report:**
   - Include all information above
   - Share console logs
   - Mention Sales Nav search URL structure
   - Include relevant HTML snippets if possible

## 🚀 Next Steps After Testing

Once everything works:

1. **Use it for real:**
   - Perform actual prospecting searches
   - Scrape your target leads
   - Export to your CRM

2. **Customize if needed:**
   - Adjust delays in `CONFIG` object
   - Add custom CSV fields
   - Modify button styling

3. **Stay updated:**
   - Watch for LinkedIn HTML changes
   - Update selectors as needed
   - Check `SELECTORS_REFERENCE.md` regularly

4. **Phase 2 features:**
   - Email enrichment
   - Deduplication
   - Company details
   - Advanced filtering

---

## 📞 Need Help?

- 📖 **Full docs:** See `README.md`
- 🔍 **Selectors:** See `SELECTORS_REFERENCE.md`
- 💻 **Code:** Check `content.js` with inline comments
- 🐛 **Issues:** Open GitHub issue with details

---

**Happy scraping! 🚀**

Last updated: 2025-11-18

