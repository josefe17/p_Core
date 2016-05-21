'use strict';

var crypto = require('crypto');


function encryptPassword(password, salt) {
    return crypto.createHmac('sha1', salt).update(password).digest('hex');
};

function randomizer(){ 
    return Math.round((new Date().valueOf() * Math.random())) + '';

};


module.exports = {
  up: function (queryInterface, Sequelize) {
          var random = randomizer();
      return queryInterface.bulkInsert('Users', [ 
         { username: 'admin',            
           password: encryptPassword('admin', random),
           salt:     random,
           isAdmin: true,
           createdAt: new Date(), updatedAt: new Date() }         
        ]);
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.bulkDelete('Users', null, {});
  }
};
