export type SectionId =
  | 'hero'
  | 'projects'
  | 'command-center'
  | 'timeline'
  | 'skills'

export type ProjectItem = {
  id: string
  name: string
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
