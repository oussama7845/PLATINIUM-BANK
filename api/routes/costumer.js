const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Customer, Account, Card } = require('../models');
const { v4: uuidv4 } = require('uuid');
const ejs = require('ejs');
const nodemailer = require('nodemailer');
let path = require("path");
let env = process.env.NODE_ENV || "development";
let config = require(path.join(__dirname, "..", "config", "config.json"))[env];
// Générateurs
const generateIdCustomer = () => uuidv4();
const generateAccountNumber = () => uuidv4();
const generatePassword = () => Math.random().toString(36).slice(-8);
const generateCodePin = () => Math.floor(1000 + Math.random() * 9000);
// Configuration du transporteur SMTP pour envoyer des emails

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: "platiniumbanque@gmail.com",
    pass: 'gxua kcrq zlse wmnc',
  }

});
const generateCardNumber = () => {
  return Array.from({ length: 4 }, () => Math.floor(1000 + Math.random() * 9000)).join('');
};
const generateSecurityCode = () => {
  return Math.floor(100 + Math.random() * 900).toString();
};
const generateExpirationDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 3);
  return date;
};
// Middleware de validation d'email
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       required:
 *         - firstname
 *         - lastname
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-généré du client
 *         firstname:
 *           type: string
 *           description: Prénom du client
 *         lastname:
 *           type: string
 *           description: Nom du client
 *         email:
 *           type: string
 *           description: Adresse email du client
 *         phoneNumber:
 *           type: string
 *           description: Numéro de téléphone
 *         idCostumer:
 *           type: string
 *           description: UUID unique pour le client
 *         codePin:
 *           type: integer
 *           description: Code PIN du client
 *         accountStatus:
 *           type: string
 *           enum: [Active, Suspended, Deactivated]
 *           description: Statut du compte
 */

/**
 * @swagger
 * /fetchAllCustomers:
 *   get:
 *     summary: Récupère tous les clients
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: Liste de tous les clients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 *       500:
 *         description: Erreur serveur
 */
router.get('/fetchAllCustomers', async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.status(200).json(customers);
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des clients.' });
  }
});


/**
 * @swagger
 * /createCustomer:
 *   post:
 *     summary: Crée un nouveau client, un compte et une carte
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *               balance:
 *                 type: number
 *               cardType:
 *                  type: string
 *             required:
 *               - firstname
 *               - lastname
 *               - email
 *     responses:
 *       201:
 *         description: Client, compte et carte créés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customer:
 *                   $ref: '#/components/schemas/Customer'
 *                 account:
 *                   $ref: '#/components/schemas/Account'
 *                 card:
 *                   $ref: '#/components/schemas/Card'
 *       400:
 *         description: Données invalides
 *       409:
 *         description: Email déjà utilisé
 *       500:
 *         description: Erreur serveur
 */
router.post('/createCustomer', async (req, res) => {
  const { firstname, lastname, email, phoneNumber, balance,cardType } = req.body;

  // Validation de l'email
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Format d\'email invalide' });
  }

  try {
    // Vérifier si l'email existe déjà
    const existingCustomer = await Customer.findOne({ where: { email } });
    if (existingCustomer) {
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }
    const pass = generatePassword();
    console.log(pass)


    // Création du client
    const newCustomer = await Customer.create({
      firstname,
      lastname,
      email,
      phoneNumber,
      idCostumer: generateIdCustomer(),
      password: pass,
      codePin: generateCodePin(),
      accountStatus: 'Active',
    });

    // Création du compte
    const newAccount = await Account.create({
      CustomerId: newCustomer.id,
      accountNumber: generateAccountNumber(),
      accountType: "Savings",
      balance: balance || 0,
    });

    // Génération des informations de la carte
    const cardNumber = generateCardNumber();
    const expirationDate = generateExpirationDate();
    const securityCode = generateSecurityCode();

    // Création de la carte
    const newCard = await Card.create({
      accountId: newAccount.id,
      cardNumber,
      expirationDate,
      securityCode,
      cardType,

    });

    // Envoi de l'email de bienvenue
    const templatePath = path.join(__dirname, '../modules/mail_Templates', 'newCostumer.ejs');
    const mailOptions = {
      from: "platiniumbanque@gmail.com",
      to: newCustomer.email,
      subject: 'Bienvenue à Platinium Banque',
      html: await ejs.renderFile(templatePath, {
        firstname: newCustomer.firstname,
        lastname: newCustomer.lastname,
        codePin: newCustomer.codePin,
        password: pass,
        idCostumer: newCustomer.idCostumer,

      })
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ customer: newCustomer, account: newAccount, card: newCard });
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création du client.' });
  }
});


/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authentifie un client
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idCostumer:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentification réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 idCostumer:
 *                   type: string
 *                 email:
 *                   type: string
 *                 firstname:
 *                   type: string
 *                 lastname:
 *                   type: string
 *                 token:
 *                   type: string
 *       403:
 *         description: Mot de passe incorrect
 *       404:
 *         description: Utilisateur introuvable
 *       500:
 *         description: Erreur serveur
 */
router.post('/login', async (req, res) => {
  const { idCostumer, password } = req.body;

  try {
    const customer = await Customer.findOne({ where: { idCostumer } });
    if (!customer) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(403).json({ error: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      {
        id: customer.id,
        idCostumer: customer.idCostumer,
        email: customer.email,
        firstname: customer.firstname,
        lastname: customer.lastname,
      },
      config.privateKey,
      { expiresIn: '1y' }
    );

    res.status(200).json({
      id: customer.id,
      idCostumer: customer.idCostumer,
      email: customer.email,
      firstname: customer.firstname,
      lastname: customer.lastname,
      token,
    });
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error);
    res.status(500).json({ error: 'Erreur serveur lors de l\'authentification.' });
  }
});


/**
 * @swagger
 * /changePassword:
 *   post:
 *     summary: Permet à un client de changer son mot de passe
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idCostumer:
 *                 type: string
 *                 description: Identifiant unique du client
 *               oldPassword:
 *                 type: string
 *                 description: Ancien mot de passe
 *               newPassword:
 *                 type: string
 *                 description: Nouveau mot de passe
 *     responses:
 *       200:
 *         description: Mot de passe changé avec succès
 *       400:
 *         description: Ancien mot de passe incorrect ou autre erreur
 *       404:
 *         description: Client introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/changePassword', async (req, res) => {
  const { idCostumer, oldPassword, newPassword } = req.body;

  try {
    // Vérification si le client existe
    const customer = await Customer.findOne({ where: { idCostumer } });
    if (!customer) {
      return res.status(404).json({ error: 'Client introuvable' });
    }

    // Vérification de l'ancien mot de passe
    const isMatch = await bcrypt.compare(oldPassword, customer.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Ancien mot de passe incorrect' });
    }

    // Mise à jour du mot de passe
    await Customer.update(
      { password: newPassword },
      { where: { idCostumer } }
    );

    res.status(200).json({ message: 'Mot de passe changé avec succès' });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;



