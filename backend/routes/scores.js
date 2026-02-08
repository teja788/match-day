const express = require('express');
const { getScores, getMatch } = require('../services/scoreAggregator');

const router = express.Router();

/**
 * GET /api/scores
 * Query params: sport (optional) — 'cricket' | 'football'
 * Returns: { matches: [...], lastUpdated, count }
 */
router.get('/', async (req, res) => {
  try {
    const { sport } = req.query;
    const data = await getScores(sport || undefined);
    res.json(data);
  } catch (err) {
    console.error('[Scores] Error fetching scores:', err.message);
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

/**
 * GET /api/scores/:id
 * Returns: single match object
 */
router.get('/:id', async (req, res) => {
  try {
    const match = await getMatch(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    res.json(match);
  } catch (err) {
    console.error('[Scores] Error fetching match:', err.message);
    res.status(500).json({ error: 'Failed to fetch match' });
  }
});

module.exports = router;
