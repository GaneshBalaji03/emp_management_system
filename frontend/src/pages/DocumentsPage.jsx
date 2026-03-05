import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { employeeApi } from '../api/employeeApi.js'
import { useAuth } from '../auth/AuthContext.jsx'
import '../styles/employees.css'

const COLORS = ['#3377FF', '#06C270', '#FF3B3B', '#FF9500', '#5856D6', '#AF52DE', '#FF2D55', '#007AFF', '#34C759', '#FFD60A']
function avatarColor(name) { let h = 0; for (let i = 0; i < (name?.length || 0); i++) h = name.charCodeAt(i) + ((h << 5) - h); return COLORS[Math.abs(h) % COLORS.length] }

const statusMap = {
    PENDING: { bg: 'bg-secondary', label: '⏳ Pending' },
    'IN PROGRESS': { bg: 'bg-warning text-dark', label: '🔄 In Progress' },
    VERIFIED: { bg: 'bg-success', label: '✅ Verified' },
    COMPLETED: { bg: 'bg-success', label: '✅ Completed' },
    REJECTED: { bg: 'bg-danger', label: '❌ Rejected' },
}

/* ─────────── ADD DOCUMENT MODAL ─────────── */
function AddDocModal({ empName, onClose, onSave, saving }) {
    const [f, setF] = useState({ comp_type: '', doc_url: '', status: 'PENDING' })
    const [err, setErr] = useState('')

    function submit() {
        if (!f.comp_type.trim()) { setErr('Document type is required'); return }
        setErr('')
        onSave(f)
    }

    return (
        <div className="emp-modal-backdrop" onClick={onClose}>
            <div className="card emp-modal shadow-lg" onClick={e => e.stopPropagation()}>
                <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="emp-modal-title mb-0">Add Document Record</h5>
                        <div className="text-muted small mt-1">for {empName}</div>
                    </div>
                    <button className="btn-close" onClick={onClose} />
                </div>
                <div className="card-body px-4">
                    {err && <div className="alert alert-danger py-2 small mb-3">{err}</div>}
                    <div className="row g-3">
                        <div className="col-12">
                            <label className="emp-label mb-1">Document Type <span className="emp-required">*</span></label>
                            <input className="form-control bg-light border-0" placeholder="e.g. PAN Card, Aadhaar, Offer Letter" value={f.comp_type} onChange={e => setF({ ...f, comp_type: e.target.value })} />
                        </div>
                        <div className="col-md-8">
                            <label className="emp-label mb-1">Document URL <span className="text-muted small">(optional)</span></label>
                            <input className="form-control bg-light border-0" placeholder="https://drive.google.com/..." value={f.doc_url} onChange={e => setF({ ...f, doc_url: e.target.value })} />
                        </div>
                        <div className="col-md-4">
                            <label className="emp-label mb-1">Initial Status</label>
                            <select className="form-select bg-light border-0" value={f.status} onChange={e => setF({ ...f, status: e.target.value })}>
                                <option value="PENDING">Pending</option>
                                <option value="VERIFIED">Verified</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="card-footer bg-white border-0 pb-4 px-4 d-flex justify-content-end gap-2">
                    <button className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>Cancel</button>
                    <button className="btn emp-primary-btn rounded-pill px-4" onClick={submit} disabled={saving}>
                        {saving ? <><i className="bi bi-arrow-repeat emp-spin me-1" />Saving…</> : <><i className="bi bi-plus-lg me-1" />Add Document</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════
   MAIN DOCUMENTS PAGE
   ═══════════════════════════════════════════ */
export default function DocumentsPage() {
    const navigate = useNavigate()
    const { token } = useAuth()

    const [employees, setEmployees] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [notice, setNotice] = useState(null)

    const [selectedEmp, setSelectedEmp] = useState(null)
    const [docs, setDocs] = useState([])
    const [docLoading, setDocLoading] = useState(false)

    const PAGE_SIZE = 10
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

    const [modalOpen, setModalOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!token) return
        setLoading(true)
        employeeApi.list({ token, search }).then(d => setEmployees(Array.isArray(d) ? d : [])).catch(() => { }).finally(() => setLoading(false))
    }, [token, search])

    function flash(type, message) { setNotice({ type, message }); setTimeout(() => setNotice(null), 4000) }

    async function loadDocs(empId) {
        setDocLoading(true)
        try { setDocs(await employeeApi.listDocuments({ token, empId })) }
        catch { setDocs([]) }
        finally { setDocLoading(false) }
    }

    function selectEmployee(emp) { setSelectedEmp(emp); setNotice(null); loadDocs(emp.emp_id) }

    async function handleAddDoc(form) {
        setSaving(true)
        try {
            await employeeApi.addDocument({ token, empId: selectedEmp.emp_id, body: form })
            flash('success', 'Document record added')
            setModalOpen(false)
            loadDocs(selectedEmp.emp_id)
        } catch (e) { flash('error', e.message || 'Failed to add document') }
        finally { setSaving(false) }
    }

    async function updateStatus(docId, status) {
        try {
            await employeeApi.verifyDocument({ token, docId, body: { status } })
            flash('success', 'Status updated')
            loadDocs(selectedEmp.emp_id)
        } catch (e) { flash('error', e.message || 'Update failed') }
    }

    const visible = employees.slice(0, visibleCount)
    const hasMore = visibleCount < employees.length
    const verified = docs.filter(d => d.status === 'VERIFIED' || d.status === 'COMPLETED').length
    const pct = docs.length > 0 ? Math.round((verified / docs.length) * 100) : 0

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
                            <i className="bi bi-plus-lg" /> Add Document
                        </button>
                    )}
                </div>
            </div>

            {/* ── HEADER ── */}
            <div className="emp-header d-flex justify-content-between align-items-end flex-wrap">
                <div>
                    <h1 className="emp-title">Document Upload & Verification</h1>
                    <p className="emp-subtitle">Manage employee compliance documents and track verification status.</p>
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
                                                        <i className="bi bi-file-earmark-text me-1" />{selectedEmp?.emp_id === emp.emp_id ? 'Selected' : 'View'}
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

                {/* ── RIGHT: DOCUMENT PANEL ── */}
                {selectedEmp && (
                    <div className="col-lg-7">
                        <div className="card border-0 shadow-sm emp-card">
                            {/* Hero Bar */}
                            <div className="p-4 d-flex align-items-center gap-3 flex-wrap" style={{ background: `linear-gradient(135deg, ${avatarColor(selectedEmp.first_name)}, ${avatarColor(selectedEmp.first_name)}aa)`, color: 'white', borderRadius: '16px 16px 0 0' }}>
                                <div className="emp-avatar shadow" style={{ background: 'rgba(255,255,255,0.2)', width: '48px', height: '48px', fontSize: '20px', borderRadius: '14px' }}>
                                    {(selectedEmp.first_name?.[0] || '?').toUpperCase()}
                                </div>
                                <div className="flex-grow-1">
                                    <h5 className="mb-0 fw-bold">{selectedEmp.first_name} {selectedEmp.last_name}</h5>
                                    <div className="opacity-75 small">ID: {selectedEmp.emp_id} · {docs.length} document{docs.length !== 1 ? 's' : ''}</div>
                                </div>
                                <div className="text-end">
                                    <div className="fw-bold" style={{ fontSize: '22px' }}>{pct}%</div>
                                    <div className="opacity-75 x-small">Verified</div>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="px-4 pt-3 pb-2 bg-light border-bottom">
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <span className="x-small fw-bold text-muted text-uppercase">Verification Progress</span>
                                    <span className="x-small text-muted">{verified}/{docs.length}</span>
                                </div>
                                <div className="progress" style={{ height: '6px', borderRadius: '10px' }}>
                                    <div className={`progress-bar ${pct === 100 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${pct}%`, transition: 'width 0.6s ease', borderRadius: '10px' }} />
                                </div>
                            </div>

                            {/* Document List */}
                            <div className="card-body p-4 custom-scrollbar" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="fw-bold text-uppercase small mb-0" style={{ letterSpacing: '0.08em', color: 'var(--dark-2)' }}>
                                        <i className="bi bi-folder2 text-primary me-2" />Documents
                                    </h6>
                                    <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={() => setModalOpen(true)}>
                                        <i className="bi bi-plus-lg me-1" />Add
                                    </button>
                                </div>

                                {docLoading ? (
                                    <div className="text-center py-5"><i className="bi bi-arrow-repeat emp-spin text-primary" style={{ fontSize: '32px' }} /></div>
                                ) : docs.length === 0 ? (
                                    <div className="text-center py-5">
                                        <i className="bi bi-file-earmark-x d-block mb-2" style={{ fontSize: '48px', opacity: 0.2 }} />
                                        <div className="text-muted">No documents on file.</div>
                                        <button className="btn btn-outline-primary btn-sm rounded-pill mt-3 px-4" onClick={() => setModalOpen(true)}>
                                            <i className="bi bi-plus-lg me-1" /> Add First Document
                                        </button>
                                    </div>
                                ) : (
                                    <div className="row g-3">
                                        {docs.map(d => {
                                            const s = statusMap[d.status] || statusMap.PENDING
                                            return (
                                                <div key={d.emp_compliance_tracker_id} className="col-md-6">
                                                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', transition: 'transform 0.2s, box-shadow 0.2s' }}
                                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)' }}
                                                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                                                    >
                                                        <div className="card-body p-3">
                                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                                <span className="fw-bold" style={{ fontSize: '14px' }}>{d.comp_type}</span>
                                                                <span className={`badge rounded-pill ${s.bg} px-2`} style={{ fontSize: '10px' }}>{d.status}</span>
                                                            </div>

                                                            <select
                                                                className="form-select form-select-sm bg-light border-0 fw-semibold mb-2"
                                                                style={{ fontSize: '12px', borderRadius: '8px' }}
                                                                value={d.status}
                                                                onChange={e => updateStatus(d.emp_compliance_tracker_id, e.target.value)}
                                                            >
                                                                <option value="PENDING">⏳ Pending</option>
                                                                <option value="IN PROGRESS">🔄 In Progress</option>
                                                                <option value="VERIFIED">✅ Verified</option>
                                                                <option value="REJECTED">❌ Rejected</option>
                                                            </select>

                                                            {d.doc_url ? (
                                                                <a href={d.doc_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary w-100 rounded-pill" style={{ fontSize: '11px' }}>
                                                                    <i className="bi bi-eye me-1" /> View Document
                                                                </a>
                                                            ) : (
                                                                <div className="text-muted x-small text-center"><i className="bi bi-cloud-upload me-1" />No file uploaded</div>
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
                )}
            </div>

            {/* ── ADD DOC MODAL ── */}
            {modalOpen && selectedEmp && (
                <AddDocModal
                    empName={`${selectedEmp.first_name} ${selectedEmp.last_name}`}
                    onClose={() => setModalOpen(false)}
                    onSave={handleAddDoc}
                    saving={saving}
                />
            )}
        </div>
    )
}
