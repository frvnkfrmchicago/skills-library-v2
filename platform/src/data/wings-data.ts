import {
  Hammer,
  Palette,
  Rocket,
  ShieldCheck,
  Smartphone,
  PenTool,
  Brain,
  Server,
  type LucideIcon,
} from 'lucide-react'

export interface WingLibrarian {
  id: string
  name: string
  role: string
}

export interface Wing {
  id: string
  name: string
  description: string
  whenToUse: string
  activationPrompt: string
  icon: LucideIcon
  color: string
  gradient: string
  librarians: WingLibrarian[]
}

export const wings: Wing[] = [
  {
    id: 'build',
    name: 'Build',
    description: 'Everything needed to build a new application or add significant features from the ground up.',
    whenToUse: 'Starting a new app, adding a major feature, or scaffolding a project.',
    activationPrompt: 'Open the Build Wing',
    icon: Hammer,
    color: 'coral',
    gradient: 'linear-gradient(135deg, #7a5050 0%, #5a3838 100%)',
    librarians: [
      { id: 'librarians-experience-designer-librarian', name: 'Experience Designer', role: 'Design tokens and visual system' },
      { id: 'librarians-typography-librarian', name: 'Typography', role: 'Type scale and font cascade' },
      { id: 'librarians-components-librarian', name: 'Components', role: 'Interactive component patterns' },
      { id: 'librarians-flow-librarian', name: 'Flow', role: 'User story flows (auth, onboarding, payment)' },
      { id: 'librarians-copywriting-librarian', name: 'Copywriting', role: 'UI text, error messages, labels' },
      { id: 'librarians-anti-mock-data-librarian', name: 'Anti-Mock Data', role: 'Real data from the start' },
      { id: 'librarians-mobile-first-librarian', name: 'Mobile-First', role: 'Responsive, touch-first design' },
    ],
  },
  {
    id: 'design',
    name: 'Design',
    description: 'Visual design work, UI decisions, creating or refining the look and feel of a project.',
    whenToUse: 'Designing a UI, visual overhaul, or making something look premium.',
    activationPrompt: 'Open the Design Wing',
    icon: Palette,
    color: 'cyan',
    gradient: 'linear-gradient(135deg, #5a8a9e 0%, #4a7080 100%)',
    librarians: [
      { id: 'librarians-experience-designer-librarian', name: 'Experience Designer', role: 'Token system, color, spacing' },
      { id: 'librarians-typography-librarian', name: 'Typography', role: 'Type hierarchy, font selection' },
      { id: 'librarians-animation-librarian', name: 'Animation', role: 'Motion design, micro-interactions' },
      { id: 'librarians-3d-librarian', name: '3D', role: '3D elements, WebGL effects' },
      { id: 'librarians-components-librarian', name: 'Components', role: 'Interactive component behavior' },
      { id: 'librarians-mobbin-librarian', name: 'Mobbin', role: 'Real-world pattern reference' },
    ],
  },
  {
    id: 'ship',
    name: 'Ship',
    description: 'Get a project from working locally to live on the internet, fully verified and secure.',
    whenToUse: 'Deploying, pushing to production, or shipping a release.',
    activationPrompt: 'Open the Ship Wing',
    icon: Rocket,
    color: 'green',
    gradient: 'linear-gradient(135deg, #3d7a56, #2d5c40)',
    librarians: [
      { id: 'librarians-deployment-librarian', name: 'Deployment', role: 'GitHub Pages, Vercel, Cloudflare' },
      { id: 'librarians-pre-deployment-librarian', name: 'Pre-Deployment', role: 'Pre-deploy verification checklist' },
      { id: 'librarians-hacker-attacker-librarian', name: 'Hacker Attacker', role: 'Security scan before push' },
      { id: 'librarians-anti-glitch-librarian', name: 'Anti-Glitch', role: 'Performance check before deploy' },
      { id: 'librarians-anti-mock-data-librarian', name: 'Anti-Mock Data', role: 'Verify no mock data ships' },
      { id: 'librarians-exit-librarian', name: 'Exit', role: 'Final ship checklist' },
    ],
  },
  {
    id: 'quality',
    name: 'Quality',
    description: 'Audit, review, and harden an existing project across code, security, and performance.',
    whenToUse: 'Auditing code, reviewing for production readiness, or hardening.',
    activationPrompt: 'Open the Quality Wing',
    icon: ShieldCheck,
    color: 'purple',
    gradient: 'linear-gradient(135deg, #6e5f9a, #524575)',
    librarians: [
      { id: 'librarians-code-scrutinizer-librarian', name: 'Code Scrutinizer', role: '7-lens code review' },
      { id: 'librarians-hacker-attacker-librarian', name: 'Hacker Attacker', role: 'Security vulnerability scan' },
      { id: 'librarians-anti-glitch-librarian', name: 'Anti-Glitch', role: 'Performance and loading diagnosis' },
      { id: 'librarians-performance-librarian', name: 'Performance', role: 'Core Web Vitals targets' },
      { id: 'librarians-testing-librarian', name: 'Testing', role: 'Test coverage and quality' },
      { id: 'librarians-visual-audit-librarian', name: 'Visual Audit', role: 'Visual consistency check' },
      { id: 'librarians-consistency-librarian', name: 'Consistency', role: 'Code style consistency' },
    ],
  },
  {
    id: 'mobile',
    name: 'Mobile',
    description: 'Building or optimizing for iOS and Android with platform-specific standards.',
    whenToUse: 'Mobile app development, React Native, Expo, or App Store prep.',
    activationPrompt: 'Open the Mobile Wing',
    icon: Smartphone,
    color: 'amber',
    gradient: 'linear-gradient(135deg, #9a7a3a, #7a6030)',
    librarians: [
      { id: 'librarians-mobile-first-librarian', name: 'Mobile-First', role: 'Mobile-specific standards and compliance' },
      { id: 'librarians-experience-designer-librarian', name: 'Experience Designer', role: 'Responsive token system' },
      { id: 'librarians-flow-librarian', name: 'Flow', role: 'Mobile user flows (onboarding, payment)' },
      { id: 'librarians-onboarding-librarian', name: 'Onboarding', role: 'First-run experience' },
      { id: 'librarians-anti-glitch-librarian', name: 'Anti-Glitch', role: 'Mobile performance optimization' },
      { id: 'librarians-deployment-librarian', name: 'Deployment', role: 'Mobile deploy pipeline' },
    ],
  },
  {
    id: 'content',
    name: 'Content',
    description: 'Writing, copywriting, and content strategy with enforced quality standards.',
    whenToUse: 'Writing copy, content strategy, or marketing pages.',
    activationPrompt: 'Open the Content Wing',
    icon: PenTool,
    color: 'rose',
    gradient: 'linear-gradient(135deg, #8e5060, #6e3545)',
    librarians: [
      { id: 'librarians-copywriting-librarian', name: 'Copywriting', role: 'Voice, tone, AI language ban' },
      { id: 'librarians-research-librarian', name: 'Research', role: 'Audience and market research' },
      { id: 'librarians-anti-mock-data-librarian', name: 'Anti-Mock Data', role: 'Real content, not lorem ipsum' },
      { id: 'librarians-experience-designer-librarian', name: 'Experience Designer', role: 'Content fits design system' },
    ],
  },
  {
    id: 'intelligence',
    name: 'Intelligence',
    description: 'AI features, LLM integration, agent systems, and workflow automation.',
    whenToUse: 'Building AI features, chatbots, multi-agent systems, or workflow automation.',
    activationPrompt: 'Open the Intelligence Wing',
    icon: Brain,
    color: 'cyan',
    gradient: 'linear-gradient(135deg, #4d7d94, #3a6070)',
    librarians: [
      { id: 'librarians-multi-agent-librarian', name: 'Multi-Agent', role: 'Multi-agent orchestration' },
      { id: 'librarians-prompt-librarian', name: 'Prompt', role: 'Prompt engineering' },
      { id: 'librarians-conversational-ai-librarian', name: 'Conversational AI', role: 'Chat and conversational UI' },
      { id: 'librarians-google-ai-librarian', name: 'Google AI', role: 'Google AI integration' },
      { id: 'librarians-n8n-librarian', name: 'n8n', role: 'Workflow automation' },
      { id: 'librarians-hacker-attacker-librarian', name: 'Hacker Attacker', role: 'AI-specific security (prompt injection)' },
    ],
  },
  {
    id: 'backend',
    name: 'Backend',
    description: 'Database design, API architecture, and server-side infrastructure.',
    whenToUse: 'Building the backend, designing schemas, or integrating APIs.',
    activationPrompt: 'Open the Backend Wing',
    icon: Server,
    color: 'green',
    gradient: 'linear-gradient(135deg, #3d6a5a, #2d5040)',
    librarians: [
      { id: 'librarians-backend-librarian', name: 'Backend', role: 'Server architecture' },
      { id: 'librarians-database-librarian', name: 'Database', role: 'Schema design, queries' },
      { id: 'librarians-api-integration-librarian', name: 'API Integration', role: 'API patterns' },
      { id: 'librarians-supabase-librarian', name: 'Supabase', role: 'Supabase-specific patterns' },
      { id: 'librarians-security-librarian', name: 'Security', role: 'Security policy' },
    ],
  },
]

export function getWingById(id: string): Wing | undefined {
  return wings.find(w => w.id === id)
}
