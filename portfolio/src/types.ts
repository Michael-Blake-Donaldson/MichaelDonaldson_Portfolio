export type SectionId =
  | 'hero'
  | 'projects'
  | 'command-center'
  | 'timeline'
  | 'skills'

export type ProjectItem = {
  id: string
  name: string
  image: string
  overview: string
  headline: string
  summary: string
  coreFeatures: string[]
  techStack: {
    backend: string[]
    frontend: string[]
    database: string[]
    other: string[]
  }
  architectureHighlights: string[]
  challengesSolved: string[]
  whyImpressive: string[]
  systemFlow: string[]
  stack: string[]
  tags: string[]
  metrics: string[]
  accent: string
  demoHint: string
}

export type NavItem = {
  id: SectionId
  label: string
  shortcut: string
}

export type GridConnectionType = 'strong' | 'weak' | 'indirect'

export type PowerGridProject = {
  id: string
  name: string
  description: string
  powerOutput: number
  color: string
  connectedSkills: string[]
}

export type PowerGridSkill = {
  id: string
  name: string
  category: 'frontend' | 'backend' | 'system' | 'platform' | 'data' | 'quality'
  strength: number
  connections: string[]
  relatedProjects: string[]
  description: string
  impact: {
    scalability: number
    decomposition: number
    architecture: number
    performance: number
  }
  x: number
  y: number
}

export type PowerGridConnection = {
  sourceSkillId: string
  targetSkillId: string
  weight: number
  type: GridConnectionType
}
