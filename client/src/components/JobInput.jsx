import { useState } from 'react';

export default function JobInput({ mode, onModeChange, jobDescription, onDescriptionChange, linkedinUrl, onUrlChange }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onModeChange('paste')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
            mode === 'paste'
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Paste Job Description
        </button>
        <button
          type="button"
          onClick={() => onModeChange('url')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
            mode === 'url'
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          LinkedIn URL
        </button>
        <button
          type="button"
          onClick={() => onModeChange('both')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
            mode === 'both'
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Both
        </button>
      </div>

      {(mode === 'url' || mode === 'both') && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn Job URL</label>
          <input
            type="url"
            value={linkedinUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://www.linkedin.com/jobs/view/..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          <p className="text-xs text-slate-400 mt-1">
            Public job listings only. If fetching fails, paste the description below.
          </p>
        </div>
      )}

      {(mode === 'paste' || mode === 'both') && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={10}
            placeholder="Paste the full job description here..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y"
          />
        </div>
      )}
    </div>
  );
}
