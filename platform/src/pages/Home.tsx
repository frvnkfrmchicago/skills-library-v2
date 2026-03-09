import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, BookOpen, Bot, Zap, Monitor, FileText, Layers, ArrowRight } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import skillsData from '../data/skills.json'
import { wings } from '../data/wings-data'
import { TiltCard } from '../components/TiltCard'

/* ── Category config with per-category accent colors ── */
const categories = [
  { name: 'Librarians', icon: BookOpen, colorVar: '--cat-librarians', desc: 'Architecture guides with principles, decision trees, and anti-skimming protocols' },
  { name: 'Agents', icon: Bot, colorVar: '--cat-agents', desc: 'Specialized AI skill documents for specific tools and frameworks' },
  { name: 'Workflows', icon: Zap, colorVar: '--cat-workflows', desc: 'Step-by-step process guides for common development tasks' },
  { name: 'Platforms', icon: Monitor, colorVar: '--cat-platforms', desc: 'IDE and tool configurations for AI-powered development' },
  { name: 'Content', icon: FileText, colorVar: '--cat-content', desc: 'Content creation guides — blogging, viral strategies, brand deals' },
  { name: 'App Types', icon: Layers, colorVar: '--cat-apptypes', desc: 'Architecture blueprints for specific app categories' },
]

/* ── Counter animation ── */
function useCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = Math.ceil(target / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, duration])
  return { count, ref }
}

/* ── Floating particle component ── */
function ParticleField() {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 3,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 4,
      color: i % 3 === 0 ? 'var(--accent)' : i % 3 === 1 ? 'var(--accent-teal)' : 'var(--accent-lavender)',
    }))
  , [])

  return (
    <div className="particle-field">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

/* ── Category color helper ── */
function getCatColor(category: string): string {
  const map: Record<string, string> = {
    'Librarians': 'var(--cat-librarians)',
    'Agents': 'var(--cat-agents)',
    'Workflows': 'var(--cat-workflows)',
    'Platforms': 'var(--cat-platforms)',
    'Content': 'var(--cat-content)',
    'App Types': 'var(--cat-apptypes)',
    'Tech Stack': 'var(--accent-teal)',
  }
  return map[category] || 'var(--accent)'
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const stats = {
    librarians: (skillsData as any[]).filter(s => s.category === 'Librarians').length,
    agents: (skillsData as any[]).filter(s => s.category === 'Agents').length,
    workflows: (skillsData as any[]).filter(s => s.category === 'Workflows').length,
    total: (skillsData as any[]).length,
  }

  const recentlyUpdated = [...(skillsData as any[])]
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, 6)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) navigate(`/browse?q=${encodeURIComponent(searchQuery)}`)
  }

  const libCounter = useCounter(stats.librarians)
  const agentCounter = useCounter(stats.agents)
  const workflowCounter = useCounter(stats.workflows)
  const totalCounter = useCounter(stats.total)
  const wingsCounter = useCounter(wings.length)

  return (
    <>
      {/* Hero with particle field */}
      <section className="hero">
        <ParticleField />

        <motion.div
          className="hero-tagline"
          initial={{ opacity: 0, scaleX: 0.8 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6 }}
        >
          <span>AI First</span>
          <span className="dot" />
          <span>Prompt Engineering</span>
          <span className="dot" />
          <span style={{ color: 'var(--accent-teal)' }}>{stats.total} Skills</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8 }}
        >
          Agentic<br />
          <span className="hero-accent">Skill Library</span>
        </motion.h1>

        <motion.form
          className="search-container"
          onSubmit={handleSearch}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Search size={18} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search skills, librarians, agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.form>

        {/* Stat counters */}
        <motion.div
          className="stats-bar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {[
            { ref: libCounter.ref, val: libCounter.count, label: 'Librarians', color: 'var(--cat-librarians)' },
            { ref: agentCounter.ref, val: agentCounter.count, label: 'Agents', color: 'var(--cat-agents)' },
            { ref: workflowCounter.ref, val: workflowCounter.count, label: 'Workflows', color: 'var(--cat-workflows)' },
            { ref: totalCounter.ref, val: totalCounter.count, label: 'Total Skills', color: 'var(--text-primary)' },
            { ref: wingsCounter.ref, val: wingsCounter.count, label: 'Wings', color: 'var(--accent-lavender)' },
          ].map((s) => (
            <div className="stat-item" ref={s.ref} key={s.label}>
              <div className="stat-number" style={{ color: s.color }}>{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      <div className="page-content">
        {/* Categories */}
        <motion.div
          className="section-header"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <h2 className="section-title">Browse by Category</h2>
          <p className="section-subtitle">Explore skills organized by function</p>
        </motion.div>

        <div className="categories-grid">
          {categories.map((cat, i) => {
            const count = (skillsData as any[]).filter(s => s.category === cat.name).length
            if (count === 0) return null
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 30, rotateX: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                style={{ perspective: '600px' }}
              >
                <TiltCard className="category-card">
                  <Link to={`/category/${cat.name}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div className="category-header">
                      <div className="category-icon" style={{ background: `var(${cat.colorVar})` }}>
                        <cat.icon size={22} />
                      </div>
                      <div>
                        <div className="category-name">{cat.name}</div>
                        <div className="category-count" style={{ color: `var(${cat.colorVar})` }}>{count} skills</div>
                      </div>
                    </div>
                    <p className="category-desc">{cat.desc}</p>
                  </Link>
                </TiltCard>
              </motion.div>
            )
          })}
        </div>

        {/* Wings */}
        <motion.div className="section-header" style={{ marginTop: 'var(--space-2xl)' }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h2 className="section-title">Wings</h2>
          <p className="section-subtitle">Activate multiple librarians at once</p>
        </motion.div>

        <div className="wings-home-grid">
          {wings.slice(0, 4).map((wing, i) => (
            <motion.div key={wing.id}
              initial={{ opacity: 0, y: 40, rotateZ: i % 2 === 0 ? -3 : 3 }}
              animate={{ opacity: 1, y: 0, rotateZ: 0 }}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.1 }}
            >
              <Link to={`/wings/${wing.id}`} className="wing-home-card">
                <div className="wing-home-icon" style={{ background: 'var(--gradient-accent)' }}>
                  <wing.icon size={18} />
                </div>
                <div className="wing-home-info">
                  <span className="wing-home-name">{wing.name}</span>
                  <span className="wing-home-count">{wing.librarians.length} librarians</span>
                </div>
                <ArrowRight size={14} className="wing-home-arrow" />
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div style={{ textAlign: 'center', marginTop: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 1.2 }}
        >
          <Link to="/wings" className="view-all-link">View all {wings.length} Wings <ArrowRight size={14} /></Link>
        </motion.div>

        {/* Recently Updated */}
        <motion.div className="section-header" style={{ marginTop: 'var(--space-2xl)' }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">Recently Updated</h2>
          <p className="section-subtitle">Latest improvements to the library</p>
        </motion.div>

        <div className="skills-grid">
          {recentlyUpdated.map((skill: any, i: number) => (
            <motion.div key={skill.id}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20, rotateY: i % 2 === 0 ? -5 : 5 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.06 }}
              style={{ perspective: '600px' }}
            >
              <TiltCard className="skill-card" style={{ '--card-accent': getCatColor(skill.category) } as React.CSSProperties}>
                <Link to={`/skill/${skill.id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div className="skill-card-header">
                    <div className="skill-card-name">{skill.name}</div>
                    <div className="skill-card-dot" style={{ background: getCatColor(skill.category) }} />
                  </div>
                  <p className="skill-card-desc">{skill.description}</p>
                  <div className="skill-card-meta">
                    <span className="skill-meta-item">{skill.lastUpdated?.slice(0, 10)}</span>
                    <span className="skill-meta-item" style={{ color: getCatColor(skill.category) }}>
                      {skill.category}
                    </span>
                  </div>
                  {skill.tags?.length > 0 && (
                    <div className="skill-tags">
                      {skill.tags.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="skill-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </Link>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  )
}
