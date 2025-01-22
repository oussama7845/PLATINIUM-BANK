const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Customer } = require('../models');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config.json')[process.env.NODE_ENV || 'development'];
require('dotenv').config();

// Générateurs
const generateIdCustomer = () => uuidv4();
const generatePassword = () => Math.random().toString(36).slice(-8);
const generateCodePin = () => Math.floor(1000 + Math.random() * 9000);

// Middleware de validation d'email
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Récupérer tous les clients
router.get('/fetchAllCustomers', async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.status(200).json(customers);
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des clients.' });
  }
});

// Créer un nouveau client
router.post('/createCustomer', async (req, res) => {
  const { firstname, lastname, email, phoneNumber } = req.body;

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

    // Création du client
    const newCustomer = await Customer.create({
      firstname,
      lastname,
      email,
      phoneNumber,
      idCostumer: generateIdCustomer(),
      password: generatePassword(),
      codePin: generateCodePin(),
      accountStatus: 'Active',
    });

    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création du client.' });
  }
});

// Authentification
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Recherche de l'utilisateur
    const customer = await Customer.findOne({ where: { email } });
    if (!customer) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(403).json({ error: 'Mot de passe incorrect' });
    }

    // Génération du token JWT
    const token = jwt.sign(
      {
        id: customer.id,
        email: customer.email,
        firstname: customer.firstname,
        lastname: customer.lastname,
      },
      config.privateKey,
      { expiresIn: '1y' }
    );
    // Réponse avec cookie et données utilisateur
    res.status(200).json({
      id: customer.id,
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

module.exports = router;
