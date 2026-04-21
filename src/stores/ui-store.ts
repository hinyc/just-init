import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type UIState = {
  sidebarOpen: boolean
  commandPaletteOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      sidebarOpen: false,
      commandPaletteOpen: false,
      toggleSidebar: () =>
        set((s) => ({ sidebarOpen: !s.sidebarOpen }), false, 'ui/toggleSidebar'),
      setSidebarOpen: (open) => set({ sidebarOpen: open }, false, 'ui/setSidebarOpen'),
      setCommandPaletteOpen: (open) =>
        set({ commandPaletteOpen: open }, false, 'ui/setCommandPaletteOpen'),
    }),
    { name: 'ui-store' },
  ),
)
