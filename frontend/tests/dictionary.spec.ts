import { expect, test } from "@playwright/test"
import { setEnglish } from "./utils/language.ts"

test.beforeEach(async ({ page }) => {
  await setEnglish(page)
})

test("Dictionary lists the AUTSL signs", async ({ page }) => {
  await page.goto("/dictionary")

  await expect(page.getByRole("heading", { name: "Dictionary" })).toBeVisible()
  await expect(
    page.getByRole("cell", { name: "abla", exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("cell", { name: "agac", exact: true }),
  ).toBeVisible()
})

test("Search finds a sign typed in plain letters", async ({ page }) => {
  await page.goto("/dictionary")

  await page.getByPlaceholder("Search a sign").fill("agac")

  await expect(
    page.getByRole("cell", { name: "agac", exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("cell", { name: "abla", exact: true }),
  ).toBeHidden()
})

test("Search finds a sign typed with Turkish letters", async ({ page }) => {
  await page.goto("/dictionary")

  // The list stores "agac", so this only works if the search folds the letters.
  await page.getByPlaceholder("Search a sign").fill("ağaç")

  await expect(
    page.getByRole("cell", { name: "agac", exact: true }),
  ).toBeVisible()
})

test("Search also matches the English word", async ({ page }) => {
  await page.goto("/dictionary")

  await page.getByPlaceholder("Search a sign").fill("tree")

  await expect(
    page.getByRole("cell", { name: "agac", exact: true }),
  ).toBeVisible()
})

test("A word that is not a sign shows the empty message", async ({ page }) => {
  await page.goto("/dictionary")

  await page.getByPlaceholder("Search a sign").fill("qqqqqq")

  await expect(page.getByText("No sign found")).toBeVisible()
})

test("Practice button opens the sign in Teacher", async ({ page }) => {
  await page.goto("/dictionary")
  await page.getByPlaceholder("Search a sign").fill("agac")

  await page.getByRole("link", { name: "Practice" }).first().click()

  await page.waitForURL(/\/teacher\?sign=5/)
  await expect(page.getByRole("heading", { name: "Teacher" })).toBeVisible()
})
