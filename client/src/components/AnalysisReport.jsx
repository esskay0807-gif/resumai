import ScoreGauge from './ScoreGauge';

const VERDICT_STYLES = {
  'Strong Fit':  { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500'  },
  'Good Fit':    { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-500'   },
  'Partial Fit': { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  'Weak Fit':    { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
  'Not a Fit':   { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-500'    },
};

function VerdictBadge({ verdict }) {
  const styles = VERDICT_STYLES[verdict] || VERDICT_STYLES['Partial Fit'];
  return (
    <span className={`badge gap-1.5 ${styles.bg} ${styles.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      {verdict}
    </span>
  );
}

function SectionScoreBar({ label, score }) {
  const color =
    score >= 75 ? 'bg-green-500'
    : score >= 60 ? 'bg-blue-500'
    : score >= 45 ? 'bg-yellow-400'
    : 'bg-red-400';

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600 w-28 shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-slate-700 w-8 text-right">{score}</span>
    </div>
  );
}

function SkillPill({ skill, variant }) {
  const styles =
    variant === 'matched'
      ? 'bg-green-50 text-green-700 border-green-200'
      : variant === 'missing'
      ? 'bg-red-50 text-red-700 border-red-200'
      : 'bg-yellow-50 text-yellow-700 border-yellow-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles}`}>
      {skill}
    </span>
  );
}

export default function AnalysisReport({ data }) {
  if (!data) return null;

  const {
    overall_score,
    verdict,
    summary,
    matched_skills = [],
    missing_skills = [],
    nice_to_have_skills = [],
    certifications = {},
    sections = {},
    recommendations = [],
    red_flags = [],
    job_title,
    company,
  } = data;

  return (
    <div className="flex flex-col gap-6">
      {/* Hero score card */}
      <div className="card p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="flex flex-col items-center gap-2 shrink-0">
          <ScoreGauge score={overall_score} size={130} />
          <p className="text-sm text-slate-500 font-medium">Overall Score</p>
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <VerdictBadge verdict={verdict} />
            {job_title && (
              <span className="text-sm text-slate-500">
                {job_title}{company ? ` · ${company}` : ''}
              </span>
            )}
          </div>
          <p className="text-slate-700 leading-relaxed">{summary}</p>
        </div>
      </div>

      {/* Section scores */}
      {sections && Object.keys(sections).length > 0 && (
        <div className="card p-6">
          <h3 className="section-title">Section Breakdown</h3>
          <div className="flex flex-col gap-3">
            {sections.technical_skills && (
              <SectionScoreBar label="Technical Skills" score={sections.technical_skills.score} />
            )}
            {sections.experience && (
              <SectionScoreBar label="Experience" score={sections.experience.score} />
            )}
            {sections.education && (
              <SectionScoreBar label="Education" score={sections.education.score} />
            )}
            {sections.soft_skills && (
              <SectionScoreBar label="Soft Skills" score={sections.soft_skills.score} />
            )}
          </div>

          {/* Detailed section analysis */}
          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            {Object.entries(sections).map(([key, sec]) => (
              <div key={key} className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">{sec.analysis}</p>
                {key === 'experience' && sec.years_required !== 'unknown' && (
                  <div className="mt-2 flex gap-4 text-xs text-slate-500">
                    <span>Required: <strong>{sec.years_required}</strong></span>
                    <span>Candidate: <strong>{sec.years_candidate}</strong></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      <div className="grid sm:grid-cols-2 gap-4">
        {matched_skills.length > 0 && (
          <div className="card p-5">
            <h3 className="section-title flex items-center gap-2">
              <span className="text-green-500">✓</span> Matched Skills
              <span className="ml-auto badge bg-green-100 text-green-700">{matched_skills.length}</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {matched_skills.map((s) => <SkillPill key={s} skill={s} variant="matched" />)}
            </div>
          </div>
        )}

        {missing_skills.length > 0 && (
          <div className="card p-5">
            <h3 className="section-title flex items-center gap-2">
              <span className="text-red-400">✗</span> Missing Skills
              <span className="ml-auto badge bg-red-100 text-red-700">{missing_skills.length}</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {missing_skills.map((s) => <SkillPill key={s} skill={s} variant="missing" />)}
            </div>
          </div>
        )}
      </div>

      {nice_to_have_skills.length > 0 && (
        <div className="card p-5">
          <h3 className="section-title flex items-center gap-2">
            <span className="text-yellow-500">◎</span> Nice-to-Have Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {nice_to_have_skills.map((s) => <SkillPill key={s} skill={s} variant="nice" />)}
          </div>
        </div>
      )}

      {/* Certifications */}
      {(certifications.required?.length > 0 || certifications.candidate_has?.length > 0) && (
        <div className="card p-5">
          <h3 className="section-title flex items-center gap-2">
            <span>🏅</span> Certifications
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {certifications.candidate_has?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Candidate Holds
                </p>
                <div className="flex flex-wrap gap-2">
                  {certifications.candidate_has.map((c) => (
                    <SkillPill key={c} skill={c} variant="matched" />
                  ))}
                </div>
              </div>
            )}
            {certifications.missing?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Required — Not Found
                </p>
                <div className="flex flex-wrap gap-2">
                  {certifications.missing.map((c) => (
                    <SkillPill key={c} skill={c} variant="missing" />
                  ))}
                </div>
              </div>
            )}
            {certifications.matched?.length > 0 && (
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Required & Matched
                </p>
                <div className="flex flex-wrap gap-2">
                  {certifications.matched.map((c) => (
                    <SkillPill key={c} skill={c} variant="matched" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="card p-5">
          <h3 className="section-title">Recommendations for Candidate</h3>
          <ul className="flex flex-col gap-2.5">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-700">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Red flags */}
      {red_flags.length > 0 && (
        <div className="card p-5 border-red-200">
          <h3 className="section-title text-red-600">Red Flags</h3>
          <ul className="flex flex-col gap-2">
            {red_flags.map((flag, i) => (
              <li key={i} className="flex gap-2 text-sm text-red-700">
                <span className="shrink-0 mt-0.5">⚠</span>
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
