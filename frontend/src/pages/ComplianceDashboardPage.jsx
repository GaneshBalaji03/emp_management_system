import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { employeeApi } from '../api/employeeApi.js'
import { useAuth } from '../auth/AuthContext.jsx'
import '../styles/employees.css'

const COLORS = ['#3377FF', '#06C270', '#FF3B3B', '#FF9500', '#5856D6', '#AF52DE', '#FF2D55', '#007AFF']
function avatarColor(name) { let h = 0; for (let i = 0; i < (name?.length || 0); i++) h = name.charCodeAt(i) + ((h << 5) - h); return COLORS[Math.abs(h) % COLORS.length] }

function MetricCard({ icon, label, value, color }) {
    return (
        <div className="col-6 col-md-4 col-lg-2">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '14px', borderLeft: `4px solid ${color}`, transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
            >
                <div className="card-body p-3 text-center">
                    <i className={`bi ${icon} d-block mb-1`} style={{ fontSize: '22px', color }} />
                    <div className="fw-bold" style={{ fontSize: '26px', color }}>{value ?? '—'}</div>
                    <div className="text-muted" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>{label}</div>
                </div>
            </div>
        </div>
    )
}

export default function ComplianceDashboardPage() {
    const navigate = useNavigate()
    const { token } = useAuth()

    const [tab, setTab] = useState('dashboard')
    const [loading, setLoading] = useState(true)
    const [notice, setNotice] = useState(null)

    const [metrics, setMetrics] = useState(null)
    const [empSummary, setEmpSummary] = useState([])
    const [empNames, setEmpNames] = useState({})
    const [alerts, setAlerts] = useState([])

    const [statusFilter, setStatusFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [complianceRows, setComplianceRows] = useState([])
    const [compLoading, setCompLoading] = useState(false)

    function flash(type, message) { setNotice({ type, message }); setTimeout(() => setNotice(null), 5000) }

    async function loadDashboard() {
        setLoading(true)
        const errors = []

        // Load each independently so one failure doesn't block others
        try {
            const empList = await employeeApi.list({ token })
            const names = {}
            if (Array.isArray(empList)) empList.forEach(e => { names[e.emp_id] = `${e.first_name} ${e.last_name}` })
            setEmpNames(names)
        } catch (e) { errors.push('Employee list: ' + (e.message || 'failed')) }

        try {
            const dashData = await employeeApi.complianceDashboard({ token })
            if (dashData && dashData.metrics) {
                setMetrics(dashData.metrics)
                setEmpSummary(Array.isArray(dashData.employee_summary) ? dashData.employee_summary : [])
            }
        } catch (e) { errors.push('Dashboard: ' + (e.message || 'failed')) }

        try {
            const alertsData = await employeeApi.alerts({ token })
            setAlerts(Array.isArray(alertsData) ? alertsData : [])
        } catch (e) { errors.push('Alerts: ' + (e.message || 'failed')) }

        if (errors.length > 0) flash('error', errors.join(' | '))
        setLoading(false)
    }

    useEffect(() => { if (token) loadDashboard() }, [token])

    async function loadComplianceReport() {
        setCompLoading(true)
        try {
            const data = await employeeApi.complianceStatusReport({ token, status: statusFilter, type: typeFilter })
            setComplianceRows(Array.isArray(data) ? data : [])
        } catch (e) {
            setComplianceRows([])
            flash('error', 'Report: ' + (e.message || 'failed'))
        } finally { setCompLoading(false) }
    }

    useEffect(() => { if (tab === 'report' && token) loadComplianceReport() }, [tab, statusFilter, typeFilter, token])

    const sevIcons = { warning: 'bi-exclamation-triangle-fill', danger: 'bi-x-circle-fill', info: 'bi-info-circle-fill' }
    const sevColors = { warning: '#FF9500', danger: '#FF3B3B', info: '#3377FF' }

    return (
        <div className="emp-shell">
            {/* ── TOPBAR ── */}
            <div className="emp-topbar">
                <div className="d-flex gap-2 flex-wrap">
                    {['dashboard', 'alerts', 'report'].map(t => (
                        <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-outline-primary'} rounded-pill px-3`} onClick={() => setTab(t)}>
                            {t === 'dashboard' && <><i className="bi bi-grid-fill me-1" />Dashboard</>}
                            {t === 'alerts' && <><i className="bi bi-bell-fill me-1" />Alerts {alerts.length > 0 && <span className="badge bg-danger ms-1">{alerts.length}</span>}</>}
                            {t === 'report' && <><i className="bi bi-file-earmark-bar-graph me-1" />Status Report</>}
                        </button>
                    ))}
                </div>

                <div className="emp-topbar-actions">
                    <button className="btn btn-outline-primary d-flex align-items-center gap-2 rounded-pill px-3" onClick={loadDashboard} disabled={loading}>
                        <i className={`bi bi-arrow-repeat ${loading ? 'emp-spin' : ''}`} /> Refresh
                    </button>
                </div>
            </div>

            {/* ── HEADER ── */}
            <div className="emp-header">
                <h1 className="emp-title">Compliance & Alerts</h1>
                <p className="emp-subtitle">Dashboard with key metrics, alerts, reminders, and compliance status report.</p>
            </div>

            {/* ── NOTICE ── */}
            {notice && (
                <div className={`alert ${notice.type === 'success' ? 'alert-success' : 'alert-danger'} emp-alert border-0 shadow-sm d-flex align-items-center gap-2`}>
                    <i className={`bi ${notice.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`} />
                    <div className="flex-grow-1 small">{notice.message}</div>
                    <button className="btn-close" onClick={() => setNotice(null)} />
                </div>
            )}

            {loading ? (
                <div className="text-center py-5"><i className="bi bi-arrow-repeat emp-spin text-primary" style={{ fontSize: '48px' }} /></div>
            ) : (
                <>
                    {/* ═════ DASHBOARD TAB ═════ */}
                    {tab === 'dashboard' && (
                        <>
                            {metrics ? (
                                <div className="row g-3 mb-4">
                                    <MetricCard icon="bi-file-earmark-check" label="Total Records" value={metrics.total_records} color="#3377FF" />
                                    <MetricCard icon="bi-check-circle-fill" label="Completed" value={metrics.completed} color="#06C270" />
                                    <MetricCard icon="bi-hourglass-split" label="Pending" value={metrics.pending} color="#FF9500" />
                                    <MetricCard icon="bi-arrow-repeat" label="In Progress" value={metrics.in_progress} color="#5856D6" />
                                    <MetricCard icon="bi-file-earmark-x" label="Missing Docs" value={metrics.missing_documents} color="#FF3B3B" />
                                    <MetricCard icon="bi-person-x-fill" label="No Records" value={metrics.employees_without_records} color="#AF52DE" />
                                </div>
                            ) : (
                                <div className="text-center py-4 mb-4">
                                    <i className="bi bi-bar-chart-line d-block mb-2" style={{ fontSize: '40px', opacity: 0.2 }} />
                                    <div className="text-muted">No compliance metrics available yet. Add compliance records via the Documents page.</div>
                                    <button className="btn btn-outline-primary btn-sm rounded-pill mt-3 px-4" onClick={() => navigate('/documents')}>
                                        <i className="bi bi-plus-lg me-1" /> Go to Documents
                                    </button>
                                </div>
                            )}

                            {/* Employee Compliance Table */}
                            <div className="card border-0 shadow-sm emp-card">
                                <div className="card-body p-0">
                                    <div className="px-4 py-3 bg-light border-bottom d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0 fw-bold text-uppercase small" style={{ letterSpacing: '0.08em' }}>
                                            <i className="bi bi-people text-primary me-2" />Employee Compliance Summary
                                        </h6>
                                        <span className="badge bg-primary rounded-pill">{empSummary.length}</span>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table align-middle mb-0">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th className="ps-4 py-3">Emp ID</th>
                                                    <th className="py-3">Employee</th>
                                                    <th className="py-3">Total</th>
                                                    <th className="py-3">Completed</th>
                                                    <th className="py-3">Pending</th>
                                                    <th className="py-3">Missing</th>
                                                    <th className="pe-4 py-3">Compliance %</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {empSummary.length === 0 ? (
                                                    <tr><td colSpan="7" className="text-center py-5 text-muted"><i className="bi bi-inbox d-block mb-2" style={{ fontSize: '40px', opacity: 0.3 }} />No employee compliance data found.</td></tr>
                                                ) : empSummary.map(e => {
                                                    const pct = e.total ? Math.round((e.completed / e.total) * 100) : 0
                                                    const name = empNames[e.emp_id] || `Employee #${e.emp_id}`
                                                    return (
                                                        <tr key={e.emp_id}>
                                                            <td className="ps-4 fw-bold text-primary">{e.emp_id}</td>
                                                            <td>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <div className="emp-avatar shadow-sm" style={{ background: avatarColor(name), width: '30px', height: '30px', fontSize: '12px', borderRadius: '8px' }}>
                                                                        {name[0]?.toUpperCase() || '?'}
                                                                    </div>
                                                                    <span className="fw-bold small">{name}</span>
                                                                </div>
                                                            </td>
                                                            <td>{e.total}</td>
                                                            <td className="text-success fw-bold">{e.completed}</td>
                                                            <td className="text-warning fw-bold">{e.pending}</td>
                                                            <td className="text-danger fw-bold">{e.missing_doc}</td>
                                                            <td className="pe-4">
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <div className="progress flex-grow-1" style={{ height: '6px', borderRadius: '10px' }}>
                                                                        <div className={`progress-bar ${pct === 100 ? 'bg-success' : pct > 50 ? 'bg-primary' : 'bg-warning'}`} style={{ width: `${pct}%`, borderRadius: '10px' }} />
                                                                    </div>
                                                                    <span className="fw-bold small" style={{ width: '35px' }}>{pct}%</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ═════ ALERTS TAB ═════ */}
                    {tab === 'alerts' && (
                        <div className="card border-0 shadow-sm emp-card">
                            <div className="px-4 py-3 bg-light border-bottom d-flex justify-content-between align-items-center" style={{ borderRadius: '16px 16px 0 0' }}>
                                <h6 className="mb-0 fw-bold text-uppercase small" style={{ letterSpacing: '0.08em' }}>
                                    <i className="bi bi-bell text-primary me-2" />Active Alerts & Reminders
                                </h6>
                                <span className="badge bg-danger rounded-pill">{alerts.length}</span>
                            </div>
                            <div className="card-body p-0">
                                {alerts.length === 0 ? (
                                    <div className="text-center py-5">
                                        <i className="bi bi-bell-slash d-block mb-2" style={{ fontSize: '48px', opacity: 0.2 }} />
                                        <div className="text-muted">No active alerts. All clear!</div>
                                    </div>
                                ) : (
                                    <div className="list-group list-group-flush">
                                        {alerts.map((a, i) => (
                                            <div key={`${a.type}-${a.id}-${i}`} className="list-group-item d-flex align-items-center gap-3 py-3 px-4" style={{ transition: 'background 0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#f8f9fb'}
                                                onMouseLeave={e => e.currentTarget.style.background = ''}
                                            >
                                                <div className="d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${sevColors[a.severity] || '#666'}15`, flexShrink: 0 }}>
                                                    <i className={`bi ${sevIcons[a.severity] || 'bi-info-circle'}`} style={{ fontSize: '18px', color: sevColors[a.severity] || '#666' }} />
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="fw-semibold" style={{ fontSize: '14px' }}>{a.message}</div>
                                                    <div className="text-muted x-small">
                                                        <span className="me-2">Emp #{a.emp_id}</span>·
                                                        <span className="ms-2 me-2">{a.comp_type}</span>·
                                                        <span className="ms-2">{a.type?.replace(/_/g, ' ')}</span>
                                                    </div>
                                                </div>
                                                <span className={`badge bg-${a.severity} rounded-pill px-2`} style={{ fontSize: '10px' }}>
                                                    {a.severity === 'danger' ? 'High' : a.severity === 'warning' ? 'Medium' : 'Info'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ═════ STATUS REPORT TAB ═════ */}
                    {tab === 'report' && (
                        <>
                            <div className="card border-0 shadow-sm emp-card mb-4">
                                <div className="card-body p-4">
                                    <div className="row g-3 align-items-end">
                                        <div className="col-md-4">
                                            <label className="emp-label mb-1">Filter by Status</label>
                                            <select className="form-select bg-light border-0" style={{ borderRadius: '10px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                                <option value="">All Statuses</option>
                                                <option value="PENDING">⏳ Pending</option>
                                                <option value="IN PROGRESS">🔄 In Progress</option>
                                                <option value="COMPLETED">✅ Completed</option>
                                                <option value="VERIFIED">✅ Verified</option>
                                                <option value="REJECTED">❌ Rejected</option>
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="emp-label mb-1">Filter by Document Type</label>
                                            <input className="form-control bg-light border-0" style={{ borderRadius: '10px' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)} placeholder="e.g. PAN, Aadhaar…" />
                                        </div>
                                        <div className="col-md-4 d-flex gap-2">
                                            <button className="btn emp-primary-btn flex-grow-1" onClick={loadComplianceReport} disabled={compLoading}>
                                                <i className={`bi bi-funnel me-1 ${compLoading ? 'emp-spin' : ''}`} /> Apply
                                            </button>
                                            {(statusFilter || typeFilter) && (
                                                <button className="btn btn-outline-secondary" onClick={() => { setStatusFilter(''); setTypeFilter('') }}>
                                                    <i className="bi bi-x-lg" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card border-0 shadow-sm emp-card">
                                <div className="px-4 py-3 bg-light border-bottom d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0 fw-bold text-uppercase small" style={{ letterSpacing: '0.08em' }}>
                                        <i className="bi bi-file-earmark-bar-graph text-primary me-2" />Compliance Records
                                    </h6>
                                    <span className="badge bg-primary rounded-pill">{complianceRows.length}</span>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table align-middle mb-0">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th className="ps-4 py-3">Emp ID</th>
                                                    <th className="py-3">Employee</th>
                                                    <th className="py-3">Document Type</th>
                                                    <th className="py-3">Status</th>
                                                    <th className="pe-4 py-3">Document</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {compLoading ? (
                                                    <tr><td colSpan="5" className="text-center py-5"><i className="bi bi-arrow-repeat emp-spin text-primary" style={{ fontSize: '36px' }} /></td></tr>
                                                ) : complianceRows.length === 0 ? (
                                                    <tr><td colSpan="5" className="text-center py-5"><div className="text-muted"><i className="bi bi-funnel d-block mb-2" style={{ fontSize: '40px', opacity: 0.3 }} />No records match the current filters.</div></td></tr>
                                                ) : complianceRows.map(r => (
                                                    <tr key={r.emp_compliance_tracker_id}>
                                                        <td className="ps-4 fw-bold text-primary">{r.emp_id}</td>
                                                        <td>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <div className="emp-avatar shadow-sm" style={{ background: avatarColor(r.employee_name || ''), width: '30px', height: '30px', fontSize: '12px', borderRadius: '8px' }}>
                                                                    {(r.employee_name?.[0] || '?').toUpperCase()}
                                                                </div>
                                                                <span className="fw-bold small">{r.employee_name || '—'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="fw-semibold">{r.comp_type}</td>
                                                        <td>
                                                            <span className={`badge rounded-pill px-3 ${r.status === 'COMPLETED' || r.status === 'VERIFIED' ? 'bg-success'
                                                                : r.status === 'PENDING' ? 'bg-warning text-dark'
                                                                    : r.status === 'REJECTED' ? 'bg-danger'
                                                                        : 'bg-secondary'
                                                                }`}>{r.status}</span>
                                                        </td>
                                                        <td className="pe-4">
                                                            {r.doc_url ? (
                                                                <a href={r.doc_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary rounded-pill px-3" style={{ fontSize: '11px' }}>
                                                                    <i className="bi bi-eye me-1" /> View
                                                                </a>
                                                            ) : <span className="text-muted x-small">—</span>}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    )
}
