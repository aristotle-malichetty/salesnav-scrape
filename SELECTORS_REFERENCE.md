# LinkedIn Sales Navigator - DOM Selectors Reference

This document contains all the CSS selectors and HTML structure for scraping LinkedIn Sales Navigator search results.

## 📍 Lead Card Structure (Search Results Page)

### Name & Sales Nav Profile Link
```html
<a class="ember-view disabled link--mercado" 
   data-control-name="view_lead_panel_via_search_lead_name" 
   href="/sales/lead/ACwAAAgkwt4BlnVeqPMXW3YqZ7veNwwua--u7WM,NAME_SEARCH,PClu">
  <span data-anonymize="person-name">Hudson Hector</span>
</a>
```
**Selectors:**
- Link: `a[data-control-name="view_lead_panel_via_search_lead_name"]`
- Name: `span[data-anonymize="person-name"]`
- Sales Nav URL: `href` attribute from the link

---

### Job Title & Company Name
```html
<div class="artdeco-entity-lockup__subtitle ember-view t-14">
  <span data-anonymize="title">Chief Executive Officer</span>
  <span aria-hidden="true" class="separator--middot"></span>
  Unshakable Mindset International
  <button aria-expanded="false" aria-label="See more about..." class="entity-hovercard__a11y-trigger p0 b0" type="button"></button>
</div>
```
**Selectors:**
- Container: `.artdeco-entity-lockup__subtitle`
- Job Title: `span[data-anonymize="title"]`
- Company Name: Text node after the separator (needs custom extraction)

---

### Location
```html
<span class="t-12" data-anonymize="location">
  Fairfield, Connecticut, United States
</span>
```
**Selectors:**
- Location: `span[data-anonymize="location"]` or `.t-12[data-anonymize="location"]`

---

### Time in Company/Role
```html
<div class="artdeco-entity-lockup__metadata ember-view" data-anonymize="job-title">
  1 year 11 months in role
  <span aria-hidden="true" class="separator--pipe"></span>
  1 year 11 months in company
</div>
```
**Selectors:**
- Container: `.artdeco-entity-lockup__metadata[data-anonymize="job-title"]`
- Parse text to extract both "in role" and "in company" durations

---

### LinkedIn Profile URL (Hidden in 3-Dot Menu)

When you click the name, the lead panel opens. Click the 3-dot menu to reveal:

```html
<a class="ember-view _item_1xnv7i" 
   href="https://www.linkedin.com/in/hudsonhector" 
   target="_blank">
  <div class="_text_1xnv7i">View LinkedIn profile</div>
</a>
```

**Selectors:**
- Menu button: `button[aria-label*="More"]` or similar trigger
- LinkedIn Profile Link: `a[href^="https://www.linkedin.com/in/"]`
- Alternative: Button with text "Copy LinkedIn.com URL"

---

## 🏢 Company Information (From Lead Panel)

When you click on a company name/link, it opens the company profile:

### Company LinkedIn Sales Nav Link
```html
<a class="ember-view link--mercado t-black--light t-bold inline-block" 
   data-anonymize="company-name" 
   data-control-name="view_company_via_profile_lockup" 
   href="/sales/company/2788132">
  Red Rock
</a>
```
**Selectors:**
- Link: `a[data-control-name="view_company_via_profile_lockup"]`
- Company Name: `a[data-anonymize="company-name"]`
- Sales Nav Company URL: `href` attribute

---

### Company Industry
```html
<span data-anonymize="industry">
  Advertising Services
</span>
```
**Selectors:**
- Industry: `span[data-anonymize="industry"]`

---

### Company Location
```html
<div data-anonymize="location" 
     class="_bodyText_1e5nen _default_1i6ulk _sizeSmall_1e5nen _lowEmphasis_1i6ulk">
  Milford, Connecticut, United States
</div>
```
**Selectors:**
- Location: `div[data-anonymize="location"]` or `[data-anonymize="location"]`

---

### Number of Employees
```html
<span class="_link-text_1808vy">
  54 employees
</span>
```
**Selectors:**
- Employee Count: `span._link-text_1808vy` (contains "employees" text)
- Parse to extract number

---

### Company Website
```html
<a class="ember-view _button_ps32ck _small_ps32ck _secondary_ps32ck" 
   data-control-name="visit_company_website" 
   href="http://redrockbranding.com" 
   target="_blank">
  <span class="_text_ps32ck">Visit website</span>
</a>
```
**Selectors:**
- Website Link: `a[data-control-name="visit_company_website"]`
- URL: `href` attribute

---

### Company LinkedIn URL (Hidden in 3-Dot Menu)

Click the 3-dot menu button on company page:

```html
<button class="ember-view _button_ps32ck _small_ps32ck _secondary_ps32ck _circle_ps32ck" 
        aria-label="More options">
  <svg><!-- 3 dots icon --></svg>
</button>
```

Then find the LinkedIn company URL in the menu dropdown.

**Selectors:**
- Menu trigger: `button[aria-label="More options"]`
- LinkedIn Company Link: `a[href^="https://www.linkedin.com/company/"]`

---

## 🔍 Extraction Strategy

### Phase 1: Search Results Page
Extract from lead cards:
- ✅ Name
- ✅ Job Title
- ✅ Company Name
- ✅ Location
- ✅ Time in role/company
- ✅ Sales Nav Profile URL

### Phase 2: Click Into Lead Panel (Optional)
To get LinkedIn profile URL:
1. Click on lead name
2. Wait for sidebar to open
3. Click 3-dot menu
4. Extract `href` from "View LinkedIn profile" link

### Phase 3: Visit Company Page (Optional)
To get full company details:
1. Click company Sales Nav link
2. Wait for company page to load
3. Extract: Industry, Company Location, Employees, Website
4. Click 3-dot menu for Company LinkedIn URL

---

## 📝 Notes

### Important Considerations:
- **Dynamic IDs**: Element IDs like `ember2546` change on each page load - DO NOT use them
- **Data Attributes**: Use `data-anonymize`, `data-control-name` - these are stable
- **Fallback Selectors**: Always have 2-3 backup selectors in case LinkedIn changes structure
- **Menu Interactions**: LinkedIn profile URLs and Company LinkedIn URLs require clicking menus
- **Rate Limiting**: Add delays between clicks to avoid detection
- **Company Links**: Some companies don't have LinkedIn pages - handle missing data gracefully

### Stable Selectors Priority:
1. ✅ `data-*` attributes (most stable)
2. ✅ Semantic class names with context
3. ❌ Generic classes like `t-14`, `ember-view` (too generic)
4. ❌ Element IDs starting with `ember` (change on reload)

---

## 🎯 Recommended Approach

**For MVP (Fast Scraping):**
- Scrape only what's visible in search results
- Skip clicking into lead panels
- Skip clicking into company pages
- Trade-off: Missing LinkedIn profile URLs and some company details

**For Complete Data (Slower):**
- Click each lead → extract LinkedIn profile URL
- Click each company → extract full company details
- Add 1-2 second delays between clicks
- Risk: Slower, more detectable

---

Last Updated: 2025-11-18

