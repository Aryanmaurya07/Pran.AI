import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

// ── Helpers ────────────────────────────────────────────────────────────────────
const adminApi = (endpoint, options = {}) => {
  const token = localStorage.getItem('pranix_admin_token');
  return api({
    url: endpoint,
    headers: { Authorization: `Bearer ${token}` },
    ...options
  });
};

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric'
});

const SeverityPill = ({ severity }) => {
  const map = {
    Mild:     'bg-green-100 text-green-700 border-green-200',
    Moderate: 'bg-amber-100 text-amber-700 border-amber-200',
    Serious:  'bg-red-100   text-red-700   border-red-200'
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${map[severity] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {severity}
    </span>
  );
};

// ── Stat card ──────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color }) => (
  <div className={`bg-white border rounded-2xl p-5 flex items-center gap-4 ${color.border}`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color.bg}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-extrabold ${color.text}`}>{value ?? '—'}</p>
    </div>
  </div>
);

// ── User detail modal ──────────────────────────────────────────────────────────
const UserModal = ({ userId, onClose, onDeleteUser }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi(`/api/admin/users/${userId}/history`)
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">User Details</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !data ? (
            <p className="text-slate-500 text-center py-8">Failed to load user data</p>
          ) : (
            <>
              {/* User info */}
              <div className="bg-slate-50 rounded-2xl p-5 mb-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    {data.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{data.user?.name}</p>
                    <p className="text-slate-500 text-sm">{data.user?.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-slate-400 text-xs uppercase font-semibold">Joined</span><p className="font-medium text-slate-700">{formatDate(data.user?.createdAt)}</p></div>
                  <div><span className="text-slate-400 text-xs uppercase font-semibold">Total Reports</span><p className="font-medium text-slate-700">{data.history?.length || 0}</p></div>
                </div>
              </div>

              {/* History */}
              <h3 className="font-bold text-slate-800 mb-3">Symptom History</h3>
              {data.history?.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-6 bg-slate-50 rounded-xl">No reports yet</p>
              ) : (
                <div className="space-y-3">
                  {data.history.map(h => (
                    <div key={h._id} className="border border-slate-200 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="font-semibold text-slate-800 text-sm">{h.condition}</p>
                        <SeverityPill severity={h.severity} />
                      </div>
                      <p className="text-slate-500 text-xs mb-1 line-clamp-2">{h.rawInput}</p>
                      <p className="text-slate-400 text-xs">{formatDate(h.createdAt)} · {h.doctorType}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-5 border-t border-slate-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm transition-colors">
            Close
          </button>
          <button
            onClick={() => { onDeleteUser(userId, data?.user?.name); onClose(); }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2" strokeLinecap="round"/>
            </svg>
            Delete User & All Data
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main AdminDashboard ────────────────────────────────────────────────────────
const TABS = ['Overview', 'Users', 'Reports'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [totalReports, setTotalReports] = useState(0);
  const [reportPage, setReportPage] = useState(1);
  const [reportPages, setReportPages] = useState(1);
  const [severityFilter, setSeverityFilter] = useState('');
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const logout = () => {
    localStorage.removeItem('pranix_admin_token');
    navigate('/admin');
  };

  // Check auth
  useEffect(() => {
    if (!localStorage.getItem('pranix_admin_token')) navigate('/admin');
  }, []);

  // Load stats
  useEffect(() => {
    setLoadingStats(true);
    adminApi('/api/admin/stats')
      .then(r => setStats(r.data))
      .catch(() => logout())
      .finally(() => setLoadingStats(false));
  }, []);

  // Load users
  useEffect(() => {
    if (activeTab !== 'Users') return;
    setLoadingUsers(true);
    adminApi('/api/admin/users')
      .then(r => setUsers(r.data.users))
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  }, [activeTab]);

  // Load reports
  const loadReports = useCallback(() => {
    setLoadingReports(true);
    adminApi(`/api/admin/reports?page=${reportPage}&limit=20${severityFilter ? `&severity=${severityFilter}` : ''}`)
      .then(r => {
        setReports(r.data.reports);
        setTotalReports(r.data.total);
        setReportPages(r.data.pages);
      })
      .catch(() => {})
      .finally(() => setLoadingReports(false));
  }, [reportPage, severityFilter]);

  useEffect(() => {
    if (activeTab === 'Reports') loadReports();
  }, [activeTab, loadReports]);

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}" and ALL their data permanently?`)) return;
    try {
      await adminApi(`/api/admin/users/${userId}`, { method: 'delete' });
      setUsers(prev => prev.filter(u => u._id !== userId));
      showToast(`User "${userName}" deleted successfully`);
      // Refresh stats
      adminApi('/api/admin/stats').then(r => setStats(r.data));
    } catch {
      showToast('Failed to delete user');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Delete this report permanently?')) return;
    try {
      await adminApi(`/api/admin/reports/${reportId}`, { method: 'delete' });
      setReports(prev => prev.filter(r => r._id !== reportId));
      setTotalReports(prev => prev - 1);
      showToast('Report deleted');
      adminApi('/api/admin/stats').then(r => setStats(r.data));
    } catch {
      showToast('Failed to delete report');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-teal-600 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      {/* User modal */}
      {selectedUserId && (
        <UserModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {/* Top bar */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 12h3l2-7 4 14 3-10 2 3h4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <span className="text-white font-bold text-sm">प्राण.AI</span>
              <span className="text-slate-500 text-xs ml-2">Admin Panel</span>
            </div>
          </div>
          <button onClick={logout}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Monitor and manage प्राण.AI users and reports</p>
        </div>

        {/* Stats cards */}
        {loadingStats ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Users"
              value={stats.totalUsers}
              color={{ bg: 'bg-teal-950', text: 'text-teal-400', border: 'border-teal-900' }}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>}
            />
            <StatCard
              label="Total Reports"
              value={stats.totalReports}
              color={{ bg: 'bg-blue-950', text: 'text-blue-400', border: 'border-blue-900' }}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
            />
            <StatCard
              label="Reports Today"
              value={stats.reportsToday}
              color={{ bg: 'bg-amber-950', text: 'text-amber-400', border: 'border-amber-900' }}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14" strokeLinecap="round"/></svg>}
            />
            <StatCard
              label="Serious Cases"
              value={stats.severityMap?.Serious}
              color={{ bg: 'bg-red-950', text: 'text-red-400', border: 'border-red-900' }}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
            />
          </div>
        )}

        {/* Severity breakdown */}
        {stats && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Severity Breakdown</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Mild',     count: stats.severityMap?.Mild,     color: 'bg-green-500' },
                { label: 'Moderate', count: stats.severityMap?.Moderate, color: 'bg-amber-500' },
                { label: 'Serious',  count: stats.severityMap?.Serious,  color: 'bg-red-500' },
              ].map(({ label, count, color }) => {
                const pct = stats.totalReports ? Math.round((count / stats.totalReports) * 100) : 0;
                return (
                  <div key={label} className="bg-slate-800 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-xs font-semibold">{label}</span>
                      <span className="text-white font-bold text-sm">{count || 0}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-slate-500 text-xs mt-1">{pct}%</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 mb-6 w-fit">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── USERS TAB ────────────────────────────────────────────────────── */}
        {activeTab === 'Users' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <p className="text-white font-bold">{users.length} Registered Users</p>
            </div>
            {loadingUsers ? (
              <div className="flex justify-center py-12">
                <div className="w-7 h-7 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-slate-500 text-center py-12">No users found</p>
            ) : (
              <div className="divide-y divide-slate-800">
                {users.map(user => (
                  <div key={user._id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                        <p className="text-slate-400 text-xs truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-slate-400 text-xs">{user.reportCount} reports</p>
                        <p className="text-slate-600 text-xs">{formatDate(user.createdAt)}</p>
                      </div>
                      <button onClick={() => setSelectedUserId(user._id)}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-colors">
                        View
                      </button>
                      <button onClick={() => handleDeleteUser(user._id, user.name)}
                        className="px-3 py-1.5 bg-red-900/40 hover:bg-red-800/60 text-red-400 hover:text-red-300 text-xs font-semibold rounded-lg transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── REPORTS TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'Reports' && (
          <div>
            {/* Filter */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-slate-400 text-sm">Filter:</span>
              {['', 'Mild', 'Moderate', 'Serious'].map(s => (
                <button key={s} onClick={() => { setSeverityFilter(s); setReportPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    severityFilter === s
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}>
                  {s || 'All'}
                </button>
              ))}
              <span className="text-slate-600 text-xs ml-auto">{totalReports} total</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              {loadingReports ? (
                <div className="flex justify-center py-12">
                  <div className="w-7 h-7 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : reports.length === 0 ? (
                <p className="text-slate-500 text-center py-12">No reports found</p>
              ) : (
                <div className="divide-y divide-slate-800">
                  {reports.map(report => (
                    <div key={report._id} className="px-5 py-4 hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="text-white font-semibold text-sm">{report.condition}</p>
                            <SeverityPill severity={report.severity} />
                          </div>
                          <p className="text-slate-400 text-xs mb-1 line-clamp-1">{report.rawInput}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                            <span>👤 {report.userId?.name || 'Unknown'}</span>
                            <span>📧 {report.userId?.email || '—'}</span>
                            <span>📅 {formatDate(report.createdAt)}</span>
                            <span>🏥 {report.doctorType}</span>
                            {report.reliabilityScore && <span>⭐ {report.reliabilityScore}/100</span>}
                          </div>
                        </div>
                        <button onClick={() => handleDeleteReport(report._id)}
                          className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {reportPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-5">
                <button disabled={reportPage === 1} onClick={() => setReportPage(p => p - 1)}
                  className="px-4 py-2 bg-slate-800 text-slate-400 hover:text-white disabled:opacity-40 rounded-lg text-sm transition-colors">
                  Previous
                </button>
                <span className="text-slate-400 text-sm">{reportPage} / {reportPages}</span>
                <button disabled={reportPage === reportPages} onClick={() => setReportPage(p => p + 1)}
                  className="px-4 py-2 bg-slate-800 text-slate-400 hover:text-white disabled:opacity-40 rounded-lg text-sm transition-colors">
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── OVERVIEW TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'Overview' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">Quick Summary</h3>
            <div className="space-y-3 text-sm text-slate-400">
              <p>· <span className="text-white font-semibold">{stats?.totalUsers || 0}</span> users have registered on प्राण.AI</p>
              <p>· <span className="text-white font-semibold">{stats?.totalReports || 0}</span> symptom analyses completed</p>
              <p>· <span className="text-white font-semibold">{stats?.reportsToday || 0}</span> analyses done today</p>
              <p>· <span className="text-red-400 font-semibold">{stats?.severityMap?.Serious || 0}</span> serious cases flagged total</p>
              <p>· Switch to <strong className="text-white">Users</strong> tab to view, inspect, or delete users</p>
              <p>· Switch to <strong className="text-white">Reports</strong> tab to browse all symptom reports with filters</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;