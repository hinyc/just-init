import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type DemoState = {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

export const useDemoStore = create<DemoState>()(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((s) => ({ count: s.count + 1 }), false, 'demo/increment'),
      decrement: () => set((s) => ({ count: s.count - 1 }), false, 'demo/decrement'),
      reset: () => set({ count: 0 }, false, 'demo/reset'),
    }),
    { name: 'demo-store' },
  ),
)
