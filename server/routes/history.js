const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/', async (req, res) => {
  try {
    const records = await db
      .find({})
      .sort({ created_at: -1 })
      .limit(100)
      .projection({
        _id: 1, created_at: 1, resume_name: 1, job_title: 1, company: 1,
        job_source: 1, overall_score: 1, verdict: 1, summary: 1,
      })
      .exec();

    const mapped = records.map((r) => ({ ...r, id: r._id }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const record = await db.findOne({ _id: req.params.id });
    if (!record) return res.status(404).json({ error: 'Analysis not found' });
    res.json({ ...record, id: record._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const n = await db.remove({ _id: req.params.id }, {});
    if (n === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
