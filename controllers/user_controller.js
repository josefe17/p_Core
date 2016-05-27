
var models = require('../models');
var Sequelize = require('sequelize');

// Autoload el user asociado a :userId
exports.load = function(req, res, next, userId) {
	models.User.findById(userId) 
  		.then(function(user) {
      		if (user) {
        		req.user = user; //Lo mete en req.user
        		next();
      		} else { 
                req.flash('error', 'No existe el usuario con id='+id+'.');
                next(new Error('No existe userId=' + userId));
      		}
        })
        .catch(function(error) { next(error); });
};

// GET /users
exports.index = function(req, res, next) {
    models.User.findAll({order: ['username']})
        .then(function(users) {
            res.render('users/index', { users: users });
        })
        .catch(function(error) { next(error); });
};

// GET /users/new crea un user nuevo -> pide pagina para meter datos
exports.new = function(req, res, next) {
    var user = models.User.build({ username: "", 
                                   password: "" });

    res.render('users/new', { user: user });
};

// POST /users/create  guarda los datos en la db
exports.create = function(req, res, next) {
  var user = models.User.build({ username: req.body.user.username, 
  	                             password: req.body.user.password} );
  // El login debe ser unico:
  models.User.find({where: {username: req.body.user.username}})
      .then(function(existing_user) {
          if (existing_user) {
              var emsg = "El usuario \""+ req.body.user.username +"\" ya existe."
              req.flash('error', emsg);
              res.render('users/new', { user: user });
          } else {
              // Guardar en la BBDD
              return user.save({fields: ["username", "password", "salt"]})
                  .then(function(user) { // Renderizar pagina de usuarios
                      req.flash('success', 'Usuario creado con éxito.');
                      res.redirect('/session');
                  })
                  .catch(Sequelize.ValidationError, function(error) {
                      req.flash('error', 'Errores en el formulario:');
                      for (var i in error.errors) {
                          req.flash('error', error.errors[i].value);
                      };
                      res.render('users/new', { user: user });
                  });
          }
      })
      .catch(function(error) { 
          next(error);
      });
};

// DELETE /users/:id borra user

exports.destroy =function(req, res, next){
	req.user.destroy()
	 .then(function(user){
    if (req.session.user && req.session.user.id===req.user.id) delete req.session.user;
		req.flash('success', 'Usuario borrado correctamente');
		res.redirect("/users"); // Redirección a la lista de usuarios
	})	
    .catch(function(error) {
		req.flash('error', 'Error al borrar el usuario: ' + error.message);
		next(error);
	});  
}

// GET /users/:id muestra user
exports.show = function(req, res, next) {
	res.render('users/show', {user: req.user}); 
};

// GET /users/:id/edit muesta edición del user
exports.edit=function(req, res, next){
	var user = req.user;
	res.render('users/edit', {user: user});
}

//PUT /users/:id  guarda user editado

exports.update =function(req, res, next){
	req.user.username 	= req.body.user.username;
	req.user.password   = req.body.user.password;

	req.user.save({fields: ["username", "password", "salt"]})
	.then(function(user){
		req.flash('success', 'Usuario editado correctamente');
		res.redirect("/users"); // Redirección a la lista de preguntas
	})
	.catch(Sequelize.ValidationError, function(error) {

      req.flash('error', 'Errores en el formulario:');
      for (var i in error.errors) {
          req.flash('error', error.errors[i].value);
      };
      res.render('users/edit', {user: req.user}); 
      })
    .catch(function(error) {
		req.flash('error', 'Errores al editar un usuario');
		next(error);
	});  
}


