// LinkedIn Sales Navigator Lead Scraper
// Uses real LinkedIn Sales Nav selectors based on DOM analysis

console.log('✅ Sales Nav Scraper Extension Loaded!');

let isScrapingActive = false;
let scrapedLeads = [];

// ==================== CONFIGURATION ====================
const CONFIG = {
  DELAY_BETWEEN_PAGES: 3000,  // 3 seconds between pages
  DELAY_BETWEEN_LEADS: 500,    // 0.5 seconds between processing leads
  MAX_RETRIES: 3,
  WAIT_FOR_LOAD_TIMEOUT: 10000 // 10 seconds max wait
};

// ==================== INITIALIZE ====================
function init() {
  // Check if we're on Sales Navigator search page
  if (window.location.href.includes('linkedin.com/sales/search')) {
    console.log('📍 Detected Sales Nav search page');
    
    // Wait for page to fully load before injecting button
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectScrapeButton);
    } else {
      setTimeout(injectScrapeButton, 1500);
    }
  }
}

// ==================== INJECT SCRAPE BUTTON ====================
function injectScrapeButton() {
  // Don't inject if already exists
  if (document.getElementById('scraper-button')) {
    console.log('Button already exists');
    return;
  }
  
  // Find a good place to inject the button
  // Try multiple possible locations
  const possibleLocations = [
    document.querySelector('.search-results__header'),
    document.querySelector('.search-results-container__header'),
    document.querySelector('[class*="search-results"]'),
    document.querySelector('header'),
  ];

  const targetLocation = possibleLocations.find(el => el !== null);
  
  if (!targetLocation) {
    console.warn('⚠️ Could not find location to inject button. Retrying...');
    setTimeout(injectScrapeButton, 2000);
    return;
  }

  // Create button
  const button = document.createElement('button');
  button.id = 'scraper-button';
  button.className = 'scraper-button';
  button.innerHTML = '📥 Scrape Leads to CSV';
  button.onclick = startScraping;
  
  targetLocation.style.position = 'relative';
  targetLocation.appendChild(button);
  
  console.log('✅ Scrape button injected successfully');
}

// ==================== START SCRAPING ====================
async function startScraping() {
  if (isScrapingActive) {
    alert('⚠️ Scraping already in progress!');
    return;
  }

  const confirmed = confirm(
    '🚀 Start scraping leads from this Sales Navigator search?\n\n' +
    'This will:\n' +
    '• Scrape all visible lead data\n' +
    '• Handle pagination automatically\n' +
    '• Export to CSV when complete\n\n' +
    'Keep this tab open during scraping.'
  );
  
  if (!confirmed) return;

  isScrapingActive = true;
  scrapedLeads = [];
  
  updateButtonState('⏳ Initializing... 0 leads', true);
  
  try {
    await scrapeAllPages();
    
    if (scrapedLeads.length > 0) {
      exportToCSV(scrapedLeads);
      alert(`✅ Successfully scraped ${scrapedLeads.length} leads!\n\nCSV file downloaded.`);
    } else {
      alert('⚠️ No leads found. LinkedIn may have changed their structure.');
    }
  } catch (error) {
    console.error('❌ Scraping error:', error);
    alert('❌ Error during scraping:\n' + error.message + '\n\nCheck console for details.');
  } finally {
    isScrapingActive = false;
    updateButtonState('📥 Scrape Leads to CSV', false);
  }
}

// ==================== SCRAPE ALL PAGES ====================
async function scrapeAllPages() {
  // Get current page from URL
  const urlParams = new URLSearchParams(window.location.search);
  let currentPage = parseInt(urlParams.get('page')) || 1;
  let hasMorePages = true;
  let consecutiveFailures = 0;

  while (hasMorePages && consecutiveFailures < CONFIG.MAX_RETRIES) {
    console.log(`\n📄 === Scraping Page ${currentPage} ===`);
    
    try {
      // Wait for leads to load
      await waitForLeadsToLoad();
      
      // Optional: Scroll to load lazy-loaded content
      await scrollToLoadAllLeads();
      
      // Scrape current page
      const leadsOnPage = scrapeCurrentPage();
      
      if (leadsOnPage.length === 0) {
        console.warn(`⚠️ No leads found on page ${currentPage}`);
        consecutiveFailures++;
      } else {
        console.log(`✅ Scraped ${leadsOnPage.length} leads from page ${currentPage}`);
        scrapedLeads.push(...leadsOnPage);
        consecutiveFailures = 0; // Reset on success
      }
      
      updateButtonState(
        `⏳ Scraping... ${scrapedLeads.length} leads (Page ${currentPage})`, 
        true
      );
      
      // Check if there's a next page and navigate
      hasMorePages = await goToNextPage();
      
      if (hasMorePages) {
        currentPage++;
        console.log(`⏭️ Navigating to page ${currentPage}...`);
        // URL navigation will reload the page, so we exit here
        // The script will restart on the new page
        return;
      } else {
        console.log('✅ No more pages to scrape');
      }
      
    } catch (error) {
      console.error(`❌ Error on page ${currentPage}:`, error);
      consecutiveFailures++;
      
      if (consecutiveFailures >= CONFIG.MAX_RETRIES) {
        break;
      }
    }
  }
  
  if (consecutiveFailures >= CONFIG.MAX_RETRIES) {
    console.warn('⚠️ Stopped scraping due to consecutive failures');
  }
  
  console.log(`\n🎉 Scraping complete! Total leads: ${scrapedLeads.length}`);
}

// ==================== SCROLL TO LOAD ALL LEADS ====================
async function scrollToLoadAllLeads() {
  // Find the scrollable container for leads
  const containers = Array.from(document.querySelectorAll('div[class*="scaffold"], div[class*="search-results"]'));
  
  for (const container of containers) {
    const style = window.getComputedStyle(container);
    if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
      // Check if it contains lead items
      if (container.querySelector('[data-anonymize="person-name"]') || 
          container.querySelector('li.artdeco-list__item')) {
        
        console.log('📜 Found scrollable leads container, scrolling to load all...');
        
        // Scroll to bottom to trigger lazy loading
        const initialHeight = container.scrollHeight;
        container.scrollTop = container.scrollHeight;
        
        // Wait for potential lazy load
        await delay(1000);
        
        const newHeight = container.scrollHeight;
        if (newHeight > initialHeight) {
          console.log(`✅ Loaded more content (${initialHeight}px → ${newHeight}px)`);
        }
        
        // Scroll back to top for consistent scraping
        container.scrollTop = 0;
        await delay(500);
        
        return;
      }
    }
  }
  
  console.log('📜 No scrollable container found or not needed');
}

// ==================== SCRAPE CURRENT PAGE ====================
function scrapeCurrentPage() {
  const leads = [];
  
  // Try to find lead list items - using multiple selectors
  const leadCards = document.querySelectorAll(
    'li.artdeco-list__item, ' +
    'li[class*="search-results"], ' +
    'div[data-x-search-result], ' +
    '[class*="search-result-"]'
  );

  console.log(`🔍 Found ${leadCards.length} potential lead cards`);

  leadCards.forEach((card, index) => {
    try {
      const lead = extractLeadData(card, index);
      
      // Only add if we got at least a name
      if (lead && (lead['Full Name'] || lead['First Name'])) {
        leads.push(lead);
        console.log(`  ✓ Lead ${index + 1}: ${lead['Full Name']}`);
      }
    } catch (error) {
      console.error(`  ✗ Error extracting lead ${index + 1}:`, error.message);
    }
  });

  return leads;
}

// ==================== EXTRACT LEAD DATA ====================
function extractLeadData(card, index) {
  // Helper functions
  const getText = (selector, parent = card) => {
    const el = parent.querySelector(selector);
    return el ? el.textContent.trim() : '';
  };

  const getAttr = (selector, attr, parent = card) => {
    const el = parent.querySelector(selector);
    return el ? el.getAttribute(attr) : '';
  };

  // ==================== EXTRACT NAME ====================
  // Using the real selector from LinkedIn
  const nameLink = card.querySelector('a[data-control-name="view_lead_panel_via_search_lead_name"]');
  let fullName = '';
  let salesNavURL = '';
  
  if (nameLink) {
    const nameSpan = nameLink.querySelector('span[data-anonymize="person-name"]');
    fullName = nameSpan ? nameSpan.textContent.trim() : nameLink.textContent.trim();
    
    // Get Sales Nav profile URL
    const href = nameLink.getAttribute('href');
    if (href) {
      salesNavURL = href.startsWith('http') ? href : `https://www.linkedin.com${href}`;
    }
  }
  
  // Fallback: try other name selectors
  if (!fullName) {
    fullName = getText('.artdeco-entity-lockup__title') ||
               getText('[data-anonymize="person-name"]') ||
               getText('.name');
  }

  // Split name into first and last
  const nameParts = fullName.split(' ').filter(p => p.length > 0);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // ==================== EXTRACT JOB TITLE & COMPANY ====================
  const subtitleDiv = card.querySelector('.artdeco-entity-lockup__subtitle');
  let currentJob = '';
  let companyName = '';
  let companySalesNavURL = '';
  
  if (subtitleDiv) {
    // Extract job title
    const titleSpan = subtitleDiv.querySelector('span[data-anonymize="title"]');
    currentJob = titleSpan ? titleSpan.textContent.trim() : '';
    
    // Extract company name - it's either in a link or as text
    const companyLink = subtitleDiv.querySelector('a[data-control-name="view_company_via_profile_lockup"]') ||
                        subtitleDiv.querySelector('a[data-anonymize="company-name"]');
    
    if (companyLink) {
      companyName = companyLink.textContent.trim();
      const href = companyLink.getAttribute('href');
      if (href) {
        companySalesNavURL = href.startsWith('http') ? href : `https://www.linkedin.com${href}`;
      }
    } else {
      // Company name might be plain text
      const allText = subtitleDiv.textContent;
      // Remove the title and separators to get company name
      companyName = allText
        .replace(currentJob, '')
        .replace(/\s*·\s*/g, '')
        .trim();
    }
  }

  // ==================== EXTRACT LOCATION ====================
  const location = getText('span[data-anonymize="location"]') ||
                   getText('.t-12[data-anonymize="location"]') ||
                   getText('[data-anonymize="location"]');

  // ==================== EXTRACT TIME IN ROLE/COMPANY ====================
  const metadataDiv = card.querySelector('.artdeco-entity-lockup__metadata[data-anonymize="job-title"]') ||
                      card.querySelector('.artdeco-entity-lockup__metadata');
  
  let yearsInPosition = '';
  let monthsInPosition = '';
  let yearsInCompany = '';
  let monthsInCompany = '';
  
  if (metadataDiv) {
    const timeText = metadataDiv.textContent;
    
    // Parse "1 year 11 months in role | 1 year 11 months in company"
    const inRoleMatch = timeText.match(/(\d+)\s*year[s]?\s*(?:(\d+)\s*month[s]?)?\s*in\s*role/i);
    const inCompanyMatch = timeText.match(/(\d+)\s*year[s]?\s*(?:(\d+)\s*month[s]?)?\s*in\s*company/i);
    
    if (inRoleMatch) {
      yearsInPosition = inRoleMatch[1] || '';
      monthsInPosition = inRoleMatch[2] || '';
    }
    
    if (inCompanyMatch) {
      yearsInCompany = inCompanyMatch[1] || '';
      monthsInCompany = inCompanyMatch[2] || '';
    }
  }

  // ==================== EXTRACT CONNECTIONS ====================
  let connections = '';
  const connectionBadge = card.querySelector('.artdeco-entity-lockup__badge') ||
                          card.querySelector('[class*="member-badge"]');
  
  if (connectionBadge) {
    const badgeText = connectionBadge.textContent.toLowerCase();
    if (badgeText.includes('1st')) connections = '1st';
    else if (badgeText.includes('2nd')) connections = '2nd';
    else if (badgeText.includes('3rd')) connections = '3rd';
  }

  // ==================== BUILD LEAD OBJECT ====================
  // Match Evaboot CSV format
  return {
    'First Name': firstName,
    'Last Name': lastName,
    'Full Name': fullName,
    'Current Job': currentJob,
    'Profile Headline': currentJob, // Same as job for now
    'Title': currentJob,
    'Email': '', // Will be enriched later
    'Email Status': '',
    'Linkedin URL Public': '', // Requires clicking 3-dot menu
    'Sales Navigator URL': salesNavURL,
    'Company Name': companyName,
    'Company Website': '', // Requires visiting company page
    'Company Industry': '', // Requires visiting company page
    'Company LinkedIn URL': '', // Requires visiting company page + 3-dot menu
    'Company Sales Navigator URL': companySalesNavURL,
    'Company Location': '', // Requires visiting company page
    'Company Employee Count': '', // Requires visiting company page
    'Location': location,
    'Connections': connections,
    'Years in Position': yearsInPosition,
    'Months in Position': monthsInPosition,
    'Years in Company': yearsInCompany,
    'Months in Company': monthsInCompany,
  };
}

// ==================== WAIT FOR LEADS TO LOAD ====================
function waitForLeadsToLoad() {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkLoaded = () => {
      // Check if leads are present using multiple selectors
      const leads = document.querySelectorAll(
        'li.artdeco-list__item, ' +
        'li[class*="search-results"], ' +
        '[data-x--lead-list-item], ' +
        '[data-anonymize="person-name"]'
      );
      
      if (leads.length > 0) {
        console.log(`✅ Found ${leads.length} lead elements on page`);
        
        // Also check if "Select all" button is present (indicates page fully loaded)
        const selectAllBtn = Array.from(document.querySelectorAll('button, span')).find(el =>
          el.textContent.toLowerCase().includes('select all')
        );
        
        if (selectAllBtn) {
          console.log('✅ Page fully loaded (Select all button present)');
          resolve();
          return;
        }
      }
      
      // Check timeout
      if (Date.now() - startTime > CONFIG.WAIT_FOR_LOAD_TIMEOUT) {
        // If we found some leads but not the button, still proceed
        if (leads.length > 0) {
          console.log('⚠️ Timeout reached but leads found, proceeding anyway');
          resolve();
        } else {
          reject(new Error('Timeout waiting for leads to load'));
        }
        return;
      }
      
      // Keep checking
      setTimeout(checkLoaded, 500);
    };
    
    checkLoaded();
  });
}

// ==================== GO TO NEXT PAGE ====================
async function goToNextPage() {
  // Check if Next button exists and is enabled (to know if there are more pages)
  const nextButton = document.querySelector('button[aria-label="Next"]') ||
                     document.querySelector('button.artdeco-pagination__button--next') ||
                     Array.from(document.querySelectorAll('button')).find(btn => 
                       btn.textContent.toLowerCase().includes('next')
                     );

  if (!nextButton) {
    console.log('❌ No "Next" button found');
    return false;
  }

  // Check if button is disabled (last page)
  if (nextButton.disabled || 
      nextButton.classList.contains('disabled') ||
      nextButton.getAttribute('aria-disabled') === 'true') {
    console.log('❌ "Next" button is disabled - last page reached');
    return false;
  }

  console.log('✅ Next button available, navigating to next page via URL...');
  
  // Use URL-based navigation instead of clicking (more reliable)
  const currentUrl = window.location.href;
  let nextPageUrl;
  
  // Check if URL has page parameter
  if (currentUrl.includes('page=')) {
    // Extract current page number and increment it
    const pageMatch = currentUrl.match(/page=(\d+)/);
    if (pageMatch) {
      const currentPage = parseInt(pageMatch[1]);
      const nextPage = currentPage + 1;
      nextPageUrl = currentUrl.replace(/page=\d+/, `page=${nextPage}`);
      console.log(`📄 Incrementing from page ${currentPage} to page ${nextPage}`);
    }
  } else {
    // No page parameter (page 1), add page=2
    if (currentUrl.includes('?')) {
      // Has query params, add page parameter
      nextPageUrl = currentUrl.replace(/\?/, '?page=2&');
    } else {
      // No query params, add page as first param
      nextPageUrl = currentUrl + '?page=2';
    }
    console.log('📄 Adding page=2 parameter for navigation');
  }
  
  console.log('🔗 Current URL:', currentUrl);
  console.log('🔗 Next URL:', nextPageUrl);
  
  // Navigate to next page
  window.location.href = nextPageUrl;
  
  // Return true to indicate navigation started (page will reload)
  return true;
}

// ==================== EXPORT TO CSV ====================
function exportToCSV(leads) {
  if (leads.length === 0) {
    console.warn('No leads to export');
    return;
  }

  // Get all unique headers from all leads
  const allHeaders = new Set();
  leads.forEach(lead => {
    Object.keys(lead).forEach(key => allHeaders.add(key));
  });
  const headers = Array.from(allHeaders);
  
  // Build CSV content
  let csvContent = headers.join(',') + '\n';
  
  leads.forEach(lead => {
    const row = headers.map(header => {
      const value = lead[header] || '';
      // Escape quotes and wrap in quotes if contains comma, newline, or quote
      const escaped = String(value).replace(/"/g, '""');
      return escaped.match(/[,\n"]/) ? `"${escaped}"` : escaped;
    });
    csvContent += row.join(',') + '\n';
  });

  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `linkedin_sales_nav_leads_${timestamp}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  console.log(`✅ CSV exported: ${filename}`);
}

// ==================== UPDATE BUTTON STATE ====================
function updateButtonState(text, isLoading) {
  const button = document.getElementById('scraper-button');
  if (button) {
    button.textContent = text;
    button.disabled = isLoading;
    button.style.opacity = isLoading ? '0.7' : '1';
    button.style.cursor = isLoading ? 'wait' : 'pointer';
  }
}

// ==================== UTILITY: DELAY ====================
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== INITIALIZE ON LOAD ====================
init();

// Also try re-injection if page changes (single-page app navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    if (url.includes('linkedin.com/sales/search')) {
      setTimeout(init, 1000);
    }
  }
}).observe(document, { subtree: true, childList: true });

console.log('✅ Sales Nav Scraper initialized');

