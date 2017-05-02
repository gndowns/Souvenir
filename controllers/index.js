
// http://timstermatic.github.io/blog/2013/08/17/a-simple-mvc-framework-with-node-and-express/

module.exports.controller = function(app) {

	// home 
	app.get('/', function(req, res){
		res.render('index.html'); 
	}); 

	
}