export type SectionId =
  | 'hero'
  | 'projects'
  | 'command-center'
  | 'timeline'
  | 'skills'

export type ProjectItem = {
  id: string
  name: string
  headline: string
  summary: string
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
