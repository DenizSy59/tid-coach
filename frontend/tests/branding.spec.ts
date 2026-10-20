import { expect, test } from "@playwright/test"
import { setEnglish } from "./utils/language.ts"

test("The sign-in page carries this project's name, not the template's", async ({
  page,
}) => {
  await page.goto("/login")

  await expect(page.getByText("TİD Coach").first()).toBeVisible()
  await expect(page.getByAltText("FastAPI")).toHaveCount(0)
  await expect(page.getByText("FastAPI")).toHaveCount(0)
})

test("The sidebar carries this project's name", async ({ page }) => {
  await setEnglish(page)
  await page.goto("/")

  await expect(page.getByText("TİD Coach").first()).toBeVisible()
  await expect(page.getByText("FastAPI")).toHaveCount(0)
})

test("The footer does not send people to the template's accounts", async ({
  page,
}) => {
  await page.goto("/login")

  const links = await page
    .locator("footer a")
    .evaluateAll((nodes) =>
      nodes.map((node) => (node as HTMLAnchorElement).href),
    )
  for (const href of links) {
    expect(href).not.toContain("fastapi")
    expect(href).not.toContain("x.com")
  }
})

test("The browser tab uses this project's icon", async ({ page }) => {
  await page.goto("/login")

  const icon = await page
    .locator('link[rel="icon"]')
    .first()
    .getAttribute("href")
  expect(icon).not.toContain("fastapi")
  expect(icon).not.toContain("vite")
})
