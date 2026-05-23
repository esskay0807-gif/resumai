const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert IT recruiter and technical hiring specialist with deep knowledge of software engineering, DevOps, data science, cybersecurity, and all major IT domains. Your job is to analyze a candidate's resume against a job description and produce a structured JSON report.

CRITICAL RULES — follow these exactly:
1. READ THE FULL RESUME TEXT carefully before drawing any conclusion.
2. CERTIFICATIONS: Before marking any certification as missing, search the entire resume for it by full name, common abbreviation, and acronym (e.g. "AWS Certified Solutions Architect" matches "AWS SAA", "AWS CSA", "Solutions Architect Associate"). Only mark a certification missing if there is truly NO mention of it in any form.
3. SKILLS: A skill is "matched" if the resume demonstrates it directly OR through equivalent technology/experience. Do not mark a skill missing just because the exact keyword is absent — look for evidence of capability.
4. NEVER invent missing items that are clearly present in the resume. False negatives (saying something is missing when it's there) are a serious error.
5. When in doubt about whether something is present, lean toward matched rather than missing.`;

async function analyzeResumeVsJob(resumeText, jobDescription) {
  const userPrompt = `You must follow a two-step process:

STEP 1 — EXTRACT (do this mentally before writing any output):
a) List every certification found in the resume (by full name AND abbreviation/acronym).
b) List every required/preferred certification mentioned in the job description.
c) For each JD certification, check if it appears in the resume list from (a) — by full name, abbreviation, acronym, or common alias. Only mark it missing if genuinely absent.
d) Do the same extraction and comparison for technical skills.

STEP 2 — OUTPUT the following JSON object with EXACTLY this structure:

{
  "job_title": "extracted job title from JD",
  "company": "extracted company name if present",
  "overall_score": <integer 0-100>,
  "verdict": "Strong Fit" | "Good Fit" | "Partial Fit" | "Weak Fit" | "Not a Fit",
  "summary": "<2-3 sentence executive summary of the match>",
  "matched_skills": ["skill1", "skill2", ...],
  "missing_skills": ["skill1", "skill2", ...],
  "nice_to_have_skills": ["skill1", ...],
  "certifications": {
    "required": ["cert name as stated in JD", ...],
    "candidate_has": ["cert name as found in resume", ...],
    "matched": ["cert from JD that candidate holds (any form/abbreviation)", ...],
    "missing": ["cert from JD that candidate genuinely does NOT have", ...]
  },
  "sections": {
    "technical_skills": {
      "score": <0-100>,
      "analysis": "<detailed analysis>",
      "matched": ["..."],
      "missing": ["..."]
    },
    "experience": {
      "score": <0-100>,
      "analysis": "<detailed analysis>",
      "years_required": "<years from JD or unknown>",
      "years_candidate": "<estimated years from resume>"
    },
    "education": {
      "score": <0-100>,
      "analysis": "<detailed analysis>"
    },
    "soft_skills": {
      "score": <0-100>,
      "analysis": "<detailed analysis>"
    }
  },
  "recommendations": [
    "<specific actionable recommendation to improve the resume or skills for this role>",
    ...
  ],
  "red_flags": [
    "<any concern a recruiter should be aware of>",
    ...
  ]
}

SCORING GUIDE:
- 90-100: Exceptional match, exceeds all requirements
- 75-89: Strong match, meets most requirements well
- 60-74: Good match, meets core requirements
- 45-59: Partial match, meets some requirements but gaps exist
- 30-44: Weak match, significant gaps
- 0-29: Not a fit

---
JOB DESCRIPTION:
${jobDescription}

---
RESUME:
${resumeText}

Return ONLY the JSON object, no markdown, no explanation.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const raw = response.content[0].text.trim();

  // Strip markdown code fences if present
  const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(jsonStr);
}

module.exports = { analyzeResumeVsJob };
