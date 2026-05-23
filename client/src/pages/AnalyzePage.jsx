import { useState } from 'react';
import axios from 'axios';
import FileUpload from '../components/FileUpload';
import JobInput from '../components/JobInput';
import AnalysisReport from '../components/AnalysisReport';

const RESUME_MODES = [
  { id: 'upload',   label: 'Upload File',          icon: '📄' },
  { id: 'linkedin', label: 'Paste LinkedIn Profile', icon: '🔗' },
  { id: 'paste',    label: 'Paste Resume Text',     icon: '📋' },
];

export default function AnalyzePage() {
  const [resumeMode, setResumeMode]               = useState('upload');
  const [file, setFile]                           = useState(null);
  const [pastedResumeText, setPastedResumeText]   = useState('');
  const [jobMode, setJobMode]                     = useState('paste');
  const [jobDescription, setJobDescription]       = useState('');
  const [linkedinUrl, setLinkedinUrl]             = useState('');
  const [loading, setLoading]                     = useState(false);
  const [error, setError]                         = useState('');
  const [result, setResult]                       = useState(null);

  function handleResumeMode(mode) {
    setResumeMode(mode);
    setFile(null);
    setPastedResumeText('');
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);

    // Validate resume input
    if (resumeMode === 'upload' && !file) {
      return setError('Please upload a resume file.');
    }
    if ((resumeMode === 'linkedin' || resumeMode === 'paste') && pastedResumeText.trim().length < 50) {
      return setError('Please paste your resume or LinkedIn profile text (at least 50 characters).');
    }

    // Validate job description input
    if (jobMode === 'paste' && !jobDescription.trim()) return setError('Please paste a job description.');
    if (jobMode === 'url' && !linkedinUrl.trim()) return setError('Please enter a LinkedIn URL.');
    if (jobMode === 'both' && !jobDescription.trim() && !linkedinUrl.trim())
      return setError('Please provide at least a job description or LinkedIn URL.');

    const formData = new FormData();
    if (resumeMode === 'upload') {
      formData.append('resume', file);
    } else {
      formData.append('pastedResumeText', pastedResumeText);
      formData.append('resumeInputLabel', resumeMode); // 'linkedin' or 'paste'
    }
    if (jobDescription.trim()) formData.append('jobDescription', jobDescription);
    if (linkedinUrl.trim()) formData.append('linkedinUrl', linkedinUrl);

    setLoading(true);
    try {
      const { data } = await axios.post('/api/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
      setResult(data);
      window.scrollTo({ top: document.getElementById('report')?.offsetTop ?? 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Resume Analyzer</h1>
        <p className="text-slate-500 mt-1">
          Upload or paste a resume / LinkedIn profile, then provide a job description for an AI-powered fit analysis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Resume input */}
          <div className="card p-5 flex flex-col gap-3">
            <h2 className="font-semibold text-slate-800">1. Candidate Resume</h2>

            {/* Mode toggle */}
            <div className="flex gap-1.5 p-1 bg-slate-100 rounded-lg">
              {RESUME_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleResumeMode(m.id)}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-md text-xs font-medium transition-colors ${
                    resumeMode === m.id
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="text-base leading-none">{m.icon}</span>
                  <span className="leading-tight text-center">{m.label}</span>
                </button>
              ))}
            </div>

            {/* Upload mode */}
            {resumeMode === 'upload' && (
              <FileUpload file={file} onFileChange={setFile} />
            )}

            {/* LinkedIn profile paste mode */}
            {resumeMode === 'linkedin' && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-slate-500">
                  Go to the candidate's LinkedIn profile → click <strong>More → Save to PDF</strong> or copy the full profile text and paste it below.
                </p>
                <textarea
                  value={pastedResumeText}
                  onChange={(e) => setPastedResumeText(e.target.value)}
                  rows={12}
                  placeholder="Paste the LinkedIn profile content here...&#10;&#10;Include: name, headline, about, experience, education, skills, certifications..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y"
                />
                {pastedResumeText.trim().length > 0 && (
                  <p className="text-xs text-slate-400 text-right">{pastedResumeText.trim().length} characters</p>
                )}
              </div>
            )}

            {/* Plain resume paste mode */}
            {resumeMode === 'paste' && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-slate-500">
                  Copy and paste the full resume text below.
                </p>
                <textarea
                  value={pastedResumeText}
                  onChange={(e) => setPastedResumeText(e.target.value)}
                  rows={12}
                  placeholder="Paste the full resume text here...&#10;&#10;Include: skills, work experience, education, certifications..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y"
                />
                {pastedResumeText.trim().length > 0 && (
                  <p className="text-xs text-slate-400 text-right">{pastedResumeText.trim().length} characters</p>
                )}
              </div>
            )}
          </div>

          {/* Job description */}
          <div className="card p-5 flex flex-col gap-3">
            <h2 className="font-semibold text-slate-800">2. Job Description</h2>
            <JobInput
              mode={jobMode}
              onModeChange={setJobMode}
              jobDescription={jobDescription}
              onDescriptionChange={setJobDescription}
              linkedinUrl={linkedinUrl}
              onUrlChange={setLinkedinUrl}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="flex justify-center">
          <button type="submit" className="btn-primary text-base px-8 py-3" disabled={loading}>
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Analyze Resume
              </>
            )}
          </button>
        </div>
      </form>

      {result && (
        <div id="report" className="flex flex-col gap-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Analysis Report</h2>
            <a href="/history" className="text-sm text-brand-600 hover:underline">
              View history →
            </a>
          </div>
          <AnalysisReport data={result} />
        </div>
      )}
    </div>
  );
}
