import { expect, test } from "@playwright/test"
import { setEnglish } from "./utils/language.ts"

test.beforeEach(async ({ page }) => {
  await setEnglish(page)
})

test("Translator shows both ways of signing a word", async ({ page }) => {
  await page.goto("/translator")

  await expect(page.getByRole("heading", { name: "Translator" })).toBeVisible()
  await expect(page.getByRole("tab", { name: "Live camera" })).toBeVisible()
  await expect(page.getByRole("tab", { name: "Upload video" })).toBeVisible()
})

test("Live camera tab offers to start the camera", async ({ page }) => {
  await page.goto("/translator")

  await expect(page.getByRole("button", { name: "Start camera" })).toBeVisible()
  await expect(page.getByText("Start the camera, sign a word")).toBeVisible()
})

test("Upload tab lets a video be chosen", async ({ page }) => {
  await page.goto("/translator")
  await page.getByRole("tab", { name: "Upload video" }).click()

  await expect(
    page.getByRole("button", { name: "Choose a video" }),
  ).toBeVisible()
  await expect(page.getByText("No file chosen")).toBeVisible()
  await expect(
    page.getByText("The video is deleted from the server"),
  ).toBeVisible()
})

test("Uploading a video returns guesses", async ({ page }) => {
  await page.goto("/translator")
  await page.getByRole("tab", { name: "Upload video" }).click()

  // The smallest thing the server accepts as an MP4: the ftyp box.
  await page.locator('input[type="file"]').setInputFiles({
    name: "sign.mp4",
    mimeType: "video/mp4",
    buffer: Buffer.concat([
      Buffer.from("00000018", "hex"),
      Buffer.from("ftypmp42"),
      Buffer.alloc(256),
    ]),
  })
  await expect(page.getByText("sign.mp4")).toBeVisible()

  await page.getByRole("button", { name: "Upload and translate" }).click()

  // The model is not connected yet, so the honest answer is "not sure".
  await expect(page.getByText("Not sure which sign that was")).toBeVisible()
})

test("A file that is not a video is refused", async ({ page }) => {
  await page.goto("/translator")
  await page.getByRole("tab", { name: "Upload video" }).click()

  // A GIF wearing an .mp4 name, which the server must still refuse.
  await page.locator('input[type="file"]').setInputFiles({
    name: "sign.mp4",
    mimeType: "video/mp4",
    buffer: Buffer.concat([Buffer.from("GIF89a"), Buffer.alloc(256)]),
  })
  await page.getByRole("button", { name: "Upload and translate" }).click()

  await expect(page.getByText("Could not translate the video")).toBeVisible()
})
