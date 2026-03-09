import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { wings } from '../data/wings-data'
import { TiltCard } from '../components/TiltCard'

/* Each Wing card enters from a different direction */
const spineVariants = {
  hidden: (i: number) => ({
    opacity: 0,
    y: 50,
    rotateZ: i % 2 === 0 ? -4 : 4,
    scale: 0.9,
  }),
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateZ: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      delay: 0.12 + i * 0.08,
      ease: "easeOut" as const,
    },
  }),
}

export default function Wings() {
  return (
    <div className="page-content">
      <motion.div
        className="section-header"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" as const }}
      >
        <h2 className="section-title">Wings</h2>
        <p className="section-subtitle">
          Activate a Wing to load multiple librarians at once for a specific objective
        </p>
      </motion.div>

      <div className="wings-grid">
        {wings.map((wing, i) => (
          <motion.div
            key={wing.id}
            custom={i}
            variants={spineVariants}
            initial="hidden"
            animate="visible"
            style={{ perspective: '600px' }}
          >
            <TiltCard className="wing-card" intensity={5}>
              <Link to={`/wings/${wing.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div className="wing-card-header">
                  <div className="wing-card-icon" style={{ background: 'var(--gradient-accent)' }}>
                    <wing.icon size={24} />
                  </div>
                  <div className="wing-card-title-area">
                    <h3 className="wing-card-name">{wing.name} Wing</h3>
                    <span className="wing-card-count">
                      {wing.librarians.length} librarians
                    </span>
                  </div>
                  <ArrowRight size={18} className="wing-card-arrow" />
                </div>

                <p className="wing-card-desc">{wing.description}</p>

                <div className="wing-card-roster">
                  {wing.librarians.slice(0, 4).map((lib) => (
                    <span key={lib.id} className="wing-roster-tag">
                      {lib.name}
                    </span>
                  ))}
                  {wing.librarians.length > 4 && (
                    <span className="wing-roster-tag wing-roster-more">
                      +{wing.librarians.length - 4}
                    </span>
                  )}
                </div>
              </Link>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {/* How Wings Work */}
      <motion.div
        className="wing-explainer"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" as const }}
      >
        <div className="wing-explainer-inner">
          <h3 className="wing-explainer-title">How Wings Work</h3>
          <div className="wing-explainer-steps">
            {['Activate', 'Build', 'Stack'].map((step, i) => (
              <motion.div
                key={step}
                className="wing-explainer-step"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.15 }}
              >
                <div className="wing-step-num">{i + 1}</div>
                <div>
                  <strong>{step}</strong>
                  <p>{
                    i === 0 ? 'Say the activation prompt to load all librarians in a Wing at once.' :
                    i === 1 ? 'Every librarian in the Wing applies its rules throughout your session.' :
                    'Combine multiple Wings for complex tasks. Librarians deduplicate automatically.'
                  }</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
