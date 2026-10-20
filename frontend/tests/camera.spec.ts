import { expect, test } from "@playwright/test"
import { setEnglish } from "./utils/language.ts"

// Chrome's built-in fake webcam, so the camera path can be tested on a
// machine with no camera attached. launchOptions has to be top level.
test.use({
  launchOptions: {
    args: [
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
    ],
  },
  permissions: ["camera"],
})

test.beforeEach(async ({ page }) => {
  await setEnglish(page)
})

test("Starting and stopping the camera works on Teacher", async ({ page }) => {
  await page.goto("/teacher?sign=5")

  await page.getByRole("button", { name: "Start camera" }).click()

  // The button only turns into "Stop camera" once MediaPipe has loaded and
  // getUserMedia has handed over a stream.
  await expect(page.getByRole("button", { name: "Stop camera" })).toBeVisible({
    timeout: 30000,
  })

  const playing = await page
    .locator("video")
    .first()
    .evaluate(
      (video: HTMLVideoElement) => video.srcObject !== null && !video.paused,
    )
  expect(playing).toBe(true)

  await page.getByRole("button", { name: "Stop camera" }).click()
  await expect(page.getByRole("button", { name: "Start camera" })).toBeVisible()
})

test("The hand tracking starts on the Translator without errors", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))

  await page.goto("/translator")
  await page.getByRole("button", { name: "Start camera" }).click()
  await expect(page.getByRole("button", { name: "Stop camera" })).toBeVisible({
    timeout: 30000,
  })

  expect(errors).toEqual([])
})

test("The hand landmark files are served by the app, not a CDN", async ({
  page,
}) => {
  const outside: string[] = []
  page.on("request", (request) => {
    const url = request.url()
    if (!url.startsWith("http://localhost") && !url.startsWith("ws://")) {
      outside.push(url)
    }
  })

  await page.goto("/translator")
  await page.getByRole("button", { name: "Start camera" }).click()
  await expect(page.getByRole("button", { name: "Stop camera" })).toBeVisible({
    timeout: 30000,
  })

  // Nothing may be fetched from jsdelivr or Google: the demo must work offline.
  expect(outside).toEqual([])
})
