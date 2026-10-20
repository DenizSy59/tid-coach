import { expect, test } from "@playwright/test"
import { setEnglish } from "./utils/language.ts"
import { createUser } from "./utils/privateApi.ts"
import { randomEmail, randomPassword } from "./utils/random.ts"
import { logInUser } from "./utils/user.ts"

test.beforeEach(async ({ page }) => {
  await setEnglish(page)
})

test.describe("Saved signs and practice history", () => {
  test.use({ storageState: { cookies: [], origins: [] } })
  let email: string
  const password = randomPassword()

  test.beforeAll(async () => {
    email = randomEmail()
    await createUser({ email, password })
  })

  test.beforeEach(async ({ page }) => {
    await logInUser(page, email, password)
  })

  test("A new account starts with nothing saved", async ({ page }) => {
    await page.goto("/my-signs")

    await expect(
      page.getByText("You have not saved any signs yet"),
    ).toBeVisible()
    await expect(page.getByText("No practice yet")).toBeVisible()
  })

  test("A sign can be saved, practised and removed", async ({ page }) => {
    await page.goto("/teacher?sign=5")

    // Save it.
    await page.getByRole("button", { name: "Save this sign" }).click()
    await expect(page.getByRole("button", { name: "Saved" })).toBeVisible()

    // Record one attempt.
    await page.getByRole("button", { name: "Check my sign" }).click()

    await page.goto("/my-signs")
    await expect(page.getByRole("cell", { name: "agac" }).first()).toBeVisible()
    // The progress summary counts the attempt.
    await expect(
      page.getByRole("cell", { name: "1", exact: true }),
    ).toBeVisible()

    // Remove it again.
    await page.getByRole("button", { name: "Remove" }).first().click()
    await expect(
      page.getByText("You have not saved any signs yet"),
    ).toBeVisible()
  })

  test("The same sign cannot be saved twice", async ({ page }) => {
    await page.goto("/teacher?sign=7")
    await page.getByRole("button", { name: "Save this sign" }).click()

    // Once saved the button is disabled, so a second save cannot be sent.
    await expect(page.getByRole("button", { name: "Saved" })).toBeDisabled()
  })

  test("Saved signs are private to the account", async ({ page, browser }) => {
    await page.goto("/teacher?sign=9")
    await page.getByRole("button", { name: "Save this sign" }).click()
    await expect(page.getByRole("button", { name: "Saved" })).toBeVisible()

    // A different account must not see it.
    const otherEmail = randomEmail()
    const otherPassword = randomPassword()
    await createUser({ email: otherEmail, password: otherPassword })

    const otherContext = await browser.newContext()
    const otherPage = await otherContext.newPage()
    await setEnglish(otherPage)
    await logInUser(otherPage, otherEmail, otherPassword)
    await otherPage.goto("/my-signs")

    await expect(
      otherPage.getByText("You have not saved any signs yet"),
    ).toBeVisible()
    await otherContext.close()
  })
})
