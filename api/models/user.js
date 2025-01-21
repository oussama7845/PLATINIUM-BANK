module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
      role: {
        type: DataTypes.ENUM("Client", "Manager", "Admin"),
        defaultValue: "Client",
      },
      accountStatus: {
        type: DataTypes.ENUM("Active", "Suspended", "Deactivated"),
        defaultValue: "Active",
      },
    });
  
    User.associate = (models) => {
      // Uniquement si le rôle est Client
      User.hasOne(models.Account, {
        foreignKey: "userId",
        onDelete: "CASCADE",
        constraints: false, // Supprime les contraintes pour les rôles sans compte
      });
    };
  
    return User;
  };
  