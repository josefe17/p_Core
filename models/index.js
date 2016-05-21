
var path = require('path');

// Cargar ORM
var Sequelize = require('sequelize');

// Usar BBDD SQLite:
//    DATABASE_URL = sqlite:///
//    DATABASE_STORAGE = quiz.sqlite
// Usar BBDD Postgres:
 

var url, storage;

var debug = process.env.DATABASE_URL;
//debug = 0;

if (!debug) {
    url = "sqlite:///";
    storage = "quiz.sqlite";
} else {
    url = process.env.DATABASE_URL;
    storage = process.env.DATABASE_STORAGE || "";
}

var sequelize = new Sequelize(url, 
                				{ storage: storage,
                  			      omitNull: true 
                      			});

// Importar la definicion de la tabla Quiz de quiz.js
var Quiz = sequelize.import(path.join(__dirname,'quiz'));
// Importar la definicion de la tabla Comments de comment.js
var Comment = sequelize.import(path.join(__dirname,'comment'));

// Relaciones entre modelos
Comment.belongsTo(Quiz); //cada comentario tiene un quiz => añade el campo quizId en la tabla de comentarios
Quiz.hasMany(Comment); //cada quiz varios comentarios


exports.Quiz = Quiz; // exportar definición de tabla Quiz
exports.Comment = Comment; // exportar definición de tabla Comments
