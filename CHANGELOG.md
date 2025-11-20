# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Initial LinkedIn Sales Navigator scraper Chrome extension implementation
- Automatic pagination using URL-based navigation
- Smart scrolling to load all lazy-loaded leads on each page
- Deduplication system to skip already-scraped leads across pages
- State management with localStorage for auto-resume after page reloads
- Random human-like delays between actions to avoid detection
- Multiple fallback selectors for robust data extraction
- Real-time progress tracking in button UI
- CSV export functionality with proper escaping
- Support for extracting: name, job title, company, location, time in role/company, connections, Sales Nav URLs

### Changed
- Switched from click-based pagination to URL-based navigation for reliability
- Removed deep scraping (profile clicking) to improve speed and reduce ban risk
- Simplified configuration by removing unnecessary delay options
- Updated user prompts to reflect fast scraping mode

### Fixed
- Improved Next button detection to properly continue past page 5
- Enhanced disabled state checking for pagination
- Better lead container detection for scrolling
- More flexible text matching for Next button

### Removed
- Deep scraping feature (clicking profiles to get LinkedIn URLs) due to ban risk and slow performance
- Company page visiting functionality (too slow and complex for MVP)
- Various delay configurations related to profile clicking
- Multiple unnecessary documentation files

---

## Notes

- Current version is MVP (v1.0.1) - Fast Mode
- Scraping speed: ~5-10 seconds per page
- No profile clicking = safer and faster
- LinkedIn profile URLs and company details can be enriched later via API services

