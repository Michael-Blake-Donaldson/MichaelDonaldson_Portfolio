import { create } from 'zustand'

type PowerGridState = {
  activeProjectId: string | null
  hoveredSkillId: string | null
  selectedSkillId: string | null
  setActiveProjectId: (id: string | null) => void
  setHoveredSkillId: (id: string | null) => void
  setSelectedSkillId: (id: string | null) => void
}

export const usePowerGridStore = create<PowerGridState>((set) => ({
  activeProjectId: null,
  hoveredSkillId: null,
  selectedSkillId: null,
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  setHoveredSkillId: (id) => set({ hoveredSkillId: id }),
  setSelectedSkillId: (id) => set({ selectedSkillId: id }),
}))
