import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { employeeApi } from '../api/employeeApi.js'
import { useAuth } from '../auth/AuthContext.jsx'
import {
    Chart as ChartJS,
    ArcElement, BarElement, LineElement, PointElement,
    CategoryScale, LinearScale,
    Tooltip, Legend, Filler
} from 'chart.js'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import '../styles/employees.css'

ChartJS.register(ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler)

export default function ReportsPage() {
    const navigate = useNavigate()
    const { token } = useAuth()
    const [tab, setTab] = useState('headcount')
    const [loading, setLoading] = useState(true)
    const [notice, setNotice] = useState(null)

    const [hc, setHc] = useState(null)
    const [jl, setJl] = useState([])
    const [ctcDist, setCtcDist] = useState(null)
    const [jlShowAll, setJlShowAll] = useState(false)

    function flash(type, message) { setNotice({ type, message }); setTimeout(() => setNotice(null), 5000) }

    async function load() {
        setLoading(true)
        const errors = []
        try { setHc(await employeeApi.headcountReport({ token })) } catch (e) { errors.push('Headcount: ' + e.message) }
        try { const d = await employeeApi.joinersLeaversReport({ token }); setJl(Array.isArray(d) ? d : []) } catch (e) { errors.push('J&L: ' + e.message) }
        try { setCtcDist(await employeeApi.ctcDistribution({ token })) } catch (e) { errors.push('CTC: ' + e.message) }
        if (errors.length > 0) flash('error', errors.join(' | '))
        setLoading(false)
    }

    useEffect(() => { if (token) load() }, [token])

    /* ── Chart configs ── */
    const headcountDonut = hc ? {
        data: {
            labels: ['Active', 'Exited'],
            datasets: [{ data: [hc.active, hc.exited], backgroundColor: ['#06C270', '#FF3B3B'], borderWidth: 0, hoverOffset: 8 }]
        },
        options: { responsive: true, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, pointStyle: 'circle', font: { size: 13, weight: '600' } } } } }
    } : null

    /* ── Premium tooltip config ── */
    const tooltipStyle = {
        backgroundColor: 'rgba(30, 33, 50, 0.95)',
        titleFont: { family: "'Inter', sans-serif", size: 13, weight: '700' },
        bodyFont: { family: "'Mulish', sans-serif", size: 12, weight: '600' },
        padding: { top: 10, bottom: 10, left: 14, right: 14 },
        cornerRadius: 10,
        displayColors: true,
        boxPadding: 6,
        caretSize: 6,
    }

    /* Joiners/Leavers summary stats */
    const jlTotalJoiners = jl.reduce((s, j) => s + j.joiners, 0)
    const jlTotalLeavers = jl.reduce((s, j) => s + j.leavers, 0)
    const jlNetChange = jlTotalJoiners - jlTotalLeavers

    const jlChart = jl.length > 0 ? {
        data: {
            labels: jl.map(j => j.month),
            datasets: [
                {
                    label: 'Joiners',
                    data: jl.map(j => j.joiners),
                    backgroundColor: 'rgba(6, 194, 112, 0.75)',
                    hoverBackgroundColor: '#06C270',
                    borderColor: '#06C270',
                    borderWidth: 2,
                    borderRadius: { topLeft: 8, topRight: 8 },
                    borderSkipped: 'bottom',
                    barPercentage: 0.55,
                    categoryPercentage: 0.65,
                },
                {
                    label: 'Leavers',
                    data: jl.map(j => j.leavers),
                    backgroundColor: 'rgba(255, 59, 59, 0.65)',
                    hoverBackgroundColor: '#FF3B3B',
                    borderColor: '#FF3B3B',
                    borderWidth: 2,
                    borderRadius: { topLeft: 8, topRight: 8 },
                    borderSkipped: 'bottom',
                    barPercentage: 0.55,
                    categoryPercentage: 0.65,
                },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { family: "'Inter', sans-serif", size: 11, weight: '600' }, color: '#8F90A6', padding: 8 },
                    border: { display: false },
                },
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, font: { family: "'Mulish', sans-serif", size: 11 }, color: '#C7C9D9', padding: 8 },
                    grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
                    border: { display: false, dash: [4, 4] },
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: { usePointStyle: true, pointStyle: 'rectRounded', padding: 20, font: { family: "'Inter', sans-serif", size: 12, weight: '700' }, color: '#555770' }
                },
                tooltip: {
                    ...tooltipStyle,
                    callbacks: {
                        title: (items) => `📅 ${items[0].label}`,
                        label: (ctx) => `  ${ctx.dataset.label}: ${ctx.parsed.y} employee${ctx.parsed.y !== 1 ? 's' : ''}`,
                    }
                }
            }
        }
    } : null

    const jlLineChart = jl.length > 0 ? {
        data: {
            labels: jl.map(j => j.month),
            datasets: [
                {
                    label: 'Joiners Trend',
                    data: jl.map(j => j.joiners),
                    borderColor: '#06C270',
                    backgroundColor: 'rgba(6, 194, 112, 0.08)',
                    fill: true,
                    tension: 0.45,
                    pointRadius: 5,
                    pointHoverRadius: 9,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#06C270',
                    pointBorderWidth: 2.5,
                    pointHoverBackgroundColor: '#06C270',
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 3,
                    borderWidth: 3,
                },
                {
                    label: 'Leavers Trend',
                    data: jl.map(j => j.leavers),
                    borderColor: '#FF3B3B',
                    backgroundColor: 'rgba(255, 59, 59, 0.06)',
                    fill: true,
                    tension: 0.45,
                    pointRadius: 5,
                    pointHoverRadius: 9,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#FF3B3B',
                    pointBorderWidth: 2.5,
                    pointHoverBackgroundColor: '#FF3B3B',
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 3,
                    borderWidth: 3,
                    borderDash: [6, 4],
                },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { family: "'Inter', sans-serif", size: 11, weight: '600' }, color: '#8F90A6', padding: 8 },
                    border: { display: false },
                },
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, font: { family: "'Mulish', sans-serif", size: 11 }, color: '#C7C9D9', padding: 8 },
                    grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
                    border: { display: false },
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: { usePointStyle: true, pointStyle: 'circle', padding: 18, font: { family: "'Inter', sans-serif", size: 11, weight: '700' }, color: '#555770' }
                },
                tooltip: {
                    ...tooltipStyle,
                    callbacks: {
                        title: (items) => `📅 ${items[0].label}`,
                    }
                }
            }
        }
    } : null

    const salaryBands = ctcDist ? Object.entries(ctcDist.salary_bands) : []
    const levelDist = ctcDist ? Object.entries(ctcDist.level_distribution) : []

    const salaryChart = salaryBands.length > 0 ? {
        data: {
            labels: salaryBands.map(([k]) => k),
            datasets: [{ data: salaryBands.map(([, v]) => v), backgroundColor: ['#3377FF', '#06C270', '#FF9500', '#5856D6', '#FF3B3B', '#AF52DE'], borderWidth: 0, hoverOffset: 6 }]
        },
        options: { responsive: true, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle', font: { size: 12, weight: '600' } } }, tooltip: tooltipStyle } }
    } : null

    const levelChart = levelDist.length > 0 ? {
        data: {
            labels: levelDist.map(([k]) => k),
            datasets: [{ label: 'Employees', data: levelDist.map(([, v]) => v), backgroundColor: 'rgba(88,86,214,0.7)', hoverBackgroundColor: '#5856D6', borderColor: '#5856D6', borderWidth: 1, borderRadius: 8, barPercentage: 0.6 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, indexAxis: 'y',
            scales: { x: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 }, color: '#C7C9D9' }, grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false } }, y: { grid: { display: false }, ticks: { font: { family: "'Inter', sans-serif", size: 12, weight: '600' }, color: '#555770' }, border: { display: false } } },
            plugins: { legend: { display: false }, tooltip: tooltipStyle }
        }
    } : null

    return (
        <div className="emp-shell">
            {/* ── TOPBAR ── */}
            <div className="emp-topbar">
                <div className="d-flex gap-2 flex-wrap">
                    {[['headcount', 'bi-people-fill', 'Headcount'], ['joiners', 'bi-arrow-left-right', 'Joiners & Leavers'], ['ctc', 'bi-cash-stack', 'CTC & Levels']].map(([id, icon, label]) => (
                        <button key={id} className={`btn btn-sm ${tab === id ? 'btn-primary' : 'btn-outline-primary'} rounded-pill px-3`} onClick={() => setTab(id)}>
                            <i className={`bi ${icon} me-1`} />{label}
                        </button>
                    ))}
                </div>
                <div className="emp-topbar-actions">
                    <button className="btn btn-outline-primary d-flex align-items-center gap-2 rounded-pill px-3" onClick={load} disabled={loading}>
                        <i className={`bi bi-arrow-repeat ${loading ? 'emp-spin' : ''}`} /> Refresh
                    </button>
                </div>
            </div>

            {/* ── HEADER ── */}
            <div className="emp-header">
                <h1 className="emp-title">Analytics & Reports</h1>
                <p className="emp-subtitle">Workforce analytics, hiring trends, and compensation insights.</p>
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
                    {/* ═════ HEADCOUNT TAB ═════ */}
                    {tab === 'headcount' && hc && (
                        <>
                            {/* Stat Cards */}
                            <div className="row g-3 mb-4">
                                {[
                                    { icon: 'bi-people-fill', label: 'Total', value: hc.total, color: '#3377FF' },
                                    { icon: 'bi-person-check-fill', label: 'Active', value: hc.active, color: '#06C270' },
                                    { icon: 'bi-person-dash-fill', label: 'Exited', value: hc.exited, color: '#FF3B3B' },
                                ].map(s => (
                                    <div key={s.label} className="col-md-4">
                                        <div className="card border-0 shadow-sm h-100" style={{ borderTop: `4px solid ${s.color}`, borderRadius: '14px', transition: 'transform 0.2s, box-shadow 0.2s' }}
                                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
                                            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                                        >
                                            <div className="card-body text-center py-4">
                                                <i className={`bi ${s.icon}`} style={{ fontSize: '28px', color: s.color }} />
                                                <div className="fw-bold mt-2" style={{ fontSize: '36px', color: s.color }}>{s.value}</div>
                                                <div className="text-muted small text-uppercase fw-bold">{s.label}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Donut + Ratio Bar */}
                            <div className="row g-4">
                                <div className="col-md-5">
                                    <div className="card border-0 shadow-sm emp-card h-100">
                                        <div className="card-body p-4 d-flex flex-column align-items-center">
                                            <h6 className="fw-bold text-uppercase small mb-3 align-self-start" style={{ letterSpacing: '0.08em' }}>
                                                <i className="bi bi-pie-chart text-primary me-2" />Workforce Distribution
                                            </h6>
                                            <div style={{ width: '220px', height: '220px' }}>
                                                {headcountDonut && <Doughnut data={headcountDonut.data} options={headcountDonut.options} />}
                                            </div>
                                            <div className="mt-3 text-muted x-small">As of {hc.as_of}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-7">
                                    <div className="card border-0 shadow-sm emp-card h-100">
                                        <div className="card-body p-4">
                                            <h6 className="fw-bold text-uppercase small mb-4" style={{ letterSpacing: '0.08em' }}>
                                                <i className="bi bi-bar-chart text-primary me-2" />Active vs Exited Ratio
                                            </h6>
                                            <div className="mb-4">
                                                <div className="d-flex justify-content-between mb-1"><span className="small fw-bold text-success">Active</span><span className="small fw-bold">{hc.active} ({hc.total ? Math.round(hc.active / hc.total * 100) : 0}%)</span></div>
                                                <div className="progress" style={{ height: '24px', borderRadius: '12px' }}>
                                                    <div className="progress-bar bg-success" style={{ width: `${hc.total ? (hc.active / hc.total * 100) : 0}%`, borderRadius: '12px', transition: 'width 0.8s ease' }} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="d-flex justify-content-between mb-1"><span className="small fw-bold text-danger">Exited</span><span className="small fw-bold">{hc.exited} ({hc.total ? Math.round(hc.exited / hc.total * 100) : 0}%)</span></div>
                                                <div className="progress" style={{ height: '24px', borderRadius: '12px' }}>
                                                    <div className="progress-bar bg-danger" style={{ width: `${hc.total ? (hc.exited / hc.total * 100) : 0}%`, borderRadius: '12px', transition: 'width 0.8s ease' }} />
                                                </div>
                                            </div>
                                            <div className="mt-4 p-3 bg-light rounded-3 text-center">
                                                <span className="text-muted small">Retention Rate: </span>
                                                <span className="fw-bold text-primary" style={{ fontSize: '20px' }}>{hc.total ? Math.round(hc.active / hc.total * 100) : 0}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ═════ JOINERS & LEAVERS TAB ═════ */}
                    {tab === 'joiners' && (
                        <>
                            {jl.length === 0 ? (
                                <div className="text-center py-5"><i className="bi bi-bar-chart-line d-block mb-2" style={{ fontSize: '48px', opacity: 0.2 }} /><div className="text-muted">No joining/leaving data available.</div></div>
                            ) : (
                                <>
                                    {/* Summary Stat Cards */}
                                    <div className="row g-3 mb-4">
                                        {[
                                            { icon: 'bi-person-plus-fill', label: 'Total Joiners', value: jlTotalJoiners, color: '#06C270' },
                                            { icon: 'bi-person-dash-fill', label: 'Total Leavers', value: jlTotalLeavers, color: '#FF3B3B' },
                                            { icon: 'bi-arrow-left-right', label: 'Net Change', value: `${jlNetChange >= 0 ? '+' : ''}${jlNetChange}`, color: jlNetChange >= 0 ? '#3377FF' : '#FF3B3B' },
                                        ].map(s => (
                                            <div key={s.label} className="col-md-4">
                                                <div className="card border-0 shadow-sm h-100" style={{ borderTop: `4px solid ${s.color}`, borderRadius: '14px', transition: 'transform 0.2s, box-shadow 0.2s' }}
                                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
                                                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                                                >
                                                    <div className="card-body d-flex align-items-center gap-3 py-3 px-4">
                                                        <div className="d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${s.color}12`, flexShrink: 0 }}>
                                                            <i className={`bi ${s.icon}`} style={{ fontSize: '22px', color: s.color }} />
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold" style={{ fontSize: '28px', color: s.color, fontFamily: "'Inter', sans-serif", lineHeight: 1.1 }}>{s.value}</div>
                                                            <div className="text-muted" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="row g-4">
                                        {/* Bar Chart */}
                                        <div className="col-lg-7">
                                            <div className="card border-0 shadow-sm emp-card h-100">
                                                <div className="px-4 pt-4 pb-0 d-flex justify-content-between align-items-center">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(51,119,255,0.1)' }}>
                                                            <i className="bi bi-bar-chart-fill" style={{ fontSize: '16px', color: '#3377FF' }} />
                                                        </div>
                                                        <h6 className="mb-0 fw-bold text-uppercase small" style={{ letterSpacing: '0.08em', fontFamily: "'Inter', sans-serif" }}>Monthly Joiners vs Leavers</h6>
                                                    </div>
                                                    <span className="badge rounded-pill px-3 py-1" style={{ background: 'rgba(51,119,255,0.08)', color: '#3377FF', fontSize: '11px', fontWeight: 700 }}>{jl.length} months</span>
                                                </div>
                                                <div className="card-body p-4">
                                                    <div style={{ height: '360px' }}>
                                                        {jlChart && <Bar data={jlChart.data} options={jlChart.options} />}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Trend Line */}
                                        <div className="col-lg-5">
                                            <div className="card border-0 shadow-sm emp-card h-100">
                                                <div className="px-4 pt-4 pb-0 d-flex justify-content-between align-items-center">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(6,194,112,0.1)' }}>
                                                            <i className="bi bi-graph-up" style={{ fontSize: '16px', color: '#06C270' }} />
                                                        </div>
                                                        <h6 className="mb-0 fw-bold text-uppercase small" style={{ letterSpacing: '0.08em', fontFamily: "'Inter', sans-serif" }}>Trend Comparison</h6>
                                                    </div>
                                                </div>
                                                <div className="card-body p-4">
                                                    <div style={{ height: '360px' }}>
                                                        {jlLineChart && <Line data={jlLineChart.data} options={jlLineChart.options} />}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Data Table */}
                                        <div className="col-12">
                                            <div className="card border-0 shadow-sm emp-card">
                                                <div className="px-4 py-3 bg-light border-bottom d-flex justify-content-between align-items-center">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(88,86,214,0.1)' }}>
                                                            <i className="bi bi-table" style={{ fontSize: '14px', color: '#5856D6' }} />
                                                        </div>
                                                        <h6 className="mb-0 fw-bold text-uppercase small" style={{ letterSpacing: '0.08em' }}>Monthly Breakdown</h6>
                                                    </div>
                                                    <span className="badge bg-primary rounded-pill">{jl.length} months</span>
                                                </div>
                                                <div className="card-body p-0">
                                                    <div className="table-responsive">
                                                        <table className="table align-middle mb-0">
                                                            <thead className="bg-light"><tr>
                                                                <th className="ps-4 py-3">Month</th>
                                                                <th className="py-3">Joiners</th>
                                                                <th className="py-3">Leavers</th>
                                                                <th className="py-3">Net Change</th>
                                                                <th className="pe-4 py-3">Trend</th>
                                                            </tr></thead>
                                                            <tbody>
                                                                {(jlShowAll ? jl : jl.slice(0, 10)).map(r => {
                                                                    const net = r.joiners - r.leavers
                                                                    return (
                                                                        <tr key={r.month}>
                                                                            <td className="ps-4 fw-bold" style={{ fontFamily: "'Inter', sans-serif" }}>{r.month}</td>
                                                                            <td><span className="badge rounded-pill px-3 py-2" style={{ background: 'rgba(6,194,112,0.1)', color: '#06C270', fontWeight: 700, fontSize: '12px' }}>{r.joiners}</span></td>
                                                                            <td><span className="badge rounded-pill px-3 py-2" style={{ background: 'rgba(255,59,59,0.1)', color: '#FF3B3B', fontWeight: 700, fontSize: '12px' }}>{r.leavers}</span></td>
                                                                            <td className={`fw-bold ${net >= 0 ? 'text-success' : 'text-danger'}`} style={{ fontFamily: "'Inter', sans-serif" }}>{net >= 0 ? '+' : ''}{net}</td>
                                                                            <td className="pe-4"><i className={`bi ${net > 0 ? 'bi-arrow-up-circle-fill text-success' : net < 0 ? 'bi-arrow-down-circle-fill text-danger' : 'bi-dash-circle text-muted'}`} style={{ fontSize: '20px' }} /></td>
                                                                        </tr>
                                                                    )
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                                {jl.length > 10 && (
                                                    <div className="px-4 py-3 border-top text-center">
                                                        <button
                                                            className="btn btn-sm rounded-pill px-4 d-inline-flex align-items-center gap-2"
                                                            style={{ background: 'rgba(51,119,255,0.08)', color: '#3377FF', fontWeight: 700, fontSize: '13px', border: 'none', transition: 'all 0.2s' }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(51,119,255,0.16)' }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(51,119,255,0.08)' }}
                                                            onClick={() => setJlShowAll(v => !v)}
                                                        >
                                                            <i className={`bi ${jlShowAll ? 'bi-chevron-up' : 'bi-chevron-down'}`} />
                                                            {jlShowAll ? 'Show Less' : `See More (${jl.length - 10} more)`}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {/* ═════ CTC & LEVELS TAB ═════ */}
                    {tab === 'ctc' && (
                        <>
                            {!ctcDist ? (
                                <div className="text-center py-5"><i className="bi bi-cash-stack d-block mb-2" style={{ fontSize: '48px', opacity: 0.2 }} /><div className="text-muted">No CTC data available.</div></div>
                            ) : (
                                <div className="row g-4">
                                    {/* Salary Band Donut */}
                                    <div className="col-md-5">
                                        <div className="card border-0 shadow-sm emp-card h-100">
                                            <div className="card-body p-4 d-flex flex-column align-items-center">
                                                <h6 className="fw-bold text-uppercase small mb-3 align-self-start" style={{ letterSpacing: '0.08em' }}>
                                                    <i className="bi bi-cash-stack text-primary me-2" />Salary Band Distribution
                                                </h6>
                                                {salaryChart ? (
                                                    <div style={{ width: '250px', height: '250px' }}>
                                                        <Doughnut data={salaryChart.data} options={salaryChart.options} />
                                                    </div>
                                                ) : <div className="text-muted py-3">No data.</div>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Level Horizontal Bar */}
                                    <div className="col-md-7">
                                        <div className="card border-0 shadow-sm emp-card h-100">
                                            <div className="card-body p-4">
                                                <h6 className="fw-bold text-uppercase small mb-3" style={{ letterSpacing: '0.08em' }}>
                                                    <i className="bi bi-bar-chart-line text-primary me-2" />Level-wise Distribution
                                                </h6>
                                                {levelChart ? (
                                                    <div style={{ height: Math.max(levelDist.length * 45, 200) + 'px' }}>
                                                        <Bar data={levelChart.data} options={levelChart.options} />
                                                    </div>
                                                ) : <div className="text-muted py-3">No data.</div>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary Cards */}
                                    <div className="col-12">
                                        <div className="row g-3">
                                            {salaryBands.map(([band, count], i) => {
                                                const bandColors = ['#3377FF', '#06C270', '#FF9500', '#5856D6', '#FF3B3B', '#AF52DE']
                                                const totalCTC = salaryBands.reduce((s, [, v]) => s + v, 0)
                                                const pct = totalCTC ? Math.round(count / totalCTC * 100) : 0
                                                return (
                                                    <div key={band} className="col-md-4 col-lg-2">
                                                        <div className="card border-0 shadow-sm" style={{ borderRadius: '14px', borderLeft: `4px solid ${bandColors[i % bandColors.length]}`, transition: 'transform 0.2s' }}
                                                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)' }}
                                                            onMouseLeave={e => { e.currentTarget.style.transform = '' }}
                                                        >
                                                            <div className="card-body p-3 text-center">
                                                                <div className="fw-bold" style={{ fontSize: '24px', color: bandColors[i % bandColors.length] }}>{count}</div>
                                                                <div className="text-muted" style={{ fontSize: '11px', fontWeight: 700 }}>₹{band}</div>
                                                                <div className="text-muted x-small">{pct}% of total</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    )
}
