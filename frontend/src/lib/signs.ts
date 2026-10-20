/**
 * The TİD sign list and the search over it.
 *
 * The list comes from AUTSL's official SignList_ClassId_TR_EN.csv
 * (226 signs, class ids 0-225), kept in src/data next to the generated JSON.
 */
import signList from "@/data/signs.json"

export interface Sign {
  /** AUTSL class id, 0-225. */
  id: number
  /** Turkish word. */
  tr: string
  /** English word. */
  en: string
}

export const SIGNS: Sign[] = signList

/**
 * Makes Turkish letters comparable to plain ASCII, so "agac" finds "ağaç".
 * Dotless "ı" is handled on its own because it does not decompose.
 */
export function foldTurkish(value: string): string {
  return value
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
}

export function searchSigns(signs: Sign[], query: string): Sign[] {
  const needle = foldTurkish(query.trim())
  if (!needle) {
    return signs
  }
  return signs.filter(
    (sign) =>
      foldTurkish(sign.tr).includes(needle) ||
      foldTurkish(sign.en).includes(needle),
  )
}

/** The Turkish word for a sign id, or a plain label while the list is empty. */
export function signLabel(id: number): string {
  return SIGNS.find((sign) => sign.id === id)?.tr ?? `Sign ${id}`
}
