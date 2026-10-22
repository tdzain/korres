'use client'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface PrefsState {
  cookies: 'all' | 'essential' | null
  announcementClosed: boolean
  newsletter: 'subscribed' | 'dismissed' | null
  recentSearches: string[]
  setCookies: (v: 'all' | 'essential') => void
  closeAnnouncement: () => void
  setNewsletter: (v: 'subscribed' | 'dismissed') => void
  addSearch: (q: string) => void
  clearSearches: () => void
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      cookies: null,
      announcementClosed: false,
      newsletter: null,
      recentSearches: [],
      setCookies: (cookies) => set({ cookies }),
      closeAnnouncement: () => set({ announcementClosed: true }),
      setNewsletter: (newsletter) => set({ newsletter }),
      addSearch: (q) => set((s) => ({ recentSearches: [q, ...s.recentSearches.filter((x) => x !== q)].slice(0, 5) })),
      clearSearches: () => set({ recentSearches: [] }),
    }),
    { name: 'kr_prefs', storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
)
