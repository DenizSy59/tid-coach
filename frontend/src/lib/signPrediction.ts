/**
 * Where the sign-recognition model plugs into the website.
 *
 * Nothing here is a model. These are the shapes the pages already use, so the
 * model can be connected by filling in the two functions below and changing
 * nothing else in the UI.
 */

/** One guess from the model, as planned: sign id 0-225 plus a 0-1 confidence. */
export interface SignPrediction {
  sign_id: number
  confidence: number
}

/** Landmarks for a single frame, as MediaPipe returns them. */
export interface LandmarkFrame {
  x: number
  y: number
  z: number
}

/**
 * TODO (Deniz, ML): run the browser model over the recorded frames and return
 * the top guesses, best first. Returning an empty list means "not sure", and
 * the Translator page already shows that message.
 */
export async function predictSignFromLandmarks(
  _frames: LandmarkFrame[][],
): Promise<SignPrediction[]> {
  return []
}

/**
 * TODO (Deniz, ML): compare the user's frames with the reference sign and
 * return a 0-100 score, plus the sign the model thought it looked like.
 * Returning null means "no score yet", which the Teacher page already handles.
 */
export async function scoreAttempt(
  _signId: number,
  _frames: LandmarkFrame[][],
): Promise<{ score: number; looksLike: number | null } | null> {
  return null
}
