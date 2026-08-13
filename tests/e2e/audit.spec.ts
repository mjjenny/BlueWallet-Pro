import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Requirements source: no formal PRD exists for this app. This suite verifies
// against the repo's own documented intent instead -- the UX review PDF acted
// on this session (onboarding must not get stuck, hero/insights read as one
// unit, no desktop/mobile feature-parity gaps, Tools dropdown must never be
// clipped or run off-viewport) plus REDESIGN_ROADMAP.md / MILESTONE_1_ROADMAP.md
// / BLUEWALLET_HANDOVER.md in the repo root.

const APP_PATH = "/legacy-root-pwa";

// Playwright statically inspects a beforeEach/test callback's parameter list
// to decide which fixtures to inject, so it must be an inline destructuring
// pattern -- a named helper taking a plain `page: Page` argument doesn't
// qualify, even though it's otherwise a normal async function.
async function gotoOnboarded({ page }: { page: Page }) {
  // Most tests aren't about onboarding itself; skip it by pre-seeding the
  // flag the app already checks (public/legacy-root-pwa.html, runOnboarding()).
  await page.addInitScript(() => {
    try {
      localStorage.setItem("bwOnboardDone", "1");
    } catch {
      /* ignore */
    }
  });
  await page.goto(APP_PATH, { waitUntil: "networkidle" });
}

function attachAxe(testInfo: { attach: (name: string, opts: { body: string; contentType: string }) => Promise<void> }, name: string, violations: unknown) {
  return testInfo.attach(name, { body: JSON.stringify(violations, null, 2), contentType: "application/json" });
}

// ---------------------------------------------------------------------------
// Onboarding — the bug fixed this session: localStorage.setItem throwing in
// restricted-storage contexts left the modal permanently stuck.
// ---------------------------------------------------------------------------
test.describe("Onboarding", () => {
  test("shows on first visit, Skip dismisses it, and it stays dismissed on reload", async ({ page }) => {
    await page.goto(APP_PATH, { waitUntil: "networkidle" });
    const modal = page.locator("#onboard");
    await expect(modal).toHaveClass(/show/);
    await page.click("#ob-skip");
    await expect(modal).not.toHaveClass(/show/);
    await page.reload({ waitUntil: "networkidle" });
    await expect(modal).not.toHaveClass(/show/);
  });

  test("dismissal survives a simulated storage-write failure (regression)", async ({ page }) => {
    await page.goto(APP_PATH, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      const orig = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k: string, v: string) {
        if (k === "bwOnboardDone") throw new DOMException("QuotaExceededError (simulated)", "QuotaExceededError");
        return orig.call(this, k, v);
      };
    });
    const modal = page.locator("#onboard");
    await expect(modal).toHaveClass(/show/);
    await page.click("#ob-skip");
    await expect(modal).not.toHaveClass(/show/, {
      timeout: 3000,
    });
  });
});

// ---------------------------------------------------------------------------
// Responsive layout
// ---------------------------------------------------------------------------
test.describe("Responsive layout", () => {
  test.beforeEach(gotoOnboarded);

  test("no unwanted horizontal scroll on the home screen", async ({ page }) => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, "document.scrollWidth should not exceed the viewport width").toBeLessThanOrEqual(1);
  });

  test("hero card and Pack Progress read as one connected block", async ({ page }) => {
    const gap = await page.evaluate(() => {
      const hero = document.querySelector(".profile-strip")!.getBoundingClientRect();
      const insights = document.getElementById("home-insights")!.getBoundingClientRect();
      return insights.top - hero.bottom;
    });
    expect(gap, "gap between hero and Pack Progress").toBeLessThan(40);
  });

  test("visual baseline (first run establishes the baseline; there is no prior baseline to diff against)", async ({ page }) => {
    await expect(page).toHaveScreenshot("home.png", { fullPage: true, animations: "disabled" });
  });
});

// ---------------------------------------------------------------------------
// Primary navigation
// ---------------------------------------------------------------------------
test.describe("Primary navigation", () => {
  test.beforeEach(gotoOnboarded);

  const destinations = ["vault", "packs", "timeline", "seatime", "profile"];

  for (const dest of destinations) {
    test(`"${dest}" destination is reachable`, async ({ page }) => {
      const btn = page.locator(`[data-mobile-nav="${dest}"]:visible`).first();
      await expect(btn, `no visible nav control for "${dest}" at this viewport`).toBeVisible();
      await btn.click();
      await expect(btn).toHaveClass(/active/);
    });
  }
});

// ---------------------------------------------------------------------------
// Tools dropdown — regression suite for tonight's two live fixes:
// 1) overflow-x:hidden on .tools-row implicitly clipping the dropdown
//    (only "Checklist" was ever visible before the fix)
// 2) the dropdown running off the bottom edge with no way to reach the last
//    item(s) when .tools-row sits low on a short/scrolled viewport
// ---------------------------------------------------------------------------
test.describe("Tools dropdown", () => {
  test.beforeEach(gotoOnboarded);

  test("all 5 items render, are visible, and stay fully inside the viewport", async ({ page }) => {
    const toggle = page.locator("#btn-tools-toggle");
    if (!(await toggle.isVisible())) {
      test.skip(true, "Tools dropdown trigger is intentionally hidden <=760px; mobile uses dedicated routes instead");
    }
    await toggle.click();
    await expect(page.locator("#tools-dropdown")).toHaveClass(/show/);

    const vh = page.viewportSize()!.height;
    const vw = page.viewportSize()!.width;
    for (const id of ["btn-checklist", "btn-ics", "btn-stcw", "btn-vaccines", "btn-bulk"]) {
      const el = page.locator(`#${id}`);
      await expect(el, `#${id} should be visible in the open dropdown`).toBeVisible();
      const box = await el.boundingBox();
      expect(box, `#${id} has no bounding box`).not.toBeNull();
      if (box) {
        expect(box.y, `#${id} top edge is above the viewport`).toBeGreaterThanOrEqual(-1);
        expect(box.y + box.height, `#${id} bottom edge runs past the viewport (the exact bug reported and fixed tonight)`).toBeLessThanOrEqual(vh + 1);
        expect(box.x, `#${id} left edge is off-screen`).toBeGreaterThanOrEqual(-1);
        expect(box.x + box.width, `#${id} right edge runs past the viewport`).toBeLessThanOrEqual(vw + 1);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Mobile/desktop feature-parity routes added this session
// ---------------------------------------------------------------------------
test.describe("Mobile parity routes", () => {
  test.beforeEach(gotoOnboarded);

  test("Vaccination log is reachable from the Packs screen on phones", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile-only route");
    await page.locator('[data-mobile-nav="packs"]:visible').first().click();
    const btn = page.locator("#btn-open-vaccines-from-packs");
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator("#modal-generic.vaccine-mode.show")).toBeVisible();
  });

  test("STCW checklist is reachable from the Packs screen on phones", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile-only route");
    await page.locator('[data-mobile-nav="packs"]:visible').first().click();
    const btn = page.locator("#btn-open-stcw-from-packs");
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator("#modal-generic.stcw-mode.show")).toBeVisible();
  });

  test("bulk-select and List/Grid view toggle are reachable on phones", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile-only route");
    for (const id of ["btn-bulk-mobile", "view-list-mobile", "view-grid-mobile"]) {
      await expect(page.locator(`#${id}`), `#${id} should be visible on mobile`).toBeVisible();
    }
  });

  test("STCW checklist is reachable from the desktop/tablet Tools dropdown", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop/tablet-only route");
    const toggle = page.locator("#btn-tools-toggle");
    await expect(toggle).toBeVisible();
    await toggle.click();
    await page.locator("#btn-stcw").click();
    await expect(page.locator("#modal-generic.stcw-mode.show")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Timeline — mobile now carries the same Renewal plan / Missing document
// tracker sections desktop has (ported this session).
// ---------------------------------------------------------------------------
test.describe("Timeline", () => {
  test.beforeEach(gotoOnboarded);

  test("mobile shows Renewal plan and Missing document tracker sections", async ({ page, isMobile }) => {
    test.skip(!isMobile, "checking the mobile-specific card list");
    await page.locator('[data-mobile-nav="timeline"]:visible').first().click();
    const mobileTimeline = page.locator(".mobile-timeline");
    await expect(mobileTimeline.locator(".help-card", { hasText: "Renewal plan" })).toBeVisible();
    await expect(mobileTimeline.locator(".help-card", { hasText: "Missing document tracker" })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Touch usability (mobile only)
// ---------------------------------------------------------------------------
test.describe("Touch target sizing", () => {
  test.beforeEach(gotoOnboarded);

  test("bottom nav buttons meet the 44x44px minimum", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile-only nav pattern");
    const buttons = page.locator(".mobile-bottom-nav button");
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.width, `nav button ${i} width`).toBeGreaterThanOrEqual(44);
        expect(box.height, `nav button ${i} height`).toBeGreaterThanOrEqual(44);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Accessibility — axe-core, WCAG 2.1 A/AA rule sets.
// Reports violations rather than hard-failing on every finding: pre-existing
// issues are worth surfacing in the audit report even if fixing all of them
// isn't in scope for this pass. Hard-fails only on "critical" impact.
// ---------------------------------------------------------------------------
test.describe("Accessibility (axe-core, WCAG 2.1 A/AA)", () => {
  test.beforeEach(gotoOnboarded);

  test("home screen", async ({ page }, testInfo) => {
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    await attachAxe(testInfo, "axe-home.json", results.violations);
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical, JSON.stringify(critical.map((v) => v.id))).toEqual([]);
  });

  test("Add Document modal", async ({ page }, testInfo) => {
    const trigger = page.locator("#readiness-cta, #fab-add, #btn-add").filter({ visible: true }).first();
    await trigger.click();
    await expect(page.locator("#modal-add.show")).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).include("#modal-add").analyze();
    await attachAxe(testInfo, "axe-add-document.json", results.violations);
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical, JSON.stringify(critical.map((v) => v.id))).toEqual([]);
  });

  test("Joining Vessel Checklist modal", async ({ page }, testInfo) => {
    await page.click("#readiness-ring");
    await expect(page.locator("#modal-checklist.show")).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).include("#modal-checklist").analyze();
    await attachAxe(testInfo, "axe-checklist.json", results.violations);
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical, JSON.stringify(critical.map((v) => v.id))).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Keyboard navigation (desktop-focused; requires a real keyboard/focus model)
// ---------------------------------------------------------------------------
test.describe("Keyboard navigation", () => {
  test.beforeEach(gotoOnboarded);

  test("Escape closes the topmost open overlay", async ({ page }, testInfo) => {
    const trigger = page.locator("#readiness-cta, #fab-add, #btn-add").filter({ visible: true }).first();
    if (!(await trigger.isVisible())) {
      test.skip(true, "no visible add-document trigger at this viewport");
    }
    await trigger.click();
    await expect(page.locator("#modal-add.show")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#modal-add")).not.toHaveClass(/show/);
    void testInfo;
  });

  test("readiness ring is keyboard-activatable (Enter)", async ({ page }) => {
    await page.locator("#readiness-ring").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#modal-checklist.show")).toBeVisible();
  });
});
