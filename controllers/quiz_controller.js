//Question
exports.question =function (req,res,next){
	var answer = req.query.answer || "";
	res.render('quizzes/question', {question:'Capital de Italia', answer:answer});
};
//Answer
exports.check = function (req, res, next){
	var result;
	var answer = req.query.answer || "";
	if (answer==='Roma') result = 'Correcta';
	else result='Incorrecta';
	res.render('quizzes/result', {result:result, answer:answer});
};
