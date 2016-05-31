
var models = require('../models');
var Sequelize = require('sequelize');
var cloudinary = require('cloudinary');
var fs = require('fs');

//opciones de imágenes
var cloudinary_image_options = { crop: 'limit', width: 200, height: 200, radius: 5, border: "3px_solid_blue", tags: ["hola", "adios"]}; //Faltan tags


// Autoload el quiz asociado a :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.findById(quizId, { include: [{model: models.Comment, include: [ 
                                      {model: models.User, as: 'Author', attributes: ['username']}]}, 
                                        models.Attachment, 
                                      {model: models.User, as: 'Author', attributes: ['username']} ] }) //Carga también los comentarios en req.quiz.Comments
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

//Allows to edit a quiz or comment
exports.ownershipRequired = function(req, res, next){

	var isAdmin = req.session.user.isAdmin; //Cargado en el autoload del mw previo
	var quizAuthorId = req.quiz.AuthorId;
	var loggedUserId = req.session.user.id; 

	if (isAdmin || quizAuthorId === loggedUserId) next(); //Todo ok
	else {
		console.log("Operación prohibida: el usuario logeado no es administrador ni el autor del quiz");
		res.send(403);
	}
}


// GET /quizzes Carga lista quizzes
exports.index = function(req, res, next) {
	if(req.query.search){
			models.Quiz.findAll({where: {question: {$like: "%"+req.query.search+"%"}},  include: [models.Attachment, {model: models.User, as: 'Author', attributes: ['Username']}]}) //Puede fallar  la closure del include
			.then(function(quizzes) {
				res.render('quizzes/index.ejs', { quizzes: quizzes});
			})
			.catch(function(error) {
				next(error);
			});

	}
	else{
	//console.log(">>>>>>>>>>>>>>>>>>>>>>>>>> Punto A");
	models.Quiz.findAll({ include: [models.Attachment, {model: models.User, as: 'Author', attributes: ['Username']}]})
		.then(function(quizzes) {
			if (req.params.format==="json"){ 
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify(quizzes));
			}			
			else{
				//console.log(">>>>>>>>>>>>>>>>>>>>>>>>>> Punto B");
				res.render('quizzes/index.ejs', { quizzes: quizzes});
			}
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

  var authorId = req.session.user && req.session.user.id || 0;

  var quiz = models.Quiz.build({ question: req.body.quiz.question, 
  	                             answer:   req.body.quiz.answer,
  	                         	   AuthorId: authorId });

  // guarda en DB los campos pregunta y respuesta de quiz
  quiz.save({fields: ["question", "answer", "AuthorId"]})
  	.then(function(quiz) {
  		//console.log(">>>>>>>>>>>>>>>>>>>>>>>AQUI");
		req.flash('success', 'Quiz creado con éxito.');

		if (!req.file){
			req.flash('info', 'Quiz sin imagen');
			return;
		}
		
		return uploadResourceToCloudinary(req) //Sube fichero
			.then(function(uploadResult){
				return createAttachment(req, uploadResult, quiz);
			});
	})
     .then(function(){
    	res.redirect('/quizzes');  // res.redirect: Redirección HTTP a lista de preguntas
    	
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

	if (req.quiz.Attachment){
		cloudinary.api.delete_resources(req.quiz.Attachment.public_id);
	}

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
	if (req.params.format==="json"){ 
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(req.quiz));
	}
	else res.render('quizzes/show', {quiz: req.quiz, answer: answer}); 
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
		
		console.log(">>>>>>>>>>>>>>>>>>>>>>>AQUI punto 0");

		if (!req.file){
			req.flash('info', 'Quiz sin imagen');
			if (quiz.Attachment){
				cloudinary.api.delete_resources(quiz.Attachment.public_id);
				console.log(">>>>>>>>>>>>>>>>>>>>>>>AQUI punto A");
				return quiz.Attachment.destroy();
			}
			console.log(">>>>>>>>>>>>>>>>>>>>>>>AQUI punto B");
			return;
		}
		console.log(">>>>>>>>>>>>>>>>>>>>>>>AQUI punto C");
		return uploadResourceToCloudinary(req) //Sube fichero
			.then(function(uploadResult){				
				console.log(">>>>>>>>>>>>>>>>>>>>>>>AQUI punto D");
				return updateAttachment(req, uploadResult, quiz);
			});
	})
     .then(function(){
     	req.flash('success', 'Quiz editado correctamente');
    	res.redirect('/quizzes');  // res.redirect: Redirección HTTP a lista de preguntas
    	
    })
	.catch(Sequelize.ValidationError, function(error) {

      req.flash('error', 'Errores en el formulario:');
      for (var i in error.errors) {
          req.flash('error', error.errors[i].value);
      };
      res.render('quizzes/edit', {quiz: quiz}); 
      })
    .catch(function(error) {
    	res.setHeader('Content-Type', 'application/json');
    	res.send(JSON.stringify(error));
		req.flash('error', 'Errores al editar un quiz');
		//next(error);
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

/**
 * Crea una promesa para subir una imagen nueva a Cloudinary. 
 * Tambien borra la imagen original.
 * 
 * Si puede subir la imagen la promesa se satisface y devuelve el public_id y 
 * la url del recurso subido. 
 * Si no puede subir la imagen, la promesa tambien se cumple pero devuelve null.
 *
 * @return Devuelve una Promesa. 
 */
function uploadResourceToCloudinary(req) {
    return new Promise(function(resolve, reject) {
    	console.log("Punto C1");
        var path = req.file.path;
        console.log(path);
        cloudinary.uploader.upload(path, function(result) {
        		console.log("Punto C2");
                fs.unlink(path); // borrar la imagen subida a ./uploads
                if (! result.error) {
                	console.log("Punto C3");
                    resolve({ public_id: result.public_id, url: result.secure_url });
                } else {
                	console.log("Punto C4");
                    req.flash('error', 'No se ha podido salvar la nueva imagen: '+result.error.message);
                    resolve(null);
                }
            },
            cloudinary_image_options
        );
    })
};

/**
 * Crea una promesa para crear un attachment en la tabla Attachments.
 */
function createAttachment(req, uploadResult, quiz) {
    if (!uploadResult) {
        return Promise.resolve();
    }

    return models.Attachment.create({ public_id: uploadResult.public_id,
                                      url: uploadResult.url,
                                      filename: req.file.originalname,
                                      mime: req.file.mimetype,
                                      QuizId: quiz.id }) //QQQQQQQQQQQQQQQQ
    .then(function(attachment) {
        req.flash('success', 'Imagen nueva guardada con éxito.');
    })
    .catch(function(error) { // Ignoro errores de validacion en imagenes
        req.flash('error', 'No se ha podido salvar la nueva imagen: '+error.message);
        cloudinary.api.delete_resources(uploadResult.public_id);
    });
};

/**
 * Crea una promesa para actualizar un attachment en la tabla Attachments.
 */
function updateAttachment(req, uploadResult, quiz) {
    if (!uploadResult) {
        return Promise.resolve();
    }

    // Recordar public_id de la imagen antigua.
    var old_public_id = quiz.Attachment ? quiz.Attachment.public_id : null;

    return quiz.getAttachment()
    .then(function(attachment) {
        if (!attachment) {
            attachment = models.Attachment.build({ QuizId: quiz.id }); //qqqqqqqqqqqqqqqqqqqqqqqqqqq
        }
        attachment.public_id = uploadResult.public_id;
        attachment.url = uploadResult.url;
        attachment.filename = req.file.originalname;
        attachment.mime = req.file.mimetype;
        return attachment.save();
    })
    .then(function(attachment) {
        req.flash('success', 'Imagen nueva guardada con éxito.');
        if (old_public_id) {
            cloudinary.api.delete_resources(old_public_id);
        }
    })
    .catch(function(error) { // Ignoro errores de validacion en imagenes
        req.flash('error', 'No se ha podido salvar la nueva imagen: '+error.message);
        cloudinary.api.delete_resources(uploadResult.public_id);
    });
};