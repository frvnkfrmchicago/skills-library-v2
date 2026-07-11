import { motion, type Variants } from 'framer-motion';
import { LinkedinLogo } from '@phosphor-icons/react';
import { BookOpen, Cpu, Code, Palette, User } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import './About.css';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const SOLUTIONS = [
  {
    icon: <BookOpen size={24} />,
    iconClass: 'about-solutions__icon--literacy',
    title: 'AI Literacy Training',
    desc: 'Bring your team up to speed with custom AI education. We design unique learning paths, from foundational concepts to advanced prompt engineering, for truly impactful upskilling.',
  },
  {
    icon: <Cpu size={24} />,
    iconClass: 'about-solutions__icon--integration',
    title: 'AI Integration',
    desc: 'Transform your business operations with strategic AI implementation. We identify high-impact use cases, develop custom integration roadmaps, and ensure seamless adoption that delivers measurable ROI.',
  },
  {
    icon: <Code size={24} />,
    iconClass: 'about-solutions__icon--coding',
    title: 'Vibe Coding Strategy',
    desc: 'Accelerate ideas to market sooner. We use AI to rapidly build functional prototypes, validate concepts, and strategize efficient software solutions, saving time and resources.',
  },
  {
    icon: <Palette size={24} />,
    iconClass: 'about-solutions__icon--marketing',
    title: 'Vibe Marketing Design',
    desc: 'Elevate your brand image with AI-powered marketing. We integrate AI into your digital strategy, using market and UX research for compelling content, dynamic web design, and campaigns that captivate.',
  },
  {
    icon: <User size={24} />,
    iconClass: 'about-solutions__icon--avatar',
    title: 'Custom AI Avatar Creation',
    desc: 'Bring your brand to life with unique digital AI personas, from visual concept and expert voice cloning to animated, speaking characters, for truly memorable engagement.',
  },
];

const TOOLS = [
  { src: '/images/about/tool-adobe.webp', alt: 'Adobe Creative Cloud' },
  { src: '/images/about/tool-chatgpt.webp', alt: 'ChatGPT' },
  { src: '/images/about/tool-canva.webp', alt: 'Canva' },
  { src: '/images/about/tool-gemini.webp', alt: 'Google Gemini' },
  { src: '/images/about/tool-claude.webp', alt: 'Claude' },
  { src: '/images/about/tool-wix.webp', alt: 'Wix' },
  { src: '/images/about/tool-kling.webp', alt: 'Kling AI' },
  { src: '/images/about/tool-lovable.webp', alt: 'Lovable' },
];

export default function AboutPage() {
  return (
    <>
      <SEOHead
        title="About"
        description="Frank Lawrence, Jr. is an AI Integration Specialist, AI Literacy Educator, and Digital Marketing Specialist at Asset Persona."
        path="/about"
      />
      <main className="about-page">
        {/* ── Hero ── */}
        <section className="about-hero">
          <div className="about-hero__bg">
            <img
              src="/images/about/hero-brain.webp"
              alt="Cybernetic brain fusion"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              width={1920}
              height={1080}
            />
            <div className="about-hero__overlay" />
          </div>
          <motion.div
            className="about-hero__content"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.h1 className="about-hero__title" variants={fadeUp}>
              Where AI Expertise Meets{' '}
              <span className="text-accent-salmon">Creative Storytelling</span>
            </motion.h1>
            <motion.p className="about-hero__subtitle" variants={fadeUp}>
              Teaching AI literacy and AI integration through custom avatars,
              vibe coding, and digital marketing expertise.
            </motion.p>
          </motion.div>
        </section>

        {/* ── Mission & Purpose ── */}
        <motion.section
          className="about-mission"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          <div className="about-mission__grid">
            <motion.div className="about-mission__card" variants={fadeUp}>
              <h2 className="text-gradient-blue">Our Mission</h2>
              <p>
                We teach the game of AI and help creators, professionals, and
                businesses play it better. AI literacy, AI integration, and the
                tools to outpace competition in the digital economy.
              </p>
              <p>
                AI is your personal asset. With Asset Persona, it becomes your
                pro-level power-up.
              </p>
              <div className="about-mission__stat">
                <img
                  src="/images/about/stat-90-orgs.webp"
                  alt="90% of organizations believe AI is key to staying competitive"
                  loading="lazy"
                  decoding="async"
                  width={1200}
                  height={800}
                />
              </div>
            </motion.div>

            <motion.div className="about-mission__card" variants={fadeUp}>
              <h2 className="text-gradient-salmon">Our Purpose</h2>
              <p>
                We exist to democratize AI technology by making it
                understandable and actionable for everyone. Through our
                integrated approach to AI literacy, AI integration, custom
                avatar development, and strategic marketing solutions, we help
                clients maintain authentic brand identity while capitalizing on
                AI efficiencies.
              </p>
              <div className="about-mission__stat">
                <img
                  src="/images/about/stat-97-leaders.webp"
                  alt="97% of business leaders say AI is critical to business survival"
                  loading="lazy"
                  decoding="async"
                  width={1200}
                  height={800}
                />
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* ── Stat Infographics ── */}
        <motion.section
          className="about-stats"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
        >
          <div className="about-stats__grid">
            <motion.div className="about-stats__item" variants={fadeUp}>
              <img
                src="/images/about/wave-face.webp"
                alt="AI neural wave visualization"
                loading="lazy"
                decoding="async"
                width={1200}
                height={1200}
              />
            </motion.div>
            <motion.div className="about-stats__item" variants={fadeUp}>
              <img
                src="/images/about/stat-ai-literacy.webp"
                alt="AI literacy is the #1 marketing skill on the rise"
                loading="lazy"
                decoding="async"
                width={1200}
                height={800}
              />
            </motion.div>
            <motion.div className="about-stats__item" variants={fadeUp}>
              <img
                src="/images/about/ideate-market.webp"
                alt="Ideate, Market, Share ,  creative collaboration"
                loading="lazy"
                decoding="async"
                width={1200}
                height={800}
              />
            </motion.div>
          </div>
        </motion.section>

        {/* ── Leadership ── */}
        <section className="about-leadership">
          <div className="about-leadership__bg">
            <img
              src="/images/about/marketing-brain.webp"
              alt="Marketing strategy visualization"
              loading="lazy"
              decoding="async"
              width={1600}
              height={900}
            />
          </div>
          <motion.div
            className="about-leadership__inner"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            <motion.div className="about-leadership__avatar" variants={fadeUp}>
              <img
                src="/images/about/FrankSite.webp"
                alt="Frank Lawrence, Jr."
                className="about-leadership__avatar-img"
                loading="lazy"
                decoding="async"
                width={1200}
                height={1200}
              />
            </motion.div>
            <motion.div className="about-leadership__info" variants={fadeUp}>
              <h2>Frank Lawrence, Jr.</h2>
              <p className="about-leadership__role">
                AI Integration Specialist &amp; AI Literacy Educator
              </p>
              <p className="about-leadership__bio">
                A Morehouse College graduate with a degree in Psychology, Frank
                applies a human-first lens to AI marketing, combining data,
                design, and vibe coding to create educational AI content. At
                Asset Persona, he transforms complex AI into actionable business
                strategy for creators and professionals navigating the digital
                economy.
              </p>
              <a
                href="https://www.linkedin.com/in/frankdlawrencejr/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary"
              >
                <LinkedinLogo size={18} weight="duotone" />
                Connect on LinkedIn
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* ── Tailored Solutions ── */}
        <motion.section
          className="about-solutions"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
        >
          <motion.div className="about-solutions__header" variants={fadeUp}>
            <h2>
              Tailored <span className="text-accent-salmon">Solutions</span>
            </h2>
            <p>
              From AI literacy to full-stack vibe coding, we deliver measurable
              outcomes.
            </p>
          </motion.div>
          <div className="about-solutions__grid">
            {SOLUTIONS.map((sol, i) => (
              <motion.div
                key={i}
                className="about-solutions__card"
                variants={fadeUp}
              >
                <div className={`about-solutions__icon ${sol.iconClass}`}>
                  {sol.icon}
                </div>
                <h3>{sol.title}</h3>
                <p>{sol.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Tools Carousel ── */}
        <motion.section
          className="about-tools"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
        >
          <motion.div className="about-tools__header" variants={fadeUp}>
            <h2>Tools We Use</h2>
            <p>Our AI-powered creative toolkit</p>
          </motion.div>
          <motion.div className="about-tools__track" variants={fadeUp}>
            {TOOLS.map((tool, i) => (
              <div key={i} className="about-tools__card">
                <img
                  src={tool.src}
                  alt={tool.alt}
                  loading="lazy"
                  decoding="async"
                  width={120}
                  height={120}
                />
              </div>
            ))}
          </motion.div>
        </motion.section>
      </main>
    </>
  );
}
