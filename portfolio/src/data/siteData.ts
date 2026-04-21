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
    overview:
      'A full-stack academic operations platform for students to plan semesters, track assignments, and coordinate team projects in one workflow.',
    headline: 'Student-focused task and study planner with a clean, mobile-first UI.',
    summary:
      'Built as a portfolio-grade application to practice state management, reusable components, and accessible interaction patterns.',
    coreFeatures: [
      'Semester planner with dependency-aware assignment timelines',
      'Team workspace with shared tasks and role-based permissions',
      'Deadline risk scoring with proactive reminder pipeline',
    ],
    techStack: {
      backend: ['Node.js', 'Express', 'JWT auth middleware'],
      frontend: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
      database: ['PostgreSQL'],
      other: ['Zod validation', 'REST API', 'Render deployment'],
    },
    architectureHighlights: [
      'Layered backend architecture: routing, service, and data-access layers for clear separation of concerns',
      'Frontend state is normalized around domain entities (courses, assignments, teams) to reduce update complexity',
      'Notification worker runs asynchronous reminder batches to avoid blocking request latency',
    ],
    challengesSolved: [
      'Resolved deadline timezone drift by converting all scheduling logic to UTC at storage boundaries',
      'Prevented duplicate reminder storms using idempotency keys on queued notification jobs',
      'Reduced render thrash in planner views by memoizing timeline computations',
    ],
    whyImpressive: [
      'Handles real scheduling complexity rather than simple CRUD forms',
      'Demonstrates async job processing and resilient API design',
      'Balances UX polish with backend data integrity concerns',
    ],
    systemFlow: ['Client', 'API Gateway', 'Planner Service', 'PostgreSQL', 'Reminder Worker'],
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
    tags: ['Frontend', 'UX', 'Student Project'],
    metrics: ['Responsive layouts', 'Keyboard-friendly navigation', 'Reusable component architecture'],
    accent: 'from-neon/40 to-arc/30',
    demoHint: 'Try switching views and toggling interaction modes for UX testing.',
  },
  {
    id: 'algorithm-lab',
    name: 'Algorithm Lab',
    overview:
      'An interactive engineering sandbox that visualizes algorithm execution and data structure state transitions for learning and debugging.',
    headline: 'Interactive visualizer for core data structures and algorithms.',
    summary:
      'Created to strengthen computer science fundamentals by showing runtime behavior, edge cases, and step-by-step execution.',
    coreFeatures: [
      'Deterministic step execution engine with rewind and replay controls',
      'Complexity dashboard that profiles operation counts and execution phases',
      'Input scenario generator for worst-case and average-case analysis',
    ],
    techStack: {
      backend: ['Node.js microservice for profiling'],
      frontend: ['React', 'TypeScript', 'SVG rendering', 'Framer Motion'],
      database: ['SQLite for scenario persistence'],
      other: ['Vitest', 'Module-level benchmarks', 'Web Workers'],
    },
    architectureHighlights: [
      'Algorithm execution core runs in a worker thread to keep UI frames smooth during heavy simulation',
      'State snapshots are versioned so users can scrub timeline history without recomputing every step',
      'Profiling API returns normalized metrics to compare algorithms on identical inputs',
    ],
    challengesSolved: [
      'Handled high-frequency visualization updates by batching DOM writes through animation frames',
      'Solved replay drift by storing immutable snapshot checkpoints at deterministic intervals',
      'Validated correctness with property-based tests against edge-case generators',
    ],
    whyImpressive: [
      'Combines CS theory with production-style instrumentation and benchmarking',
      'Shows clear async and performance engineering decisions',
      'Built for scale in input size while preserving a fluid frontend experience',
    ],
    systemFlow: ['Input Generator', 'Worker Runtime', 'Profiling API', 'Snapshot Store', 'Visualizer'],
    stack: ['TypeScript', 'React', 'Framer Motion', 'Jest'],
    tags: ['Computer Science', 'Education', 'Visualization'],
    metrics: ['Step-through execution views', 'Tested utility modules', 'Clear complexity explanations'],
    accent: 'from-plasma/40 to-neon/30',
    demoHint: 'Hover and inspect nodes to understand algorithm flow.',
  },
  {
    id: 'career-compass',
    name: 'Career Compass',
    overview:
      'A career operations system that centralizes applications, interview loops, and follow-up workflows for internship and junior engineering roles.',
    headline: 'Full-stack job application tracker for internship and junior SWE roles.',
    summary:
      'Designed to solve a real personal workflow: organize applications, interview notes, and follow-up tasks in one place.',
    coreFeatures: [
      'Pipeline stages with transition rules and audit trail history',
      'Interview prep vault linking company notes, questions, and outcomes',
      'Analytics layer for response rates and funnel conversion tracking',
    ],
    techStack: {
      backend: ['Express', 'REST API', 'Role-aware middleware'],
      frontend: ['React', 'TypeScript', 'Tailwind', 'cmdk command palette'],
      database: ['PostgreSQL'],
      other: ['Prisma ORM', 'Cron jobs', 'CSV export tooling'],
    },
    architectureHighlights: [
      'Entity model supports normalized relationships between applications, interviews, contacts, and notes',
      'Analytics endpoints aggregate by stage to avoid expensive client-side recomputation',
      'Background scheduler automates reminders and stale-application checks',
    ],
    challengesSolved: [
      'Solved race conditions during stage transitions with transactional updates',
      'Prevented stale analytics by introducing cached materialized rollups refreshed on write',
      'Improved command navigation discoverability with keyboard-first UX design',
    ],
    whyImpressive: [
      'Implements a real operational workflow with non-trivial domain modeling',
      'Demonstrates data consistency, analytics, and automation in one system',
      'Shows product thinking backed by engineering rigor',
    ],
    systemFlow: ['UI Command Layer', 'Applications API', 'Domain Services', 'PostgreSQL', 'Scheduler'],
    stack: ['React', 'Node.js', 'Express', 'PostgreSQL'],
    tags: ['Full Stack', 'Career Tooling', 'Portfolio Project'],
    metrics: ['CRUD workflow coverage', 'REST API integration', 'Deployment-ready architecture'],
    accent: 'from-arc/40 to-plasma/30',
    demoHint: 'Use Ctrl+K to jump quickly between sections and project views.',
  },
  {
    id: 'relay-room',
    name: 'Relay Room',
    overview:
      'A real-time collaboration environment for coding study groups with synchronized sessions, chat, and event streams.',
    headline: 'Realtime collaboration system for pair programming and study teams.',
    summary:
      'Engineered to explore event-driven architecture patterns, socket communication reliability, and concurrency-aware UX.',
    coreFeatures: [
      'Realtime room synchronization with presence and typing indicators',
      'Event timeline replay for session review and debugging',
      'Role-based moderation controls and rate-limited messaging',
    ],
    techStack: {
      backend: ['Node.js', 'Socket.IO', 'Redis pub/sub'],
      frontend: ['React', 'TypeScript', 'Framer Motion'],
      database: ['PostgreSQL for persistent room/session records'],
      other: ['Nginx reverse proxy', 'Dockerized local stack'],
    },
    architectureHighlights: [
      'WebSocket gateway handles low-latency bidirectional events while HTTP API handles persistence boundaries',
      'Redis pub/sub fans out room events to support horizontal process scaling',
      'Client reconciles out-of-order events using sequence numbers and optimistic state rollback',
    ],
    challengesSolved: [
      'Fixed message duplication under reconnect storms with server-issued message IDs',
      'Reduced event latency spikes by separating broadcast and persistence paths',
      'Hardened room lifecycle logic with heartbeat-based presence cleanup',
    ],
    whyImpressive: [
      'Demonstrates real-time system design and distributed event handling',
      'Balances low latency UX with durable data storage',
      'Includes reliability controls usually missing in student realtime apps',
    ],
    systemFlow: ['Client Socket', 'Realtime Gateway', 'Redis Bus', 'Persistence API', 'PostgreSQL'],
    stack: ['React', 'Node.js', 'Socket.IO', 'Redis'],
    tags: ['Realtime', 'Distributed Systems', 'Collaboration'],
    metrics: ['Sub-second event fanout', 'Reconnect-safe sessions', 'Scalable room architecture'],
    accent: 'from-neon/35 to-plasma/35',
    demoHint: 'Open multiple tabs to simulate concurrent room participants.',
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
