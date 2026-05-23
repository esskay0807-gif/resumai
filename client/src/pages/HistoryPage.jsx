import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const VERDICT_COLORS = {
  'Strong Fit':  'bg-green-100 text-green-800',
  'Good Fit':    'bg-blue-100 text-blue-800',
  'Partial Fit': 'bg-yellow-100 text-yellow-800',
  'Weak Fit':    'bg-orange-100 text-orange-800',
  'Not a Fit':   'bg-red-100 text-red-800',
};

function ScoreBadge({ score }) {
  const color =
    score >= 75 ? 'text-green-600 bg-green-50'
    : score >= 60 ? 'text-blue-600 bg-blue-50'
    : score >= 45 ? 'text-yellow-600 bg-yellow-50'
    : 'text-red-600 bg-red-50';
  return (
    <span className={`font-bold text-lg px-2 py-0.5 rounded-lg ${color}`}>{score}</span>
  );
}

export default function HistoryPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    axios.get('/api/history').then((r) => {
      setRecords(r.data);
      setLoading(false);
    });
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this analysis?')) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/history/${id}`);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Loading history...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analysis History</h1>
          <p className="text-slate-500 mt-1">{records.length} saved {records.length === 1 ? 'analysis' : 'analyses'}</p>
        </div>
        <Link to="/" className="btn-primary">+ New Analysis</Link>
      </div>

      {records.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          <p className="text-lg font-medium mb-2">No analyses yet</p>
          <p className="text-sm">Run your first resume analysis to see results here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {records.map((rec) => (
            <div key={rec.id} className="card p-5 hover:border-slate-300 transition-colors">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                  <ScoreBadge score={rec.overall_score} />
                  <span className="text-xs text-slate-400">score</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-800 truncate">
                      {rec.job_title || 'Untitled Role'}
                    </span>
                    {rec.company && (
                      <span className="text-sm text-slate-500">· {rec.company}</span>
                    )}
                    <span className={`badge ${VERDICT_COLORS[rec.verdict] || 'bg-slate-100 text-slate-600'}`}>
                      {rec.verdict}
                    </span>
                    {rec.job_source === 'linkedin' && (
                      <span className="badge bg-sky-100 text-sky-700">LinkedIn</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{rec.summary}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-slate-400">
                      {new Date(rec.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    <span className="text-xs text-slate-400">· {rec.resume_name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/history/${rec.id}`}
                    className="btn-secondary text-sm py-1.5 px-3"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(rec.id)}
                    disabled={deleting === rec.id}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
