import { expect, test } from "@playwright/test"
import { firstSuperuser, firstSuperuserPassword } from "./config.ts"
import { setEnglish } from "./utils/language.ts"

// The service worker only exists in a real build. Run this suite with
// PLAYWRIGHT_BASE_URL=http://localhost:8000, where the backend serves it.
test.use({ storageState: { cookies: [], origins: [] } })

// The dev server has no service worker, so these only mean something against
// a build. Run them with:
//   PLAYWRIGHT_BASE_URL=http://localhost:8000 bunx playwright test offline
test.skip(
  !process.env.PLAYWRIGHT_BASE_URL,
  "needs the built app, not the dev server",
)

async function openInstalledApp(page) {
  await setEnglish(page)
  await page.goto("/login")
  await page.getByTestId("email-input").fill(firstSuperuser)
  await page.getByTestId("password-input").fill(firstSuperuserPassword)
  await page.getByRole("button", { name: "Log In" }).click()
  await page.waitForURL("/")

  // Wait until the service worker is not just registered but in charge.
  await page.waitForFunction(
    () => navigator.serviceWorker.controller !== null,
    null,
    { timeout: 30000 },
  )
}

test("The app installs a service worker and a manifest", async ({ page }) => {
  await openInstalledApp(page)

  const manifestHref = await page
    .locator('link[rel="manifest"]')
    .getAttribute("href")
  expect(manifestHref).toBeTruthy()

  const manifest = await page.evaluate(async (href) => {
    const response = await fetch(href as string)
    return response.json()
  }, manifestHref)

  expect(manifest.name).toBe("TİD Coach")
  expect(manifest.display).toBe("standalone")
  expect(manifest.icons.length).toBeGreaterThanOrEqual(2)
})

test("The dictionary still works with the network cut", async ({
  page,
  context,
}) => {
  await openInstalledApp(page)
  await page.goto("/dictionary")
  await expect(
    page.getByRole("cell", { name: "agac", exact: true }),
  ).toBeVisible()

  await context.setOffline(true)

  // Opening the installed app again with no network at all, which is what
  // happens when someone taps the icon on a phone with no signal.
  const offlinePage = await context.newPage()
  await offlinePage.goto("/dictionary")

  // The 226 signs are bundled into the app, so no server is needed.
  await expect(
    offlinePage.getByRole("heading", { name: "Dictionary" }),
  ).toBeVisible()
  await expect(
    offlinePage.getByRole("cell", { name: "agac", exact: true }),
  ).toBeVisible()

  await offlinePage.getByPlaceholder("Search a sign").fill("ağaç")
  await expect(
    offlinePage.getByRole("cell", { name: "agac", exact: true }),
  ).toBeVisible()

  await offlinePage.close()
  await context.setOffline(false)
})

test("Moving between pages works with the network cut", async ({
  page,
  context,
}) => {
  await openInstalledApp(page)
  await page.goto("/dictionary")
  await page.goto("/teacher")
  await expect(page.getByRole("heading", { name: "Teacher" })).toBeVisible()

  await context.setOffline(true)

  await page.goto("/dictionary")
  await expect(page.getByRole("heading", { name: "Dictionary" })).toBeVisible()

  await context.setOffline(false)
})
