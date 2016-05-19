
var models = require('../models');
var Sequelize = require('sequelize');

// Autoload el quiz asociado a :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.findById(quizId)
  		.then(function(quiz) {
      		if (quiz) {
        		req.quiz = quiz; //Lo mete en req.quiz
        		next();
      		} else { 
      			next(new Error('No existe quizId=' + quizId));
      		}
        })
        .catch(function(error) { next(error); });
};


// GET /quizzes Carga lista quizzes
exports.index = function(req, res, next) {
	if(req.query.search){
		models.Quiz.findAll({where: {question: {$like: "%"+req.query.search+"%"}}})
			.then(function(quizzes) {
				res.render('quizzes/index.ejs', { quizzes: quizzes});
			})
			.catch(function(error) {
				next(error);
			});

	}
	else{
	models.Quiz.findAll()
		.then(function(quizzes) {
			res.render('quizzes/index.ejs', { quizzes: quizzes});
		})
		.catch(function(error) {
			next(error);
		});
	}

};

// GET /quizzes/new crea un quiz nuevo -> pide pagina para meter datos
exports.new = function(req, res, next){
	var quiz = models.Quiz.build({question: "", answer: ""});
	res.render('quizzes/new', {quiz: quiz}); //quiz.question y quiz.answer van vacíos
};

// POST /quizzes/create  guarda los datos en la db
exports.create = function(req, res, next) {
  var quiz = models.Quiz.build({ question: req.body.quiz.question, 
  	                             answer:   req.body.quiz.answer} );

  // guarda en DB los campos pregunta y respuesta de quiz
  quiz.save({fields: ["question", "answer"]})
  	.then(function(quiz) {
  		console.log(">>>>>>>>>>>>>>>>>>>>>>>AQUI");
		req.flash('success', 'Quiz creado con éxito.');
		console.log(">>>>>>>>>>>>>>>>>>>>>>>AQUI2");
    	res.redirect('/quizzes');  // res.redirect: Redirección HTTP a lista de preguntas
    	console.log(">>>>>>>>>>>>>>>>>>>>>>>AQUI3");
    })
    
    .catch(Sequelize.ValidationError, function(error) {

      req.flash('error', 'Errores en el formulario:');
      for (var i in error.errors) {
          req.flash('error', error.errors[i].value);
      };
      res.render('quizzes/new', {quiz: quiz}); 
      })
    .catch(function(error) {
		req.flash('error', 'Error al crear un Quiz: '+ error.message);
		next(error);
	});  
};

// DELETE /quizzes/:id borra quiz

exports.destroy =function(req, res, next){
	req.quiz.destroy()
	 .then(function(quiz){
		req.flash('success', 'Quiz borrado correctamente');
		res.redirect("/quizzes"); // Redirección a la lista de preguntas
	})	
    .catch(function(error) {
		req.flash('error', 'Error al borrar el quiz: ' + error.message);
		next(error);
	});  
}

// GET /quizzes/:id muestra quiz
exports.show = function(req, res, next) {

	var answer = req.query.answer || '';

	res.render('quizzes/show', {quiz: req.quiz,
								answer: answer});
};

// GET /quizzes/:id/edit muesta edición de quiz
exports.edit=function(req, res, next){
	var quiz = req.quiz;
	res.render('quizzes/edit', {quiz: quiz});
}

//PUT /quizzes/:id  guarda quiz editado

exports.update =function(req, res, next){
	req.quiz.question = req.body.quiz.question;
	req.quiz.answer   = req.body.quiz.answer;

	req.quiz.save({fields: ["question", "answer"]})
	.then(function(quiz){
		req.flash('success', 'Quiz editado correctamente');
		res.redirect("/quizzes"); // Redirección a la lista de preguntas
	})
	.catch(Sequelize.ValidationError, function(error) {

      req.flash('error', 'Errores en el formulario:');
      for (var i in error.errors) {
          req.flash('error', error.errors[i].value);
      };
      res.render('quizzes/edit', {quiz: quiz}); 
      })
    .catch(function(error) {
		req.flash('error', 'Errores al editar un quiz');
		next(error);
	});  
}


// GET /quizzes/:id/check comprueba respuesta quiz
exports.check = function(req, res, next) {

	var answer = req.query.answer || "";

	var result = answer === req.quiz.answer ? 'Correcta' : 'Incorrecta';

	res.render('quizzes/result', { quiz: req.quiz, 
								   result: result, 
								   answer: answer,
								   id:req.quiz.id});
};
