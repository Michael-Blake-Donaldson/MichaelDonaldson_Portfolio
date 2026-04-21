import type { NavItem, ProjectItem } from '../types'

export const navItems: NavItem[] = [
  { id: 'hero', label: 'Neural Deck', shortcut: '1' },
  { id: 'projects', label: 'Project Vault', shortcut: '2' },
  { id: 'command-center', label: 'Command Center', shortcut: '3' },
  { id: 'timeline', label: 'Flux Timeline', shortcut: '4' },
  { id: 'skills', label: 'Skill Graph', shortcut: '5' },
]

export const projects: ProjectItem[] = [
  {
    id: 'orion',
    name: 'Orion Ops',
    headline: 'Realtime observability cockpit for distributed systems.',
    summary:
      'A kinetic analytics surface that translates telemetry noise into cinematic insight with predictive anomaly trails.',
    stack: ['React', 'TypeScript', 'WebGL', 'Kafka'],
    tags: ['Realtime', 'Data Viz', 'Product'],
    metrics: ['99.98% stream uptime', '42ms median render', '27% faster triage'],
    accent: 'from-neon/40 to-arc/30',
    demoHint: 'Press D to simulate live incident mode.',
  },
  {
    id: 'lattice',
    name: 'Lattice ID',
    headline: 'Biometric identity mesh with privacy-preserving edge auth.',
    summary:
      'Designed an adaptive trust graph that shifts auth strategy based on context, behavior signatures, and risk posture.',
    stack: ['Next.js', 'Rust', 'gRPC', 'PostgreSQL'],
    tags: ['Security', 'Edge', 'Platform'],
    metrics: ['3.4x faster sign-in', 'Zero P1 auth incidents', 'SOC2 automation'],
    accent: 'from-plasma/40 to-neon/30',
    demoHint: 'Hover trust nodes to inspect confidence deltas.',
  },
  {
    id: 'pulseforge',
    name: 'Pulseforge',
    headline: 'AI-assisted internal developer platform with intent routing.',
    summary:
      'Built a command-driven workflow engine that converts plain language into compliant, auditable delivery pipelines.',
    stack: ['React', 'Go', 'Temporal', 'OpenTelemetry'],
    tags: ['DX', 'AI', 'Automation'],
    metrics: ['61% deploy time reduction', '90% policy pass rate', '4 regions active'],
    accent: 'from-arc/40 to-plasma/30',
    demoHint: 'Use Ctrl+K to launch route commands instantly.',
  },
]

export const timelineEvents = [
  {
    year: '2022',
    title: 'Began Building Motion-First Interfaces',
    detail: 'Shifted from static dashboard design to narrative interaction systems.',
  },
  {
    year: '2023',
    title: 'Launched Multi-Region Platform Core',
    detail: 'Architected highly available services with progressive rollout controls.',
  },
  {
    year: '2024',
    title: 'Led Product Animation System',
    detail: 'Established shared motion primitives and performance budgets for UI teams.',
  },
  {
    year: '2025',
    title: 'Crafted AI-native Developer Experiences',
    detail: 'Built command-first workflows with strong guardrails and observability.',
  },
]

export const skillNodes = [
  { id: 'react', label: 'React', x: 12, y: 45, size: 1.2 },
  { id: 'ts', label: 'TypeScript', x: 28, y: 20, size: 1.1 },
  { id: 'motion', label: 'Motion Design', x: 48, y: 60, size: 1.35 },
  { id: 'gsap', label: 'GSAP', x: 66, y: 30, size: 1.05 },
  { id: 'systems', label: 'System Design', x: 82, y: 52, size: 1.25 },
  { id: 'dx', label: 'DevEx', x: 37, y: 78, size: 1.18 },
  { id: 'infra', label: 'Cloud Infra', x: 74, y: 78, size: 1.08 },
]

export const skillLinks = [
  ['react', 'ts'],
  ['ts', 'systems'],
  ['react', 'motion'],
  ['motion', 'gsap'],
  ['systems', 'infra'],
  ['dx', 'motion'],
  ['dx', 'react'],
]
