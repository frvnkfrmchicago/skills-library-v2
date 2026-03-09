import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import skillsData from '../data/skills.json'

export default function Category() {
  const { category } = useParams<{ category: string }>()
  const skills = (skillsData as any[]).filter(s => s.category === category)

  return (
    <div className="page-content">
      <Link to="/" className="back-btn">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="section-header">
        <h2 className="section-title">{category}</h2>
        <p className="section-subtitle">{skills.length} skills in this category</p>
      </div>

      <div className="skills-grid">
        {skills.map((skill: any, i: number) => {
          const sizeKB = skill.size / 1024
          const healthPercent = Math.min((sizeKB / 8) * 100, 100)
          const healthClass = sizeKB >= 5 ? 'healthy' : sizeKB >= 3 ? 'warning' : 'critical'

          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Link to={`/skill/${skill.id}`} className="skill-card">
                <div className="skill-card-name">{skill.name}</div>
                <p className="skill-card-desc">{skill.description}</p>
                <div className="size-bar">
                  <div
                    className={`size-bar-fill ${healthClass}`}
                    style={{ width: `${healthPercent}%` }}
                  />
                </div>
                <div className="skill-card-meta">
                  <span className="skill-meta-item">{sizeKB.toFixed(1)}KB</span>
                  <span className="skill-meta-item">{skill.lastUpdated}</span>
                </div>
                {skill.tags?.length > 0 && (
                  <div className="skill-tags">
                    {skill.tags.slice(0, 4).map((tag: string) => (
                      <span key={tag} className="skill-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
