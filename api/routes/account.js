const express = require('express');
const router = express.Router();
const { Account } = require('../models/account');

router.post('/createAccount', async (req, res) => {
  try {
    const account = await Account.create(req.body);
    res.status(201).json(account);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/fetchAllAccounts', async (req, res) => {
  try {
    const accounts = await Account.findAll();
    res.status(200).json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/updateAccount:id', async (req, res) => {
  try {
    const updated = await Account.update(req.body, { where: { id: req.params.id } });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/deleteAccount:id', async (req, res) => {
  try {
    await Account.destroy({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
