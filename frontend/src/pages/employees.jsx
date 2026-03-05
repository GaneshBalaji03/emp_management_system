import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { employeeApi } from '../api/employeeApi.js'
import { useAuth } from '../auth/AuthContext.jsx'
import '../styles/employees.css'

const COLORS = ['#3377FF', '#06C270', '#FF3B3B', '#FF9500', '#5856D6', '#AF52DE', '#FF2D55', '#007AFF', '#34C759', '#FFD60A']
function avatarColor(name) { let h = 0; for (let i = 0; i < (name?.length || 0); i++) h = name.charCodeAt(i) + ((h << 5) - h); return COLORS[Math.abs(h) % COLORS.length] }
const PAGE_SIZE = 10

/* ─────────── CREATE / EDIT MODAL ─────────── */
function FormModal({ mode, initial, onClose, onSave }) {
  const isEdit = mode === 'edit'
  const [f, setF] = useState(initial || { emp_id: '', first_name: '', middle_name: '', last_name: '', start_date: '' })
  const [err, setErr] = useState('')

  function submit() {
    if (!f.first_name || !f.last_name || !f.start_date || (!isEdit && !f.emp_id)) { setErr('Fill all required fields'); return }
    setErr('')
    onSave(f)
  }

  return (
    <div className="emp-modal-backdrop" onClick={onClose}>
      <div className="card emp-modal shadow-lg" onClick={e => e.stopPropagation()}>
        <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
          <h5 className="emp-modal-title mb-0">{isEdit ? 'Edit Employee' : 'Add Employee'}</h5>
          <button className="btn-close" onClick={onClose} />
        </div>
        <div className="card-body px-4">
          {err && <div className="alert alert-danger py-2 small">{err}</div>}
          <div className="row g-3">
            {!isEdit && (
              <div className="col-12"><label className="emp-label mb-1">Employee ID <span className="emp-required">*</span></label><input className="form-control bg-light border-0" type="number" value={f.emp_id} onChange={e => setF({ ...f, emp_id: e.target.value })} /></div>
            )}
            <div className="col-md-4"><label className="emp-label mb-1">First Name <span className="emp-required">*</span></label><input className="form-control bg-light border-0" value={f.first_name} onChange={e => setF({ ...f, first_name: e.target.value })} /></div>
            <div className="col-md-4"><label className="emp-label mb-1">Middle Name</label><input className="form-control bg-light border-0" value={f.middle_name} onChange={e => setF({ ...f, middle_name: e.target.value })} /></div>
            <div className="col-md-4"><label className="emp-label mb-1">Last Name <span className="emp-required">*</span></label><input className="form-control bg-light border-0" value={f.last_name} onChange={e => setF({ ...f, last_name: e.target.value })} /></div>
            <div className="col-md-6"><label className="emp-label mb-1">Start Date <span className="emp-required">*</span></label><input className="form-control bg-light border-0" type="date" value={f.start_date} onChange={e => setF({ ...f, start_date: e.target.value })} /></div>
          </div>
        </div>
        <div className="card-footer bg-white border-0 pb-4 px-4 d-flex justify-content-end gap-2">
          <button className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>Cancel</button>
          <button className="btn emp-primary-btn rounded-pill px-4" onClick={submit}>{isEdit ? 'Save Changes' : 'Create'}</button>
        </div>
      </div>
    </div>
  )
}

/* ─────────── EXIT MODAL ─────────── */
function ExitModal({ emp, onClose, onSave }) {
  const [exitDate, setExitDate] = useState('')
  return (
    <div className="emp-modal-backdrop" onClick={onClose}>
      <div className="card emp-modal shadow-lg" onClick={e => e.stopPropagation()}>
        <div className="card-header bg-white border-0 pt-4 px-4"><h5 className="emp-modal-title mb-0">Exit Employee</h5></div>
        <div className="card-body px-4">
          <p className="mb-3">Set the last working day for <strong>{emp.first_name} {emp.last_name}</strong> (ID: {emp.emp_id}).</p>
          <label className="emp-label mb-1">Exit Date <span className="emp-required">*</span></label>
          <input className="form-control bg-light border-0" type="date" value={exitDate} onChange={e => setExitDate(e.target.value)} />
        </div>
        <div className="card-footer bg-white border-0 pb-4 px-4 d-flex justify-content-end gap-2">
          <button className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>Cancel</button>
          <button className="btn btn-warning text-white rounded-pill px-4" disabled={!exitDate} onClick={() => onSave(exitDate)}>Confirm Exit</button>
        </div>
      </div>
    </div>
  )
}

/* ─────────── DELETE CONFIRM MODAL ─────────── */
function DeleteModal({ emp, onClose, onConfirm }) {
  return (
    <div className="emp-modal-backdrop" onClick={onClose}>
      <div className="card emp-modal shadow-lg" onClick={e => e.stopPropagation()}>
        <div className="card-header bg-white border-0 pt-4 px-4"><h5 className="emp-modal-title mb-0 text-danger"><i className="bi bi-exclamation-triangle-fill me-2" />Delete Employee</h5></div>
        <div className="card-body px-4">
          <p>Are you sure you want to permanently remove <strong>{emp.first_name} {emp.last_name}</strong> (ID: {emp.emp_id})?</p>
          <div className="alert alert-danger py-2 small mb-0"><i className="bi bi-info-circle me-1" />This action cannot be undone.</div>
        </div>
        <div className="card-footer bg-white border-0 pb-4 px-4 d-flex justify-content-end gap-2">
          <button className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger rounded-pill px-4" onClick={onConfirm}>Delete Permanently</button>
        </div>
      </div>
    </div>
  )
}

/* ─────────── PROFILE MODAL ─────────── */
function ProfileModal({ empId, onClose, token, onEdit, onExit, onDelete }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    employeeApi.getProfile({ token, empId }).then(d => setData(d)).catch(() => { }).finally(() => setLoading(false))
  }, [empId, token])

  if (loading) return (
    <div className="emp-modal-backdrop" onClick={onClose}>
      <div className="text-center"><i className="bi bi-arrow-repeat emp-spin text-white" style={{ fontSize: '48px' }} /></div>
    </div>
  )

  if (!data) return null
  const p = data.personal || {}
  const bg = avatarColor(p.first_name)

  return (
    <div className="emp-modal-backdrop" onClick={onClose}>
      <div className="card profile-card shadow-lg border-0" onClick={e => e.stopPropagation()}>
        {/* HERO */}
        <div className="profile-hero p-4 d-flex align-items-center gap-4 text-white" style={{ background: `linear-gradient(135deg, ${bg}, ${bg}cc)` }}>
          <div className="profile-avatar-large">{(p.first_name?.[0] || '?').toUpperCase()}</div>
          <div className="flex-grow-1">
            <h3 className="mb-0 fw-bold">{p.first_name} {p.middle_name ? p.middle_name + ' ' : ''}{p.last_name}</h3>
            <div className="opacity-75 mt-1">ID: {p.emp_id}  ·  Joined: {p.start_date || '—'}</div>
            <div className="mt-2"><span className={`emp-badge ${p.status === 'ACTIVE' ? 'emp-badge-active' : 'emp-badge-exited'}`} style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{p.status}</span></div>
          </div>
          <button className="btn-close btn-close-white position-absolute top-0 end-0 m-3" onClick={onClose} />
        </div>

        {/* ACTION BUTTONS */}
        <div className="d-flex gap-2 px-4 py-3 border-bottom bg-light">
          <button className="profile-action-btn profile-action-edit" onClick={() => { onClose(); onEdit(p) }}><i className="bi bi-pencil" /> Edit</button>
          {p.status === 'ACTIVE' && <button className="profile-action-btn profile-action-exit" onClick={() => { onClose(); onExit(p) }}><i className="bi bi-box-arrow-right" /> Exit</button>}
          <button className="profile-action-btn profile-action-delete ms-auto" onClick={() => { onClose(); onDelete(p) }}><i className="bi bi-trash3" /> Delete</button>
        </div>

        {/* SECTIONS */}
        <div className="p-4 custom-scrollbar" style={{ maxHeight: 'calc(90vh - 260px)', overflowY: 'auto' }}>
          <div className="row g-3 mb-3">
            {/* Personal */}
            <div className="col-md-6">
              <div className="profile-section">
                <div className="section-title"><i className="bi bi-person-fill text-primary me-2" />Personal Details</div>
                <div className="row g-2">
                  <div className="col-6 info-item"><label>First Name</label><div className="value">{p.first_name || '—'}</div></div>
                  <div className="col-6 info-item"><label>Last Name</label><div className="value">{p.last_name || '—'}</div></div>
                  <div className="col-6 info-item"><label>Middle Name</label><div className="value">{p.middle_name || '—'}</div></div>
                  <div className="col-6 info-item"><label>Start Date</label><div className="value">{p.start_date || '—'}</div></div>
                  <div className="col-6 info-item"><label>Status</label><div className="value"><span className={`emp-badge ${p.status === 'ACTIVE' ? 'emp-badge-active' : 'emp-badge-exited'}`}>{p.status}</span></div></div>
                  {p.end_date && <div className="col-6 info-item"><label>Exit Date</label><div className="value text-danger">{p.end_date}</div></div>}
                </div>
              </div>
            </div>

            {/* Regulatory IDs */}
            <div className="col-md-6">
              <div className="profile-section">
                <div className="section-title"><i className="bi bi-shield-check text-success me-2" />Regulatory IDs</div>
                {data.reg ? (
                  <div className="row g-2">
                    <div className="col-6 info-item"><label>PAN</label><div className="value">{data.reg.pan || '—'}</div></div>
                    <div className="col-6 info-item"><label>Aadhaar</label><div className="value">{data.reg.aadhaar || '—'}</div></div>
                    <div className="col-6 info-item"><label>UAN / EPF</label><div className="value">{data.reg.uan_epf_acctno || '—'}</div></div>
                    <div className="col-6 info-item"><label>ESI</label><div className="value">{data.reg.esi || '—'}</div></div>
                  </div>
                ) : <div className="text-muted small text-center py-3"><i className="bi bi-info-circle me-1" />No regulatory info on file.</div>}
              </div>
            </div>
          </div>

          {/* Bank Info */}
          <div className="mb-3">
            <div className="profile-section">
              <div className="section-title"><i className="bi bi-bank text-info me-2" />Bank Details</div>
              {data.bank && data.bank.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm mb-0">
                    <thead><tr className="text-muted x-small"><th>Bank</th><th>Account No</th><th>IFSC</th><th>Branch</th></tr></thead>
                    <tbody>{data.bank.map((b, i) => <tr key={i}><td className="fw-bold">{b.bank_name}</td><td>{b.bank_acct_no}</td><td>{b.ifsc_code}</td><td>{b.branch_name}</td></tr>)}</tbody>
                  </table>
                </div>
              ) : <div className="text-muted small text-center py-3"><i className="bi bi-info-circle me-1" />No bank details on file.</div>}
            </div>
          </div>

          {/* CTC Timeline */}
          <div className="mb-3">
            <div className="profile-section">
              <div className="section-title"><i className="bi bi-graph-up-arrow text-warning me-2" />CTC History</div>
              {data.ctc && data.ctc.length > 0 ? (
                <div className="ctc-timeline">
                  {data.ctc.map((c, i) => (
                    <div key={c.emp_ctc_id} className="timeline-item d-flex gap-3 mb-3">
                      <div className="timeline-marker-shell"><div className="timeline-marker" style={{ background: i === 0 ? 'var(--primary)' : '#e0e0e0' }} /></div>
                      <div className="card border-0 bg-light p-3 flex-grow-1" style={{ borderRadius: '10px' }}>
                        <div className="d-flex justify-content-between align-items-start flex-wrap">
                          <div><div className="fw-bold">{c.ext_title}</div><div className="text-muted x-small">{c.int_title} · L{c.main_level}{c.sub_level}</div></div>
                          <div className="text-end"><div className="fw-bold text-primary">₹{Number(c.ctc_amt).toLocaleString()}</div><div className="text-muted x-small">{c.start_of_ctc} → {c.end_of_ctc || 'Present'}</div></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="text-muted small text-center py-3"><i className="bi bi-info-circle me-1" />No CTC records.</div>}
            </div>
          </div>

          {/* Compliance */}
          <div>
            <div className="profile-section">
              <div className="section-title"><i className="bi bi-clipboard-check text-danger me-2" />Compliance Records</div>
              {data.compliance && data.compliance.length > 0 ? (
                <div className="row g-2">
                  {data.compliance.map(c => (
                    <div key={c.emp_compliance_tracker_id} className="col-md-4">
                      <div className="card border bg-light p-2" style={{ borderRadius: '8px' }}>
                        <div className="d-flex justify-content-between"><span className="fw-bold small">{c.comp_type}</span><span className={`badge rounded-pill ${c.status === 'COMPLETED' || c.status === 'VERIFIED' ? 'bg-success' : c.status === 'PENDING' ? 'bg-warning text-dark' : 'bg-secondary'}`}>{c.status}</span></div>
                        {c.doc_url && <a href={c.doc_url} target="_blank" rel="noopener noreferrer" className="text-primary x-small mt-1"><i className="bi bi-link-45deg" /> View</a>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="text-muted small text-center py-3"><i className="bi bi-info-circle me-1" />No compliance records.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN EMPLOYEES PAGE
   ═══════════════════════════════════════════ */
export default function EmployeesPage() {
  const navigate = useNavigate()
  const { token } = useAuth()

  const [allRows, setAllRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortField, setSortField] = useState('emp_id')
  const [sortDir, setSortDir] = useState('asc')
  const [notice, setNotice] = useState(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Modals
  const [formModal, setFormModal] = useState(null) // { mode: 'create'|'edit', initial? }
  const [exitModal, setExitModal] = useState(null) // emp object
  const [deleteModal, setDeleteModal] = useState(null) // emp object
  const [profileEmpId, setProfileEmpId] = useState(null)

  const location = useLocation()
  useEffect(() => {
    if (location.state?.openAddModal) {
      setFormModal({ mode: 'create' })
      // Clear state to avoid reopening on refresh
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, navigate])

  async function load() {
    setLoading(true)
    try {
      const data = await employeeApi.list({ search, status: statusFilter })
      setAllRows(Array.isArray(data) ? data : [])
    } catch (e) { setNotice({ type: 'error', message: e.message || 'Failed to load' }) }
    finally { setLoading(false) }
  }

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [search, statusFilter])

  function flash(type, message) { setNotice({ type, message }); setTimeout(() => setNotice(null), 4000) }

  // Sort
  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }
  const sorted = [...allRows].sort((a, b) => {
    let va = a[sortField] ?? '', vb = b[sortField] ?? ''
    if (typeof va === 'string') va = va.toLowerCase()
    if (typeof vb === 'string') vb = vb.toLowerCase()
    if (va < vb) return sortDir === 'asc' ? -1 : 1
    if (va > vb) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const visible = sorted.slice(0, visibleCount)
  const hasMore = visibleCount < sorted.length

  function sortIcon(f) {
    if (sortField !== f) return <i className="bi bi-chevron-expand text-muted ms-1" style={{ fontSize: '10px' }} />
    return <i className={`bi bi-chevron-${sortDir === 'asc' ? 'up' : 'down'} text-primary ms-1`} style={{ fontSize: '10px' }} />
  }

  // CRUD handlers
  async function handleCreate(form) {
    try {
      await employeeApi.create({ token, body: form })
      flash('success', 'Employee created successfully')
      setFormModal(null)
      load()
    } catch (e) { flash('error', e.message) }
  }

  async function handleEdit(form) {
    try {
      await employeeApi.update({ token, empId: form.emp_id, body: form })
      flash('success', 'Employee updated')
      setFormModal(null)
      load()
    } catch (e) { flash('error', e.message) }
  }

  async function handleExit(exitDate) {
    try {
      await employeeApi.exit({ token, empId: exitModal.emp_id, exit_date: exitDate })
      flash('success', 'Employee marked as exited')
      setExitModal(null)
      load()
    } catch (e) { flash('error', e.message) }
  }

  async function handleDelete() {
    try {
      await employeeApi.delete({ token, empId: deleteModal.emp_id })
      flash('success', 'Employee record permanently removed')
      setDeleteModal(null)
      await load()
    } catch (e) { flash('error', e.message) }
  }

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
          <select className="emp-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setVisibleCount(PAGE_SIZE) }}>
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="EXITED">Exited</option>
          </select>
          <button className="btn emp-primary-btn d-flex align-items-center gap-2 px-3" onClick={() => setFormModal({ mode: 'create' })}>
            <i className="bi bi-plus-lg" /> Add Employee
          </button>
        </div>
      </div>

      {/* ── HEADER ── */}
      <div className="emp-header d-flex justify-content-between align-items-end flex-wrap">
        <div>
          <h1 className="emp-title">Employee Directory</h1>
          <p className="emp-subtitle">{allRows.length} employee{allRows.length !== 1 ? 's' : ''} found</p>
        </div>
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
                  <th className="ps-4 py-3 cursor-pointer" onClick={() => toggleSort('emp_id')}>ID {sortIcon('emp_id')}</th>
                  <th className="py-3 cursor-pointer" onClick={() => toggleSort('first_name')}>Employee {sortIcon('first_name')}</th>
                  <th className="py-3 cursor-pointer" onClick={() => toggleSort('start_date')}>Joined {sortIcon('start_date')}</th>
                  <th className="py-3">Status</th>
                  <th className="pe-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && allRows.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-5"><i className="bi bi-arrow-repeat emp-spin text-primary" style={{ fontSize: '36px' }} /></td></tr>
                ) : visible.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-5"><div className="text-muted"><i className="bi bi-inbox d-block mb-2" style={{ fontSize: '40px', opacity: 0.3 }} />No employees match your search.</div></td></tr>
                ) : visible.map(row => (
                  <tr key={row.emp_id} className="cursor-pointer" onClick={() => setProfileEmpId(row.emp_id)}>
                    <td className="ps-4 fw-bold text-primary">{row.emp_id}</td>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="emp-avatar shadow-sm" style={{ background: avatarColor(row.first_name) }}>
                          {(row.first_name?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-bold">{row.first_name} {row.last_name}</div>
                          {row.middle_name && <div className="text-muted x-small">{row.middle_name}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="text-muted">{row.start_date || '—'}</td>
                    <td><span className={`emp-badge ${row.status === 'ACTIVE' ? 'emp-badge-active' : 'emp-badge-exited'}`}>{row.status}</span></td>
                    <td className="pe-4 text-end" onClick={e => e.stopPropagation()}>
                      <div className="d-flex gap-1 justify-content-end">
                        <button className="btn btn-sm btn-outline-primary rounded-pill px-2" title="Edit" onClick={() => setFormModal({ mode: 'edit', initial: { emp_id: row.emp_id, first_name: row.first_name, middle_name: row.middle_name || '', last_name: row.last_name, start_date: row.start_date || '' } })}><i className="bi bi-pencil" /></button>
                        {row.status === 'ACTIVE' && <button className="btn btn-sm btn-outline-warning rounded-pill px-2" title="Exit" onClick={() => setExitModal(row)}><i className="bi bi-box-arrow-right" /></button>}
                        <button className="btn btn-sm btn-outline-danger rounded-pill px-2" title="Delete" onClick={() => setDeleteModal(row)}><i className="bi bi-trash3" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SEE MORE */}
          {hasMore && (
            <button className="see-more-btn" onClick={() => setVisibleCount(c => c + PAGE_SIZE)}>
              <i className="bi bi-chevron-down me-2" />
              See More ({sorted.length - visibleCount} remaining)
            </button>
          )}
        </div>
      </div>

      {/* ── MODALS ── */}
      {formModal && (
        <FormModal
          mode={formModal.mode}
          initial={formModal.initial}
          onClose={() => setFormModal(null)}
          onSave={formModal.mode === 'edit' ? handleEdit : handleCreate}
        />
      )}
      {exitModal && <ExitModal emp={exitModal} onClose={() => setExitModal(null)} onSave={handleExit} />}
      {deleteModal && <DeleteModal emp={deleteModal} onClose={() => setDeleteModal(null)} onConfirm={handleDelete} />}
      {profileEmpId && (
        <ProfileModal
          empId={profileEmpId}
          token={token}
          onClose={() => setProfileEmpId(null)}
          onEdit={(p) => { setProfileEmpId(null); setFormModal({ mode: 'edit', initial: { emp_id: p.emp_id, first_name: p.first_name, middle_name: p.middle_name || '', last_name: p.last_name, start_date: p.start_date || '' } }) }}
          onExit={(p) => { setProfileEmpId(null); setExitModal(p) }}
          onDelete={(p) => { setProfileEmpId(null); setDeleteModal(p) }}
        />
      )}
    </div>
  )
}
