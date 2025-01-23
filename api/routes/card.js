const express = require('express');
const router = express.Router();
const { Card, Customer, Account } = require('../models');

/**
 * Génère un numéro de carte unique.
 * Format : 16 chiffres (exemple : 1234 5678 9012 3456)
 */
const generateCardNumber = () => {
  return Array.from({ length: 4 }, () => Math.floor(1000 + Math.random() * 9000)).join('');
};

/**
 * Génère un code de sécurité (CVV).
 * Format : 3 chiffres (exemple : 123)
 */
const generateSecurityCode = () => {
  return Math.floor(100 + Math.random() * 900).toString();
};

/**
 * Calcule la date d'expiration de la carte.
 * Par défaut : 3 ans après la date actuelle.
 */
const calculateExpirationDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 3);
  return date;
};

/**
 * @swagger
 * /createCard:
 *   post:
 *     summary: Crée une nouvelle carte (données générées par la banque)
 *     tags: [Cards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountId:
 *                 type: integer
 *                 description: ID du compte associé
 *               cardType:
 *                 type: string
 *                 enum: [Debit, Credit, Prepaid]
 *                 description: "Type de la carte (par défaut: Debit)"
 *     responses:
 *       201:
 *         description: "Carte créée avec succès"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Card'
 *       400:
 *         description: "Erreur dans les données envoyées"
 *       500:
 *         description: "Erreur serveur"
 */
router.post('/createCard', async (req, res) => {
  const { accountId, cardType = 'Debit' } = req.body;

  try {
    // Générer les données de la carte
    const cardNumber = generateCardNumber();
    const securityCode = generateSecurityCode();
    const expirationDate = calculateExpirationDate();

    // Créer la carte
    const card = await Card.create({
      cardNumber,
      cardType,
      expirationDate,
      securityCode,
      cardStatus: 'Active', // Par défaut
      onlinePaymentLimit: 1000.00, // Plafond par défaut
      onlinePaymentsEnabled: true, // Activé par défaut
      accountId,
    });

    res.status(201).json(card);
  } catch (err) {
    console.error('Erreur lors de la création de la carte:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la création de la carte.' });
  }
});




/**
 * @swagger
 * /fetchAllCards:
 *   get:
 *     summary: Récupère toutes les cartes
 *     tags: [Cards]
 *     responses:
 *       200:
 *         description: Liste de toutes les cartes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Card'
 *       500:
 *         description: Erreur serveur
 */
router.get('/fetchAllCards', async (req, res) => {
  try {
    const cards = await Card.findAll();
    res.status(200).json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /deleteCard/{id}:
 *   delete:
 *     summary: Supprime une carte
 *     tags: [Cards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la carte à supprimer
 *     responses:
 *       204:
 *         description: Carte supprimée avec succès
 *       500:
 *         description: Erreur serveur
 */
router.delete('/deleteCard/:id', async (req, res) => {
  try {
    await Card.destroy({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /blockCard:
 *   put:
 *     summary: Bloque ou débloque une carte
 *     tags: [Cards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cardId:
 *                 type: integer
 *               action:
 *                 type: string
 *                 enum: [block, unblock]
 *                 description: Action à effectuer (blocker ou débloquer)
 *     responses:
 *       200:
 *         description: Carte mise à jour avec succès
 *       404:
 *         description: Carte introuvable
 */
router.put('/blockCard', async (req, res) => {
  const { cardId, action } = req.body;

  try {
    const card = await Card.findOne({ where: { id: cardId } });
    if (!card) {
      return res.status(404).json({ error: 'Carte introuvable' });
    }

    if (action === 'block') {
      card.cardStatus = 'Blocked';
      card.onlinePaymentsEnabled = false;
    } else if (action === 'unblock') {
      card.cardStatus = 'Active';
      card.onlinePaymentsEnabled = true;
    } else {
      return res.status(400).json({ error: 'Action invalide. Utilisez "block" ou "unblock".' });
    }

    await card.save();
    res.status(200).json({ message: 'Statut de la carte mis à jour avec succès.', card });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * @swagger
 * /onlinePayment:
 *   post:
 *     summary: Effectue un paiement en ligne
 *     tags: [Cards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
*                 firstname:
*                   type: string
*                 lastname:
*                   type: string
*                 cardNumber:
*                   type: string
*                 expirationDate:
*                   type: string
*                   format: date
*                 securityCode:
*                   type: string
*                 amount:
*                   type: number
*                   description: Montant du paiement
 *     responses:
 *       200:
 *         description: Paiement effectué avec succès
 *       400:
 *         description: Erreur liée au paiement (plafond dépassé, carte inactive, etc.)
 *       404:
 *         description: Carte introuvable
 */
router.post('/onlinePayment', async (req, res) => {
  const { firstname, lastname, cardNumber, expirationDate, securityCode, amount } = req.body;

  try {

    const customer = await Customer.findOne({ where: { firstname, lastname } });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const account = await Account.findOne({ where: { CustomerId: customer.id } });
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const card = await Card.findOne({ where: { cardNumber, expirationDate, securityCode } });
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    if (card.cardStatus !== 'Active') {
      return res.status(400).json({ error: 'Card is not active' });
    }

    if (!card.onlinePaymentsEnabled) {
      return res.status(400).json({ error: 'Online payments are disabled for this card' });
    }

    if (amount > card.onlinePaymentLimit) {
      return res.status(400).json({ error: 'Amount exceeds online payment limit' });
    }

    // Initiate a secure payment transaction using a payment gateway or service

    // Update account balance within a database transaction (assuming a transaction library)
    await database.transaction(async () => {
      account.balance -= amount;
      await account.save();
    });

    res.status(200).json({ message: 'Payment successful', amount });
  } catch (err) {
    console.error(err); // Log the error for debugging
    if (err instanceof DatabaseError) {
      res.status(500).json({ error: 'Database error occurred' });
    } else {
      res.status(500).json({ error: 'An error occurred during payment processing' });
    }
  }
});

/**
 * @swagger
 * /updatePaymentLimit:
 *   put:
 *     summary: Met à jour le plafond de paiement en ligne
 *     tags: [Cards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cardId:
 *                 type: integer
 *               newLimit:
 *                 type: number
 *                 description: Nouveau plafond de paiement
 *     responses:
 *       200:
 *         description: Plafond mis à jour avec succès
 *       404:
 *         description: Carte introuvable
 */
router.put('/updatePaymentLimit', async (req, res) => {
  const { cardId, newLimit } = req.body;

  if (newLimit <= 0) {
    return res.status(400).json({ error: 'Le plafond de paiement doit être supérieur à 0.' });
  }

  try {
    const card = await Card.findOne({ where: { id: cardId } });
    if (!card) {
      return res.status(404).json({ error: 'Carte introuvable' });
    }

    card.onlinePaymentLimit = newLimit;
    await card.save();
    res.status(200).json({ message: 'Plafond de paiement en ligne mis à jour avec succès.', card });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
