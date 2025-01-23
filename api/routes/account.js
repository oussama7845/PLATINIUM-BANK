const express = require('express');
const router = express.Router();
const { Account } = require('../models/account');

/**
 * @swagger
 * components:
 *   schemas:
 *     Account:
 *       type: object
 *       required:
 *         - accountNumber
 *         - accountType
 *         - balance
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-généré du compte
 *         accountNumber:
 *           type: string
 *           description: Numéro du compte
 *         accountType:
 *           type: string
 *           enum: [Savings, Checking, Business]
 *           description: Type du compte
 *         balance:
 *           type: number
 *           format: float
 *           description: Solde du compte
 *         accountStatus:
 *           type: string
 *           enum: [Active, Suspended, Closed]
 *           description: Statut du compte
 */

/**
 * @swagger
 * /createAccount:
 *   post:
 *     summary: Crée un nouveau compte
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Account'
 *     responses:
 *       201:
 *         description: Compte créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       400:
 *         description: Erreur dans les données envoyées
 */
router.post('/createAccount', async (req, res) => {
  try {
    const account = await Account.create(req.body);
    res.status(201).json(account);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /fetchAllAccounts:
 *   get:
 *     summary: Récupère tous les comptes
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: Liste de tous les comptes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Account'
 *       500:
 *         description: Erreur serveur
 */
router.get('/fetchAllAccounts', async (req, res) => {
  try {
    const accounts = await Account.findAll();
    res.status(200).json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /updateAccount{id}:
 *   put:
 *     summary: Met à jour un compte
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du compte à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Account'
 *     responses:
 *       200:
 *         description: Compte mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       400:
 *         description: Erreur dans les données envoyées
 */
router.put('/updateAccount:id', async (req, res) => {
  try {
    const updated = await Account.update(req.body, { where: { id: req.params.id } });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /deleteAccount{id}:
 *   delete:
 *     summary: Supprime un compte
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du compte à supprimer
 *     responses:
 *       204:
 *         description: Compte supprimé avec succès
 *       500:
 *         description: Erreur serveur
 */
router.delete('/deleteAccount:id', async (req, res) => {
  try {
    await Account.destroy({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
