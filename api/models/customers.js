module.exports = (sequelize, DataTypes) => {
    const Customer = sequelize.define("Customer", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      codepin:{
        type:DataTypes.INTEGER,
        allowNull:false,
      },
      idCostumer:{
        type:DataTypes.INTEGER,
        allowNull:false,
      },
      firstname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      accountStatus: {
        type: DataTypes.ENUM("Active", "Suspended", "Deactivated"),
        defaultValue: "Active",
      },
    });
  
    Customer.associate = (models) => {

      Customer.hasOne(models.Account, {
        foreignKey: "CustomerId",
        onDelete: "CASCADE",
        constraints: false, 
      });
    };
  
    return Customer;
  };
  