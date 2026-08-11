# THE BLUE - Mobile UI Redesign Prototype

## Overview

This prototype demonstrates a **premium mobile-first UI/UX redesign** for BlueWallet Pro, following the Grok visual standard for a seafarer digital wallet.

## Visual Design Goals

- **Deep ocean atmosphere**: Navy/black background with subtle moonlit water texture
- **Premium feel**: Glassmorphism, careful spacing, expensive aesthetic
- **Strong brand identity**: Wave/ocean logo mark with "THE BLUE" wordmark
- **Status-first design**: Clear visual hierarchy using color (red/green/blue)
- **Mobile-native**: Bottom navigation, floating actions, touch-friendly targets

## Files in This Directory

| File | Purpose |
|------|---------|
| `preview.html` | Complete clickable mobile UI prototype shell |
| `mobile-redesign-overrides.css` | All styling for the prototype |
| `app.js` | Prototype-only navigation, filtering, wizard, and feedback logic |
| `README.md` | This documentation file |

## Key Features Demonstrated

### 1. Brand Header
- Custom SVG wave/ocean logo
- "THE BLUE" wordmark with premium spacing
- Subtitle: "Seafarer Digital Wallet"
- OFFLINE status pill indicator

### 2. Document Vault Hero
- Large heading with supporting text
- Glass stats panel showing:
  - Total documents
  - Expiring soon count
  - Expired count

### 3. Search and Filters
- Search by title, document number, category, status, and notes
- Category chips
- Status chips
- Empty state with reset action
- Secondary horizontal scroll chips
- NOT part of bottom navigation
- Includes: All, Passport, CDC, COC, Visa, Certificates

### 4. Status-First Document Cards
- **Expired card**: Red left border, red badge, warning icon, risk message
- **Valid card**: Green left border, green badge, check icon, ready message
- Spacious layout with clear hierarchy
- Glass effect with subtle shadows

### 5. Floating Add Button
- Circular electric blue button
- Lower right position
- Premium glow shadow effect
- Does not cover important content

### 6. Bottom Navigation
Five main app sections (NOT document categories):
- Vault
- Timeline
- Vaccines
- Packs
- Profile

### 7. Prototype UX States
- Expired, expiring soon, valid/ready, and missing document states
- Sync healthy and sync attention examples
- Offline mode and update available examples
- OCR fallback/manual-entry guidance
- iOS print/share guidance

### 8. Add Document Wizard
- Four visible prototype steps:
  1. Category
  2. Details
  3. Scan or upload
  4. Review
- Next, Back, Cancel, and Save controls are wired for prototype navigation

## Color Palette

| Color | Usage | Hex |
|-------|-------|-----|
| Ocean Black | Background | #0a0e14 |
| Ocean Navy | Background gradient | #0d1520 |
| Danger Red | Expired/Danger | #ff3b30 |
| Success Green | Valid/Ready | #34c759 |
| Brand Blue | Primary brand | #0066ff |
| Electric Blue | Actions/FAB | #00d4ff |

## Responsive Behavior

- **Mobile (< 390px)**: Full-width mobile frame
- **Desktop (> 450px)**: Centered phone mockup with shadow
- **Safe areas**: Respects iOS safe-area-inset
- **Touch targets**: Minimum 44x44px
- **Overflow**: Designed for 390px and 320px mobile review with no horizontal page scroll

## How to Preview

1. Open `preview.html` in any modern browser
2. For mobile simulation, use browser DevTools device mode
3. Set viewport to 390px width (iPhone 12/13/14 Pro)
4. Test scrolling and touch interactions

## What This Prototype Does NOT Include

- ❌ No real data persistence
- ❌ No IndexedDB integration
- ❌ No backup/export functionality
- ❌ No OCR features
- ❌ No sync logic
- ❌ No service worker
- ❌ No deployment

This is a **visual prototype only** for design review.

## Next Steps

1. Review with Jenny (Product Owner)
2. Gather feedback on visual direction
3. If approved, integrate into feature branch
4. Wire up real data and functionality
5. Test on actual devices

## Branch Information

- **Branch**: `feature/mobile-ui-redesign-prototype-clean`
- **Stable App**: UNTOUCHED
- **Status**: Planning/Prototype only

---

*Last updated: 2026-08-10*

## Acceptance Checklist

### Responsive Testing
- [ ] 390px viewport: no horizontal overflow
- [ ] 320px viewport: no horizontal overflow
- [ ] Desktop preview centers correctly

### Navigation
- [ ] Bottom nav usable on all screens
- [ ] All 7 screens reachable via bottom nav
- [ ] Detail screen opens from document card tap
- [ ] Add flow opens from floating + button
- [ ] Back behavior works consistently

### Interactions
- [ ] Theme selector changes visual theme in the prototype
- [ ] Search/filter changes visible cards
- [ ] Empty state appears when no cards match
- [ ] Add wizard moves through all 4 steps
- [ ] Detail action buttons show prototype feedback
- [ ] Document cards are readable at 390px
- [ ] Touch targets are at least 44px

### Safety
- [ ] Stable app files untouched
- [ ] Only prototype folder modified
- [ ] No data persistence logic added
- [ ] No service worker modifications

---

*Last updated: 2026-08-10*
