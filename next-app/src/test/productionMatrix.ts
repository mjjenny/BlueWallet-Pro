export const PRODUCTION_BROWSER_MATRIX = [
  { platform: "iOS", browser: "Safari", areas: ["install", "offline", "vault", "scanner", "ocr", "maritime"] },
  { platform: "iPadOS", browser: "Safari", areas: ["install", "offline", "vault", "scanner", "ocr", "maritime"] },
  { platform: "Android", browser: "Chrome", areas: ["install", "offline", "vault", "scanner", "ocr", "maritime"] },
  { platform: "Windows", browser: "Chrome", areas: ["offline", "vault", "backup", "ocr", "maritime"] },
  { platform: "Windows", browser: "Edge", areas: ["offline", "vault", "backup", "ocr", "maritime"] },
  { platform: "macOS", browser: "Safari", areas: ["offline", "vault", "backup", "ocr", "maritime"] },
  { platform: "macOS", browser: "Chrome", areas: ["offline", "vault", "backup", "ocr", "maritime"] },
] as const;

export const PRODUCTION_TEST_AREAS = [
  "install",
  "offline",
  "vault",
  "scanner",
  "ocr",
  "backup",
  "maritime",
] as const;
