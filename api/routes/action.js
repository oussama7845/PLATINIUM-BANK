const express = require('express');
const router = express.Router();
const { Action } = require('../models/Actions');

/**
 * @swagger
 * components:
 *   schemas:
 *     Action:
 *       type: object
 *       required:
 *         - actionName
 *         - actionDescription
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-généré de l'action
 *         actionName:
 *           type: string
 *           description: Nom de l'action
 *         actionDescription:
 *           type: string
 *           description: Description de l'action
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de mise à jour
 */

/**
 * @swagger
 * /createAction:
 *   post:
 *     summary: Crée une nouvelle action
 *     tags: [Actions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Action'
 *     responses:
 *       201:
 *         description: Action créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Action'
 *       400:
 *         description: Erreur dans les données envoyées
 */
router.post('/createAction', async (req, res) => {
  try {
    const action = await Action.create(req.body);
    res.status(201).json(action);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /fetchAllAction:
 *   get:
 *     summary: Récupère toutes les actions
 *     tags: [Actions]
 *     responses:
 *       200:
 *         description: Liste de toutes les actions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Action'
 *       500:
 *         description: Erreur serveur
 */
router.get('/fetchAllAction', async (req, res) => {
  try {
    const actions = await Action.findAll();
    res.status(200).json(actions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
