import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Fuse from 'fuse.js'
import skillsData from '../data/skills.json'

interface Skill {
  id: string
  name: string
  description: string
  category: string
}

const fuse = new Fuse(skillsData as Skill[], {
  keys: [
    { name: 'name', weight: 3 },
    { name: 'description', weight: 2 },
    { name: 'content', weight: 1 },
    { name: 'tags', weight: 2 },
  ],
  threshold: 0.4,
  includeScore: true,
})

export function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Skill[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults((skillsData as Skill[]).slice(0, 10))
      return
    }
    const found = fuse.search(query).slice(0, 12)
    setResults(found.map(r => r.item))
  }, [query])

  const handleSelect = (skill: Skill) => {
    navigate(`/skill/${skill.id}`)
    onClose()
  }

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="search-modal-input"
          placeholder="Search skills, librarians, agents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'Enter' && results.length > 0) handleSelect(results[0])
          }}
        />
        <div className="search-modal-results">
          {results.map(skill => (
            <div
              key={skill.id}
              className="search-result-item"
              onClick={() => handleSelect(skill)}
            >
              <span className="search-result-category">{skill.category}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="search-result-name">{skill.name}</div>
                <div className="search-result-desc">{skill.description}</div>
              </div>
            </div>
          ))}
          {results.length === 0 && query && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No skills found for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
