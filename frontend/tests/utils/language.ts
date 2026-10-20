import type { Page } from "@playwright/test"

export const LANGUAGE_KEY = "tid-coach-language"

/**
 * The app starts in Turkish. These tests are written against the English
 * wording, so pin the language before the page loads.
 */
export async function setEnglish(page: Page) {
  await page.addInitScript(
    ([key]) => {
      try {
        window.localStorage.setItem(key, "en")
      } catch {
        // Storage can be blocked; the test will just run in Turkish.
      }
    },
    [LANGUAGE_KEY],
  )
}
