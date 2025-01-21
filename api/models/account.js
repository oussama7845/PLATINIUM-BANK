module.exports = (sequelize, DataTypes) => {
    const Account = sequelize.define("Account", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      accountNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      accountType: {
        type: DataTypes.ENUM("Savings", "Checking", "Business"),
        allowNull: false,
      },
      balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
      },
      accountStatus: {
        type: DataTypes.ENUM("Active", "Suspended", "Closed"),
        defaultValue: "Active",
      },
    });
  
    Account.associate = (models) => {
      Account.hasMany(models.Card, {
        foreignKey: "accountId",
        onDelete: "CASCADE",
      });
  
      Account.hasMany(models.Transaction, {
        foreignKey: "accountId",
        onDelete: "CASCADE",
      });
  
      Account.belongsTo(models.User, {
        foreignKey: "userId",
        onDelete: "CASCADE",
      });
    };
  
    return Account;
  };
  