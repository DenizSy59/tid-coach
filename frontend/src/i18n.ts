/**
 * Interface language. Turkish is the default; English can be chosen from the
 * sidebar. Set up following the react-i18next "getting started" example.
 */
import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import en from "./locales/en.json"
import tr from "./locales/tr.json"

export const LANGUAGES = {
  tr: "Türkçe",
  en: "English",
} as const

export type Language = keyof typeof LANGUAGES

const STORAGE_KEY = "tid-coach-language"

function storedLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === "tr" || saved === "en") {
      return saved
    }
  } catch {
    // Private windows and blocked storage: fall back to Turkish.
  }
  return "tr"
}

i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
  },
  lng: storedLanguage(),
  fallbackLng: "tr",
  interpolation: { escapeValue: false },
})

export function setLanguage(language: Language) {
  i18n.changeLanguage(language)
  try {
    localStorage.setItem(STORAGE_KEY, language)
  } catch {
    // Not being able to remember the choice is not an error.
  }
}

export default i18n
