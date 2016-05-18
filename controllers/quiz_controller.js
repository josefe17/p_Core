
var models = require('../models');

// Autoload el quiz asociado a :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.findById(quizId)
  		.then(function(quiz) {
      		if (quiz) {
        		req.quiz = quiz;
        		next();
      		} else { 
      			next(new Error('No existe quizId=' + quizId));
      		}
        })
        .catch(function(error) { next(error); });
};


// GET /quizzes
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

// GET /quizzes/new
exports.new = function(req, res, next){
	var quiz = models.Quiz.build({question: "", answer: ""});
	res.render('quizzes/new', {quiz: quiz}); //quiz.question y quiz.answer van vacíos
};

//POST /quizzes/create
exports.create = function (req, res, next){
	var quiz = models.Quiz.build({ question: req.body.quiz.question, answer: req.body.quiz.answer} ); //Req.body.quiz pq es body (parser)
	quiz.save({fields: ["question", "answer"]})
	.then(function(quiz){
		req.flash('success', 'Quiz '+ quiz.question +' creado  con éxito.');
		res.redirect('/quizzes')}) //redirigimos a la lista quizzes
	.catch(function(error){
		req.flash('error', "Error al crear un Quiz: " + error.message);
		next(error)});  
};


// GET /quizzes/:id
exports.show = function(req, res, next) {

	var answer = req.query.answer || '';

	res.render('quizzes/show', {quiz: req.quiz,
								answer: answer});
};


// GET /quizzes/:id/check
exports.check = function(req, res, next) {

	var answer = req.query.answer || "";

	var result = answer === req.quiz.answer ? 'Correcta' : 'Incorrecta';

	res.render('quizzes/result', { quiz: req.quiz, 
								   result: result, 
								   answer: answer,
								   id:req.quiz.id});
};
