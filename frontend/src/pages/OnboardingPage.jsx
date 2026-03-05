import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { employeeApi } from '../api/employeeApi.js'
import { useAuth } from '../auth/AuthContext.jsx'
import '../styles/employees.css'

const COLORS = ['#3377FF', '#06C270', '#FF3B3B', '#FF9500', '#5856D6', '#AF52DE', '#FF2D55', '#007AFF', '#34C759', '#FFD60A']
function avatarColor(name) { let h = 0; for (let i = 0; i < (name?.length || 0); i++) h = name.charCodeAt(i) + ((h << 5) - h); return COLORS[Math.abs(h) % COLORS.length] }
const PAGE_SIZE = 10

/* ─────────── ONBOARDING DETAIL MODAL ─────────── */
function OnboardingModal({ emp, onClose, token }) {
    const [items, setItems] = useState(emp.items || [])
    const [updating, setUpdating] = useState(false)
    const [notice, setNotice] = useState(null)
    const bg = avatarColor(emp.first_name)

    const completed = items.filter(i => i.status === 'COMPLETED' || i.status === 'VERIFIED').length
    const progress = items.length > 0 ? Math.round((completed / items.length) * 100) : 0

    function flash(type, message) { setNotice({ type, message }); setTimeout(() => setNotice(null), 3000) }

    async function handleStatusUpdate(trackerId, newStatus) {
        setUpdating(true)
        try {
            await employeeApi.updateOnboardingStatus({ token, trackerId, status: newStatus })
            setItems(prev => prev.map(i => i.emp_compliance_tracker_id === trackerId ? { ...i, status: newStatus } : i))
            flash('success', 'Status updated')
        } catch (e) {
            flash('error', e.message || 'Update failed')
        } finally {
            setUpdating(false)
        }
    }

    const statusColor = s => {
        if (s === 'COMPLETED' || s === 'VERIFIED') return { bg: 'rgba(6,194,112,0.1)', color: '#06C270', label: '✅ ' + s }
        if (s === 'IN PROGRESS') return { bg: 'rgba(255,149,0,0.1)', color: '#FF9500', label: '🔄 In Progress' }
        if (s === 'REJECTED') return { bg: 'rgba(255,59,59,0.1)', color: '#FF3B3B', label: '❌ Rejected' }
        return { bg: 'rgba(143,144,166,0.1)', color: '#8F90A6', label: '⏳ Pending' }
    }

    return (
        <div className="emp-modal-backdrop" onClick={onClose}>
            <div className="card profile-card shadow-lg border-0" style={{ width: 'min(780px, 94vw)' }} onClick={e => e.stopPropagation()}>
                {/* ── HERO ── */}
                <div className="profile-hero p-4 d-flex align-items-center gap-4 text-white" style={{ background: `linear-gradient(135deg, ${bg}, ${bg}cc)` }}>
                    <div className="profile-avatar-large">{(emp.first_name?.[0] || '?').toUpperCase()}</div>
                    <div className="flex-grow-1">
                        <h3 className="mb-0 fw-bold" style={{ fontFamily: "'Inter', sans-serif" }}>{emp.first_name} {emp.last_name}</h3>
                        <div className="opacity-75 mt-1" style={{ fontSize: '14px' }}>ID: {emp.emp_id}  ·  Joined: {emp.start_date || '—'}</div>
                        <div className="mt-2 d-flex align-items-center gap-3">
                            <span className="emp-badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                                {progress === 100 ? '✅ Complete' : `${progress}% Done`}
                            </span>
                            <span style={{ fontSize: '13px', opacity: 0.8 }}>{completed}/{items.length} tasks</span>
                        </div>
                    </div>
                    <button className="btn-close btn-close-white position-absolute top-0 end-0 m-3" onClick={onClose} />
                </div>

                {/* ── PROGRESS BAR ── */}
                <div className="px-4 pt-3 pb-2 bg-light border-bottom">
                    <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="x-small fw-bold text-muted text-uppercase">Onboarding Progress</span>
                        <span className="x-small text-muted">{completed}/{items.length}</span>
                    </div>
                    <div className="progress" style={{ height: '8px', borderRadius: '10px' }}>
                        <div
                            className={`progress-bar ${progress === 100 ? 'bg-success' : progress > 50 ? 'bg-primary' : 'bg-warning'}`}
                            style={{ width: `${progress}%`, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: '10px' }}
                        />
                    </div>
                </div>

                {/* ── NOTICE ── */}
                {notice && (
                    <div className={`mx-4 mt-3 alert ${notice.type === 'success' ? 'alert-success' : 'alert-danger'} py-2 small d-flex align-items-center gap-2`} style={{ borderRadius: '10px' }}>
                        <i className={`bi ${notice.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`} />
                        {notice.message}
                    </div>
                )}

                {/* ── DOCUMENTS & STEPS ── */}
                <div className="p-4 custom-scrollbar" style={{ maxHeight: 'calc(90vh - 280px)', overflowY: 'auto' }}>
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <i className="bi bi-list-check text-primary" style={{ fontSize: '18px' }} />
                        <h6 className="mb-0 fw-bold text-uppercase small" style={{ letterSpacing: '0.08em', color: 'var(--dark-2)', fontFamily: "'Inter', sans-serif" }}>
                            Required Documents & Steps
                        </h6>
                        <span className="badge bg-primary rounded-pill ms-auto">{items.length}</span>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-clipboard2-x d-block mb-2" style={{ fontSize: '48px', opacity: 0.2 }} />
                            <div className="text-muted">No onboarding items assigned to this employee.</div>
                        </div>
                    ) : (
                        <div className="row g-3">
                            {items.map(item => {
                                const sc = statusColor(item.status)
                                return (
                                    <div key={item.emp_compliance_tracker_id} className="col-md-6">
                                        <div className="card border-0 shadow-sm h-100"
                                            style={{ borderRadius: '12px', borderLeft: `4px solid ${sc.color}`, transition: 'transform 0.2s, box-shadow 0.2s' }}
                                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)' }}
                                            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                                        >
                                            <div className="card-body p-3">
                                                {/* Header */}
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <div className="fw-bold" style={{ fontSize: '14px', fontFamily: "'Inter', sans-serif" }}>{item.comp_type}</div>
                                                    </div>
                                                    <span className="badge rounded-pill px-2" style={{ fontSize: '10px', background: sc.bg, color: sc.color, fontWeight: 700 }}>
                                                        {item.status}
                                                    </span>
                                                </div>

                                                {/* Status Selector */}
                                                <div className="mb-2">
                                                    <label className="x-small fw-bold text-muted text-uppercase d-block mb-1" style={{ letterSpacing: '0.04em' }}>Update Status</label>
                                                    <select
                                                        className="form-select form-select-sm bg-light border-0 fw-semibold"
                                                        style={{ fontSize: '12px', borderRadius: '8px' }}
                                                        value={item.status}
                                                        disabled={updating}
                                                        onChange={e => handleStatusUpdate(item.emp_compliance_tracker_id, e.target.value)}
                                                    >
                                                        <option value="PENDING">⏳ Pending</option>
                                                        <option value="IN PROGRESS">🔄 In Progress</option>
                                                        <option value="COMPLETED">✅ Completed</option>
                                                    </select>
                                                </div>

                                                {/* Document Link */}
                                                {item.doc_url ? (
                                                    <a href={item.doc_url} target="_blank" rel="noopener noreferrer"
                                                        className="btn btn-sm btn-outline-primary w-100 rounded-pill d-flex align-items-center justify-content-center gap-1"
                                                        style={{ fontSize: '12px' }}
                                                    >
                                                        <i className="bi bi-eye" /> View Document
                                                    </a>
                                                ) : (
                                                    <div className="text-muted x-small text-center d-flex align-items-center justify-content-center gap-1 py-1">
                                                        <i className="bi bi-cloud-upload" /> No document uploaded
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════
   MAIN ONBOARDING PAGE
   ═══════════════════════════════════════════ */
export default function OnboardingPage() {
    const navigate = useNavigate()
    const { token } = useAuth()

    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [notice, setNotice] = useState(null)
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
    const [selectedEmp, setSelectedEmp] = useState(null)

    async function load() {
        setLoading(true)
        try {
            const data = await employeeApi.list({ token, search })
            const list = Array.isArray(data) ? data : []

            const enhanced = await Promise.all(
                list.map(async emp => {
                    try {
                        const profile = await employeeApi.getProfile({ token, empId: emp.emp_id })
                        const items = Array.isArray(profile.compliance) ? profile.compliance : []
                        const completed = items.filter(i => i.status === 'COMPLETED' || i.status === 'VERIFIED').length
                        const progress = items.length > 0 ? Math.round((completed / items.length) * 100) : 0
                        return { ...emp, progress, items }
                    } catch {
                        return { ...emp, progress: 0, items: [] }
                    }
                })
            )

            setRows(enhanced)
        } catch (e) {
            setNotice({ type: 'error', message: e.message || 'Failed to load onboarding data' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!token) return
        const t = setTimeout(load, 400)
        return () => clearTimeout(t)
    }, [search, token])

    function flash(type, message) { setNotice({ type, message }); setTimeout(() => setNotice(null), 4000) }

    const visible = rows.slice(0, visibleCount)
    const hasMore = visibleCount < rows.length

    return (
        <div className="emp-shell">
            {/* ── TOPBAR ── */}
            <div className="emp-topbar">
                <div className="input-group" style={{ maxWidth: '340px', flex: '1 1 auto' }}>
                    <span className="input-group-text bg-white"><i className="bi bi-search text-muted" /></span>
                    <input className="form-control" placeholder="Search employees…" value={search} onChange={e => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE) }} />
                    {search && <button className="btn btn-outline-secondary border-start-0" onClick={() => setSearch('')}><i className="bi bi-x" /></button>}
                </div>

                <div className="emp-topbar-actions">
                    <button className="btn emp-primary-btn d-flex align-items-center gap-2 px-3" onClick={() => navigate('/documents')}>
                        <i className="bi bi-file-earmark-plus" /> Manage Documents
                    </button>
                </div>
            </div>

            {/* ── HEADER ── */}
            <div className="emp-header d-flex justify-content-between align-items-end flex-wrap">
                <div>
                    <h1 className="emp-title">Onboarding Tracking</h1>
                    <p className="emp-subtitle">Monitor document submission and step completion for employees.</p>
                </div>
                <div className="text-muted small">{rows.length} employee{rows.length !== 1 ? 's' : ''}</div>
            </div>

            {/* ── NOTICE ── */}
            {notice && (
                <div className={`alert ${notice.type === 'success' ? 'alert-success' : 'alert-danger'} emp-alert border-0 shadow-sm d-flex align-items-center gap-2`}>
                    <i className={`bi ${notice.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`} />
                    {notice.message}
                    <button className="btn-close ms-auto" onClick={() => setNotice(null)} />
                </div>
            )}

            {/* ── TABLE ── */}
            <div className="card border-0 shadow-sm emp-card">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4 py-3">ID</th>
                                    <th className="py-3">Employee</th>
                                    <th className="py-3" style={{ width: '250px' }}>Progress</th>
                                    <th className="py-3 text-center">Tasks</th>
                                    <th className="py-3">Status</th>
                                    <th className="pe-4 py-3 text-end">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && rows.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-5"><i className="bi bi-arrow-repeat emp-spin text-primary" style={{ fontSize: '36px' }} /></td></tr>
                                ) : visible.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-5"><div className="text-muted"><i className="bi bi-inbox d-block mb-2" style={{ fontSize: '40px', opacity: 0.3 }} />No employees found.</div></td></tr>
                                ) : visible.map(row => (
                                    <tr key={row.emp_id} style={{ transition: 'all 0.2s ease' }}>
                                        <td className="ps-4 fw-bold text-primary">{row.emp_id}</td>
                                        <td>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="emp-avatar shadow-sm" style={{ background: avatarColor(row.first_name) }}>
                                                    {(row.first_name?.[0] || '?').toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="fw-bold">{row.first_name} {row.last_name}</div>
                                                    <div className="text-muted x-small">Joined: {row.start_date || '—'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="progress flex-grow-1" style={{ height: '8px', borderRadius: '10px' }}>
                                                    <div
                                                        className={`progress-bar ${row.progress === 100 ? 'bg-success' : row.progress > 50 ? 'bg-primary' : 'bg-warning'}`}
                                                        style={{ width: `${row.progress}%`, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: '10px' }}
                                                    />
                                                </div>
                                                <span className="fw-bold small" style={{ width: '40px', fontSize: '12px' }}>{row.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className="badge bg-white text-dark border shadow-sm px-3 py-2" style={{ borderRadius: '8px' }}>
                                                <span className="text-primary fw-bold">{row.items.filter(i => i.status === 'COMPLETED' || i.status === 'VERIFIED').length}</span>
                                                <span className="text-muted mx-1">/</span>
                                                <span className="text-muted">{row.items.length}</span>
                                            </span>
                                        </td>
                                        <td>
                                            {row.items.length === 0 ? (
                                                <span className="emp-badge" style={{ background: 'rgba(150,150,150,0.1)', color: '#999' }}>No Items</span>
                                            ) : row.progress === 100 ? (
                                                <span className="emp-badge emp-badge-active"><i className="bi bi-check-circle me-1" />Complete</span>
                                            ) : (
                                                <span className="emp-badge" style={{ background: 'rgba(255,149,0,0.1)', color: '#FF9500' }}><i className="bi bi-clock me-1" />In Progress</span>
                                            )}
                                        </td>
                                        <td className="pe-4 text-end">
                                            <button
                                                className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                                onClick={() => setSelectedEmp(row)}
                                                disabled={row.items.length === 0}
                                            >
                                                <i className="bi bi-eye me-1" /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── SEE MORE ── */}
                    {hasMore && (
                        <button className="see-more-btn" onClick={() => setVisibleCount(c => c + PAGE_SIZE)}>
                            <i className="bi bi-chevron-down me-2" />
                            See More ({rows.length - visibleCount} remaining)
                        </button>
                    )}
                </div>
            </div>

            {/* ── ONBOARDING DETAIL MODAL ── */}
            {selectedEmp && (
                <OnboardingModal
                    emp={selectedEmp}
                    token={token}
                    onClose={() => setSelectedEmp(null)}
                />
            )}
        </div>
    )
}
