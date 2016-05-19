'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

      return queryInterface.bulkInsert( 'Quizzes', [
            { question: "Capital de España", answer: "Madrid",
              createdAt: new Date(), updatedAt: new Date() },
            { question: "Capital de Italia", answer: "Roma",
              createdAt: new Date(), updatedAt: new Date() },
            { question: "Capital de Bélgica", answer: "Bruselas",
              createdAt: new Date(), updatedAt: new Date() },
            { question: "Capital de China", answer: "Pekín",
              createdAt: new Date(), updatedAt: new Date() },  
        ]);

  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.bulkDelete('Quizzes', null, {});
    
  }
};
