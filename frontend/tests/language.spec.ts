import { expect, test } from "@playwright/test"
import { firstSuperuser, firstSuperuserPassword } from "./config.ts"

// These tests check the language itself, so they must not pin it.
test.use({ storageState: { cookies: [], origins: [] } })

test("The app starts in Turkish", async ({ page }) => {
  await page.goto("/login")

  await expect(
    page.getByRole("heading", { name: "Hesabına giriş yap" }),
  ).toBeVisible()
  await expect(page.getByRole("button", { name: "Giriş yap" })).toBeVisible()
})

test("Language can be changed before signing in", async ({ page }) => {
  await page.goto("/login")

  await page.getByTestId("language-button").click()
  await page.getByRole("menuitem", { name: "English" }).click()

  await expect(
    page.getByRole("heading", { name: "Login to your account" }),
  ).toBeVisible()
})

test("The chosen language survives a reload", async ({ page }) => {
  await page.goto("/login")
  await page.getByTestId("language-button").click()
  await page.getByRole("menuitem", { name: "English" }).click()
  await expect(
    page.getByRole("heading", { name: "Login to your account" }),
  ).toBeVisible()

  await page.reload()

  await expect(
    page.getByRole("heading", { name: "Login to your account" }),
  ).toBeVisible()
})

test("The chosen language is kept after signing in", async ({ page }) => {
  await page.goto("/login")
  await page.getByTestId("language-button").click()
  await page.getByRole("menuitem", { name: "English" }).click()

  await page.getByTestId("email-input").fill(firstSuperuser)
  await page.getByTestId("password-input").fill(firstSuperuserPassword)
  await page.getByRole("button", { name: "Log In" }).click()

  await page.waitForURL("/")
  await expect(
    page.getByText("Welcome back, nice to see you again!"),
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Dictionary", exact: true }),
  ).toBeVisible()
})

test("Validation messages follow the language", async ({ page }) => {
  await page.goto("/login")

  await page.getByTestId("email-input").fill("not-an-email")
  await page.getByTestId("password-input").click()
  await expect(page.getByText("Geçersiz e-posta adresi")).toBeVisible()

  await page.getByTestId("language-button").click()
  await page.getByRole("menuitem", { name: "English" }).click()

  // A message already on screen keeps the language it was written in. The
  // rules themselves are rebuilt, so the next check comes back in English.
  await page.getByTestId("email-input").fill("still-not-an-email")
  await page.getByTestId("password-input").click()
  await expect(page.getByText("Invalid email address")).toBeVisible()
})

test("The page language attribute follows the chosen language", async ({
  page,
}) => {
  await page.goto("/login")
  await expect(page.locator("html")).toHaveAttribute("lang", "tr")

  await page.getByTestId("language-button").click()
  await page.getByRole("menuitem", { name: "English" }).click()

  // Screen readers need this to switch voice with the wording.
  await expect(page.locator("html")).toHaveAttribute("lang", "en")
})
