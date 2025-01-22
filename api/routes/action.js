const express = require('express');
const router = express.Router();
const { Action } = require('../models/Actions');

router.post('/createAction', async (req, res) => {
  try {
    const action = await Action.create(req.body);
    res.status(201).json(action);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/fetchAllAction', async (req, res) => {
  try {
    const actions = await Action.findAll();
    res.status(200).json(actions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
