# Changelog Update Rules

## Automatic Changelog Management

Every time you make code changes that are accepted by the user, you MUST update the `CHANGELOG.md` file in the project root.

### Rules for Updating the Changelog

1. **Always update the `[Unreleased]` section** at the top of the changelog
2. **Do NOT add timestamps to individual bullet points** - only version headings have timestamps
3. **Categorize changes** under the appropriate heading:
   - **Added** - for new features
   - **Changed** - for changes in existing functionality
   - **Fixed** - for bug fixes
   - **Removed** - for removed features
   - **Security** - for security fixes
   - **Deprecated** - for features to be removed in future versions

4. **Format each entry** as a bullet point with:
   - Clear, concise description of the change (NO timestamp on bullet points)
   - Context when helpful (e.g., file names, function names)
   - No technical jargon unless necessary

5. **Be specific but brief**:
   - Good: "Fixed LinkedIn profile scraper missing company data"
   - Bad: "Updated code"
   - Good: "Added retry mechanism for failed API calls"
   - Bad: "Made improvements"

6. **Group related changes** when multiple files are affected by a single logical change

### Example Entry Format

```markdown
## [Unreleased]

### Added
- Implemented automatic changelog update system with Cursor rules
- Added support for exporting data in CSV format

### Fixed
- Resolved issue with profile scraper not capturing work experience dates
```

### When NOT to Update

- Minor typo fixes in comments
- Whitespace or formatting-only changes
- Changes to documentation files (unless significant)
- Changes to test files only (unless adding new test capabilities)

### Important Notes

- **Never create a new changelog file** - always append to the existing `CHANGELOG.md`
- **Never remove existing entries** - only add new ones
- **Keep entries in chronological order** within each category (newest first)
- **Summarize multiple related changes** into a single bullet point when appropriate
- **Update the changelog BEFORE completing your response** to the user

## Changelog Structure

The changelog should follow this structure:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Description (no timestamp)

### Changed
- Description (no timestamp)

### Fixed
- Description (no timestamp)

### Removed
- Description (no timestamp)

---

## [Version Number] - MM-DD-YYYY HH:MM EST

### Added
- Description (no timestamp on individual items)

### Changed
- Description (no timestamp on individual items)

### Fixed
- Description (no timestamp on individual items)
```

**Important:** Only version headings like `## [1.4.0] - 11-20-2025 20:30 EST` get timestamps. Individual bullet points do NOT get timestamps.

This ensures consistency and makes the changelog useful for both humans and AI agents in future interactions.

