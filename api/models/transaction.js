module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define("Transaction", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      transactionType: {
        type: DataTypes.ENUM("Deposit", "Withdrawal", "Transfer"),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      transactionDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.ENUM("Pending", "Completed", "Failed"),
        defaultValue: "Pending",
      },
    });
  
    Transaction.associate = (models) => {
      Transaction.belongsTo(models.Account, {
        foreignKey: "accountIdDebit",
        onDelete: "CASCADE",
      });
      Transaction.belongsTo(models.Account, {
        foreignKey: "accountIdCredit",
        onDelete: "CASCADE",
      });
    };
  
    return Transaction;
  };
  