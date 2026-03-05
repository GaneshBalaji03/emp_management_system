import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { employeeApi } from '../api/employeeApi.js'
import { useAuth } from '../auth/AuthContext.jsx'
import '../styles/employees.css'

const COLORS = ['#3377FF', '#06C270', '#FF3B3B', '#FF9500', '#5856D6', '#AF52DE', '#FF2D55', '#007AFF', '#34C759', '#FFD60A']
function avatarColor(name) { let h = 0; for (let i = 0; i < (name?.length || 0); i++) h = name.charCodeAt(i) + ((h << 5) - h); return COLORS[Math.abs(h) % COLORS.length] }

const EMPTY = { int_title: '', ext_title: '', main_level: '', sub_level: '', start_of_ctc: '', end_of_ctc: '', ctc_amt: '' }

/* ─────────── ADD CTC MODAL ─────────── */
function AddCtcModal({ empName, onClose, onSave, saving }) {
    const [f, setF] = useState({ ...EMPTY })
    const [err, setErr] = useState('')

    function submit() {
        const missing = []
        if (!f.int_title.trim()) missing.push('Internal Title')
        if (!f.ext_title.trim()) missing.push('External Title')
        if (!f.main_level) missing.push('Main Level')
        if (!f.sub_level.trim()) missing.push('Sub Level')
        if (!f.start_of_ctc) missing.push('Start Date')
        if (!f.ctc_amt) missing.push('CTC Amount')
        if (missing.length) { setErr(`Missing: ${missing.join(', ')}`); return }
        setErr('')
        onSave({
            ...f,
            main_level: Number(f.main_level),
            ctc_amt: Number(f.ctc_amt),
            end_of_ctc: f.end_of_ctc || null
        })
    }

    return (
        <div className="emp-modal-backdrop" onClick={onClose}>
            <div className="card emp-modal shadow-lg" style={{ width: 'min(680px, 95vw)' }} onClick={e => e.stopPropagation()}>
                <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="emp-modal-title mb-0">Add CTC / Role Record</h5>
                        <div className="text-muted small mt-1">for {empName}</div>
                    </div>
                    <button className="btn-close" onClick={onClose} />
                </div>
                <div className="card-body px-4">
                    {err && <div className="alert alert-danger py-2 small mb-3">{err}</div>}
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="emp-label mb-1">Internal Title <span className="emp-required">*</span></label>
                            <input className="form-control bg-light border-0" placeholder="e.g. Software Engineer" value={f.int_title} onChange={e => setF({ ...f, int_title: e.target.value })} />
                        </div>
                        <div className="col-md-6">
                            <label className="emp-label mb-1">External Title <span className="emp-required">*</span></label>
                            <input className="form-control bg-light border-0" placeholder="e.g. SDE-2" value={f.ext_title} onChange={e => setF({ ...f, ext_title: e.target.value })} />
                        </div>
                        <div className="col-md-3">
                            <label className="emp-label mb-1">Main Level <span className="emp-required">*</span></label>
                            <input className="form-control bg-light border-0" type="number" min="1" placeholder="3" value={f.main_level} onChange={e => setF({ ...f, main_level: e.target.value })} />
                        </div>
                        <div className="col-md-3">
                            <label className="emp-label mb-1">Sub Level <span className="emp-required">*</span></label>
                            <input className="form-control bg-light border-0" maxLength={1} placeholder="A" value={f.sub_level} onChange={e => setF({ ...f, sub_level: e.target.value.toUpperCase() })} />
                        </div>
                        <div className="col-md-6">
                            <label className="emp-label mb-1">CTC Amount (₹) <span className="emp-required">*</span></label>
                            <input className="form-control bg-light border-0" type="number" min="0" placeholder="800000" value={f.ctc_amt} onChange={e => setF({ ...f, ctc_amt: e.target.value })} />
                        </div>
                        <div className="col-md-6">
                            <label className="emp-label mb-1">Start Date <span className="emp-required">*</span></label>
                            <input className="form-control bg-light border-0" type="date" value={f.start_of_ctc} onChange={e => setF({ ...f, start_of_ctc: e.target.value })} />
                        </div>
                        <div className="col-md-6">
                            <label className="emp-label mb-1">End Date <span className="text-muted small">(optional)</span></label>
                            <input className="form-control bg-light border-0" type="date" value={f.end_of_ctc} onChange={e => setF({ ...f, end_of_ctc: e.target.value })} />
                        </div>
                    </div>
                </div>
                <div className="card-footer bg-white border-0 pb-4 px-4 d-flex justify-content-end gap-2">
                    <button className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>Cancel</button>
                    <button className="btn emp-primary-btn rounded-pill px-4" onClick={submit} disabled={saving}>
                        {saving ? <><i className="bi bi-arrow-repeat emp-spin me-1" />Saving…</> : <><i className="bi bi-plus-lg me-1" />Add Record</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════
   MAIN ROLE CHANGE PAGE
   ═══════════════════════════════════════════ */
export default function RoleChangePage() {
    const navigate = useNavigate()
    const { token } = useAuth()

    const [employees, setEmployees] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [notice, setNotice] = useState(null)

    // Selected employee
    const [selectedEmp, setSelectedEmp] = useState(null)
    const [records, setRecords] = useState([])
    const [recLoading, setRecLoading] = useState(false)

    // Pagination
    const PAGE_SIZE = 10
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

    // Modal
    const [modalOpen, setModalOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    // Load employees
    useEffect(() => {
        if (!token) return
        setLoading(true)
        employeeApi.list({ token, search }).then(d => setEmployees(Array.isArray(d) ? d : [])).catch(() => { }).finally(() => setLoading(false))
    }, [token, search])

    function flash(type, message) { setNotice({ type, message }); setTimeout(() => setNotice(null), 4000) }

    // Load CTC records for selected employee
    async function loadRecords(empId) {
        setRecLoading(true)
        try {
            const data = await employeeApi.listCtc({ token, empId })
            setRecords(Array.isArray(data) ? data : [])
        } catch { setRecords([]) }
        finally { setRecLoading(false) }
    }

    function selectEmployee(emp) {
        setSelectedEmp(emp)
        setNotice(null)
        loadRecords(emp.emp_id)
    }

    async function handleAddCtc(form) {
        setSaving(true)
        try {
            await employeeApi.addCtc({ token, empId: selectedEmp.emp_id, body: form })
            flash('success', 'CTC record added successfully')
            setModalOpen(false)
            loadRecords(selectedEmp.emp_id)
        } catch (e) { flash('error', e.message || 'Failed to add record') }
        finally { setSaving(false) }
    }

    const visible = employees.slice(0, visibleCount)
    const hasMore = visibleCount < employees.length

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
                    {selectedEmp && (
                        <button className="btn emp-primary-btn d-flex align-items-center gap-2 px-3" onClick={() => setModalOpen(true)}>
                            <i className="bi bi-plus-lg" /> Add CTC Record
                        </button>
                    )}
                </div>
            </div>

            {/* ── HEADER ── */}
            <div className="emp-header d-flex justify-content-between align-items-end flex-wrap">
                <div>
                    <h1 className="emp-title">Job / Role Change Tracking</h1>
                    <p className="emp-subtitle">Record role, level, and CTC changes with effective dates.</p>
                </div>
                <div className="text-muted small">{employees.length} employee{employees.length !== 1 ? 's' : ''}</div>
            </div>

            {/* ── NOTICE ── */}
            {notice && (
                <div className={`alert ${notice.type === 'success' ? 'alert-success' : 'alert-danger'} emp-alert border-0 shadow-sm d-flex align-items-center gap-2`}>
                    <i className={`bi ${notice.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`} />
                    {notice.message}
                    <button className="btn-close ms-auto" onClick={() => setNotice(null)} />
                </div>
            )}

            <div className="row g-4">
                {/* ── LEFT: EMPLOYEE LIST ── */}
                <div className={selectedEmp ? 'col-lg-5' : 'col-12'}>
                    <div className="card border-0 shadow-sm emp-card">
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="ps-4 py-3">ID</th>
                                            <th className="py-3">Employee</th>
                                            <th className="py-3">Status</th>
                                            <th className="pe-4 py-3 text-end">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="4" className="text-center py-5"><i className="bi bi-arrow-repeat emp-spin text-primary" style={{ fontSize: '36px' }} /></td></tr>
                                        ) : visible.length === 0 ? (
                                            <tr><td colSpan="4" className="text-center py-5"><div className="text-muted"><i className="bi bi-inbox d-block mb-2" style={{ fontSize: '40px', opacity: 0.3 }} />No employees found.</div></td></tr>
                                        ) : visible.map(emp => (
                                            <tr key={emp.emp_id} className={selectedEmp?.emp_id === emp.emp_id ? 'bg-light' : ''} style={{ transition: 'all 0.2s ease' }}>
                                                <td className="ps-4 fw-bold text-primary">{emp.emp_id}</td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="emp-avatar shadow-sm" style={{ background: avatarColor(emp.first_name) }}>
                                                            {(emp.first_name?.[0] || '?').toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold">{emp.first_name} {emp.last_name}</div>
                                                            <div className="text-muted x-small">Joined: {emp.start_date || '—'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span className={`emp-badge ${emp.status === 'ACTIVE' ? 'emp-badge-active' : 'emp-badge-exited'}`}>{emp.status}</span></td>
                                                <td className="pe-4 text-end">
                                                    <button
                                                        className={`btn btn-sm ${selectedEmp?.emp_id === emp.emp_id ? 'btn-primary' : 'btn-outline-primary'} rounded-pill px-3`}
                                                        onClick={() => selectEmployee(emp)}
                                                    >
                                                        <i className="bi bi-graph-up-arrow me-1" />{selectedEmp?.emp_id === emp.emp_id ? 'Selected' : 'View'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {hasMore && (
                                <button className="see-more-btn" onClick={() => setVisibleCount(c => c + PAGE_SIZE)}>
                                    <i className="bi bi-chevron-down me-2" />See More ({employees.length - visibleCount} remaining)
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: CTC TIMELINE ── */}
                {selectedEmp && (
                    <div className="col-lg-7">
                        <div className="card border-0 shadow-sm emp-card">
                            {/* Employee Hero Bar */}
                            <div className="p-4 d-flex align-items-center gap-3" style={{ background: `linear-gradient(135deg, ${avatarColor(selectedEmp.first_name)}, ${avatarColor(selectedEmp.first_name)}aa)`, color: 'white', borderRadius: '16px 16px 0 0' }}>
                                <div className="emp-avatar shadow" style={{ background: 'rgba(255,255,255,0.2)', width: '48px', height: '48px', fontSize: '20px', borderRadius: '14px' }}>
                                    {(selectedEmp.first_name?.[0] || '?').toUpperCase()}
                                </div>
                                <div className="flex-grow-1">
                                    <h5 className="mb-0 fw-bold">{selectedEmp.first_name} {selectedEmp.last_name}</h5>
                                    <div className="opacity-75 small">ID: {selectedEmp.emp_id} · {selectedEmp.status}</div>
                                </div>
                                <button className="btn btn-sm text-white rounded-pill px-3" style={{ background: 'rgba(255,255,255,0.2)' }} onClick={() => setModalOpen(true)}>
                                    <i className="bi bi-plus-lg me-1" /> Add Record
                                </button>
                            </div>

                            {/* Timeline */}
                            <div className="card-body p-4 custom-scrollbar" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                <h6 className="fw-bold text-uppercase small mb-3" style={{ letterSpacing: '0.08em', color: 'var(--dark-2)' }}>
                                    <i className="bi bi-clock-history text-primary me-2" />CTC & Role Timeline
                                    <span className="badge bg-primary ms-2 rounded-pill">{records.length}</span>
                                </h6>

                                {recLoading ? (
                                    <div className="text-center py-5"><i className="bi bi-arrow-repeat emp-spin text-primary" style={{ fontSize: '32px' }} /></div>
                                ) : records.length === 0 ? (
                                    <div className="text-center py-5">
                                        <i className="bi bi-folder2-open d-block mb-2" style={{ fontSize: '48px', opacity: 0.2 }} />
                                        <div className="text-muted">No CTC records found for this employee.</div>
                                        <button className="btn btn-outline-primary btn-sm rounded-pill mt-3 px-4" onClick={() => setModalOpen(true)}>
                                            <i className="bi bi-plus-lg me-1" /> Add First Record
                                        </button>
                                    </div>
                                ) : (
                                    <div className="ctc-timeline">
                                        {records.map((c, i) => (
                                            <div key={c.emp_ctc_id} className="timeline-item d-flex gap-3 mb-3">
                                                <div className="timeline-marker-shell">
                                                    <div className="timeline-marker" style={{ background: i === 0 ? 'var(--primary)' : '#ddd' }} />
                                                </div>
                                                <div className="card border-0 flex-grow-1 shadow-sm" style={{ borderRadius: '12px', transition: 'transform 0.2s, box-shadow 0.2s' }}
                                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)' }}
                                                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                                                >
                                                    <div className="card-body p-3">
                                                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                                                            <div>
                                                                <div className="fw-bold" style={{ fontSize: '15px' }}>{c.ext_title}</div>
                                                                <div className="text-muted x-small">{c.int_title}</div>
                                                                <div className="mt-1">
                                                                    <span className="badge bg-light text-dark border me-1" style={{ fontSize: '11px' }}>Level {c.main_level}{c.sub_level}</span>
                                                                    {i === 0 && <span className="badge bg-success" style={{ fontSize: '10px' }}>Current</span>}
                                                                </div>
                                                            </div>
                                                            <div className="text-end">
                                                                <div className="fw-bold" style={{ fontSize: '18px', color: 'var(--primary)' }}>₹{Number(c.ctc_amt).toLocaleString('en-IN')}</div>
                                                                <div className="text-muted x-small mt-1">
                                                                    <i className="bi bi-calendar3 me-1" />
                                                                    {c.start_of_ctc} → {c.end_of_ctc || 'Present'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── ADD CTC MODAL ── */}
            {modalOpen && selectedEmp && (
                <AddCtcModal
                    empName={`${selectedEmp.first_name} ${selectedEmp.last_name}`}
                    onClose={() => setModalOpen(false)}
                    onSave={handleAddCtc}
                    saving={saving}
                />
            )}
        </div>
    )
}
