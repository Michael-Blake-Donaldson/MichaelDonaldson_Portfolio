import { create } from 'zustand'

type PowerGridState = {
  gameStarted: boolean
  gamePaused: boolean
  currentWave: number
  systemHealth: number
  gridStability: number
  score: number
  combo: number
  threatsContained: number
  audioEnabled: boolean
  gamePhase: 'intro' | 'running' | 'summary'
  unlockedSkillIds: string[]
  activeProjectId: string | null
  hoveredSkillId: string | null
  selectedSkillId: string | null
  setGameStarted: (value: boolean) => void
  setGamePaused: (value: boolean) => void
  setCurrentWave: (value: number) => void
  setSystemHealth: (value: number) => void
  setGridStability: (value: number) => void
  setScore: (value: number) => void
  setCombo: (value: number) => void
  setThreatsContained: (value: number) => void
  setAudioEnabled: (value: boolean) => void
  setGamePhase: (value: 'intro' | 'running' | 'summary') => void
  setUnlockedSkillIds: (ids: string[]) => void
  setActiveProjectId: (id: string | null) => void
  setHoveredSkillId: (id: string | null) => void
  setSelectedSkillId: (id: string | null) => void
  resetGame: () => void
}

export const usePowerGridStore = create<PowerGridState>((set) => ({
  gameStarted: false,
  gamePaused: false,
  currentWave: 1,
  systemHealth: 100,
  gridStability: 100,
  score: 0,
  combo: 0,
  threatsContained: 0,
  audioEnabled: true,
  gamePhase: 'intro',
  unlockedSkillIds: [],
  activeProjectId: null,
  hoveredSkillId: null,
  selectedSkillId: null,
  setGameStarted: (value) => set({ gameStarted: value }),
  setGamePaused: (value) => set({ gamePaused: value }),
  setCurrentWave: (value) => set({ currentWave: value }),
  setSystemHealth: (value) => set({ systemHealth: value }),
  setGridStability: (value) => set({ gridStability: value }),
  setScore: (value) => set({ score: value }),
  setCombo: (value) => set({ combo: value }),
  setThreatsContained: (value) => set({ threatsContained: value }),
  setAudioEnabled: (value) => set({ audioEnabled: value }),
  setGamePhase: (value) => set({ gamePhase: value }),
  setUnlockedSkillIds: (ids) => set({ unlockedSkillIds: ids }),
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  setHoveredSkillId: (id) => set({ hoveredSkillId: id }),
  setSelectedSkillId: (id) => set({ selectedSkillId: id }),
  resetGame: () => set({
    gameStarted: false,
    gamePaused: false,
    currentWave: 1,
    systemHealth: 100,
    gridStability: 100,
    score: 0,
    combo: 0,
    threatsContained: 0,
    gamePhase: 'intro',
    activeProjectId: null,
    hoveredSkillId: null,
    selectedSkillId: null,
    unlockedSkillIds: [],
  }),
}))
