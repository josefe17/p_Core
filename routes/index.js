var express = require('express');
var router = express.Router();

var multer = require ('multer');
var upload = multer({dest: './uploads'});

var quizController=require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var userController = require('../controllers/user_controller');
var sessionController = require('../controllers/session_controller');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});


// Autoload de rutas que usen :quizId
router.param('quizId', quizController.load);  // autoload :quizId
router.param('userId', userController.load); //Autoload userId
router.param('commentId', commentController.load);  // autoload :commentId


// Definición de rutas de /quizzes
router.get('/quizzes.:format?',            			quizController.index); //Muesta todos
router.get('/quizzes/:quizId(\\d+).:format?',       quizController.show); //Muestra uno
router.get('/quizzes/:quizId(\\d+)/check', quizController.check); //Comprueba uno
router.get('/quizzes/new',				   sessionController.loginRequired, quizController.new); //Crea uno (manda web de creado)
router.post('/quizzes',					   sessionController.loginRequired, upload.single('image'), quizController.create); //Mete los datos del creado en la web
router.get('/quizzes/:quizId(\\d+)/edit',  sessionController.loginRequired, quizController.ownershipRequired, quizController.edit); //...
router.put('/quizzes/:quizId(\\d+)', 	   sessionController.loginRequired, upload.single('image'), quizController.ownershipRequired, quizController.update);
router.delete('/quizzes/:quizId(\\d+)',    sessionController.loginRequired, quizController.ownershipRequired, quizController.destroy);

//Rutas de comentarios
router.get('/quizzes/:quizId(\\d+)/comments/new',  sessionController.loginRequired, commentController.new); //Formulario para crear comentario asociado al quizId
router.post('/quizzes/:quizId(\\d+)/comments',     sessionController.loginRequired, commentController.create); //post que mete los datos del nuevo comentario en la base de datos
router.put('/quizzes/:quizId(\\d+)/comments/:commentId(\\d+)/accept', sessionController.loginRequired, quizController.ownershipRequired, commentController.accept); //permite moderar los comentarios

//Rutas de user
router.get('/users',				userController.index); //Muestra todos
router.get('/users/:userId(\\d+)',	userController.show); //Muestra uno
router.get('/users/new',			userController.new); //crea uno (manda la web de crear uno)
router.post('/users',				userController.create); //Mete los datos del creado en la db
router.get('/users/:userId(\\d+)/edit', sessionController.loginRequired, sessionController.adminOrMyselfRequired,	userController.edit); //Manda la web para editarlo
router.put('/users/:userId(\\d+)', 		sessionController.loginRequired, sessionController.adminOrMyselfRequired,	userController.update); //Guarda los datos del editado en la db
router.delete('/users/:userId(\\d+)', sessionController.loginRequired,	sessionController.adminAndNotMyselfRequired,	userController.destroy); //Borra el usuario

// Definición de rutas de sesion
router.get('/session',    sessionController.new);     // formulario login
router.post('/session',   sessionController.create);  // crear sesión
router.delete('/session', sessionController.destroy); // destruir sesión


module.exports = router;
