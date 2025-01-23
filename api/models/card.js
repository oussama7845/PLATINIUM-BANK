module.exports = (sequelize, DataTypes) => {
  const Card = sequelize.define("Card", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cardNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    cardType: {
      type: DataTypes.ENUM("Debit", "Credit", "Prepaid"),
      allowNull: false,
    },
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    securityCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cardStatus: {
      type: DataTypes.ENUM("Active", "Blocked", "Expired"),
      defaultValue: "Active",
    },
    onlinePaymentLimit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 1000.00, // Plafond par défaut
    },
    onlinePaymentsEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // Paiements en ligne activés par défaut
    },
  });

  Card.associate = (models) => {
    Card.belongsTo(models.Account, {
      foreignKey: "accountId",
      onDelete: "CASCADE",
    });
  };

  return Card;
};
