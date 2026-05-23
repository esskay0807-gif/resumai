const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { parseResume } = require('../services/resumeParser');
const { scrapeLinkedInJob } = require('../services/linkedinScraper');
const { analyzeResumeVsJob } = require('../services/aiAnalyzer');
const db = require('../db/database');

const upload = multer({
  dest: path.join(__dirname, '../uploads'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and DOCX files are supported'));
  },
});

router.post('/', upload.single('resume'), async (req, res) => {
  let filePath = null;

  try {
    const { jobDescription, linkedinUrl, pastedResumeText, resumeInputLabel } = req.body;

    // Resolve resume text — file upload takes priority, then pasted text
    let resumeText = '';
    let resumeName = 'Pasted Resume';

    if (req.file) {
      filePath = req.file.path;
      resumeName = req.file.originalname;
      resumeText = await parseResume(filePath, req.file.mimetype);
      if (!resumeText || resumeText.trim().length < 50) {
        return res.status(422).json({
          error: 'Could not extract readable text from the resume. Please ensure the file is not scanned/image-only.',
        });
      }
    } else if (pastedResumeText && pastedResumeText.trim().length >= 50) {
      resumeText = pastedResumeText.trim();
      resumeName = resumeInputLabel === 'linkedin' ? 'LinkedIn Profile (pasted)' : 'Pasted Resume';
    } else {
      return res.status(400).json({
        error: 'Please upload a resume file or paste resume / LinkedIn profile text (minimum 50 characters).',
      });
    }

    // Resolve job description — LinkedIn URL takes priority if provided
    let finalJobDescription = jobDescription || '';
    let linkedinTitle = '';
    let linkedinCompany = '';

    if (linkedinUrl && linkedinUrl.trim()) {
      try {
        const scraped = await scrapeLinkedInJob(linkedinUrl.trim());
        finalJobDescription = scraped.description;
        linkedinTitle = scraped.title;
        linkedinCompany = scraped.company;
      } catch (scrapeErr) {
        if (!finalJobDescription.trim()) {
          return res.status(422).json({ error: scrapeErr.message });
        }
      }
    }

    if (!finalJobDescription.trim()) {
      return res.status(400).json({
        error: 'Job description is required (paste text or provide a LinkedIn URL)',
      });
    }

    const analysis = await analyzeResumeVsJob(resumeText, finalJobDescription);

    const record = {
      _id: uuidv4(),
      created_at: new Date().toISOString(),
      resume_name: resumeName,
      job_title: analysis.job_title || linkedinTitle || 'Unknown',
      company: analysis.company || linkedinCompany || '',
      job_source: linkedinUrl ? 'linkedin' : 'manual',
      overall_score: analysis.overall_score,
      verdict: analysis.verdict,
      summary: analysis.summary,
      matched_skills: analysis.matched_skills || [],
      missing_skills: analysis.missing_skills || [],
      details: analysis,
    };

    await db.insert(record);

    res.json({ id: record._id, ...analysis });
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: err.message || 'Analysis failed' });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

module.exports = router;
