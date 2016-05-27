
var models = require('../models');
var Sequelize = require('sequelize');

//Los comentarios se renderizan y se muestran al pedir el quiz, salvo ahora para aceptar

// Autoload el comentario asociado a :commentId
exports.load = function(req, res, next, commentId) {
  models.Comment.findById(commentId)
      .then(function(comment) {
          if (comment) {
            req.comment = comment;
            next();
          } else { 
            next(new Error('No existe commentId=' + commentId));
          }
        })
        .catch(function(error) { next(error); });
};


// GET /quizzes/:quizId/comments/new manda la página pa crear el comentario
exports.new = function(req, res, next) {
  var comment = models.Comment.build({text: ""});

  res.render('comments/new', { comment: comment, 
  	                           quiz: req.quiz //le dice de que quiz es el comentario
  	                         });
};


// POST /quizes/:quizId/comments mete el comentario en la db de comentarios
exports.create = function(req, res, next) {
  var comment = models.Comment.build(
      { text:   req.body.comment.text, //mete el text de comment pasado en el body en el text del modelo de comment      
        QuizId: req.quiz.id //Asocia el quiz metiendo en el campo quizId de la tabla de comments creado por belongsTo el id del quiz
      });

  comment.save()
    .then(function(comment) {
      req.flash('success', 'Comentario creado con éxito.');
      res.redirect('/quizzes/' + req.quiz.id);
    }) 
	  .catch(Sequelize.ValidationError, function(error) {

      req.flash('error', 'Errores en el formulario:'); //pide rehacer todo
      for (var i in error.errors) {
          req.flash('error', error.errors[i].value); //Muestra todos los errores
      };

      res.render('comments/new', { comment: comment, //reranderiza la página con los campos pasados
      	                           quiz:    req.quiz});
    })
    .catch(function(error) {
      req.flash('error', 'Error al crear un Comentario: '+error.message);
		  next(error);
	  });    
};

// GET /quizzes/:quizId/comments/:commentId/accept
exports.accept = function(req, res, next) {

  req.comment.accepted = true;

  req.comment.save(["accepted"])
    .then(function(comment) {
      req.flash('success', 'Comentario aceptado con éxito.');
      res.redirect('/quizzes/'+req.params.quizId);
    })
    .catch(function(error) {
       req.flash('error', 'Error al aceptar un Comentario: '+error.message);
       next(error);
    });
  };
