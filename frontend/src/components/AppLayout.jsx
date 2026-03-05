import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import '../styles/Home.css'

export default function AppLayout({ children }) {
    const navigate = useNavigate()
    const location = useLocation()
    const { member, signOut } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null)

    /* Close dropdown on outside click */
    useEffect(() => {
        function onDocMouseDown(e) {
            if (!menuRef.current) return
            if (!menuRef.current.contains(e.target)) setMenuOpen(false)
        }
        document.addEventListener('mousedown', onDocMouseDown)
        return () => document.removeEventListener('mousedown', onDocMouseDown)
    }, [])

    async function onLogout() {
        await signOut()
        navigate('/auth')
    }

    const isHome = location.pathname === '/home'

    return (
        <>
            {/* ── SHARED TOP NAVBAR ── */}
            <div className="home-topbar">
                <div className="d-flex align-items-center gap-3">
                    <div className="home-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>
                        <i className="bi bi-grid-fill" style={{ fontSize: '20px', color: 'var(--primary)' }} />
                    </div>
                    {!isHome && (
                        <button
                            className="btn btn-outline-secondary d-flex align-items-center gap-2 rounded-pill px-3"
                            style={{ fontSize: '13px', fontWeight: 600 }}
                            onClick={() => navigate('/home')}
                        >
                            <i className="bi bi-arrow-left" /> Home
                        </button>
                    )}
                </div>

                <div className="d-flex align-items-center gap-3">
                    {/* Module Shortcuts (Related Elements) */}
                    <div className="d-none d-md-flex align-items-center gap-2 me-2">
                        <button className="btn btn-link text-dark p-2" title="Onboarding" onClick={() => navigate('/onboarding')}>
                            <i className="bi bi-card-checklist" style={{ fontSize: '18px' }} />
                        </button>
                        <button className="btn btn-link text-dark p-2" title="Compliance" onClick={() => navigate('/compliance')}>
                            <i className="bi bi-shield-check" style={{ fontSize: '18px' }} />
                        </button>
                        <button className="btn btn-link text-dark p-2" title="Reports" onClick={() => navigate('/reports')}>
                            <i className="bi bi-bar-chart-line" style={{ fontSize: '18px' }} />
                        </button>
                    </div>

                    {/* Quick Add Action */}
                    <button
                        className="btn emp-primary-btn d-flex align-items-center gap-2 rounded-pill px-3 py-2"
                        style={{ fontSize: '13px', fontWeight: 600, height: '38px' }}
                        onClick={() => navigate('/employees', { state: { openAddModal: true } })}
                    >
                        <i className="bi bi-plus-lg" />
                        <span className="d-none d-sm-inline">Add Employee</span>
                    </button>

                    <div className="dropdown" ref={menuRef}>
                        <button
                            className="home-userbtn"
                            type="button"
                            aria-expanded={menuOpen}
                            onClick={() => setMenuOpen((v) => !v)}
                        >
                            <i className="bi bi-person-circle" />
                        </button>

                        <ul className={`dropdown-menu dropdown-menu-end home-dropdown${menuOpen ? ' show' : ''}`}>
                            <li className="px-3 pt-2 pb-1">
                                <div className="home-userline">
                                    <i className="bi bi-person-circle" />
                                    <div>
                                        <div className="home-username">{member?.name || '--'}</div>
                                        <div className="home-userdetail">{member?.email || '--'}</div>
                                        <div className="home-userdetail">{member?.phone || '--'}</div>
                                    </div>
                                </div>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li className="px-3 pb-3">
                                <button className="btn btn-danger w-100" type="button" onClick={onLogout}>
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* ── PAGE CONTENT ── */}
            {children}
        </>
    )
}
