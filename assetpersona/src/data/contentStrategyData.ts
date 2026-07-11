/**
 * ═══ CONTENT STRATEGY DATA ═══
 *
 * Managing scheduling calendars, keywords, descriptions, and the brand voice profile.
 * Loads defaults and persists changes in localStorage for development environment.
 */

export interface ContentSlot {
  id: string;
  time: string;
  tool: string;
  type: string;
  desc: string;
  kw: string[];
}

export interface DaySchedule {
  day: string;
  slots: ContentSlot[];
}

export interface VoiceGuideline {
  title: string;
  desc: string;
}

export interface BannedWord {
  word: string;
  reason: string;
  alternatives: string;
}

export interface FormattingRule {
  title: string;
  rule: string;
}

export interface StyleExample {
  title: string;
  ai: string;
  human: string;
  note: string;
}

export interface ContentStrategy {
  threads: DaySchedule[];
  linkedin: DaySchedule[];
  voice: {
    guidelines: VoiceGuideline[];
    bannedWords: BannedWord[];
    formattingRules: FormattingRule[];
    styleExamples: StyleExample[];
  };
}

const STRATEGY_STORAGE_KEY = 'ap_content_strategy_v1';

// Default data parsed from workflow files and copywriting-enforcing standards
const DEFAULT_STRATEGY: ContentStrategy = {
  threads: [
    {
      day: "Monday",
      slots: [
        {
          id: "threads-mon-7:00am",
          time: "7:00 AM",
          tool: "Claude Code",
          type: "Tip",
          desc: "Quick Claude Code tip. Plan Mode, CLAUDE.md, code review, multi-agent, model selection. Mention the free Claude Code in Action course on Anthropic Skilljar if relevant.",
          kw: ["Claude Code"]
        },
        {
          id: "threads-mon-9:00am",
          time: "9:00 AM",
          tool: "AI news",
          type: "Morning news",
          desc: "Morning AI news. Overnight releases, updates, trending conversations.",
          kw: ["AI news"]
        },
        {
          id: "threads-mon-9:30am",
          time: "9:30 AM",
          tool: "Claude (general)",
          type: "AI education",
          desc: "Teach about Claude. Context windows, Opus vs Sonnet, prompt patterns, model selection. Mention free Anthropic courses like Claude 101 or AI Fluency on Skilljar when relevant.",
          kw: ["Claude (general)"]
        },
        {
          id: "threads-mon-11:30am",
          time: "11:30 AM",
          tool: "Google Antigravity",
          type: "Pain point / real talk",
          desc: "Antigravity real talk. Pricing controversy, credit system, what is actually useful.",
          kw: ["Google Antigravity"]
        },
        {
          id: "threads-mon-1:30pm",
          time: "1:30 PM",
          tool: "Cursor",
          type: "Tip",
          desc: "Cursor tip. Agent mode, codebase indexing, Cursor rules, model switching.",
          kw: ["Cursor"]
        },
        {
          id: "threads-mon-2:30pm",
          time: "2:30 PM",
          tool: "Web development",
          type: "Tip",
          desc: "Share a web development insight from your experience as a web developer. Talk about something you learned building sites, a common mistake people make, or why having a good website matters for business. Vary between framing yourself as a web developer, a full-stack developer, or a digital builder. End with something like: if you need help building your site or want to chat about your project, reach out.",
          kw: ["Web development"]
        },
        {
          id: "threads-mon-3:30pm",
          time: "3:30 PM",
          tool: "Vibe coding",
          type: "Vibe coding tip",
          desc: "Vibe coding tip. Quality over speed. Testing AI output. Architecture thinking. Sometimes include encouragement for people learning to vibe code, like you got this or keep building.",
          kw: ["Vibe coding"]
        },
        {
          id: "threads-mon-5:00pm",
          time: "5:00 PM",
          tool: "AI news",
          type: "Evening news",
          desc: "Evening AI news. Today's releases, community debates, updates.",
          kw: ["AI news"]
        },
        {
          id: "threads-mon-7:00pm",
          time: "7:00 PM",
          tool: "Hermes",
          type: "AI education",
          desc: "Teach about Hermes. What it does, how people use it, setup basics. Positive/educational.",
          kw: ["Hermes"]
        },
        {
          id: "threads-mon-8:30pm",
          time: "8:30 PM",
          tool: "App development",
          type: "Tip",
          desc: "Share an insight about app development or building software. Talk about what it takes to build an app, the development process, or how AI tools speed things up. Do NOT claim you shipped an app to the App Store unless describing the general process. Frame as a developer sharing knowledge.",
          kw: ["App development"]
        },
        {
          id: "threads-mon-9:00pm",
          time: "9:00 PM",
          tool: "AI agents",
          type: "Use case",
          desc: "AI agents use case. How many agents, what models, what they actually solve in business.",
          kw: ["AI agents"]
        }
      ]
    },
    {
      day: "Tuesday",
      slots: [
        {
          id: "threads-tue-7:00am",
          time: "7:00 AM",
          tool: "Codex",
          type: "Tip",
          desc: "Codex tip. Multi-agent sandbox, prompting patterns, what Codex does differently.",
          kw: ["Codex"]
        },
        {
          id: "threads-tue-9:00am",
          time: "9:00 AM",
          tool: "AI news",
          type: "Morning news",
          desc: "Morning AI news roundup.",
          kw: ["AI news"]
        },
        {
          id: "threads-tue-9:30am",
          time: "9:30 AM",
          tool: "Claude Code",
          type: "Use case",
          desc: "What you built/shipped with Claude Code. Architecture, prompt strategy, results. Mention the Claude Code in Action course on Skilljar if it fits.",
          kw: ["Claude Code"]
        },
        {
          id: "threads-tue-11:30am",
          time: "11:30 AM",
          tool: "Google AI Studio",
          type: "AI education",
          desc: "Teach about AI Studio. Prompt testing, model comparison, Gemini features, API setup.",
          kw: ["Google AI Studio"]
        },
        {
          id: "threads-tue-1:30pm",
          time: "1:30 PM",
          tool: "Lovable",
          type: "Pain point / real talk",
          desc: "Lovable real talk. Beautiful UIs that break on deploy. Who should vs shouldn't use it.",
          kw: ["Lovable"]
        },
        {
          id: "threads-tue-2:30pm",
          time: "2:30 PM",
          tool: "Web development",
          type: "AI education",
          desc: "Talk about why every business needs a website in 2026, or share a web development tip from your experience as a full-stack developer. Keep it practical and end with a soft CTA about connecting if they need web help.",
          kw: ["Web development"]
        },
        {
          id: "threads-tue-3:30pm",
          time: "3:30 PM",
          tool: "Google Antigravity",
          type: "Tip",
          desc: "Antigravity tip. MCP connections, Claude Code extension, agent workflows.",
          kw: ["Google Antigravity"]
        },
        {
          id: "threads-tue-5:00pm",
          time: "5:00 PM",
          tool: "AI news",
          type: "Evening news",
          desc: "Evening AI news recap.",
          kw: ["AI news"]
        },
        {
          id: "threads-tue-7:00pm",
          time: "7:00 PM",
          tool: "Hermes",
          type: "Tip",
          desc: "Hermes tip. Useful skills, WhatsApp/Telegram setup, best models to connect. Practical, positive.",
          kw: ["Hermes"]
        },
        {
          id: "threads-tue-8:30pm",
          time: "8:30 PM",
          tool: "App development",
          type: "Use case",
          desc: "Share a tip about building apps or the development process. Talk about SwiftUI, testing, or how AI tools help you build faster. Do NOT claim you published or shipped a specific app to the App Store. Share general development knowledge.",
          kw: ["App development"]
        },
        {
          id: "threads-tue-9:00pm",
          time: "9:00 PM",
          tool: "Vibe coding",
          type: "Hot take",
          desc: "Vibe coding hot take or encouragement. Sometimes it is a hot take about quality vs speed. Sometimes it is encouragement for vibe coders like keep building, you are closer than you think. Rollover post.",
          kw: ["Vibe coding"]
        }
      ]
    },
    {
      day: "Wednesday",
      slots: [
        {
          id: "threads-wed-7:00am",
          time: "7:00 AM",
          tool: "Claude (general)",
          type: "Tip",
          desc: "Claude prompting tip. System prompts, XML tags, chain of thought. Mention the Building with the Claude API course on Skilljar if relevant.",
          kw: ["Claude (general)"]
        },
        {
          id: "threads-wed-9:00am",
          time: "9:00 AM",
          tool: "AI news",
          type: "Morning news",
          desc: "Morning AI news.",
          kw: ["AI news"]
        },
        {
          id: "threads-wed-9:30am",
          time: "9:30 AM",
          tool: "Claude Code",
          type: "AI education",
          desc: "Claude Code education. SKILL.md, agent skills, subagents, code review. Mention Anthropic Skilljar courses like Introduction to Agent Skills or Introduction to Subagents when relevant.",
          kw: ["Claude Code"]
        },
        {
          id: "threads-wed-11:30am",
          time: "11:30 AM",
          tool: "Google Antigravity",
          type: "AI education",
          desc: "Teach about Antigravity. Editor vs manager view, agent-first concept, parallel agents.",
          kw: ["Google Antigravity"]
        },
        {
          id: "threads-wed-1:30pm",
          time: "1:30 PM",
          tool: "Claude Dispatch",
          type: "Tip",
          desc: "Claude Dispatch tip. Workflow automation, power user setup.",
          kw: ["Claude Dispatch"]
        },
        {
          id: "threads-wed-2:30pm",
          time: "2:30 PM",
          tool: "Web development",
          type: "Use case",
          desc: "Share a story about building a website for a client or project. What tools you used, what the client needed, how AI helped. Frame yourself as a web developer or digital builder. Soft CTA about reaching out.",
          kw: ["Web development"]
        },
        {
          id: "threads-wed-3:30pm",
          time: "3:30 PM",
          tool: "Vibe coding",
          type: "Vibe coding tip",
          desc: "Vibe coding tutorial or encouragement. Sometimes teach testing AI output, architecture before prompting, debugging AI code. Sometimes encourage people who are just getting started with vibe coding.",
          kw: ["Vibe coding"]
        },
        {
          id: "threads-wed-5:00pm",
          time: "5:00 PM",
          tool: "AI news",
          type: "Evening news",
          desc: "Evening AI news.",
          kw: ["AI news"]
        },
        {
          id: "threads-wed-7:00pm",
          time: "7:00 PM",
          tool: "Hermes",
          type: "Use case",
          desc: "Hermes use case. What people are building with it. Calendar automation, email, dev workflows. Positive examples.",
          kw: ["Hermes"]
        },
        {
          id: "threads-wed-8:30pm",
          time: "8:30 PM",
          tool: "App development",
          type: "AI education",
          desc: "Teach something about app development for people who are not technical. What does it take to build an app? How do AI tools help? Keep it simple and practical. Do NOT claim you shipped a specific app. Share general development knowledge.",
          kw: ["App development"]
        },
        {
          id: "threads-wed-9:00pm",
          time: "9:00 PM",
          tool: "AI agents",
          type: "AI education",
          desc: "Teach about AI agents. Multi-agent setups, how to run them. Rollover.",
          kw: ["AI agents"]
        }
      ]
    },
    {
      day: "Thursday",
      slots: [
        {
          id: "threads-thu-7:00am",
          time: "7:00 AM",
          tool: "Google Antigravity",
          type: "Tip",
          desc: "Antigravity tip. Agent manager, model switching, extension setup.",
          kw: ["Google Antigravity"]
        },
        {
          id: "threads-thu-9:00am",
          time: "9:00 AM",
          tool: "AI news",
          type: "Morning news",
          desc: "Morning AI news.",
          kw: ["AI news"]
        },
        {
          id: "threads-thu-9:30am",
          time: "9:30 AM",
          tool: "Claude Code",
          type: "Pain point / real talk",
          desc: "Claude Code real talk. Great at X, struggles at Y. Enterprise vs indie cost.",
          kw: ["Claude Code"]
        },
        {
          id: "threads-thu-11:30am",
          time: "11:30 AM",
          tool: "Codex",
          type: "AI education",
          desc: "Teach about Codex. Multi-agent concept, how it differs from Claude Code and Cursor.",
          kw: ["Codex"]
        },
        {
          id: "threads-thu-1:30pm",
          time: "1:30 PM",
          tool: "Cursor",
          type: "Pain point / real talk",
          desc: "Cursor real talk. Credit system, speed, frustrations.",
          kw: ["Cursor"]
        },
        {
          id: "threads-thu-2:30pm",
          time: "2:30 PM",
          tool: "Web development",
          type: "Pain point / real talk",
          desc: "Real talk about web development. Common mistakes people make when building websites, why cheap sites cost more in the long run, or what separates a professional site from a DIY one. Frame as a web developer sharing experience. Soft CTA.",
          kw: ["Web development"]
        },
        {
          id: "threads-thu-3:30pm",
          time: "3:30 PM",
          tool: "NotebookLM",
          type: "Tip",
          desc: "NotebookLM tip. Audio overview, source management.",
          kw: ["NotebookLM"]
        },
        {
          id: "threads-thu-5:00pm",
          time: "5:00 PM",
          tool: "AI news",
          type: "Evening news",
          desc: "Evening AI news.",
          kw: ["AI news"]
        },
        {
          id: "threads-thu-7:00pm",
          time: "7:00 PM",
          tool: "Google AI Studio",
          type: "Use case",
          desc: "AI Studio use case. What you tested, model comparison results, API integration. Practical.",
          kw: ["Google AI Studio"]
        },
        {
          id: "threads-thu-8:30pm",
          time: "8:30 PM",
          tool: "App development",
          type: "Tip",
          desc: "Quick tip about app development or the Apple developer ecosystem. Talk about TestFlight, App Store Connect, provisioning profiles, or how AI speeds up app development. Frame as an Apple developer or app builder.",
          kw: ["App development"]
        },
        {
          id: "threads-thu-9:00pm",
          time: "9:00 PM",
          tool: "Hermes",
          type: "Hot take",
          desc: "Hermes hot take. Security vs utility, what is next.",
          kw: ["Hermes"]
        }
      ]
    },
    {
      day: "Friday",
      slots: [
        {
          id: "threads-fri-7:00am",
          time: "7:00 AM",
          tool: "Claude Code",
          type: "Tip",
          desc: "Friday Claude Code tip. End-of-week workflow optimization. Mention the Introduction to Claude Cowork course on Skilljar if relevant.",
          kw: ["Claude Code"]
        },
        {
          id: "threads-fri-9:00am",
          time: "9:00 AM",
          tool: "AI news",
          type: "Morning news",
          desc: "Friday morning news. Week in review, releases.",
          kw: ["AI news"]
        },
        {
          id: "threads-fri-9:30am",
          time: "9:30 AM",
          tool: "Claude (general)",
          type: "Roundup",
          desc: "Weekly Claude roundup. What happened across all Claude products this week. Mention Anthropic Skilljar courses people should check out.",
          kw: ["Claude (general)"]
        },
        {
          id: "threads-fri-11:30am",
          time: "11:30 AM",
          tool: "Vibe coding",
          type: "Vibe coding tip",
          desc: "Friday vibe coding encouragement. Celebrate what people built this week, share a tip, and remind people they are making progress even when it does not feel like it.",
          kw: ["Vibe coding"]
        },
        {
          id: "threads-fri-1:30pm",
          time: "1:30 PM",
          tool: "Claude Visualizer",
          type: "Use case",
          desc: "Claude Visualizer use case. What you prompted, what it produced.",
          kw: ["Claude Visualizer"]
        },
        {
          id: "threads-fri-2:30pm",
          time: "2:30 PM",
          tool: "Web development",
          type: "AI education",
          desc: "Teach something about web development that non-techie people would find useful. How websites work, what makes a good one, or how AI is changing web dev. Frame as a web developer or full-stack developer. Soft CTA.",
          kw: ["Web development"]
        },
        {
          id: "threads-fri-3:30pm",
          time: "3:30 PM",
          tool: "Google AI Studio",
          type: "Tip",
          desc: "AI Studio tip. Gemini features, prompt testing tricks, model comparison shortcuts.",
          kw: ["Google AI Studio"]
        },
        {
          id: "threads-fri-5:00pm",
          time: "5:00 PM",
          tool: "AI news",
          type: "Evening news",
          desc: "Friday evening news + week in review.",
          kw: ["AI news"]
        },
        {
          id: "threads-fri-7:00pm",
          time: "7:00 PM",
          tool: "Hermes",
          type: "AI education",
          desc: "Hermes education. Skills system, best integrations, community projects. Positive.",
          kw: ["Hermes"]
        },
        {
          id: "threads-fri-8:30pm",
          time: "8:30 PM",
          tool: "App development",
          type: "Use case",
          desc: "Share what you worked on as a developer this week. How AI helped with your projects. What tools you used. What you learned. Do NOT claim you shipped a specific app to the App Store.",
          kw: ["App development"]
        },
        {
          id: "threads-fri-9:00pm",
          time: "9:00 PM",
          tool: "Vibe coding",
          type: "Roundup",
          desc: "Weekly vibe coding roundup. Tools to watch, state of the space. Rollover.",
          kw: ["Vibe coding"]
        }
      ]
    },
    {
      day: "Saturday",
      slots: [
        {
          id: "threads-sat-7:00am",
          time: "7:00 AM",
          tool: "Google Antigravity",
          type: "Use case",
          desc: "Weekend Antigravity use case. What you built, agent setup, workflow.",
          kw: ["Google Antigravity"]
        },
        {
          id: "threads-sat-9:00am",
          time: "9:00 AM",
          tool: "AI news",
          type: "Morning news",
          desc: "Saturday morning news. Community buzz, weekend reads.",
          kw: ["AI news"]
        },
        {
          id: "threads-sat-10:30am",
          time: "10:30 AM",
          tool: "Claude Code",
          type: "Use case",
          desc: "Saturday Claude Code use case. Weekend projects, architecture.",
          kw: ["Claude Code"]
        },
        {
          id: "threads-sat-12:30pm",
          time: "12:30 PM",
          tool: "Cursor",
          type: "Tip",
          desc: "Weekend Cursor tip.",
          kw: ["Cursor"]
        },
        {
          id: "threads-sat-2:30pm",
          time: "2:30 PM",
          tool: "Web development",
          type: "Tip",
          desc: "Weekend web development tip. Something useful about building sites, performance, accessibility, or design. Frame as a web developer sharing from experience. Soft CTA about connecting.",
          kw: ["Web development"]
        },
        {
          id: "threads-sat-5:00pm",
          time: "5:00 PM",
          tool: "AI news",
          type: "Evening news",
          desc: "Saturday evening news.",
          kw: ["AI news"]
        },
        {
          id: "threads-sat-7:00pm",
          time: "7:00 PM",
          tool: "Google Stitch",
          type: "AI education",
          desc: "Teach about Google Stitch. Vibe design, text-to-UI, Stitch to Antigravity pipeline.",
          kw: ["Google Stitch"]
        },
        {
          id: "threads-sat-8:30pm-app",
          time: "8:30 PM",
          tool: "App development",
          type: "AI education",
          desc: "Teach something about the Apple developer program or app development process. What it costs, how long it takes, what the review process looks like. Keep it real and accessible. Frame as an app developer.",
          kw: ["App development"]
        },
        {
          id: "threads-sat-8:30pm-hermes",
          time: "8:30 PM",
          tool: "Hermes",
          type: "Use case",
          desc: "Hermes use case. Interesting community project or experiment. Positive energy.",
          kw: ["Hermes"]
        },
        {
          id: "threads-sat-9:00pm",
          time: "9:00 PM",
          tool: "AI agents",
          type: "Use case",
          desc: "Weekend AI agents post. Stack keywords. 1,000-view formula. Rollover.",
          kw: ["AI agents"]
        }
      ]
    },
    {
      day: "Sunday",
      slots: [
        {
          id: "threads-sun-8:30am",
          time: "8:30 AM",
          tool: "Claude (general)",
          type: "Hot take",
          desc: "Sunday hot take. AI trends, industry opinion. Mention Anthropic AI Fluency course if relevant.",
          kw: ["Claude (general)"]
        },
        {
          id: "threads-sun-9:00am",
          time: "9:00 AM",
          tool: "AI news",
          type: "Morning news",
          desc: "Sunday morning news. Preview of next week.",
          kw: ["AI news"]
        },
        {
          id: "threads-sun-11:00am",
          time: "11:00 AM",
          tool: "Codex",
          type: "Use case",
          desc: "Codex use case. Multi-agent performance.",
          kw: ["Codex"]
        },
        {
          id: "threads-sun-1:00pm",
          time: "1:00 PM",
          tool: "Vibe coding",
          type: "Vibe coding tip",
          desc: "Sunday vibe coding tip and encouragement. Prep for the week but also remind people that learning AI coding is a process. Keep building. You are further along than you were last week.",
          kw: ["Vibe coding"]
        },
        {
          id: "threads-sun-2:30pm",
          time: "2:30 PM",
          tool: "Web development",
          type: "Use case",
          desc: "Share a web development use case or project you worked on. Talk about what tools you used, how AI helped, what the outcome was. Frame as a full-stack developer or digital builder. Soft CTA.",
          kw: ["Web development"]
        },
        {
          id: "threads-sun-3:00pm",
          time: "3:00 PM",
          tool: "Google Antigravity",
          type: "Tip",
          desc: "Antigravity tip. Quick setup trick or feature people miss.",
          kw: ["Google Antigravity"]
        },
        {
          id: "threads-sun-5:00pm",
          time: "5:00 PM",
          tool: "AI news",
          type: "Evening news",
          desc: "Sunday evening news. Preview of the week ahead.",
          kw: ["AI news"]
        },
        {
          id: "threads-sun-6:30pm",
          time: "6:30 PM",
          tool: "Claude Dispatch",
          type: "Tip",
          desc: "Dispatch tip. Monday prep automation.",
          kw: ["Claude Dispatch"]
        },
        {
          id: "threads-sun-7:30pm",
          time: "7:30 PM",
          tool: "Hermes",
          type: "Tip",
          desc: "Hermes tip. Best model to use, useful skill to install, integration trick.",
          kw: ["Hermes"]
        },
        {
          id: "threads-sun-8:30pm",
          time: "8:30 PM",
          tool: "App development",
          type: "Hot take",
          desc: "Hot take about app development. Is it worth building native apps in 2026? PWAs vs native? How AI changes the game for indie app developers? Frame as an Apple developer and AI engineer.",
          kw: ["App development"]
        },
        {
          id: "threads-sun-9:00pm",
          time: "9:00 PM",
          tool: "AI agents",
          type: "Use case",
          desc: "Sunday night AI agents post. STRATEGIC ROLLOVER into Monday.",
          kw: ["AI agents"]
        }
      ]
    }
  ],
  linkedin: [
    {
      day: "Monday",
      slots: [
        {
          id: "linkedin-mon-8:00am",
          time: "8:00 AM",
          tool: "Claude Code",
          type: "Use case",
          desc: "What you built/shipped. Architecture, results, prompt strategy. Show expertise for recruiters.",
          kw: ["Claude Code", "built with AI", "AI engineer", "web developer", "results", "portfolio"]
        },
        {
          id: "linkedin-mon-5:00pm",
          time: "5:00 PM",
          tool: "AI industry",
          type: "Industry perspective",
          desc: "React to AI industry news. What it means for developers, businesses, hiring. Thought leadership angle.",
          kw: ["AI trends 2026", "AI industry", "agentic AI", "future of coding", "opinion", "thought leadership"]
        }
      ]
    },
    {
      day: "Tuesday",
      slots: [
        {
          id: "linkedin-tue-9:00am",
          time: "9:00 AM",
          tool: "Google Antigravity",
          type: "AI education",
          desc: "Deep dive on Antigravity. What it is, how it works, why it matters. Position as expert on Google AI tools.",
          kw: ["Google Antigravity", "AI IDE", "AI education", "Gemini", "tutorial", "Google AI"]
        },
        {
          id: "linkedin-tue-5:30pm",
          time: "5:30 PM",
          tool: "Vibe coding",
          type: "Hot take",
          desc: "Vibe coding perspective for LinkedIn audience. Quality, hiring implications, what it means for teams. Professional tone.",
          kw: ["vibe coding", "AI coding", "code quality", "hiring", "software engineering", "opinion"]
        }
      ]
    },
    {
      day: "Wednesday",
      slots: [
        {
          id: "linkedin-wed-9:30am",
          time: "9:30 AM",
          tool: "AI agents",
          type: "AI education",
          desc: "Teach about agentic AI. Multi-agent systems, Hermes, Claude Code agents. Enterprise applications. LinkedIn loves educational content.",
          kw: ["AI agents", "agentic AI", "Hermes", "Claude Code", "enterprise", "AI education", "automation"]
        },
        {
          id: "linkedin-wed-5:00pm",
          time: "5:00 PM",
          tool: "Career / jobs",
          type: "Career / hiring market",
          desc: "AI job market commentary. What recruiters are looking for, skills in demand, hiring trends. Positions you as informed and available.",
          kw: ["AI engineer", "hiring", "job market 2026", "skills", "LangChain", "RAG", "Python", "open to work"]
        }
      ]
    },
    {
      day: "Thursday",
      slots: [
        {
          id: "linkedin-thu-9:00am",
          time: "9:00 AM",
          tool: "Google Antigravity",
          type: "Use case",
          desc: "Antigravity use case. What you built, workflow, deployment. Showcase for clients and recruiters.",
          kw: ["Google Antigravity", "use case", "web app", "built with AI", "portfolio", "Gemini 3.1 Pro"]
        },
        {
          id: "linkedin-thu-5:30pm",
          time: "5:30 PM",
          tool: "AI industry",
          type: "Pain point / real talk",
          desc: "Real talk on AI tools. What's overhyped, what actually works, honest professional perspective. High dwell time content.",
          kw: ["AI tools 2026", "real talk", "honest review", "developer tools", "pain point", "professional"]
        }
      ]
    },
    {
      day: "Friday",
      slots: [
        {
          id: "linkedin-fri-9:30am",
          time: "9:30 AM",
          tool: "Claude (general)",
          type: "Roundup",
          desc: "Weekly wins. What you shipped, metrics, tools used. Portfolio energy. Tag Claude, Antigravity, Cursor.",
          kw: ["Claude AI", "Claude Code", "Google Antigravity", "Cursor AI", "weekly", "portfolio", "results"]
        },
        {
          id: "linkedin-fri-5:00pm",
          time: "5:00 PM",
          tool: "Google AI Studio",
          type: "AI education",
          desc: "Teach about AI Studio or Google AI tools. Practical knowledge that positions you as a Google AI expert.",
          kw: ["Google AI Studio", "Gemini API", "AI education", "tutorial", "Google AI", "prompt engineering"]
        }
      ]
    },
    {
      day: "Saturday",
      slots: [
        {
          id: "linkedin-sat-9:00am",
          time: "9:00 AM",
          tool: "Claude Code",
          type: "AI education",
          desc: "Weekend educational post. Teach something about Claude Code that professionals can try Monday. Practical value.",
          kw: ["Claude Code", "AI education", "tutorial", "developer productivity", "AI coding", "weekend"]
        },
        {
          id: "linkedin-sat-4:00pm",
          time: "4:00 PM",
          tool: "AI industry",
          type: "Industry perspective",
          desc: "Weekend thought leadership. Broader AI trends, what's changing, where the industry is going. Relaxed but informed.",
          kw: ["AI trends 2026", "AI industry", "thought leadership", "future", "opinion"]
        }
      ]
    },
    {
      day: "Sunday",
      slots: [
        {
          id: "linkedin-sun-10:00am",
          time: "10:00 AM",
          tool: "AI industry",
          type: "Hot take",
          desc: "Sunday AI hot take. Bold opinion, trend prediction, contrarian view. Gets engagement heading into the week.",
          kw: ["AI trends 2026", "hot take", "opinion", "prediction", "AI industry"]
        },
        {
          id: "linkedin-sun-5:00pm",
          time: "5:00 PM",
          tool: "Career / jobs",
          type: "Career / hiring market",
          desc: "Sunday career post. Week ahead prep, job market insight, skills commentary. Signals availability without desperation.",
          kw: ["AI engineer", "web developer", "job market", "hiring", "skills 2026", "available", "consulting"]
        }
      ]
    }
  ],
  voice: {
    guidelines: [
      {
        title: "Developer Persona (Frank Lawrence)",
        desc: "Write as a hands-on digital builder, full-stack developer, and AI engineer sharing authentic experiences from building apps and automations. Avoid claiming false accomplishments; maintain a genuine sharing posture."
      },
      {
        title: "Pragmatic & High-Signal",
        desc: "Focus on exact numbers, architectures, real-world constraints, and code patterns. Keep content informative, useful, and straightforward instead of using marketing spin."
      },
      {
        title: "Builder-First Context",
        desc: "Relate issues to concrete tools (Claude Code, Google Antigravity, Cursor, Hermes, Supabase, N8N). Frame advice around lessons learned while configuring, debugging, or deploying workflows."
      }
    ],
    bannedWords: [
      { word: "leverage", reason: "Overused AI marketing verb.", alternatives: "use, apply, build with, run" },
      { word: "unlock", reason: "Standard AI output hyperbole.", alternatives: "open, enable, access, start using" },
      { word: "seamless", reason: "Cliché filler that lacks concrete technical meaning.", alternatives: "direct, smooth, integrated, automatic" },
      { word: "supercharge / turbocharge", reason: "Inflated marketing adjectives.", alternatives: "speed up, accelerate, optimize, simplify" },
      { word: "cutting-edge / state-of-the-art", reason: "Vague, meaningless industry jargon.", alternatives: "modern, current, recent, specific technical metrics" },
      { word: "game-changing / revolutionary", reason: "Fake hype words that trigger AI detectors.", alternatives: "descriptive features, actual results" },
      { word: "delve / tapestry / testament", reason: "Highly recognizable LLM transition words.", alternatives: "start directly with the point, omit them" }
    ],
    formattingRules: [
      {
        title: "Strict Emoji Ban",
        rule: "Emojis are strictly banned in all codebase edits, code comments, logs, and toast notifications. They are only allowed inside original workflow configurations or in social feeds if absolutely necessary."
      },
      {
        title: "Em-Dash Ban",
        rule: "Avoid using em dashes (—) as filler. Replace them with commas, periods, or semicolons to keep sentences crisp and distinct."
      },
      {
        title: "Sentence Fragments",
        rule: "Avoid style fragments (e.g. 'Fast. Simple. Secure.'). Use complete sentences containing active subjects and verbs."
      },
      {
        title: "Active Voice Default",
        rule: "Always write in the active voice. Say 'We deployed the scraper' instead of 'The scraper was deployed.'"
      }
    ],
    styleExamples: [
      {
        title: "Technical Showcase",
        ai: "Our cutting-edge platform leverages AI to deliver seamless, state-of-the-art experiences across your enterprise ecosystem.",
        human: "The platform runs on your infrastructure. Your data never leaves your VPC. Authentication integrates with your existing SAML provider. Setup takes one engineer, one afternoon.",
        note: "Replace hype with concrete developer facts."
      },
      {
        title: "CLI Tool Description",
        ai: "Unlock the full potential of your development workflow with this powerful CLI that supercharges productivity.",
        human: "Run one command to scaffold, test, and deploy. The setup generates TypeScript, ESLint, and CI configs. Tests run in parallel. Deploys complete in under 5 seconds.",
        note: "Focus on exact outcomes and mechanics."
      }
    ]
  }
};

/**
 * Gets the current content strategy from local storage or returns the default dataset.
 */
export function getStoredStrategy(): ContentStrategy {
  try {
    const stored = localStorage.getItem(STRATEGY_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.warn('Failed to load strategy from localStorage, falling back to defaults', err);
  }
  return DEFAULT_STRATEGY;
}

/**
 * Saves the content strategy back to local storage.
 */
export function saveStrategy(strategy: ContentStrategy): void {
  try {
    localStorage.setItem(STRATEGY_STORAGE_KEY, JSON.stringify(strategy));
  } catch (err) {
    console.error('Failed to save strategy to localStorage', err);
  }
}
