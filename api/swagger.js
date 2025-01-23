const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bank API Documentation',
      version: '1.0.0',
      description: 'API pour la gestion des clients, comptes, cartes, transactions et actions.',
    },
    servers: [
      {
        url: 'http://localhost:3000', // URL de base de votre API
      },
    ],
  },
  apis: ['./routes/*.js'], // Chemin vers les fichiers contenant les commentaires Swagger
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);

module.exports = { swaggerUi, swaggerSpecs };
