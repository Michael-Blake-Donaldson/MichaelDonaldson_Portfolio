import type { NavItem, ProjectItem } from '../types'
import drasticShot from '../assets/screenshots/mapSH.png'
import earthShot from '../assets/screenshots/Earth3d.png'
import plantShot from '../assets/screenshots/PHmain.jpeg'

export const navItems: NavItem[] = [
  { id: 'hero', label: 'Neural Deck', shortcut: '1' },
  { id: 'projects', label: 'Project Vault', shortcut: '2' },
  { id: 'command-center', label: 'Command Center', shortcut: '3' },
  { id: 'timeline', label: 'Flux Timeline', shortcut: '4' },
  { id: 'skills', label: 'Skill Graph', shortcut: '5' },
]

export const projects: ProjectItem[] = [
  {
    id: 'drastic-planner',
    name: 'DRASTIC Planner',
    image: drasticShot,
    overview:
      'A desktop decision-support system for humanitarian crisis scenario planning that transforms uncertain inputs into actionable operational insights across coverage, staffing, logistics, cost modeling, and risk analysis.',
    headline: 'Desktop scenario-planning system for high-stakes humanitarian operations.',
    summary:
      'Engineered as a modular, production-style simulation system where planners can branch scenarios, compare weighted outcomes, and generate evidence-backed operational recommendations.',
    coreFeatures: [
      'Scenario modeling with structured domain entities: hazard, population, infrastructure, resources, personnel, and transport',
      'Modular analysis pipeline: needs, staffing, transport, and cost stages',
      'Scenario branching, lineage tracking, risk flags, confidence scoring, and side-by-side comparisons',
      'Timeline simulation outputs and interactive geospatial map visualization',
      'Async background workers for heavy analysis and report generation',
      'SQLite persistence with audit logging and telemetry capture',
    ],
    techStack: {
      backend: ['Python 3.12 service layer and simulation modules'],
      frontend: ['PySide6 (Qt desktop UI)', 'Leaflet embedded via WebEngine'],
      database: ['SQLite'],
      other: ['Async worker patterns', 'PyInstaller packaging'],
    },
    architectureHighlights: [
      'Modular pipeline architecture allows independent computation stages and extensible analysis rules',
      'Strong separation between UI, domain logic, services, and persistence for maintainability',
      'Background worker orchestration keeps the desktop interface responsive during long-running simulations',
      'Scenario versioning and lineage model supports baseline-versus-variant decision analysis',
      'Web map integration inside native desktop runtime bridges geospatial context with planning logic',
    ],
    challengesSolved: [
      'Maintained responsive UX during expensive multi-stage computations by moving work off the UI thread',
      'Designed interpretable risk and confidence models that remain explainable to non-technical stakeholders',
      'Integrated web-based geospatial rendering into a native desktop architecture without breaking interaction flow',
      'Built extensible domain models to represent complex crisis simulation inputs and outputs',
    ],
    whyImpressive: [
      'Demonstrates strong system architecture under real-world complexity constraints',
      'Combines simulation, data modeling, and decision UX in one cohesive product',
      'Reflects real decision-support platform patterns used in industry and public-sector operations',
    ],
    systemFlow: ['Qt UI', 'Scenario Domain Model', 'Analysis Pipeline', 'Risk and Scoring Engine', 'SQLite and Reports'],
    stack: ['Python 3.12', 'PySide6', 'SQLite', 'Leaflet'],
    tags: ['Decision Systems', 'Simulation', 'Desktop Engineering'],
    metrics: ['Pipeline-stage analysis', 'Scenario lineage tracking', 'Async simulation workflows'],
    accent: 'from-neon/40 to-arc/30',
    demoHint: 'Explore baseline versus variant scenarios to inspect operational tradeoffs.',
  },
  {
    id: 'earth-3d-dashboard',
    name: 'Earth 3D Dashboard',
    image: earthShot,
    overview:
      'An interactive 3D Earth visualization platform that renders scientific datasets on a fully explorable globe with layered insights and story-driven educational context.',
    headline: 'WebGL-powered scientific globe with dynamic layered storytelling.',
    summary:
      'Designed as a graphics-heavy frontend system that balances rendering fidelity, interactive UX, and data-layer flexibility across devices.',
    coreFeatures: [
      'Interactive 3D globe with multiple mesh modes and map skins',
      'Toggleable scientific layers including climate, seismic, coral, aurora, carbon sinks, and energy hubs',
      'Story presets that reconfigure visual state for guided exploration',
      'Linked article and educational content system connected to active datasets',
      'Particle intro animation, atmospheric rendering, and quality/performance modes',
      'Fallback rendering path for unsupported or low-capability devices',
    ],
    techStack: {
      backend: ['Static pipeline with data preprocessing scripts'],
      frontend: ['Babylon.js', 'Vanilla JavaScript ES Modules', 'HTML and CSS'],
      database: ['Structured dataset bundles (JSON)'],
      other: ['Vitest', 'GitHub Actions CI/CD'],
    },
    architectureHighlights: [
      'Custom rendering layer built on Babylon.js with modular separation of scene, camera, lighting, and overlay systems',
      'Metadata-driven layer configuration enables dynamic overlays without rewriting rendering logic',
      'Data validation and transformation pipeline normalizes raw scientific sources into consistent visualization schema',
      'Frontend modules isolate rendering, UI controls, and data orchestration for maintainability',
      'Performance and fallback strategies balance quality and frame-rate on diverse hardware',
    ],
    challengesSolved: [
      'Managed real-time rendering performance across high-density visual layers',
      'Mapped heterogeneous scientific datasets onto a unified globe coordinate system',
      'Maintained smooth interactions across quality tiers and lower-powered devices',
      'Built a scalable ingestion workflow for adding new data layers safely',
    ],
    whyImpressive: [
      'Demonstrates advanced graphics and frontend systems engineering',
      'Shows deep understanding of render-performance tradeoffs',
      'Combines scientific data visualization, storytelling, and interaction design',
      'Highly differentiated from typical CRUD portfolio projects',
    ],
    systemFlow: ['Dataset Ingestion', 'Transform and Validation', 'Layer Registry', 'Babylon Renderer', 'Interactive Story UI'],
    stack: ['Babylon.js', 'JavaScript ES Modules', 'Vitest', 'GitHub Actions'],
    tags: ['WebGL', 'Data Visualization', 'Rendering Systems'],
    metrics: ['Dynamic scientific layers', 'Performance quality modes', 'Metadata-driven scene config'],
    accent: 'from-plasma/40 to-neon/30',
    demoHint: 'Toggle story presets to inspect how data overlays reconfigure the globe.',
  },
  {
    id: 'plant-haven',
    name: 'Plant Haven',
    image: plantShot,
    overview:
      'A full-stack e-commerce platform for plant shopping with secure payments, auth, recommendations, and production-oriented deployment infrastructure.',
    headline: 'Serverless commerce platform with secure checkout and personalized shopping flows.',
    summary:
      'Built as an end-to-end product system from catalog browsing through order processing, with strong focus on payment integrity and reliable state synchronization.',
    coreFeatures: [
      'Product catalog with advanced filtering, search, wishlist, and recently viewed tracking',
      'Realtime cart updates and persistent order history with Supabase',
      'Stripe checkout with secure server-side validation and webhook handling',
      'Authentication and protected routes for account-specific workflows',
      'Interactive plant-care quiz and recommendation logic',
      'PWA support with offline caching and installable app behavior',
    ],
    techStack: {
      backend: ['Netlify Serverless Functions'],
      frontend: ['HTML', 'CSS', 'JavaScript'],
      database: ['Supabase PostgreSQL'],
      other: ['Stripe API and Webhooks', 'Supabase Auth', 'Netlify Hosting'],
    },
    architectureHighlights: [
      'Serverless backend handles checkout, payment verification, and order write paths',
      'Stripe webhook verification enforces trusted payment state transitions',
      'Auth-aware data access patterns protect user-specific cart and order resources',
      'Client state architecture coordinates cart, wishlist, and browsing context with backend persistence',
      'Performance layer includes caching, lazy-loading, and responsive rendering optimization',
    ],
    challengesSolved: [
      'Designed secure payment processing that avoids client-side trust assumptions',
      'Synchronized frontend state transitions with asynchronous serverless backend operations',
      'Implemented robust auth and protected-route workflows without degrading UX',
      'Balanced feature richness with responsive UI performance and mobile usability',
    ],
    whyImpressive: [
      'Demonstrates complete full-stack product delivery from UI to payments and deployment',
      'Covers production-critical concerns: auth, payments, persistence, and reliability',
      'Reflects real-world e-commerce architecture and customer flow complexity',
      'Shows strong end-to-end engineering ownership and product execution',
    ],
    systemFlow: ['Client Storefront', 'Serverless API', 'Stripe Checkout', 'Webhook Verifier', 'Supabase Orders'],
    stack: ['JavaScript', 'Netlify Functions', 'Supabase', 'Stripe'],
    tags: ['Full Stack', 'Serverless', 'E-Commerce'],
    metrics: ['Secure webhook flow', 'Auth-protected user state', 'PWA-ready experience'],
    accent: 'from-arc/40 to-plasma/30',
    demoHint: 'Run through checkout simulation and inspect webhook-backed order state.',
  },
]

export const timelineEvents = [
  {
    year: '2024',
    planet: 'Astra Unscripted',
    title: 'Full Stack Software Engineer Intern',
    company: 'Unscripted Inc (Remote)',
    period: 'May 2024 - September 2024',
    summary:
      'Shipped production web features in Agile Scrum workflows while contributing to responsive UI delivery, debugging, performance tuning, and system design discussions across a real engineering team.',
    signals: [
      'Worked in Agile sprints, standups, and retrospectives with cross-functional collaboration',
      'Built and maintained web applications with HTML, CSS, JavaScript, and modern frontend frameworks',
      'Tested, debugged, and optimized applications for performance and cross-platform behavior',
      'Participated in architecture discussions and supported teammates with technical troubleshooting',
    ],
  },
  {
    year: '2022-2024',
    planet: 'Titan Target',
    title: 'General Merchandise Manager',
    company: 'Target',
    period: 'Leadership and Operations',
    summary:
      'Owned high-scale retail operations with data-informed decision loops, translating directly to systems thinking, optimization, and reliability discipline in software engineering.',
    signals: [
      'Managed operations producing 8M to 12M annually with ownership over complex workflows',
      'Led teams of 15 to 30 and managed inventory systems spanning 10,000+ SKUs at 98%+ accuracy',
      'Reduced shrink by 15% while driving 5 to 10% growth through process and performance tuning',
      'Applied analytical decision making under pressure in high-variability environments',
    ],
  },
  {
    year: 'Prior Experience',
    planet: 'Orion Disney',
    title: 'Operations Coordinator',
    company: 'Disney',
    period: 'Multi-Department Coordination',
    summary:
      'Coordinated people, systems, and dependencies across multiple departments, reinforcing distributed-systems style thinking around orchestration, bottlenecks, and throughput.',
    signals: [
      'Managed 52+ employees across 6 departments with synchronized execution requirements',
      'Improved inventory systems by 18% through process redesign and workflow refinement',
      'Built training systems to improve consistency, speed to competency, and execution quality',
    ],
  },
  {
    year: 'Prior Experience',
    planet: 'Nova Arbys',
    title: 'General Manager',
    company: "Arby's",
    period: 'Performance and Team Leadership',
    summary:
      'Led under pressure with a strong optimization mindset, improving retention and business outcomes through operational experimentation and continuous improvement.',
    signals: [
      'Increased retention from 67% to 92% through structured coaching and process accountability',
      'Increased revenue by 34% using targeted operational improvements and execution discipline',
      'Built leadership habits that transfer to engineering ownership and delivery reliability',
    ],
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
