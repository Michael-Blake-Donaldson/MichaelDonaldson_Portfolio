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
    id: 'campus-hub',
    name: 'Campus Hub',
    headline: 'Student-focused task and study planner with a clean, mobile-first UI.',
    summary:
      'Built as a portfolio-grade application to practice state management, reusable components, and accessible interaction patterns.',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
    tags: ['Frontend', 'UX', 'Student Project'],
    metrics: ['Responsive layouts', 'Keyboard-friendly navigation', 'Reusable component architecture'],
    accent: 'from-neon/40 to-arc/30',
    demoHint: 'Try switching views and toggling interaction modes for UX testing.',
  },
  {
    id: 'algorithm-lab',
    name: 'Algorithm Lab',
    headline: 'Interactive visualizer for core data structures and algorithms.',
    summary:
      'Created to strengthen computer science fundamentals by showing runtime behavior, edge cases, and step-by-step execution.',
    stack: ['TypeScript', 'React', 'Framer Motion', 'Jest'],
    tags: ['Computer Science', 'Education', 'Visualization'],
    metrics: ['Step-through execution views', 'Tested utility modules', 'Clear complexity explanations'],
    accent: 'from-plasma/40 to-neon/30',
    demoHint: 'Hover and inspect nodes to understand algorithm flow.',
  },
  {
    id: 'career-compass',
    name: 'Career Compass',
    headline: 'Full-stack job application tracker for internship and junior SWE roles.',
    summary:
      'Designed to solve a real personal workflow: organize applications, interview notes, and follow-up tasks in one place.',
    stack: ['React', 'Node.js', 'Express', 'PostgreSQL'],
    tags: ['Full Stack', 'Career Tooling', 'Portfolio Project'],
    metrics: ['CRUD workflow coverage', 'REST API integration', 'Deployment-ready architecture'],
    accent: 'from-arc/40 to-plasma/30',
    demoHint: 'Use Ctrl+K to jump quickly between sections and project views.',
  },
]

export const timelineEvents = [
  {
    year: '2023',
    title: 'Started Computer Science Path',
    detail: 'Committed to software engineering and began structured learning in programming fundamentals.',
  },
  {
    year: '2024',
    title: 'SNHU Coursework and Portfolio Buildout',
    detail: 'Applied coursework concepts by building practical projects focused on frontend and full-stack foundations.',
  },
  {
    year: '2025',
    title: 'Advanced Project Work and Technical Growth',
    detail: 'Expanded into API integration, testing, and performance-minded UI engineering patterns.',
  },
  {
    year: '2026',
    title: 'Targeting Internship and Junior SWE Roles',
    detail: 'Actively refining this portfolio and pursuing software engineering opportunities with strong mentorship.',
  },
]

export const skillNodes = [
  { id: 'react', label: 'React', x: 12, y: 45, size: 1.2 },
  { id: 'ts', label: 'TypeScript', x: 28, y: 20, size: 1.1 },
  { id: 'motion', label: 'UI Animation', x: 48, y: 60, size: 1.35 },
  { id: 'gsap', label: 'GSAP', x: 66, y: 30, size: 1.05 },
  { id: 'systems', label: 'Algorithms', x: 82, y: 52, size: 1.25 },
  { id: 'dx', label: 'Git and CI', x: 37, y: 78, size: 1.18 },
  { id: 'infra', label: 'SQL and APIs', x: 74, y: 78, size: 1.08 },
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
