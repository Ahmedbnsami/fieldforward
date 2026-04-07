import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const links = [
    { to: '/', label: 'Home', image: '/Main.PNG' },
    { to: '/dashboard', label: 'Dashboard', image: '/DropDown.PNG' },
    { to: '/recommend-crop', label: 'Recommend Crop', image: '/RecommendCrop.PNG' },
  ]

  const toggle = () => setIsOpen(prev => !prev)

  return (
    <>
      <nav className="bottom-nav">
        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'current' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <h2 className="nav-link-label">{link.label}</h2>
              <img className="nav-link-image" src={link.image} alt={link.label} />
            </Link>
          ))}
        </div>
      </nav>

      <button
        className={`nav-toggle ${isOpen ? 'active' : ''}`}
        onClick={toggle}
        type="button"
        aria-label="Toggle navigation"
      >
        <span className="nav-toggle-icon open">☰</span>
        <span className="nav-toggle-icon close">✕</span>
      </button>
    </>
  )
}
