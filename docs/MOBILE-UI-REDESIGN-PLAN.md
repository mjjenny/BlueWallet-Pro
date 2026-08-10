BlueWallet Pro — Mobile UI Redesign Plan (Prototype)
Branch: feature/mobile-ui-redesign-prototype
Status: Planning Only — Do Not Merge to Stable
Author: Qwen (Worker)
Date: 2026-08-10
Manager: Codex
Product Owner: Jenny  
Executive Summary
This document outlines a mobile-first UI/UX redesign prototype for BlueWallet Pro, inspired by Grok's redesign proposals. The prototype will explore modern mobile navigation patterns, improved information hierarchy, and streamlined user flows without modifying the locked stable app.
Critical Rule: The stable app (legacy-root-pwa.html on branch development/stable-app-copy) must remain untouched. All redesign work occurs on a separate feature branch and requires explicit approval from Jenny before any merge consideration.
1. Grok Redesign Summary
1.1 Key UI/UX Ideas from Transcript
Based on the provided screen list and design patterns, Grok's redesign emphasizes:
Principle
Description
Mobile-First Navigation
Bottom navigation bar replacing or supplementing top-bar + category rail for thumb-friendly access
Status-First Cards
Document cards lead with expiry status badges (Expired/Expiring/Valid) using color and size hierarchy
Larger Badges
Status indicators are more prominent, readable at glance, especially on small screens
Cleaner Hierarchy
Reduced visual clutter, clearer separation between sections, progressive disclosure of advanced options
Lighter Settings
Settings reorganized into digestible sections with preview capabilities
Progressive Disclosure
Advanced features hidden until needed; primary actions always visible
1.2 Proposed Screens
Grok's redesign includes the following screens:
Screen
Purpose
Priority
Home / Document Vault
Main dashboard showing all documents filtered by category
P0
Document Detail
View/edit single document with attachments, OCR, metadata
P0
Vaccination Log
Timeline view of vaccines with reminders
P1
Settings
App configuration, themes, backup, sync, PIN
P0
Timeline
Chronological view of sea time, certificates, events
P1
Packs
Grouped document collections (e.g., STCW pack)
P1
Add Document
Flow to create new document with scan/OCR
P0
Sea Time
Log sea service entries
P2
STCW Checklist
Compliance matrix by rank/certificate
P2
Share Pack / Share Document
Export/share workflow
P1
Lite Mode
Simplified interface for quick access
P1
1.3 Recurring Design Patterns
Pattern
Implementation Notes
Bottom Navigation
4-5 primary tabs max; icons + labels; active state clear
Status-First Cards
Color-coded badges (red/orange/green/blue) dominate card visual
Larger Badges
Minimum 44x44px touch targets; high contrast
Cleaner Hierarchy
Increased whitespace, larger type for primary info
Mobile-First Actions
Primary action buttons fixed at bottom; secondary actions in overflow menu
Lighter Settings
Grouped settings with search; theme preview inline
Progressive Disclosure
"Show More" expansions; settings behind confirmations
2. Fit Against Current Stable App
2.1 Comparison Matrix
Grok Idea
Current Stable Implementation
Classification
Notes
Bottom Navigation
Top bar + horizontal category rail
🟡 Needs Prototype
Conflicts with locked top-bar layout; test mobile-only
Status-First Cards
Cards show title/category; status via small badge
🟢 Safe to Adopt
Enhancement only; no structural change
Larger Badges
Small status indicators
🟢 Safe to Adopt
Visual polish; no data impact
Cleaner Hierarchy
Dense information layout
🟡 Needs Prototype
May affect desktop parity
Mobile-First Actions
Floating Action Button (FAB)
🟢 Safe to Adopt
FAB already exists; repositioning OK
Lighter Settings
Comprehensive modal with all settings
🟡 Needs Prototype
Risk of hiding critical features
Progressive Disclosure
Most features visible by default
🟡 Needs Prototype
Must ensure discoverability
Timeline View
Basic timeline exists
🟢 Safe to Adopt
Feature addition
Packs Management
Exists in current app
🟢 Safe to Adopt
UX improvement only
Lite Mode Toggle
Exists in Settings
🟢 Safe to Adopt
Could be more prominent
2.2 Desktop vs Mobile Considerations
Concern
Current Behavior
Redesign Impact
Navigation
Top bar works on all viewports
Bottom nav may feel unnatural on desktop
Category Rail
Horizontal scroll disabled; all tabs visible
Bottom nav replaces this on mobile only
Document Cards
Grid/list toggle
Status-first cards work in both modes
Settings Modal
Full-screen overlay on mobile
Could become side panel on desktop
Add Document Flow
Modal bottom sheet
Could become full-screen on mobile
Recommendation: Bottom navigation should be mobile-only (viewport < 768px). Desktop retains top bar + category rail.

3. Prototype Strategy

3.1 Branch Structure

```bash
# Create new feature branch from stable copy
git checkout development/stable-app-copy
git checkout -b feature/mobile-ui-redesign-prototype
```

3.2 File Organization

```text
/workspace
├── legacy-root-pwa.html          # UNTOUCHED (stable)
├── index.html                    # UNTOUCHED
├── manifest.json                 # UNTOUCHED
├── service-worker.js             # UNTOUCHED
├── styles.css                    # May add mobile-specific overrides
├── app.js                        # May add mobile-specific handlers
└── prototypes/
    └── mobile-ui/
        ├── mobile-nav.html       # Bottom nav component (if separate)
        ├── mobile-styles.css     # Mobile-specific overrides
        └── mobile-handlers.js    # Mobile-specific interactions
```

Alternative Approach: Embed mobile-specific CSS/JS within existing files using media queries and viewport detection, keeping all code in legacy-root-pwa.html.

3.3 Data Model Preservation

Component
Must Remain Unchanged
IndexedDB Schema
Document structure, field names, relationships
Backup Format
JSON export/import structure
Sync Tables
Supabase encrypted vault schema
OCR Pipeline
Tesseract.js integration, image preprocessing
Print Output
PDF generation, print styles
Service Worker
Cache versioning, offline fallback

3.4 When Schema Changes Are Required

If the prototype reveals a need for data model changes:
Document the proposed change
Justify why it's necessary
Submit separate proposal to Codex/Jenny
Do NOT implement until approved

4. Screen-by-Screen Plan

4.1 Home / Document Vault

Aspect
Details
Purpose
Display all documents, filterable by category and status
Current Problem
Category rail takes vertical space; status badges small
Proposed Improvement
Bottom nav for categories; large status badges on cards
Exact UI Behavior
Tap category in bottom nav → filter documents; swipe left/right between categories
Mobile Layout
Bottom nav fixed; cards stack vertically; FAB for add
Desktop Impact
None — desktop uses existing top bar + rail
Data Dependencies
Document list from IndexedDB documents store
Risk Level
Low (visual only)
Acceptance Criteria
All documents visible; category filter works; no horizontal scroll; status readable at glance

4.2 Document Detail

Aspect
Details
Purpose
View/edit document metadata, attachments, OCR results
Current Problem
Information density high on small screens; actions scattered
Proposed Improvement
70% viewer / 30% details split (already approved); actions grouped at bottom
Exact UI Behavior
Tap document → full-screen modal; swipe down to close; tap attachment to zoom
Mobile Layout
Full-screen modal; viewer top; details bottom; action bar fixed
Desktop Impact
Retain 70/30 split; action bar becomes right sidebar
Data Dependencies
Single document from IndexedDB; attachments from attachments store
Risk Level
Low (layout refinement)
Acceptance Criteria
Attachment preview works; edit saves correctly; OCR button accessible; print/download available

4.3 Settings

Aspect
Details
Purpose
Configure app behavior, themes, backup, security
Current Problem
Long modal with many options; overwhelming on mobile
Proposed Improvement
Grouped sections (Appearance, Security, Data, About); search within settings
Exact UI Behavior
Tap setting category → expand section; tap theme → preview inline
Mobile Layout
Scrollable list with sections; back button to return to main view
Desktop Impact
Retain current modal; optional side navigation
Data Dependencies
Settings from IndexedDB settings store
Risk Level
Medium (may hide important features)
Acceptance Criteria
All current settings accessible; theme preview works; backup/export functional; PIN flow intact

4.4 Add Document

Aspect
Details
Purpose
Create new document with optional scan/OCR
Current Problem
Many steps; camera/file picker can confuse on iOS
Proposed Improvement
Linear flow: Category → Details → Scan (optional) → Save
Exact UI Behavior
Step wizard with progress indicator; camera permission handled gracefully
Mobile Layout
Full-screen wizard; next/back buttons fixed at bottom
Desktop Impact
Retain current modal flow
Data Dependencies
New document write to IndexedDB; optional OCR via Tesseract.js
Risk Level
Medium (data entry flow)
Acceptance Criteria
Document saves correctly; camera works on supported devices; cancel does not lose data; OCR optional

4.5 Vaccination Log

Aspect
Details
Purpose
Track vaccine history with reminders
Current Problem
List view lacks timeline context
Proposed Improvement
Timeline visualization; colour-coded by vaccine type
Exact UI Behavior
Tap vaccine → detail modal; tap "+" to add; reminders auto-calculated
Mobile Layout
Vertical timeline; cards for each entry
Desktop Impact
Optional horizontal timeline
Data Dependencies
Vaccines from IndexedDB vaccines store
Risk Level
Low
Acceptance Criteria
Add/edit/delete works; reminders accurate; export available

4.6 Timeline

Aspect
Details
Purpose
Chronological view of sea time, certificates, events
Current Problem
Separate views for sea time and certificates
Proposed Improvement
Unified timeline with filters
Exact UI Behavior
Filter by event type; tap event → detail
Mobile Layout
Vertical timeline; infinite scroll
Desktop Impact
Optional horizontal timeline
Data Dependencies
Sea time, certificates, vaccines from respective stores
Risk Level
Low
Acceptance Criteria
All event types shown; filters work; chronological order correct

4.7 Packs

Aspect
Details
Purpose
Group related documents (e.g., STCW pack for job application)
Current Problem
Pack creation not intuitive
Proposed Improvement
Pre-built pack templates; one-tap document inclusion
Exact UI Behavior
Select pack template -> check documents -> save
Mobile Layout
Card-based pack selector; checklist for documents
Desktop Impact
Retain current pack management
Data Dependencies
Packs from IndexedDB packs store; document references
Risk Level
Low
Acceptance Criteria
Create/edit/delete packs; share pack exports correctly

4.8 Sea Time

Aspect
Details
Purpose
Log sea service for certification requirements
Current Problem
Date calculation unclear
Proposed Improvement
Inclusive day count clearly displayed; vessel autocomplete
Exact UI Behavior
Enter dates -> auto-calculate days; select vessel from history
Mobile Layout
Form with date pickers; summary card
Desktop Impact
None
Data Dependencies
Sea time from IndexedDB seaTime store
Risk Level
Low
Acceptance Criteria
Day count accurate; save/edit/delete works

4.9 STCW Checklist

Aspect
Details
Purpose
Verify certificate compliance by rank
Current Problem
Matrix view complex on mobile
Proposed Improvement
Checklist format with progress indicator
Exact UI Behavior
Select rank -> see required certificates; tap to verify
Mobile Layout
Accordion checklist; progress bar at top
Desktop Impact
Retain matrix view
Data Dependencies
Certificates from IndexedDB; rank from profile
Risk Level
Low
Acceptance Criteria
Checklist accurate; progress updates; export available

4.10 Share Pack / Share Document

Aspect
Details
Purpose
Export documents or packs for sharing
Current Problem
Share options not prominent
Proposed Improvement
One-tap share using Web Share API; fallback to download
Exact UI Behavior
Tap share -> system share sheet or download
Mobile Layout
Share button in action bar
Desktop Impact
Retain current share behavior
Data Dependencies
Document/pack data for export
Risk Level
Low
Acceptance Criteria
Web Share works where supported; download fallback works

4.11 Lite Mode

Aspect
Details
Purpose
Simplified interface for quick document access
Current Problem
Lite mode toggle buried in Settings
Proposed Improvement
Prominent toggle on Home screen or bottom nav
Exact UI Behavior
Toggle -> hide advanced features; show only essential documents
Mobile Layout
Toggle in bottom nav or floating button
Desktop Impact
Retain current Lite mode behavior
Data Dependencies
None (view mode only)
Risk Level
Low
Acceptance Criteria
Lite mode hides correct features; toggle accessible

5. Recommended First Implementation Batch

5.1 Phase 1: Foundation (Week 1)

Implement these items first as they provide the highest visual impact with lowest risk:

Item
Rationale
Mobile Bottom Navigation
Core navigation pattern; enables all other mobile improvements
Status-First Document Cards
Immediate visual clarity; no data changes required
Cleaner Document Detail Actions
Improves daily workflow; low risk
Settings Theme Preview Polish
Shows design intent; non-functional risk

Why This Batch First:
These changes are visual only - no data model modifications
They demonstrate the mobile-first design language
Easy to revert if Jenny disapproves
Can be tested independently of complex features
Provide immediate value for mobile users

5.2 Phase 2: Flows (Week 2)

Item
Depends On
Add Document Flow Improvement
Phase 1 navigation
Vaccination Log Timeline
Phase 1 card design
Packs Management UX
Phase 1 navigation

5.3 Phase 3: Advanced Features (Week 3)

Item
Depends On
Unified Timeline
Phase 2
STCW Checklist
Phase 2
Sea Time Enhancements
Phase 2
Share Flow Improvements
Phase 2

5.4 Phase 4: Polish & Testing (Week 4)

Item
Cross-browser testing
Accessibility audit
Performance optimization
Documentation

6. Non-Goals

The following are explicitly out of scope for this prototype without additional approval:

Non-Goal
Reason
Deletion/Migration of Documents
User data must never be at risk
Stable Deployment
Prototype remains on feature branch only
Backup Format Change
Would break compatibility with existing backups
Sync Table Change
Would require Supabase migration plan
Theme Identity Replacement
Brand identity is locked; only refinements allowed
Removal of Desktop Layout
Desktop users rely on current layout; changes require separate approval
Service Worker Modifications
Could break offline functionality and update mechanism
IndexedDB Schema Changes
Would require migration scripts and extensive testing

7. Testing Plan

All prototype changes must pass the following validation before being presented for approval:

7.1 Viewport Testing

Test
Expected Result
Desktop Viewport (>=1024px)
Existing layout unchanged; bottom nav hidden
Tablet Viewport (768-1023px)
Hybrid behavior defined; no broken layouts
Mobile Viewport (<768px)
Bottom nav visible; no horizontal scrolling
Small Mobile (<375px)
Content still readable; touch targets maintain 44px minimum

7.2 Interaction Testing

Test
Expected Result
Touch Targets
All interactive elements >=44x44px
Document Cards
Status badge visible at glance; tap opens detail
Add/Edit Document
Flow completes successfully; data persists
Category Filter
Bottom nav tabs filter correctly
Settings Navigation
All settings accessible; changes persist

7.3 Data Integrity Testing

Test
Expected Result
Backup Export
JSON file downloads correctly
Backup Import
Previous backups restore without error
Encrypted Sync
Supabase sync unaffected; no duplicate records
OCR Functionality
Tesseract.js processes images correctly
Print Output
Print styles render correctly; PDF generation works

7.4 System Testing

Test
Expected Result
Update Button
Service worker version check still functional
Service Worker Versioning
Cache invalidation works; no stale assets
Offline Mode
App functions without network; changes sync when online
PIN Protection
Lock/unlock flow unchanged
Web Share API
Share works on supported devices; download fallback works

7.5 Regression Testing

Test
Expected Result
Existing Documents
All previously saved documents visible and editable
Existing Vaccines
Vaccine history intact
Existing Sea Time
Sea service records unchanged
Existing Packs
Pack configurations preserved

8. Risks and Mitigation

Risk
Likelihood
Impact
Mitigation
Bottom Nav Conflicts with Desktop
Medium
Medium
Restrict to mobile viewport only (<768px)
Settings Reorganization Hides Features
Medium
High
Ensure all settings remain accessible; add search
Add Document Flow Breaks Data Entry
Low
High
Extensive testing with real data before approval
Performance Degradation on Old Devices
Low
Medium
Test on low-end Android devices; optimize CSS
Accessibility Regression
Medium
High
Run automated a11y checks; manual keyboard testing
Scope Creep
High
Medium
Strict adherence to phased approach; defer nice-to-haves

9. Manager Decision Points

Before any implementation begins, Codex and Jenny must approve the following:

9.1 Scope Approval

Which screens to prototype first?
Recommended: Home, Document Detail, Settings, Add Document
Alternative: Start with Settings only as safest option

Should bottom navigation be mobile-only?
Recommended: Yes, viewport < 768px only
Alternative: Test on tablet viewports as well

Should desktop remain completely unchanged?
Recommended: Yes, zero modifications to desktop experience
Alternative: Allow subtle responsive improvements

9.2 Design Direction

Which Grok mockups are closest to desired look?
Need Jenny to identify preferred reference screenshots
Required before CSS implementation begins

Should this become a preview mode or separate branch only?
Recommended: Separate branch (feature/mobile-ui-redesign-prototype)
Alternative: Build as toggleable preview mode within stable app

What must be shown in screenshots before approval?
Home screen with bottom nav
Document detail with new action layout
Settings with grouped sections
Add Document flow (all steps)
At least one viewport comparison (mobile vs desktop)

9.3 Deployment Strategy

Where should the prototype be deployed for review?
Option A: Separate Vercel/Netlify preview URL
Option B: Local testing only; screenshots shared via chat
Option C: Password-protected staging environment

Who should test the prototype before Jenny reviews?
Recommended: Codex performs initial technical validation
Then: Jenny performs product/design review
Optionally: Third-party tester for unbiased feedback

9.4 Success Criteria

What defines "approval to proceed" after Phase 1?
Visual design matches Jenny's expectations
No data integrity issues detected
No performance regression
No accessibility violations

What happens if Phase 1 is rejected?
Branch archived; learnings documented
Stable app remains untouched (as required)
Alternative approaches explored based on feedback

Appendix A: Glossary

Term
Definition
Stable App
The production-ready version at legacy-root-pwa.html
Prototype Branch
Feature branch for experimental changes
Bottom Navigation
Mobile navigation pattern with tabs at screen bottom
Status-First Cards
Document cards emphasizing expiry status visually
Progressive Disclosure
UI pattern showing advanced options only when needed
Viewport
The visible area of the app on a device
Touch Target
The clickable/tappable area of a UI element

Appendix B: Reference Files

File
Purpose
docs/CURRENT-STATUS-HANDOVER-2026-08-09.md
Project handover documentation
docs/STABLE-APP-LOCK.md
Rules for protecting stable app
docs/THIRD-PARTY-TESTING-HANDOVER.md
Testing protocols
C:\Users\Jenny\Downloads\THE_BLUE_Full_Conversation_Transcript.zip
Grok redesign source material
https://bluewallet-pro-stable.cl76380.chatgpt.site/legacy-root-pwa.html
Live stable deployment

END OF DOCUMENT
