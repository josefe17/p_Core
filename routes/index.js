var express = require('express');
var router = express.Router();

var quizController=require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var userController = require('../controllers/user_controller');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});


// Autoload de rutas que usen :quizId
router.param('quizId', quizController.load);  // autoload :quizId
router.param('userId', userController.load); //Autoload userId


// Definición de rutas de /quizzes
router.get('/quizzes.:format?',            quizController.index); //Muesta todos
router.get('/quizzes/:quizId(\\d+).:format?',       quizController.show); //Muestra uno
router.get('/quizzes/:quizId(\\d+)/check', quizController.check); //Comprueba uno
router.get('/quizzes/new',				   quizController.new); //Crea uno (manda web de creado)
router.post('/quizzes',					   quizController.create); //Mete los datos del creado en la web
router.get('/quizzes/:quizId(\\d+)/edit',  quizController.edit); //...
router.put('/quizzes/:quizId(\\d+)', 	   quizController.update);
router.delete('/quizzes/:quizId(\\d+)',   quizController.destroy);

router.get('/quizzes/:quizId(\\d+)/comments/new',  commentController.new); //Formulario para crear comentario asociado al quizId
router.post('/quizzes/:quizId(\\d+)/comments',     commentController.create); //post que mete los datos del nuevo comentario en la base de datos

router.get('/users',				userController.index); //Muestra todos
router.get('/users/:userId(\\d+)',	userController.show); //Muestra uno
router.get('/users/new',			userController.new); //crea uno (manda la web de crear uno)
router.post('/users',				userController.create); //Mete los datos del creado en la db
router.get('/users/:userId(\\d+)/edit', userController.edit); //Manda la web para editarlo
router.put('/users/:userId(\\d+)',	userController.update); //Guarda los datos del editado en la db
router.delete('/users/:userId(\\d+)',	userController.destroy); //Borra el usuario



module.exports = router;
