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
    });
  
    Card.associate = (models) => {
      Card.belongsTo(models.Account, {
        foreignKey: "accountId",
        onDelete: "CASCADE",
      });
    };
  
    return Card;
  };
  