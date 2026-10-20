import { test as setup } from "@playwright/test"
import { firstSuperuser, firstSuperuserPassword } from "./config.ts"
import { setEnglish } from "./utils/language.ts"

const authFile = "playwright/.auth/user.json"

setup("authenticate", async ({ page }) => {
  await setEnglish(page)
  await page.goto("/login")
  await page.getByTestId("email-input").fill(firstSuperuser)
  await page.getByTestId("password-input").fill(firstSuperuserPassword)
  await page.getByRole("button", { name: "Log In" }).click()
  await page.waitForURL("/")
  await page.context().storageState({ path: authFile })
})
