const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Configuration de Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "Documentation pour l'API de gestion des clients",
    },
    servers: [
      {
        url: "http://localhost:3000", // Remplacez par l'URL de votre API
      },
    ],
  },
  apis: ["./routes/*.js"], // Chemin vers vos fichiers de routes
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);

module.exports = { swaggerUi, swaggerSpecs };
