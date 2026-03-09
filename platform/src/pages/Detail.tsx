import { useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import skillsData from '../data/skills.json'

interface TocItem {
  id: string
  text: string
  depth: number
}

function extractToc(content: string): TocItem[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm
  const items: TocItem[] = []
  let match
  while ((match = headingRegex.exec(content)) !== null) {
    const depth = match[1].length
    const text = match[2].replace(/[`*_]/g, '')
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '')
    items.push({ id, text, depth })
  }
  return items
}

export default function Detail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const skill = (skillsData as any[]).find(s => s.id === id)

  const toc = useMemo(() => {
    if (!skill) return []
    return extractToc(skill.content)
  }, [skill])

  if (!skill) {
    return (
      <div className="page-content" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
        <h2>Skill not found</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-md)' }}>
          The skill "{id}" doesn't exist in the library.
        </p>
        <Link to="/browse" style={{ marginTop: 'var(--space-lg)', display: 'inline-block' }}>
          Browse all skills →
        </Link>
      </div>
    )
  }

  return (
    <div className="page-content">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
        <span className="skill-meta-item" style={{ color: 'var(--accent-coral)', fontSize: '0.8rem' }}>
          {skill.category}
        </span>
        <span className="skill-meta-item">{(skill.size / 1024).toFixed(1)}KB</span>
        <span className="skill-meta-item">Updated: {skill.lastUpdated}</span>
      </div>

      {skill.tags?.length > 0 && (
        <div className="skill-tags" style={{ marginBottom: 'var(--space-lg)' }}>
          {skill.tags.map((tag: string) => (
            <span key={tag} className="skill-tag">{tag}</span>
          ))}
        </div>
      )}

      <div className="detail-layout">
        {/* Table of Contents */}
        <aside className="detail-toc">
          <div className="toc-title">On This Page</div>
          {toc.map(item => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`toc-link ${item.depth >= 3 ? 'depth-3' : ''}`}
            >
              {item.text}
            </a>
          ))}
        </aside>

        {/* Content */}
        <div className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children, ...props }) => {
                const text = String(children)
                const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                return <h1 id={id} {...props}>{children}</h1>
              },
              h2: ({ children, ...props }) => {
                const text = String(children)
                const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                return <h2 id={id} {...props}>{children}</h2>
              },
              h3: ({ children, ...props }) => {
                const text = String(children)
                const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                return <h3 id={id} {...props}>{children}</h3>
              },
              h4: ({ children, ...props }) => {
                const text = String(children)
                const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                return <h4 id={id} {...props}>{children}</h4>
              },
              a: ({ href, children }) => {
                // Convert librarian links to internal routes
                if (href?.includes('librarian') && href?.endsWith('.md')) {
                  const name = href.split('/').pop()?.replace('.md', '') || ''
                  const linkedSkill = (skillsData as any[]).find(s =>
                    s.relativePath.includes(name)
                  )
                  if (linkedSkill) {
                    return <Link to={`/skill/${linkedSkill.id}`}>{children}</Link>
                  }
                }
                return <a href={href} target="_blank" rel="noopener">{children}</a>
              },
            }}
          >
            {skill.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Related Skills */}
      {skill.relatedSkills?.length > 0 && (
        <div style={{ marginTop: 'var(--space-2xl)' }}>
          <h3 className="section-title" style={{ fontSize: '1.2rem' }}>Related Skills</h3>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginTop: 'var(--space-md)' }}>
            {skill.relatedSkills.map((name: string) => {
              const related = (skillsData as any[]).find(s =>
                s.name.toLowerCase().includes(name.toLowerCase().replace(/-/g, ' '))
              )
              if (!related) return (
                <span key={name} className="skill-tag" style={{ fontSize: '0.85rem', padding: '4px 12px' }}>
                  {name}
                </span>
              )
              return (
                <Link key={name} to={`/skill/${related.id}`} className="skill-tag"
                  style={{ fontSize: '0.85rem', padding: '4px 12px', cursor: 'pointer' }}>
                  {related.name}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
