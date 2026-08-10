# BlueWallet Pro — Mobile UI Redesign Plan (Prototype)

**Branch:** `feature/mobile-ui-redesign-prototype`  
**Status:** Planning Only — Do Not Merge to Stable  
**Author:** Qwen (Worker)  
**Date:** 2026-08-10  
**Manager:** Codex  
**Product Owner:** Jenny  

---

## Executive Summary

This document outlines a **mobile-first UI/UX redesign prototype** for BlueWallet Pro, inspired by Grok's redesign proposals. The prototype will explore modern mobile navigation patterns, improved information hierarchy, and streamlined user flows **without modifying the locked stable app**.

**Critical Rule:** The stable app (`legacy-root-pwa.html` on branch `development/stable-app-copy`) must remain untouched. All redesign work occurs on a separate feature branch and requires explicit approval from Jenny before any merge consideration.

---

## 1. Grok Redesign Summary

### 1.1 Key UI/UX Ideas from Transcript

Based on the provided screen list and design patterns, Grok's redesign emphasizes:

| Principle | Description |
|-----------|-------------|
| **Mobile-First Navigation** | Bottom navigation bar replacing or supplementing top-bar + category rail for thumb-friendly access |
| **Status-First Cards** | Document cards lead with expiry status badges (Expired/Expiring/Valid) using color and size hierarchy |
| **Larger Badges** | Status indicators are more prominent, readable at glance, especially on small screens |
| **Cleaner Hierarchy** | Reduced visual clutter, clearer separation between sections, progressive disclosure of advanced options |
| **Lighter Settings** | Settings reorganized into digestible sections with preview capabilities |
| **Progressive Disclosure** | Advanced features hidden until needed; primary actions always visible |

### 1.2 Proposed Screens

Grok's redesign includes the following screens:

| Screen | Purpose | Priority |
|--------|---------|----------|
| **Home / Document Vault** | Main dashboard showing all documents filtered by category | P0 |
| **Document Detail** | View/edit single document with attachments, OCR, metadata | P0 |
| **Vaccination Log** | Timeline view of vaccines with reminders | P1 |
| **Settings** | App configuration, themes, backup, sync, PIN | P0 |
| **Timeline** | Chronological view of sea time, certificates, events | P1 |
| **Packs** | Grouped document collections (e.g., STCW pack) | P1 |
| **Add Document** | Flow to create new document with scan/OCR | P0 |
| **Sea Time** | Log sea service entries | P2 |
| **STCW Checklist** | Compliance matrix by rank/certificate | P2 |
| **Share Pack / Share Document** | Export/share workflow | P1 |
| **Lite Mode** | Simplified interface for quick access | P1 |

### 1.3 Recurring Design Patterns

| Pattern | Implementation Notes |
|---------|---------------------|
| **Bottom Navigation** | 4-5 primary tabs max; icons + labels; active state clear |
| **Status-First Cards** | Color-coded badges (red/orange/green/blue) dominate card visual |
| **Larger Badges** | Minimum 44x44px touch targets; high contrast |
| **Cleaner Hierarchy** | Increased whitespace, larger type for primary info |
| **Mobile-First Actions** | Primary action buttons fixed at bottom; secondary actions in overflow menu |
| **Lighter Settings** | Grouped settings with search; theme preview inline |
| **Progressive Disclosure** | "Show More" expansions; settings behind confirmations |

---

## 2. Fit Against Current Stable App

### 2.1 Comparison Matrix

| Grok Idea | Current Stable Implementation | Classification | Notes |
|-----------|------------------------------|----------------|-------|
| **Bottom Navigation** | Top bar + horizontal category rail | 🟡 Needs Prototype | Conflicts with locked top-bar layout; test mobile-only |
| **Status-First Cards** | Cards show title/category; status via small badge | 🟢 Safe to Adopt | Enhancement only; no structural change |
| **Larger Badges** | Small status indicators | 🟢 Safe to Adopt | Visual polish; no data impact |
| **Cleaner Hierarchy** | Dense information layout | 🟡 Needs Prototype | May affect desktop parity |
| **Mobile-First Actions** | Floating Action Button (FAB) | 🟢 Safe to Adopt | FAB already exists; repositioning OK |
| **Lighter Settings** | Comprehensive modal with all settings | 🟡 Needs Prototype | Risk of hiding critical features |
| **Progressive Disclosure** | Most features visible by default | 🟡 Needs Prototype | Must ensure discoverability |
| **Timeline View** | Basic timeline exists | 🟢 Safe to Adopt | Feature addition |
| **Packs Management** | Exists in current app | 🟢 Safe to Adopt | UX improvement only |
| **Lite Mode Toggle** | Exists in Settings | 🟢 Safe to Adopt | Could be more prominent |

### 2.2 Desktop vs Mobile Considerations

| Concern | Current Behavior | Redesign Impact |
|---------|------------------|-----------------|
| **Navigation** | Top bar works on all viewports | Bottom nav may feel unnatural on desktop |
| **Category Rail** | Horizontal scroll disabled; all tabs visible | Bottom nav replaces this on mobile only |
| **Document Cards** | Grid/list toggle | Status-first cards work in both modes |
| **Settings Modal** | Full-screen overlay on mobile | Could become side panel on desktop |
| **Add Document Flow** | Modal bottom sheet | Could become full-screen on mobile |

**Recommendation:** Bottom navigation should be **mobile-only** (viewport < 768px). Desktop retains top bar + category rail.

---

## 3. Prototype Strategy

### 3.1 Branch Structure

```bash
# Create new feature branch from stable copy
git checkout development/stable-app-copy
git checkout -b feature/mobile-ui-redesign-prototype
```

### 3.2 File Organization

```
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

**Alternative Approach:** Embed mobile-specific CSS/JS within existing files using media queries and viewport detection, keeping all code in `legacy-root-pwa.html`.

### 3.3 Data Model Preservation

| Component | Must Remain Unchanged |
|-----------|----------------------|
| **IndexedDB Schema** | Document structure, field names, relationships |
| **Backup Format** | JSON export/import structure |
| **Sync Tables** | Supabase encrypted vault schema |
| **OCR Pipeline** | Tesseract.js integration, image preprocessing |
| **Print Output** | PDF generation, print styles |
| **Service Worker** | Cache versioning, offline fallback |

### 3.4 When Schema Changes Are Required

If the prototype reveals a need for data model changes:
1. Document the proposed change
2. Justify why it's necessary
3. Submit separate proposal to Codex/Jenny
4. Do NOT implement until approved

---

## 4. Screen-by-Screen Plan

### 4.1 Home / Document Vault

| Aspect | Details |
|--------|---------|
| **Purpose** | Display all documents, filterable by category and status |
| **Current Problem** | Category rail takes vertical space; status badges small |
| **Proposed Improvement** | Bottom nav for categories; large status badges on cards |
| **Exact UI Behavior** | Tap category in bottom nav → filter documents; swipe left/right between categories |
| **Mobile Layout** | Bottom nav fixed; cards stack vertically; FAB for add |
| **Desktop Impact** | None — desktop uses existing top bar + rail |
| **Data Dependencies** | Document list from IndexedDB `documents` store |
| **Risk Level** | Low (visual only) |
| **Acceptance Criteria** | All documents visible; category filter works; no horizontal scroll; status readable at glance |

### 4.2 Document Detail

| Aspect | Details |
|--------|---------|
| **Purpose** | View/edit document metadata, attachments, OCR results |
| **Current Problem** | Information density high on small screens; actions scattered |
| **Proposed Improvement** | 70% viewer / 30% details split (already approved); actions grouped at bottom |
| **Exact UI Behavior** | Tap document → full-screen modal; swipe down to close; tap attachment to zoom |
| **Mobile Layout** | Full-screen modal; viewer top; details bottom; action bar fixed |
| **Desktop Impact** | Retain 70/30 split; action bar becomes right sidebar |
| **Data Dependencies** | Single document from IndexedDB; attachments from `attachments` store |
| **Risk Level** | Low (layout refinement) |
| **Acceptance Criteria** | Attachment preview works; edit saves correctly; OCR button accessible; print/download available |

### 4.3 Settings

| Aspect | Details |
|--------|---------|
| **Purpose** | Configure app behavior, themes, backup, security |
| **Current Problem** | Long modal with many options; overwhelming on mobile |
| **Proposed Improvement** | Grouped sections (Appearance, Security, Data, About); search within settings |
| **Exact UI Behavior** | Tap setting category → expand section; tap theme → preview inline |
| **Mobile Layout** | Scrollable list with sections; back button to return to main view |
| **Desktop Impact** | Retain current modal; optional side navigation |
| **Data Dependencies** | Settings from IndexedDB `settings` store |
| **Risk Level** | Medium (may hide important features) |
| **Acceptance Criteria** | All current settings accessible; theme preview works; backup/export functional; PIN flow intact |

### 4.4 Add Document

| Aspect | Details |
|--------|---------|
| **Purpose** | Create new document with optional scan/OCR |
| **Current Problem** | Many steps; camera/file picker can confuse on iOS |
| **Proposed Improvement** | Linear flow: Category → Details → Scan (optional) → Save |
| **Exact UI Behavior** | Step wizard with progress indicator; camera permission handled gracefully |
| **Mobile Layout** | Full-screen wizard; next/back buttons fixed at bottom |
| **Desktop Impact** | Retain current modal flow |
| **Data Dependencies** | New document write to IndexedDB; optional OCR via Tesseract.js |
| **Risk Level** | Medium (data entry flow) |
| **Acceptance Criteria** | Document saves correctly; camera works on supported devices; cancel does not lose data; OCR optional |

### 4.5 Vaccination Log

| Aspect | Details |
|--------|---------|
| **Purpose** | Track vaccine history with reminders |
| **Current Problem** | List view lacks timeline context |
| **Proposed Improvement** | Timeline visualization; colour-coded by vaccine type |
| **Exact UI Behavior** | Tap vaccine → detail modal; tap "+" to add; reminders auto-calculated |
| **Mobile Layout** | Vertical timeline; cards for each entry |
| **Desktop Impact** | Optional horizontal timeline |
| **Data Dependencies** | Vaccines from IndexedDB `vaccines` store |
| **Risk Level** | Low |
| **Acceptance Criteria** | Add/edit/delete works; reminders accurate; export available |

### 4.6 Timeline

| Aspect | Details |
|--------|---------|
| **Purpose** | Chronological view of sea time, certificates, events |
| **Current Problem** | Separate views for sea time and certificates |
| **Proposed Improvement** | Unified timeline with filters |
| **Exact UI Behavior** | Filter by event type; tap event → detail |
| **Mobile Layout** | Vertical timeline; infinite scroll |
| **Desktop Impact** | Optional horizontal timeline |
| **Data Dependencies** | Sea time, certificates, vaccines from respective stores |
| **Risk Level** | Low |
| **Acceptance Criteria** | All event types shown; filters work; chronological order correct |

### 4.7 Packs

| Aspect | Details |
|--------|---------|
| **Purpose** | Group related documents (e.g., STCW pack for job application) |
| **Current Problem** | Pack creation not intuitive |
| **Proposed Improvement** | Pre-built pack templates; one-tap document inclusion |
| **Exact UI Behavior** | Select pack template → check documents → save |
| **Mobile Layout** | Card-based pack selector; checklist for documents |
| **Desktop Impact** | Retain current pack management |
| **Data Dependencies** | Packs from IndexedDB `packs` store; document references |
| **Risk Level** | Low |
| **Acceptance Criteria** | Create/edit/delete packs; share pack exports correctly |

### 4.8 Sea Time

| Aspect | Details |
|--------|---------|
| **Purpose** | Log sea service for certification requirements |
| **Current Problem** | Date calculation unclear |
| **Proposed Improvement** | Inclusive day count clearly displayed; vessel autocomplete |
| **Exact UI Behavior** | Enter dates → auto-calculate days; select vessel from history |
| **Mobile Layout** | Form with date pickers; summary card |
| **Desktop Impact** | None |
| **Data Dependencies** | Sea time from IndexedDB `seaTime` store |
| **Risk Level** | Low |
| **Acceptance Criteria** | Day count accurate; save/edit/delete works |

### 4.9 STCW Checklist

| Aspect | Details |
|--------|---------|
| **Purpose** | Verify certificate compliance by rank |
| **Current Problem** | Matrix view complex on mobile |
| **Proposed Improvement** | Checklist format with progress indicator |
| **Exact UI Behavior** | Select rank → see required certificates; tap to verify |
| **Mobile Layout** | Accordion checklist; progress bar at top |
| **Desktop Impact** | Retain matrix view |
| **Data Dependencies** | Certificates from IndexedDB; rank from profile |
| **Risk Level** | Low |
| **Acceptance Criteria** | Checklist accurate; progress updates; export available |

### 4.10 Share Pack / Share Document

| Aspect | Details |
|--------|---------|
| **Purpose** | Export documents or packs for sharing |
| **Current Problem** | Share options not prominent |
| **Proposed Improvement** | One-tap share using Web Share API; fallback to download |
| **Exact UI Behavior** | Tap share → system share sheet or download |
| **Mobile Layout** | Share button in action bar |
| **Desktop Impact** | Retain current share behavior |
| **Data Dependencies** | Document/pack data for export |
| **Risk Level** | Low |
| **Acceptance Criteria** | Web Share works where supported; download fallback works |

### 4.11 Lite Mode

| Aspect | Details |
|--------|---------|
| **Purpose** | Simplified interface for quick document access |
| **Current Problem** | Lite mode toggle buried in Settings |
| **Proposed Improvement** | Prominent toggle on Home screen or bottom nav |
| **Exact UI Behavior** | Toggle → hide advanced features; show only essential documents |
| **Mobile Layout** | Toggle in bottom nav or floating button |
| **Desktop Impact** | Retain current Lite mode behavior |
| **Data Dependencies** | None (view mode only) |
| **Risk Level** | Low |
| **Acceptance Criteria** | Lite mode hides correct features; toggle accessible |

---

## 5. Recommended First Implementation Batch

### 5.1 Phase 1: Foundation (Week 1)

Implement these items first as they provide the highest visual impact with lowest risk:

| Item | Rationale |
|------|-----------|
| **Mobile Bottom Navigation** | Core navigation pattern; enables all other mobile improvements |
| **Status-First Document Cards** | Immediate visual clarity; no data changes required |
| **Cleaner Document Detail Actions** | Improves daily workflow; low risk |
| **Settings Theme Preview Polish** | Shows design intent; non-functional risk |

**Why This Batch First:**
- These changes are **visual only** — no data model modifications
- They demonstrate the mobile-first design language
- Easy to revert if Jenny disapproves
- Can be tested independently of complex features
- Provide immediate value for mobile users

### 5.2 Phase 2: Flows (Week 2)

| Item | Depends On |
|------|------------|
| **Add Document Flow Improvement** | Phase 1 navigation |
| **Vaccination Log Timeline** | Phase 1 card design |
| **Packs Management UX** | Phase 1 card design |

### 5.3 Phase 3: Advanced Features (Week 3+)

| Item | Depends On |
|------|------------|
| **Sea Time Enhancements** | Phase 2 flows |
| **STCW Checklist** | Phase 2 flows |
| **Unified Timeline** | Phase 2 timeline |
| **Share Improvements** | Phase 2 packs |

---

## 6. Non-Goals (Explicitly Out of Scope)

The following are **NOT** part of this prototype without separate explicit approval:

| Item | Reason |
|------|--------|
| **Deletion/Migration of Documents** | Data integrity risk; requires migration plan |
| **Stable Deployment** | Prototype is for testing only |
| **Backup Format Change** | Breaks compatibility with existing backups |
| **Sync Table Change** | Affects encrypted vault schema |
| **Theme Identity Replacement** | Ocean theme is brand identity; locked |
| **Removal of Desktop Layout** | Desktop users depend on current layout |
| **OCR Algorithm Changes** | Performance/testing implications |
| **Service Worker Modifications** | Offline behavior critical; separate review needed |
| **PIN/Security Model Changes** | Security audit required |
| **IndexedDB Schema Changes** | Requires migration strategy |

---

## 7. Testing Plan

### 7.1 Viewport Testing

| Test | Acceptance Criteria |
|------|---------------------|
| **Desktop (≥1024px)** | Existing layout unchanged; no regressions |
| **Tablet (768-1023px)** | Responsive behavior; no horizontal scroll |
| **Phone (<768px)** | Bottom nav visible; all content accessible |
| **No Horizontal Scrolling** | Anywhere in app at any viewport |

### 7.2 Touch Target Testing

| Element | Minimum Size |
|---------|--------------|
| Bottom nav items | 44x44px |
| Document cards | 44px minimum height for interactive areas |
| Buttons | 44x44px |
| Form inputs | 44px height |

### 7.3 Functional Testing

| Feature | Test Case | Expected Result |
|---------|-----------|-----------------|
| **Document Cards** | Tap card → detail opens | Detail modal appears |
| **Add/Edit Document** | Create document → save → reload | Document persists |
| **Backup Export** | Export backup → inspect JSON | Valid JSON with all documents |
| **Backup Import** | Import backup → confirm → reload | All documents restored |
| **Encrypted Sync** | Configure sync → trigger sync | No errors; data encrypted |
| **OCR** | Attach image → run OCR | Text extracted or graceful failure |
| **Print** | Print document → preview | Printable layout correct |
| **Update Button** | Check update → simulate new version | Service worker updates correctly |
| **Service Worker Versioning** | Deploy new SW → reload | Old cache cleared; new assets loaded |

### 7.4 Device/Browser Matrix

| Platform | Browser | Required |
|----------|---------|----------|
| iOS | Safari | Yes |
| iPadOS | Safari | Yes |
| Android | Chrome | Yes |
| Windows | Chrome | Yes |
| Windows | Edge | Yes |
| macOS | Safari | Preferred |
| macOS | Chrome | Preferred |

### 7.5 Regression Testing

Verify the following remain unaffected:

- [ ] Ocean background animation
- [ ] Helm brand animation
- [ ] Top bar on desktop
- [ ] Category rail on desktop
- [ ] Document card grid/list toggle
- [ ] Search functionality
- [ ] Sort/filter options
- [ ] Profile editing
- [ ] PIN lock/unlock
- [ ] Auto-lock behavior
- [ ] Biometric registration (where supported)
- [ ] Camera capture
- [ ] File picker
- [ ] PDF preview
- [ ] Image optimization
- [ ] Activity log
- [ ] Expiry reminders
- [ ] Calendar export (.ics)
- [ ] Summary print
- [ ] Web Share API
- [ ] Clear all data

---

## 8. Manager Decision Points

### 8.1 Approval Gates for Codex/Jenny

The following decisions require explicit approval before proceeding:

| Question | Options | Recommendation |
|----------|---------|----------------|
| **Which screens to prototype first?** | Home, Document Detail, Settings, Add Doc | Start with Home + Document Detail |
| **Should bottom navigation be mobile-only?** | Yes / No / Tablet-inclusive | Yes, mobile-only (<768px) |
| **Should desktop remain unchanged?** | Yes / No / Partial | Yes, fully unchanged |
| **Which Grok mockups are closest to desired look?** | Need screenshots from transcript | TBD after reviewing mockups |
| **Should this become a preview mode or separate branch only?** | Preview toggle / Branch only | Branch only for safety |
| **What must be shown in screenshots before approval?** | Home, Detail, Settings, Add Doc | All four on phone + desktop |
| **Can we modify `legacy-root-pwa.html` for prototype?** | Yes (in feature branch) / No (separate files) | Yes, in feature branch only |
| **Is a deploy of the prototype allowed?** | Yes (staging) / No (local only) | Local only until approved |

### 8.2 Required Deliverables Before Approval Meeting

Before presenting to Jenny, prepare:

1. **Screenshot Package**
   - Home screen (phone, tablet, desktop)
   - Document Detail (phone, desktop)
   - Settings (phone, desktop)
   - Add Document flow (phone)
   - Bottom navigation close-up

2. **Interactive Demo**
   - Local deployment instructions
   - Test credentials/sample data
   - Video walkthrough (optional)

3. **Comparison Document**
   - Side-by-side: current stable vs prototype
   - List of changes (what's different)
   - List of non-changes (what's preserved)

4. **Risk Assessment**
   - Data model impact: None
   - Backup compatibility: Preserved
   - Sync compatibility: Preserved
   - Rollback plan: Delete branch

---

## 9. Implementation Phases

### Phase 0: Setup (Day 1)

```bash
git checkout development/stable-app-copy
git checkout -b feature/mobile-ui-redesign-prototype
mkdir -p prototypes/mobile-ui
```

Create base mobile CSS overrides and viewport detection logic.

### Phase 1: Navigation Foundation (Days 2-4)

- Implement bottom navigation component
- Add viewport detection (mobile vs desktop)
- Wire navigation to existing routes
- Test on real devices

### Phase 2: Card Redesign (Days 5-7)

- Redesign document cards with status-first approach
- Implement larger badges
- Ensure grid/list toggle still works
- Test with 100+ sample documents

### Phase 3: Detail Screen Polish (Days 8-10)

- Refine 70/30 split for mobile
- Group actions at bottom
- Improve attachment preview
- Test OCR flow

### Phase 4: Settings Refinement (Days 11-13)

- Group settings into sections
- Add theme preview
- Ensure all settings accessible
- Test backup/export flow

### Phase 5: Testing & Documentation (Days 14-15)

- Run full test matrix
- Document known issues
- Prepare screenshot package
- Write presentation notes

### Phase 6: Review & Feedback (Day 16+)

- Present to Codex/Jenny
- Collect feedback
- Iterate or shelve based on decision

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Accidental stable branch modification** | Medium | Critical | Use branch protection; code review required |
| **Data loss during testing** | Low | Critical | Test with sample data only; backup before testing |
| **Desktop regression** | Medium | High | Continuous visual testing on desktop viewport |
| **iOS Safari camera issues** | High | Medium | Graceful fallbacks; clear error messages |
| **Service worker cache conflicts** | Medium | High | Unique cache namespace for prototype |
| **Feature discoverability reduced** | Medium | Medium | User testing; "What's New" tooltip on first load |
| **Performance degradation on old devices** | Low | Medium | Performance budget; lazy loading |
| **Scope creep** | High | Medium | Strict adherence to phased plan; say "no" to additions |

---

## 11. Success Criteria

The prototype will be considered successful if:

1. ✅ All target screens implemented on mobile viewport
2. ✅ Desktop viewport completely unchanged
3. ✅ No data model modifications
4. ✅ All existing features still accessible
5. ✅ No horizontal scrolling at any viewport
6. ✅ Touch targets meet 44px minimum
7. ✅ Backup/export/import works correctly
8. ✅ OCR flow unaffected
9. ✅ Service worker versioning preserved
10. ✅ Positive feedback from Jenny on design direction

---

## 12. Next Steps

1. **Codex:** Review this plan and provide feedback
2. **Codex:** Schedule approval meeting with Jenny
3. **Jenny:** Approve/deny prototype branch creation
4. **Jenny:** Specify which screens are highest priority
5. **Qwen:** Begin Phase 0 upon approval
6. **Qwen:** Deliver screenshot package after Phase 4
7. **All:** Review meeting and go/no-go decision

---

**Document End**

*This plan is a living document. Update as decisions are made and scope evolves.*
