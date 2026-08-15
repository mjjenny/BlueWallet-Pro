import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Requirements source: no formal PRD exists for this app. This suite verifies
// against the repo's own documented intent instead -- the UX review PDF acted
// on this session (onboarding must not get stuck, hero/insights read as one
// unit, no desktop/mobile feature-parity gaps, Tools dropdown must never be
// clipped or run off-viewport) plus REDESIGN_ROADMAP.md / MILESTONE_1_ROADMAP.md
// / BLUEWALLET_HANDOVER.md in the repo root.

// Cloudflare routes the live URL's extensionless path; a local static
// server (used for fast pre-deploy iteration via AUDIT_BASE_URL) serves the
// real filename instead.
const APP_PATH = process.env.AUDIT_BASE_URL ? "/legacy-root-pwa.html" : "/legacy-root-pwa";

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
// Service worker update handling -- regression test for Issue #5 (audit
// report): self.clients.claim() in service-worker.js's activate handler
// fires `controllerchange` on ANY newly-claimed client, including a
// first-time visitor who had no controller at all, not just a real update.
// The app used to reload unconditionally on that event, causing a spurious
// reload on first visit (the desktop layout-shift/navigation flake the
// original audit caught). Fixed via a hadControllerAtLoad guard.
// ---------------------------------------------------------------------------
test.describe("Service worker update handling", () => {
  test("a first-visit controllerchange (clients.claim on initial activation) does not reload the page", async ({ page }) => {
    await page.goto(APP_PATH, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      (window as unknown as { __noReloadMarker: boolean }).__noReloadMarker = true;
      navigator.serviceWorker.dispatchEvent(new Event("controllerchange"));
    });
    // Longer than the 1200ms reload delay used elsewhere in the app's update flow.
    await page.waitForTimeout(1500);
    const stillThere = await page.evaluate(() => (window as unknown as { __noReloadMarker?: boolean }).__noReloadMarker === true);
    expect(stillThere, "page reloaded on a first-visit controllerchange (regression: see Issue #5)").toBe(true);
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

  test("all 6 items render, are visible, and stay fully inside the viewport", async ({ page }) => {
    const toggle = page.locator("#btn-tools-toggle");
    if (!(await toggle.isVisible())) {
      test.skip(true, "Tools dropdown trigger is intentionally hidden <=760px; mobile uses dedicated routes instead");
    }
    await toggle.click();
    await expect(page.locator("#tools-dropdown")).toHaveClass(/show/);

    const vh = page.viewportSize()!.height;
    const vw = page.viewportSize()!.width;
    for (const id of ["btn-checklist", "btn-ics", "btn-stcw", "btn-vaccines", "btn-packing", "btn-bulk"]) {
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

  test("Pre-Deployment Checklist is reachable from the Packs screen on phones", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile-only route");
    await page.locator('[data-mobile-nav="packs"]:visible').first().click();
    const btn = page.locator("#btn-open-packing-from-packs");
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.locator("#modal-generic.packing-mode.show")).toBeVisible();
  });

  test("Pre-Deployment Checklist is reachable from the desktop/tablet Tools dropdown", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop/tablet-only route");
    const toggle = page.locator("#btn-tools-toggle");
    await expect(toggle).toBeVisible();
    await toggle.click();
    await page.locator("#btn-packing").click();
    await expect(page.locator("#modal-generic.packing-mode.show")).toBeVisible();
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

  // -------------------------------------------------------------------------
  // Sweep 2: screens PLAYWRIGHT_AUDIT.md flagged as not yet covered (only
  // Home, Add Document, and Joining Vessel Checklist were scanned before).
  // The `.sw` toggle-switch pattern behind Issue #4 (unlabeled checkboxes)
  // was known to exist in Settings too, so it's the most likely place to
  // find more of the same defect class.
  // -------------------------------------------------------------------------

  test("Settings modal", async ({ page }, testInfo) => {
    await page.locator('[data-mobile-nav="profile"]:visible').first().click();
    await page.locator("#btn-profile-settings").click();
    await expect(page.locator("#modal-settings.show")).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).include("#modal-settings").analyze();
    await attachAxe(testInfo, "axe-settings.json", results.violations);
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical, JSON.stringify(critical.map((v) => v.id))).toEqual([]);
  });

  test("Packs modal", async ({ page }, testInfo) => {
    await page.locator('[data-mobile-nav="packs"]:visible').first().click();
    await expect(page.locator("#modal-generic.packs-mode.show")).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).include("#modal-generic").analyze();
    await attachAxe(testInfo, "axe-packs.json", results.violations);
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical, JSON.stringify(critical.map((v) => v.id))).toEqual([]);
  });

  test("Timeline modal", async ({ page }, testInfo) => {
    await page.locator('[data-mobile-nav="timeline"]:visible').first().click();
    await expect(page.locator("#modal-generic.timeline-mode.show")).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).include("#modal-generic").analyze();
    await attachAxe(testInfo, "axe-timeline.json", results.violations);
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical, JSON.stringify(critical.map((v) => v.id))).toEqual([]);
  });

  test("Sea Time modal", async ({ page }, testInfo) => {
    await page.locator('[data-mobile-nav="seatime"]:visible').first().click();
    await expect(page.locator("#modal-generic.seatime-mode.show")).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).include("#modal-generic").analyze();
    await attachAxe(testInfo, "axe-seatime.json", results.violations);
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical, JSON.stringify(critical.map((v) => v.id))).toEqual([]);
  });

  test("Pre-Deployment Checklist modal", async ({ page, isMobile }, testInfo) => {
    if (isMobile) {
      await page.locator('[data-mobile-nav="packs"]:visible').first().click();
      await page.locator("#btn-open-packing-from-packs").click();
    } else {
      await page.locator("#btn-tools-toggle").click();
      await page.locator("#btn-packing").click();
    }
    await expect(page.locator("#modal-generic.packing-mode.show")).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).include("#modal-generic").analyze();
    await attachAxe(testInfo, "axe-packing.json", results.violations);
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical, JSON.stringify(critical.map((v) => v.id))).toEqual([]);
  });

  test("STCW checklist modal", async ({ page, isMobile }, testInfo) => {
    if (isMobile) {
      await page.locator('[data-mobile-nav="packs"]:visible').first().click();
      await page.locator("#btn-open-stcw-from-packs").click();
    } else {
      await page.locator("#btn-tools-toggle").click();
      await page.locator("#btn-stcw").click();
    }
    await expect(page.locator("#modal-generic.stcw-mode.show")).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).include("#modal-generic").analyze();
    await attachAxe(testInfo, "axe-stcw.json", results.violations);
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical, JSON.stringify(critical.map((v) => v.id))).toEqual([]);
  });

  test("Vaccines modal", async ({ page, isMobile }, testInfo) => {
    if (isMobile) {
      await page.locator('[data-mobile-nav="packs"]:visible').first().click();
      await page.locator("#btn-open-vaccines-from-packs").click();
    } else {
      await page.locator("#btn-tools-toggle").click();
      await page.locator("#btn-vaccines").click();
    }
    await expect(page.locator("#modal-generic.vaccine-mode.show")).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).include("#modal-generic").analyze();
    await attachAxe(testInfo, "axe-vaccines.json", results.violations);
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

// ---------------------------------------------------------------------------
// OCR preprocessing -- deskew, adaptive binarization, and MRZ checksum
// validation, added to fix known-weak OCR quality (no deskew at all before,
// and a half-built OpenCV binarization path that was never actually wired
// in -- see git history). These three are fast and fully deterministic (no
// network, no real Tesseract call), so they're safe in the regular suite.
// A fourth, slower verification -- real Tesseract OCR on a synthetically
// skewed MRZ image, confirming deskew turns a garbled/failed read into an
// exact, checksum-valid one -- was run manually during development and is
// not included here to keep this suite network-independent; see the commit
// that added this pipeline for that result.
// ---------------------------------------------------------------------------
test.describe("OCR preprocessing (deskew / binarize / MRZ validity)", () => {
  test("deskew measurably improves text-line alignment after a synthetic rotation", async ({ page }) => {
    await page.goto(APP_PATH, { waitUntil: "networkidle" });
    const result = await page.evaluate(async () => {
      const w = 600, h = 400;
      function makeTextCanvas() {
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        const ctx = c.getContext("2d")!;
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#000";
        ctx.font = "24px monospace";
        for (let i = 0; i < 8; i++) ctx.fillText("THE QUICK BROWN FOX JUMPS OVER", 20, 40 + i * 40);
        return c;
      }
      // @ts-expect-error -- globals from legacy-root-pwa.html's classic <script>
      const base = makeTextCanvas();
            // @ts-expect-error -- window global from legacy-root-pwa.html
      const skewed = window.rotateCanvas(base, 6.3);
            // @ts-expect-error -- window global from legacy-root-pwa.html
      const { canvas: corrected } = await window.deskewCanvas(skewed);
            // @ts-expect-error -- window global from legacy-root-pwa.html
      const score = (c: HTMLCanvasElement) => window.rotatedProjectionVariance(window.grayscaleCanvasCopy(c, 500), 0);
      return { baseScore: score(base), skewedScore: score(skewed), correctedScore: score(corrected) };
    });
    expect(result.skewedScore, "synthetic skew should have measurably degraded alignment").toBeLessThan(result.baseScore * 0.9);
    expect(result.correctedScore, "deskew should meaningfully recover alignment").toBeGreaterThan(result.skewedScore * 1.5);
  });

  test("adaptive binarization handles an uneven lighting gradient better than a naive global threshold", async ({ page }) => {
    await page.goto(APP_PATH, { waitUntil: "networkidle" });
    const result = await page.evaluate(() => {
      const w = 400, h = 200;
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d")!;
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "#eeeeee");
      grad.addColorStop(1, "#555555");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#000";
      ctx.font = "20px monospace";
      ctx.fillText("SAMPLE TEXT LINE ONE HERE", 5, 60);
      ctx.fillText("SAMPLE TEXT LINE TWO HERE", 5, 100);
      ctx.fillText("SAMPLE TEXT LINE THREE OK", 5, 140);

      function naiveThreshold(canvas: HTMLCanvasElement) {
        const cw = canvas.width, ch = canvas.height;
        const cctx = canvas.getContext("2d")!;
        const d = cctx.getImageData(0, 0, cw, ch).data;
        const n = cw * ch;
        const gray = new Float64Array(n);
        let sum = 0;
        for (let i = 0, p = 0; i < d.length; i += 4, p++) {
          gray[p] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          sum += gray[p];
        }
        const mean = sum / n;
        const out = document.createElement("canvas");
        out.width = cw; out.height = ch;
        const octx = out.getContext("2d")!;
        const od = octx.createImageData(cw, ch);
        for (let p = 0; p < n; p++) {
          const g = gray[p] < mean ? 0 : 255;
          od.data[p * 4] = od.data[p * 4 + 1] = od.data[p * 4 + 2] = g;
          od.data[p * 4 + 3] = 255;
        }
        octx.putImageData(od, 0, 0);
        return out;
      }
      function blackFraction(canvas: HTMLCanvasElement, x0: number, x1: number) {
        const cctx = canvas.getContext("2d")!;
        const d = cctx.getImageData(x0, 0, x1 - x0, canvas.height).data;
        let black = 0, total = 0;
        for (let i = 0; i < d.length; i += 4) { total++; if (d[i] < 128) black++; }
        return black / total;
      }

            // @ts-expect-error -- window global from legacy-root-pwa.html
      const adaptive = window.binarizeCanvas(c);
      const naive = naiveThreshold(c);
      const mid = w / 2;
      const adaptiveDiff = Math.abs(blackFraction(adaptive, 0, mid) - blackFraction(adaptive, mid, w));
      const naiveDiff = Math.abs(blackFraction(naive, 0, mid) - blackFraction(naive, mid, w));
      return { adaptiveDiff, naiveDiff };
    });
    expect(result.adaptiveDiff, "adaptive threshold should be far less affected by the lighting gradient than a naive global one").toBeLessThan(result.naiveDiff);
  });

  test("parseMrzLines numberValid/expiryValid correctly reflect ICAO check digits", async ({ page }) => {
    await page.goto(APP_PATH, { waitUntil: "networkidle" });
    const result = await page.evaluate(() => {
            // @ts-expect-error -- window global from legacy-root-pwa.html
      const cd = (s: string) => window.mrzCheckDigit(s);
      const docNo = "L898902C3"; // ICAO 9303 sample document number
      const docCd = cd(docNo);
      const expRaw = "401231"; // YYMMDD
      const expCd = cd(expRaw);
      const line1 = "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<";
      const validLine2 = `${docNo}${docCd}UTO${"740812"}${cd("740812")}F${expRaw}${expCd}${"ZE184226B<<<<<10".padEnd(14, "<")}${"0"}`.slice(0, 44);
      const corruptLine2 = validLine2.slice(0, 5) + "X" + validLine2.slice(6);
            // @ts-expect-error -- window global from legacy-root-pwa.html
      const validParsed = window.parseMrzLines([line1, validLine2]);
            // @ts-expect-error -- window global from legacy-root-pwa.html
      const corruptParsed = window.parseMrzLines([line1, corruptLine2]);
      return {
        validNumberValid: validParsed?.numberValid,
        validExpiryValid: validParsed?.expiryValid,
        corruptNumberValid: corruptParsed?.numberValid,
      };
    });
    expect(result.validNumberValid, "a correctly-formed MRZ should validate its document-number check digit").toBe(true);
    expect(result.validExpiryValid, "a correctly-formed MRZ should validate its expiry check digit").toBe(true);
    expect(result.corruptNumberValid, "a corrupted document number should fail check-digit validation").toBe(false);
  });
});
