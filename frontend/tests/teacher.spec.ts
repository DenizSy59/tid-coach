import { expect, test } from "@playwright/test"
import { setEnglish } from "./utils/language.ts"

test.beforeEach(async ({ page }) => {
  await setEnglish(page)
})

test("Teacher shows the chosen sign and its reference video area", async ({
  page,
}) => {
  await page.goto("/teacher?sign=5")

  await expect(page.getByRole("heading", { name: "Teacher" })).toBeVisible()
  await expect(page.getByText("agac")).toBeVisible()
  await expect(page.getByText("Reference video", { exact: true })).toBeVisible()
  // No AUTSL clips have been added yet, so it says so rather than breaking.
  await expect(
    page.getByText("The video for this sign has not been added yet"),
  ).toBeVisible()
})

test("Check my sign is disabled until a sign is chosen", async ({ page }) => {
  await page.goto("/teacher")

  await expect(
    page.getByRole("button", { name: "Check my sign" }),
  ).toBeDisabled()
})
