import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Fuse from 'fuse.js'
import skillsData from '../data/skills.json'
import { TiltCard } from '../components/TiltCard'

/* ── Category color map ── */
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

const allCategories = [...new Set((skillsData as any[]).map(s => s.category))]

const fuse = new Fuse(skillsData as any[], {
  keys: [
    { name: 'name', weight: 3 },
    { name: 'description', weight: 2 },
    { name: 'content', weight: 1 },
    { name: 'tags', weight: 2 },
  ],
  threshold: 0.4,
})

export default function Browse() {
  const [searchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery)
  }, [initialQuery])

  const filtered = useMemo(() => {
    let results = skillsData as any[]
    if (query.trim()) {
      results = fuse.search(query).map(r => r.item)
    }
    if (activeCategory) {
      results = results.filter(s => s.category === activeCategory)
    }
    return results
  }, [query, activeCategory])

  return (
    <div className="page-content">
      <div className="section-header">
        <h2 className="section-title">Browse All Skills</h2>
        <p className="section-subtitle">{filtered.length} skills found</p>
      </div>

      <div style={{ maxWidth: 500, marginBottom: 'var(--space-lg)', position: 'relative' }}>
        <input
          className="search-input"
          style={{ paddingLeft: 'var(--space-lg)' }}
          placeholder="Filter skills..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="filter-bar">
        <button
          className={`filter-btn ${!activeCategory ? 'active' : ''}`}
          onClick={() => setActiveCategory(null)}
        >
          All
        </button>
        {allCategories.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            style={activeCategory === cat ? { borderColor: getCatColor(cat), color: getCatColor(cat) } : {}}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="skills-grid">
        {filtered.map((skill: any, i: number) => (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, x: i % 2 === 0 ? -12 : 12, y: 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.6) }}
            style={{ perspective: '600px' }}
          >
            <TiltCard className="skill-card" intensity={4} style={{ '--card-accent': getCatColor(skill.category) } as React.CSSProperties}>
              <Link to={`/skill/${skill.id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className="skill-card-header">
                  <div className="skill-card-name">{skill.name}</div>
                  <div className="skill-card-dot" style={{ background: getCatColor(skill.category) }} />
                </div>
                <p className="skill-card-desc">{skill.description}</p>
                <div className="skill-card-meta">
                  <span className="skill-meta-item">{(skill.size / 1024).toFixed(1)}KB</span>
                  <span className="skill-meta-item">{skill.lastUpdated?.slice(0, 10)}</span>
                  <span className="skill-meta-item" style={{ color: getCatColor(skill.category) }}>
                    {skill.category}
                  </span>
                </div>
                {skill.tags?.length > 0 && (
                  <div className="skill-tags">
                    {skill.tags.slice(0, 4).map((tag: string) => (
                      <span key={tag} className="skill-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </Link>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.2rem' }}>No skills match your search.</p>
          <p style={{ marginTop: 'var(--space-sm)' }}>Try different keywords or clear filters.</p>
        </div>
      )}
    </div>
  )
}
