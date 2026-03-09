import { ReactNode, useState, useEffect, useCallback } from 'react'
import { Link, useLocation} from 'react-router-dom'
import { BookOpen, Search, Home, Layers, Grid3X3, LibraryBig } from 'lucide-react'
import { SearchModal } from './SearchModal'

export function Layout({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setSearchOpen(true)
    }
    if (e.key === 'Escape') setSearchOpen(false)
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    setSearchOpen(false)
  }, [location])

  const isActive = (path: string) => location.pathname === path ? 'active' : ''

  return (
    <div className="app-container">
      {/* Animated grid background */}
      <div className="grid-bg" />

      {/* Floating ambient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="nav-brand">
            <div className="brand-icon">
              <BookOpen size={18} />
            </div>
            Agentic
          </Link>

          <ul className="nav-links">
            <li><Link to="/" className={isActive('/')}>Home</Link></li>
            <li><Link to="/browse" className={isActive('/browse')}>Browse</Link></li>
            <li><Link to="/wings" className={location.pathname.includes('/wings') ? 'active' : ''}>Wings</Link></li>
            <li><Link to="/category/Librarians" className={location.pathname.includes('/category') ? 'active' : ''}>Categories</Link></li>
          </ul>

          <button className="nav-search-btn" onClick={() => setSearchOpen(true)}>
            <Search size={14} />
            Search...
            <kbd>⌘K</kbd>
          </button>
        </div>
      </nav>

      {children}

      {/* Mobile bottom nav */}
      <div className="mobile-nav">
        <div className="mobile-nav-inner">
          <Link to="/" className={`mobile-nav-item ${isActive('/')}`}>
            <Home size={20} />
            Home
          </Link>
          <Link to="/browse" className={`mobile-nav-item ${isActive('/browse')}`}>
            <Grid3X3 size={20} />
            Browse
          </Link>
          <Link to="/wings" className={`mobile-nav-item ${location.pathname.includes('/wings') ? 'active' : ''}`}>
            <LibraryBig size={20} />
            Wings
          </Link>
          <button className="mobile-nav-item" onClick={() => setSearchOpen(true)}>
            <Search size={20} />
            Search
          </button>
        </div>
      </div>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  )
}
