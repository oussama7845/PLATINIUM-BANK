const bcrypt = require('bcryptjs');
const saltRounds = 10;

module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define("Customer", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    codePin: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idCostumer: {
      type: DataTypes.STRING,
      allowNull: false,
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
  }, {
    hooks: {
      beforeCreate: async (customer) => {
        await formatCustomerData(customer, true);
      },
      beforeUpdate: async (customer) => {
        await formatCustomerData(customer);
      },
    },
  });

  return Customer;
};

// Utility functions
async function formatCustomerData(customer, isBeforeCreate = false) {
  const fieldsToFormat = [
    { column: "email", format: "toLowerCase" },
    { column: "firstname", format: "toTitleCase" },
    { column: "lastname", format: "toTitleCase" },
    { column: "password", format: "hashPassword" },
  ];

  for (const { column, format } of fieldsToFormat) {
    if (customer[column] && (isBeforeCreate || customer.changed(column))) {
      if (format === "toLowerCase") {
        customer[column] = customer[column].toLowerCase();
      } else if (format === "toTitleCase") {
        customer[column] = titleCase(customer[column]);
      } else if (format === "hashPassword") {
        customer[column] = await bcrypt.hash(customer[column], saltRounds);
      }
    }
  }
}

function titleCase(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
