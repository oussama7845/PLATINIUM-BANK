const express = require('express');
const router = express.Router();
const { Transaction } = require('../models/transaction');

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - transactionType
 *         - amount
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-généré de la transaction
 *         transactionType:
 *           type: string
 *           enum: [Deposit, Withdrawal, Transfer]
 *           description: Type de transaction
 *         amount:
 *           type: number
 *           format: float
 *           description: Montant de la transaction
 *         transactionDate:
 *           type: string
 *           format: date-time
 *           description: Date de la transaction
 *         status:
 *           type: string
 *           enum: [Pending, Completed, Failed]
 *           description: Statut de la transaction
 *         accountIdDebit:
 *           type: integer
 *           description: ID du compte débité
 *         accountIdCredit:
 *           type: integer
 *           description: ID du compte crédité
 */

/**
 * @swagger
 * /createTransaction:
 *   post:
 *     summary: Crée une nouvelle transaction
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactionType:
 *                 type: string
 *                 enum: [Deposit, Withdrawal, Transfer]
 *                 description: Type de transaction
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: Montant de la transaction
 *               accountIdDebit:
 *                 type: integer
 *                 description: ID du compte débité
 *               accountIdCredit:
 *                 type: integer
 *                 description: ID du compte crédité
 *     responses:
 *       201:
 *         description: Transaction créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Erreur dans les données envoyées
 */
router.post('/createTransaction', async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /fetchAllTransaction:
 *   get:
 *     summary: Récupère toutes les transactions
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: Liste de toutes les transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       500:
 *         description: Erreur serveur
 */
router.get('/fetchAllTransaction', async (req, res) => {
  try {
    const transactions = await Transaction.findAll();
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
