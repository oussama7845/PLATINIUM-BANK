module.exports = (sequelize, DataTypes) => {
    const Action = sequelize.define("Action", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      actionDescription: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      actionName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    
    });
  
    Action.associate = (models) => {
        Action.belongsTo(models.Customer, {
        foreignKey: "CustomerId",
        onDelete: "CASCADE",
      });
    };
  
    return Action;
  };
  