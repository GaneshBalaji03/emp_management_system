import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { employeeApi } from '../api/employeeApi.js'
import '../styles/Home.css'

const NAV_CARDS = [
  { path: '/employees', icon: 'bi-people-fill', label: 'Employee Directory', desc: 'Manage employee records, profiles & CRUD operations', color: '#3377FF', gradient: 'linear-gradient(135deg, #3377FF, #5B93FF)' },
  { path: '/onboarding', icon: 'bi-card-checklist', label: 'Onboarding', desc: 'Track document submission & step completion', color: '#06C270', gradient: 'linear-gradient(135deg, #06C270, #34D399)' },
  { path: '/role-change', icon: 'bi-graph-up-arrow', label: 'Role & CTC Changes', desc: 'Job role, level & salary change tracking', color: '#FF9500', gradient: 'linear-gradient(135deg, #FF9500, #FFAD33)' },
  { path: '/documents', icon: 'bi-file-earmark-text', label: 'Documents', desc: 'Upload, verify & manage compliance documents', color: '#5856D6', gradient: 'linear-gradient(135deg, #5856D6, #7B79E5)' },
  { path: '/compliance', icon: 'bi-shield-check', label: 'Compliance & Alerts', desc: 'Dashboard, metrics & compliance reminders', color: '#FF3B3B', gradient: 'linear-gradient(135deg, #FF3B3B, #FF6B6B)' },
  { path: '/reports', icon: 'bi-bar-chart-line-fill', label: 'Reports & Analytics', desc: 'Headcount, CTC distribution & hiring trends', color: '#AF52DE', gradient: 'linear-gradient(135deg, #AF52DE, #C77DFF)' },
]

function HomePage() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [stats, setStats] = useState(null)
  const [time, setTime] = useState(new Date())

  /* Clock */
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  /* Load quick stats */
  useEffect(() => {
    employeeApi.headcountReport()
      .then(d => setStats(d))
      .catch(() => { })
  }, [])

  const greeting = (() => {
    const h = time.getHours()
    if (h < 12) return 'Good Morning'
    if (h < 17) return 'Good Afternoon'
    return 'Good Evening'
  })()

  const dateStr = time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="home-shell">
      {/* ── MAIN CONTENT ── */}

      <main className="home-main">
        {/* Welcome Header */}
        <div className="home-welcome-section">
          <div className="home-welcome-text">
            <h1 className="home-greeting">{greeting}</h1>
            <p className="home-date">{dateStr}</p>
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="home-stats-row">
            <div className="home-stat-card" style={{ borderLeftColor: '#3377FF' }}>
              <div className="home-stat-icon" style={{ background: 'rgba(51,119,255,0.1)', color: '#3377FF' }}>
                <i className="bi bi-people-fill" />
              </div>
              <div>
                <div className="home-stat-value">{stats.total ?? '—'}</div>
                <div className="home-stat-label">Total Employees</div>
              </div>
            </div>
            <div className="home-stat-card" style={{ borderLeftColor: '#06C270' }}>
              <div className="home-stat-icon" style={{ background: 'rgba(6,194,112,0.1)', color: '#06C270' }}>
                <i className="bi bi-person-check-fill" />
              </div>
              <div>
                <div className="home-stat-value">{stats.active ?? '—'}</div>
                <div className="home-stat-label">Active</div>
              </div>
            </div>
            <div className="home-stat-card" style={{ borderLeftColor: '#FF3B3B' }}>
              <div className="home-stat-icon" style={{ background: 'rgba(255,59,59,0.1)', color: '#FF3B3B' }}>
                <i className="bi bi-person-dash-fill" />
              </div>
              <div>
                <div className="home-stat-value">{stats.exited ?? '—'}</div>
                <div className="home-stat-label">Exited</div>
              </div>
            </div>
            <div className="home-stat-card" style={{ borderLeftColor: '#5856D6' }}>
              <div className="home-stat-icon" style={{ background: 'rgba(88,86,214,0.1)', color: '#5856D6' }}>
                <i className="bi bi-percent" />
              </div>
              <div>
                <div className="home-stat-value">{stats.total ? Math.round(stats.active / stats.total * 100) : 0}%</div>
                <div className="home-stat-label">Retention Rate</div>
              </div>
            </div>
          </div>
        )}


        {/* Module Navigation Heading */}
        <div className="home-section-header">
          <h2 className="home-section-title">
            <i className="bi bi-grid-3x3-gap-fill" style={{ color: 'var(--primary)', marginRight: '10px' }} />
            Modules
          </h2>
          <p className="home-section-subtitle">Access all HR management modules from here</p>
        </div>

        {/* Navigation Cards Grid */}
        <div className="home-cards-grid">
          {NAV_CARDS.map(c => (
            <button
              key={c.path}
              className="home-nav-card"
              onClick={() => navigate(c.path)}
            >
              <div className="home-nav-card-icon" style={{ background: c.gradient }}>
                <i className={`bi ${c.icon}`} />
              </div>
              <div className="home-nav-card-content">
                <h3 className="home-nav-card-title">{c.label}</h3>
                <p className="home-nav-card-desc">{c.desc}</p>
              </div>
              <div className="home-nav-card-arrow">
                <i className="bi bi-arrow-right" />
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}

export default HomePage
