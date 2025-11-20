// LinkedIn Sales Navigator Lead Scraper
// Uses real LinkedIn Sales Nav selectors based on DOM analysis

console.log('✅ Sales Nav Scraper Extension Loaded!');

let isScrapingActive = false;
let scrapedLeads = [];
let scrapedUrls = new Set(); // Track unique leads by URL

// ==================== CONFIGURATION ====================
const CONFIG = {
  // Random delays to appear human-like
  DELAY_BETWEEN_PAGES: { min: 2500, max: 4500 },      // 2.5-4.5 seconds between pages
  SCROLL_DELAY: { min: 1200, max: 2000 },             // 1.2-2 seconds between scrolls
  
  WAIT_FOR_LOAD_TIMEOUT: 15000,                       // 15 seconds max wait
  MAX_SCROLL_ATTEMPTS: 10,                            // Max times to scroll to load leads
  STORAGE_KEY: 'linkedinScraperState'
};

// ==================== INITIALIZE ====================
function init() {
  // Check if we're on Sales Navigator search page
  if (window.location.href.includes('linkedin.com/sales/search')) {
    console.log('📍 Detected Sales Nav search page');
    
    // Check if there's an active scraping session
    checkAndResumeScraping();
    
    // Wait for page to fully load before injecting button
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectScrapeButton);
    } else {
      setTimeout(injectScrapeButton, 1500);
    }
  }
}

// ==================== CHECK AND RESUME SCRAPING ====================
function checkAndResumeScraping() {
  const state = getScrapeState();
  
  if (state && state.isActive) {
    console.log('🔄 ========================================');
    console.log('🔄 RESUMING SCRAPING SESSION');
    console.log(`📊 Progress: ${state.leads.length} leads from ${state.pagesScraped} pages`);
    console.log('🔄 ========================================\n');
    
    // Restore state
    isScrapingActive = true;
    scrapedLeads = state.leads || [];
    scrapedUrls = new Set(state.urls || []);
    
    // Update button to show scraping is active
    updateButtonState(`⏳ Resuming... ${scrapedLeads.length} leads`, true);
    
    // Wait random time for page to fully load before continuing (more human-like)
    const resumeDelay = Math.floor(Math.random() * (4000 - 2500 + 1)) + 2500; // 2.5-4s
    setTimeout(() => {
      continueScraping();
    }, resumeDelay);
  }
}

// ==================== SAVE SCRAPE STATE ====================
function saveScrapeState(isActive, leads, urls, pagesScraped) {
  const state = {
    isActive: isActive,
    leads: leads,
    urls: Array.from(urls),
    pagesScraped: pagesScraped,
    timestamp: Date.now()
  };
  
  try {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save scrape state:', error);
  }
}

// ==================== GET SCRAPE STATE ====================
function getScrapeState() {
  try {
    const stateStr = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (stateStr) {
      const state = JSON.parse(stateStr);
      
      // Check if state is not too old (expired after 1 hour)
      const isExpired = (Date.now() - state.timestamp) > 3600000;
      if (isExpired) {
        console.log('⏰ Scraping session expired');
        clearScrapeState();
        return null;
      }
      
      return state;
    }
  } catch (error) {
    console.error('Failed to get scrape state:', error);
  }
  return null;
}

// ==================== CLEAR SCRAPE STATE ====================
function clearScrapeState() {
  try {
    localStorage.removeItem(CONFIG.STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear scrape state:', error);
  }
}

// ==================== INJECT SCRAPE BUTTON ====================
function injectScrapeButton() {
  // Don't inject if already exists
  if (document.getElementById('scraper-button')) {
    console.log('Button already exists');
    return;
  }
  
  // Wait for body to be ready
  if (!document.body) {
    console.warn('⚠️ Body not ready, retrying...');
    setTimeout(injectScrapeButton, 500);
    return;
  }

  // Create button
  const button = document.createElement('button');
  button.id = 'scraper-button';
  button.className = 'scraper-button';
  button.innerHTML = '📥 Scrape Leads to CSV';
  button.onclick = handleButtonClick;
  
  // Append to body (using fixed positioning in CSS)
  document.body.appendChild(button);
  
  console.log('✅ Scrape button injected successfully');
  console.log('📍 Button should be visible at top-right corner');
}

// ==================== HANDLE BUTTON CLICK ====================
function handleButtonClick() {
  if (isScrapingActive) {
    // Allow cancellation
    const confirmed = confirm(
      '⚠️ Scraping is in progress.\n\n' +
      `Currently scraped: ${scrapedLeads.length} leads\n\n` +
      'Do you want to:\n' +
      '• Cancel and export current data? Click OK\n' +
      '• Continue scraping? Click Cancel'
    );
    
    if (confirmed) {
      console.log('🛑 User cancelled scraping');
      finishScraping();
    }
  } else {
    startScraping();
  }
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
    '• Scroll to load ALL leads on each page\n' +
    '• Scrape all visible lead data (fast mode)\n' +
    '• Handle pagination automatically\n' +
    '• Skip duplicates across pages\n' +
    '• Export to CSV when complete\n\n' +
    '⚡ Fast scraping: ~5-10s per page (no clicking profiles)\n\n' +
    '⚠️ Keep this tab open during scraping\n' +
    '⚠️ Don\'t navigate away from this page'
  );
  
  if (!confirmed) return;

  isScrapingActive = true;
  scrapedLeads = [];
  scrapedUrls = new Set();
  
  // Clear any old state
  clearScrapeState();
  
  console.log('\n🚀 ========================================');
  console.log('🚀 STARTING NEW SCRAPING SESSION');
  console.log(`🔧 Mode: FAST (no profile clicking)`);
  console.log(`🔧 Deduplication: ENABLED`);
  console.log(`🔧 Random delays: ENABLED`);
  console.log('🚀 ========================================\n');
  
  updateButtonState('⏳ Initializing... 0 leads', true);
  
  await continueScraping();
}

// ==================== CONTINUE SCRAPING ====================
async function continueScraping() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const currentPage = parseInt(urlParams.get('page')) || 1;
    
    console.log(`\n📄 ========================================`);
    console.log(`📄 === SCRAPING PAGE ${currentPage} ===`);
    console.log(`📄 ========================================\n`);
    
    // Wait for leads to load (with random delay)
    await waitForLeadsToLoad();
    
    // Scroll to load ALL leads (with random delays between scrolls)
    await scrollToLoadAllLeads();
    
    // Random delay to ensure DOM is stable (human-like pause before scraping)
    await randomDelay({ min: 800, max: 1500 });
    
    // Scrape current page (this now includes deep scraping if enabled)
    const leadsOnPage = await scrapeCurrentPage();
    
    const newLeadsCount = scrapedLeads.length;
    console.log(`\n✅ Page ${currentPage} complete!`);
    console.log(`   📊 Total unique leads: ${scrapedLeads.length}`);
    console.log(`   📄 Pages scraped: ${currentPage}\n`);
    
    updateButtonState(
      `⏳ Scraping... ${scrapedLeads.length} leads (Page ${currentPage})`, 
      true
    );
    
    // Check if there's a next page
    const hasNextPage = await checkNextPage();
    
    if (hasNextPage) {
      // Save state before navigating
      saveScrapeState(true, scrapedLeads, scrapedUrls, currentPage);
      
      // Random delay between pages (appears more human)
      const pageDelay = CONFIG.DELAY_BETWEEN_PAGES;
      console.log(`⏭️  Waiting before next page...`);
      await randomDelay(pageDelay);
      
      console.log(`🔗 Navigating to page ${currentPage + 1}...\n`);
      
      // Navigate to next page
      await goToNextPage();
      // Page will reload and resume automatically
    } else {
      // Scraping complete
      console.log('✅ No more pages to scrape');
      finishScraping();
    }
    
  } catch (error) {
    console.error('❌ Scraping error:', error);
    alert('❌ Error during scraping:\n' + error.message + '\n\nCheck console for details.');
    finishScraping();
  }
}

// ==================== FINISH SCRAPING ====================
function finishScraping() {
  clearScrapeState();
  isScrapingActive = false;
  
  if (scrapedLeads.length > 0) {
    exportToCSV(scrapedLeads);
    alert(`✅ Successfully scraped ${scrapedLeads.length} unique leads!\n\nCSV file downloaded.`);
  } else {
    alert('⚠️ No leads found. LinkedIn may have changed their structure.');
  }
  
  updateButtonState('📥 Scrape Leads to CSV', false);
}

// ==================== CHECK NEXT PAGE ====================
function checkNextPage() {
  return new Promise((resolve) => {
    // Check if Next button exists and is enabled
    const nextButton = document.querySelector('button[aria-label="Next"]') ||
                       document.querySelector('button.artdeco-pagination__button--next') ||
                       Array.from(document.querySelectorAll('button')).find(btn => {
                         const text = btn.textContent.toLowerCase().trim();
                         return text === 'next' || text.includes('next');
                       });

    if (!nextButton) {
      console.log('❌ No "Next" button found - reached last page');
      resolve(false);
      return;
    }

    // Check if button is disabled (last page)
    const isDisabled = nextButton.disabled || 
                      nextButton.classList.contains('disabled') ||
                      nextButton.getAttribute('aria-disabled') === 'true' ||
                      nextButton.hasAttribute('disabled');

    if (isDisabled) {
      console.log('❌ "Next" button is disabled - reached last page');
      resolve(false);
      return;
    }

    console.log('✅ Next button available and enabled');
    resolve(true);
  });
}

// ==================== FIND LEADS CONTAINER ====================
function findLeadsContainer() {
  // Look for common Sales Navigator container classes
  // The leads are usually in a scrollable div with overflow
  const containers = Array.from(document.querySelectorAll('div[class*="scaffold"]'));
  
  for (const container of containers) {
    const style = window.getComputedStyle(container);
    if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
      // Check if it contains lead items
      if (container.querySelector('[data-anonymize="person-name"]') || 
          container.querySelector('[class*="artdeco-list"]') ||
          container.querySelector('li.artdeco-list__item')) {
        return container;
      }
    }
  }
  
  // Fallback: find any scrollable div that's tall enough
  const scrollableDivs = Array.from(document.querySelectorAll('div'));
  return scrollableDivs.find(div => {
    const style = window.getComputedStyle(div);
    return (style.overflowY === 'auto' || style.overflowY === 'scroll') && 
           div.scrollHeight > div.clientHeight + 100;
  });
}

// ==================== SCROLL TO LOAD ALL LEADS ====================
async function scrollToLoadAllLeads() {
  const container = findLeadsContainer();
  
  if (!container) {
    console.log('📜 No scrollable container found, trying window scroll...');
    // Fallback: try scrolling the window
    const initialCount = document.querySelectorAll('[data-anonymize="person-name"]').length;
    window.scrollTo(0, document.body.scrollHeight);
    await randomDelay(CONFIG.SCROLL_DELAY);
    const afterCount = document.querySelectorAll('[data-anonymize="person-name"]').length;
    
    if (afterCount > initialCount) {
      console.log(`✅ Window scroll loaded ${afterCount - initialCount} more leads`);
    }
    window.scrollTo(0, 0);
    return;
  }
  
  console.log('📜 Found scrollable leads container, loading all leads...');
  
  let previousLeadCount = 0;
  let currentLeadCount = 0;
  let scrollAttempts = 0;
  let noChangeCount = 0;
  
  // Keep scrolling until no new leads appear
  while (scrollAttempts < CONFIG.MAX_SCROLL_ATTEMPTS) {
    // Count current leads
    const leadElements = container.querySelectorAll('[data-anonymize="person-name"]');
    currentLeadCount = leadElements.length;
    
    console.log(`📜 Scroll ${scrollAttempts + 1}/${CONFIG.MAX_SCROLL_ATTEMPTS}: ${currentLeadCount} leads visible`);
    
    // Check if we got new leads
    if (currentLeadCount === previousLeadCount) {
      noChangeCount++;
      // If no change for 2 consecutive scrolls, we're done
      if (noChangeCount >= 2) {
        console.log(`✅ All leads loaded! Total: ${currentLeadCount} leads`);
        break;
      }
    } else {
      noChangeCount = 0; // Reset counter when we see changes
      console.log(`   ↗️ Loaded ${currentLeadCount - previousLeadCount} more leads`);
    }
    
    previousLeadCount = currentLeadCount;
    
    // Scroll to bottom gradually (more natural, human-like)
    const scrollStep = container.scrollHeight / 3;
    container.scrollTop += scrollStep;
    await randomDelay({ min: 200, max: 400 }); // Small random delay mid-scroll
    container.scrollTop = container.scrollHeight;
    
    // Wait for lazy loading with random delay
    await randomDelay(CONFIG.SCROLL_DELAY);
    
    scrollAttempts++;
  }
  
  if (scrollAttempts >= CONFIG.MAX_SCROLL_ATTEMPTS) {
    console.log('⚠️ Max scroll attempts reached');
  }
  
  // Scroll back to top for consistent scraping
  container.scrollTop = 0;
  await randomDelay({ min: 400, max: 700 });
  
  console.log(`📊 Ready to scrape ${currentLeadCount} leads from this page`);
}

// ==================== CONVERT SALES NAV URL TO LINKEDIN URL ====================
// Attempt to extract LinkedIn profile ID from Sales Nav URL and construct LinkedIn URL
// This is not 100% reliable but works for many cases
function tryConvertSalesNavToLinkedInURL(salesNavURL) {
  if (!salesNavURL) return '';
  
  try {
    // Sales Nav URL format: /sales/lead/ACwAAAgkwt4BlnVeqPMXW3YqZ7veNwwua--u7WM,NAME_SEARCH,PClu
    // Try to extract the encoded ID
    const match = salesNavURL.match(/\/sales\/lead\/([^,\?]+)/);
    if (match && match[1]) {
      // The ID in Sales Nav can sometimes map to LinkedIn, but it's encoded
      // For now, we return empty since we can't reliably convert without API
      // LinkedIn would need to be clicked or enriched via API
      return '';
    }
  } catch (error) {
    console.error('Error converting URL:', error);
  }
  
  return '';
}

// ==================== SCRAPE CURRENT PAGE ====================
async function scrapeCurrentPage() {
  const newLeadsCount = scrapedLeads.length;
  
  // More precise selector - only get direct list items from results
  const leadCards = document.querySelectorAll(
    'li.artdeco-list__item:has([data-anonymize="person-name"])'
  );
  
  // Fallback if :has selector doesn't work
  let validCards = Array.from(leadCards);
  if (validCards.length === 0) {
    const allItems = document.querySelectorAll('li.artdeco-list__item');
    validCards = Array.from(allItems).filter(card => 
      card.querySelector('[data-anonymize="person-name"]')
    );
  }

  console.log(`🔍 Found ${validCards.length} lead cards on page`);

  // Process each lead (no async needed now - fast extraction)
  for (let index = 0; index < validCards.length; index++) {
    const card = validCards[index];
    
    try {
      // Extract basic data from card (fast, no clicking)
      const lead = extractLeadData(card, index);
      
      // Check if we have a valid lead with at least a name
      if (lead && (lead['Full Name'] || lead['First Name'])) {
        // Check for duplicates using Sales Navigator URL
        const leadUrl = lead['Sales Navigator URL'];
        
        if (leadUrl && scrapedUrls.has(leadUrl)) {
          console.log(`  ⊘ Duplicate skipped: ${lead['Full Name']}`);
          continue;
        }
        
        // Try to convert Sales Nav URL to LinkedIn URL (best effort, no API)
        // This is left empty for now - would need LinkedIn API or enrichment service
        // User can enrich later with BetterContact or similar
        
        // Add lead to results
        if (leadUrl) {
          scrapedUrls.add(leadUrl);
        }
        scrapedLeads.push(lead);
        console.log(`  ✓ Lead ${scrapedLeads.length}: ${lead['Full Name']}`);
        
      }
    } catch (error) {
      console.error(`  ✗ Error extracting lead ${index + 1}:`, error.message);
    }
  }

  const addedCount = scrapedLeads.length - newLeadsCount;
  console.log(`📊 Added ${addedCount} new unique leads (${validCards.length - addedCount} duplicates skipped)`);
  
  return scrapedLeads;
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
async function waitForLeadsToLoad() {
  console.log('⏳ Waiting for leads to load...');
  
  // First, wait random time for page to settle (human-like)
  await randomDelay({ min: 1800, max: 2500 });
  
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let lastLeadCount = 0;
    let stableCount = 0;
    
    const checkLoaded = () => {
      // Check if leads are present
      const leads = document.querySelectorAll('[data-anonymize="person-name"]');
      const leadCount = leads.length;
      
      if (leadCount > 0) {
        // Check if lead count is stable (not still loading)
        if (leadCount === lastLeadCount) {
          stableCount++;
          // If count is stable for 3 checks (1.5 seconds), consider loaded
          if (stableCount >= 3) {
            console.log(`✅ Page loaded with ${leadCount} leads visible initially`);
            resolve();
            return;
          }
        } else {
          stableCount = 0; // Reset if count changed
          console.log(`   ⏳ Loading... ${leadCount} leads visible so far`);
        }
        lastLeadCount = leadCount;
      }
      
      // Check timeout
      if (Date.now() - startTime > CONFIG.WAIT_FOR_LOAD_TIMEOUT) {
        if (leadCount > 0) {
          console.log(`⚠️ Timeout reached with ${leadCount} leads visible, proceeding`);
          resolve();
        } else {
          reject(new Error('Timeout: No leads found on page'));
        }
        return;
      }
      
      // Keep checking every 500ms
      setTimeout(checkLoaded, 500);
    };
    
    checkLoaded();
  });
}

// ==================== GO TO NEXT PAGE ====================
async function goToNextPage() {
  // Use URL-based navigation (more reliable than clicking)
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
    const separator = currentUrl.includes('?') ? '&' : '?';
    nextPageUrl = currentUrl + separator + 'page=2';
    console.log('📄 Adding page=2 parameter for navigation');
  }
  
  console.log('🔗 Navigating to:', nextPageUrl);
  
  // Navigate to next page (page will reload and auto-resume scraping)
  window.location.href = nextPageUrl;
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

// ==================== UTILITY: RANDOM DELAY (HUMAN-LIKE) ====================
function randomDelay(config) {
  // If config is a number, use it directly (backward compatibility)
  if (typeof config === 'number') {
    return new Promise(resolve => setTimeout(resolve, config));
  }
  
  // If config is an object with min/max, randomize
  const { min, max } = config;
  const randomMs = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log(`   ⏱️  Waiting ${(randomMs/1000).toFixed(2)}s (human-like delay)`);
  return new Promise(resolve => setTimeout(resolve, randomMs));
}

// Alias for backward compatibility
function delay(ms) {
  return randomDelay(ms);
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

