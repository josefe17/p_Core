
var userController = require('./user_controller');
var url=require('url');
var models = require('../models');

var authenticate = function(login, password){
    return models.User.findOne({where: {username:login}})
        .then(function(user){
            if (user && user.verifyPassword(password)) return user;
            else return null;         
        });
};

exports.loginRequired = function (req, res, next){
    if (req.session.user) next();
    else res.redirect('/session?redir=' + (req.param('redir') || req.url));
}


// GET /session   -- Formulario de login
exports.new = function(req, res, next) {
    var redir = req.query.redir || url.parse(req.headers.referer ||"/").pathname; //Redir=>Original=>Inicio
    if (redir === '/session' || redir === '/users/new') redir='/';

    res.render('session/new', {redir: redir}); //Guardo donde redirigir
};

//El usuario registrado es admin o el propietario de la cuenta
exports.adminOrMyselfRequired = function(req, res, next){

  var isAdmin = req.session.user.isAdmin; //Cargado en el autoload del mw previo
  var userId = req.user.id;
  var loggedUserId = req.session.user.id; 

  if (isAdmin || userId === loggedUserId) next(); //Todo ok
  else {
    console.log("Ruta prohibida: no es el usuario logeado ni un administrador.");
    res.send(403);
  }
}

//El usuario registrado es admin y no es el propietario de la cuenta
exports.adminAndNotMyselfRequired = function(req, res, next){

  var isAdmin = req.session.user.isAdmin; //Cargado en el autoload del mw previo
  var userId = req.user.id;
  var loggedUserId = req.session.user.id; 

  if (isAdmin && userId !== loggedUserId) next(); //Todo ok
  else {
    console.log("Ruta prohibida: no es el usuario logeado ni un administrador.");
    res.send(403);
  }
}

// POST /session   -- Crear la sesion si usuario se autentica
exports.create = function(req, res, next) {

    var redir = req.body.redir || '/';
    var login     = req.body.login;
    var password  = req.body.password;

   authenticate(login, password)
        .then(function(user) {
             if (user){
	        // Crear req.session.user y guardar campos id y username
	        // La sesión se define por la existencia de: req.session.user
	        req.session.user = {id:user.id, username:user.username, isAdmin:user.isAdmin};
	        res.redirect(redir); // redirección a redir guardado
            }
            else{
                req.flash('error', "Error al  iniciar sesión. Inténtelo de nuevo.");
                res.redirect("/session?redir="+redir); //intentar de nuevo conservando el redir: pedimos otra vez
            }
		})
		.catch(function(error) {
            req.flash('error', 'Se ha producido un error: ' + error);
            next(error);
    });
};


// DELETE /session   -- Destruir sesion 
exports.destroy = function(req, res, next) {
    delete req.session.user;    
    res.redirect("/session"); // redirect a login
};
