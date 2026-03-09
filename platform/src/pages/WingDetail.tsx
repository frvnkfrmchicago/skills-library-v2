import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Copy, Check, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { getWingById } from '../data/wings-data'
import { TiltCard } from '../components/TiltCard'

/* Roster cards enter from alternating directions */
const rosterVariants = {
  hidden: (i: number) => ({
    opacity: 0,
    x: i % 3 === 0 ? -20 : i % 3 === 1 ? 0 : 20,
    y: i % 3 === 1 ? 20 : 0,
    scale: 0.95,
  }),
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, delay: 0.3 + i * 0.06, ease: "easeOut" as const },
  }),
}

export default function WingDetail() {
  const { wingId } = useParams<{ wingId: string }>()
  const wing = getWingById(wingId || '')
  const [copied, setCopied] = useState(false)

  if (!wing) {
    return (
      <div className="page-content" style={{ textAlign: 'center', paddingTop: 'var(--space-3xl)' }}>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Wing not found.</p>
        <Link to="/wings" style={{ marginTop: 'var(--space-md)', display: 'inline-block', color: 'var(--accent)' }}>
          Back to Wings
        </Link>
      </div>
    )
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(wing.activationPrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = wing.activationPrompt
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="page-content">
      <motion.button
        className="back-btn"
        onClick={() => window.history.back()}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" as const }}
      >
        <ArrowLeft size={16} /> Back
      </motion.button>

      {/* Wing Header — scale up entrance */}
      <motion.div
        className="wing-detail-header"
        initial={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, ease: "easeOut" as const }}
      >
        <div className="wing-detail-icon" style={{ background: 'var(--gradient-accent)' }}>
          <wing.icon size={32} />
        </div>
        <div className="wing-detail-info">
          <h1 className="wing-detail-name">{wing.name} Wing</h1>
          <p className="wing-detail-desc">{wing.description}</p>
        </div>
      </motion.div>

      {/* Activation Card — slide from right */}
      <motion.div
        className="wing-activation-card"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" as const }}
      >
        <div className="wing-activation-label">Activation Prompt</div>
        <div className="wing-activation-row">
          <code className="wing-activation-code">{wing.activationPrompt}</code>
          <button className="wing-copy-btn" onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="wing-activation-hint">
          Use this prompt to activate all {wing.librarians.length} librarians in this Wing simultaneously.
        </p>
      </motion.div>

      {/* When to Use — slide from left */}
      <motion.div
        className="wing-when-card"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" as const }}
      >
        <h3 className="wing-when-title">When to Use</h3>
        <p className="wing-when-text">{wing.whenToUse}</p>
      </motion.div>

      {/* Librarian Roster — varied directional entrance */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <h2 className="section-title" style={{ marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)' }}>
          Librarian Roster
        </h2>
        <p className="section-subtitle" style={{ marginBottom: 'var(--space-lg)' }}>
          {wing.librarians.length} librarians working together in this Wing
        </p>
      </motion.div>

      <div className="wing-roster-grid">
        {wing.librarians.map((lib, i) => (
          <motion.div
            key={lib.id}
            custom={i}
            variants={rosterVariants}
            initial="hidden"
            animate="visible"
            style={{ perspective: '600px' }}
          >
            <TiltCard className="wing-roster-card" intensity={6}>
              <Link to={`/skill/${lib.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div className="wing-roster-card-header">
                  <span className="wing-roster-card-name">{lib.name}</span>
                  <ExternalLink size={14} className="wing-roster-link-icon" />
                </div>
                <p className="wing-roster-card-role">{lib.role}</p>
              </Link>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
