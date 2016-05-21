
var crypto = require('crypto');

// Definicion de la clase User:

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('User',
      { username: {
            type: DataTypes.STRING,
            unique: true,
            validate: { notEmpty: { msg: "Falta username" }}
        },
        password: {
            type: DataTypes.STRING,
            validate: { notEmpty: {msg: "Falta password"}},
            set: function (password) {
                    // String aleatorio usado como salt.
                    this.salt = randomizer(); //Lo guarda "en salazón"
                    this.setDataValue('password', encryptPassword(password, this.salt)); //Mete en el campo password el encriptado
                    console.log("Aleatorio: "+ this.salt);
                    console.log("Cifrada: " + this.password);
                }
        },
        salt: {
            type: DataTypes.STRING
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
      });
};


/*
 * Encripta un password en claro.
 * Mezcla un password en claro con el salt proporcionado, ejecuta un SHA1 digest, 
 * y devuelve 40 caracteres hexadecimales.
 */
function encryptPassword(password, salt) {
    return crypto.createHmac('sha1', salt).update(password).digest('hex');
};

function randomizer(){ 
    return Math.round((new Date().valueOf() * Math.random())) + '';

};
