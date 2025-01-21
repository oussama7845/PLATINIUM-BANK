'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');


const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];


const sequelize = new Sequelize(config.database, config.username, config.password, {
  ...config,
  logging: console.log,
});


const db = {};


(async () => {
  try {
    console.log('🔄 Tentative de connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données :', error.message);
    console.error('📋 Détails de l\'erreur :', error);
    process.exit(1);
  }
})();


fs.readdirSync(__dirname)
  .filter((file) => file.endsWith('.js') && file !== 'index.js')
  .forEach((file) => {
    console.log(`📦 Chargement du modèle : ${file}`);
    try {
      const model = require(path.join(__dirname, file))(sequelize, DataTypes);
      db[model.name] = model;
    } catch (error) {
      console.error(`❌ Échec du chargement du modèle ${file} :`, error);
    }
  });


Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    console.log(`🔗 Initialisation des associations pour : ${modelName}`);
    try {
      db[modelName].associate(db);
    } catch (error) {
      console.error(`❌ Échec de l'initialisation des associations pour ${modelName} :`, error);
    }
  }
});


(async () => {
  try {
    console.log('🔄 Synchronisation de la base de données...');
    await sequelize.sync();
    console.log('✅ Synchronisation terminée, tables créées.');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation de la base de données :', error);
  }
})();


db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
