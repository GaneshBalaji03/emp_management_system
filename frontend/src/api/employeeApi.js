import { httpJson } from './http.js'

export const employeeApi = {
  // Employee CRUD
  list: ({ status, search } = {}) => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (search) params.append('search', search)
    const qs = params.toString() ? `?${params.toString()}` : ''
    return httpJson(`/api/employees/${qs}`)
  },

  create: ({ body }) => httpJson('/api/employees/create', { method: 'POST', body }),

  update: ({ empId, body }) =>
    httpJson(`/api/employees/${encodeURIComponent(empId)}/update`, { method: 'PUT', body }),

  exit: ({ empId, exit_date }) =>
    httpJson(`/api/employees/${encodeURIComponent(empId)}/exit`, {
      method: 'PUT', body: { exit_date },
    }),

  delete: ({ empId }) =>
    httpJson(`/api/employees/${encodeURIComponent(empId)}/delete`, { method: 'DELETE' }),

  getProfile: ({ empId }) =>
    httpJson(`/api/employees/${encodeURIComponent(empId)}/profile`),

  updateOnboardingStatus: ({ trackerId, status }) =>
    httpJson(`/api/employees/onboarding/tracker/${encodeURIComponent(trackerId)}`, {
      method: 'PUT', body: { status }
    }),

  // CTC / Role Change
  listCtc: ({ empId }) =>
    httpJson(`/api/employees/${encodeURIComponent(empId)}/ctc`),

  addCtc: ({ empId, body }) =>
    httpJson(`/api/employees/${encodeURIComponent(empId)}/ctc`, { method: 'POST', body }),

  // Documents
  listDocuments: ({ empId }) =>
    httpJson(`/api/employees/${encodeURIComponent(empId)}/documents`),

  addDocument: ({ empId, body }) =>
    httpJson(`/api/employees/${encodeURIComponent(empId)}/documents`, { method: 'POST', body }),

  verifyDocument: ({ docId, body }) =>
    httpJson(`/api/employees/documents/${encodeURIComponent(docId)}/verify`, { method: 'PUT', body }),

  // Reports
  headcountReport: () =>
    httpJson('/api/employees/reports/headcount'),

  joinersLeaversReport: () =>
    httpJson('/api/employees/reports/joiners-leavers'),

  ctcDistribution: () =>
    httpJson('/api/employees/reports/ctc-distribution'),

  // Compliance
  complianceDashboard: () =>
    httpJson('/api/employees/reports/compliance-dashboard'),

  complianceStatusReport: ({ status, type }) => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (type) params.append('type', type)
    const qs = params.toString() ? `?${params.toString()}` : ''
    return httpJson(`/api/employees/reports/compliance-status${qs}`)
  },

  // Alerts
  alerts: () =>
    httpJson('/api/employees/alerts'),
}
