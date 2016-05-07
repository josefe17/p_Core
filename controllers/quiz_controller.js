//Question
exports.question =function (req,res,next){
	res.render('quizzes/question', {question:'Capital de Italia'});
};
//Answer
exports.check = function (req, res, next){
	var result;
	if (req.query.answer==='Roma') result = 'Correcta';
	else result='Incorrecta';
	res.render('quizzes/result', {result:result});
};
