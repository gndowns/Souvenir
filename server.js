var express = require("express"); 
var session = require('express-session'); 
var bodyParser = require("body-parser"); 
var favicon = require('serve-favicon'); 
var fs = require('fs'); 
var request = require('request'); 

var app = express(); 

// export local vs dev key with palace data 
var MAPS_API_KEY = process.env.MAPS_API_KEY;  
var FLICKR_API_KEY = process.env.FLICKR_API_KEY; 

// check configs
//console.log(MAPS_API_KEY); 
//console.log(FLICKR_API_KEY); 

// TO DO: fix scaling of images


app.set('port', (process.env.PORT || 5000)); 

app.use(express.static(__dirname + '/public')); 

app.use(favicon(__dirname + '/public/images/icon.png')); 


// need bodyParser as middleware to handle post requests 
// body-parser stuff:
//parses text as URL encoded data ie how its first sent from browser
app.use(bodyParser.urlencoded({
	extended: true
}));
// parses as json, the data is now a prop of req.body
app.use(bodyParser.json());; 


// sessions
app.use(session({
	secret: 'eqmLh1UA36', 
	saveUninitialized: true, 
	resave: true
})); 


app.set('views', __dirname + '/views'); 
app.engine('html', require('ejs').renderFile); 
app.set('view engine', 'ejs'); 




// redirects to get  
app.post('/list_submit', function(req, res){

	// TESTING	
	//console.log(req.body); 

	// global var for use in flickr call
	var listElem = ""; 
	var listElems = "" + req.body.list;

	console.log("submitted with list: \n" + listElems + "\n");
	listElems = listElems.split('\r\n'); 

	// add '+' for spaces for url format 
	for (var i = 0; i < listElems.length; i++){ 
		listElems[i] = listElems[i].replace(/[^\w\s]/g, ''); 
		listElems[i] = listElems[i].replace(/[\s]/g, "+"); 
	}

	palaceData = {
		mapKey: MAPS_API_KEY, 
		flickrKey: FLICKR_API_KEY, 
		size: listElems.length
	}; 

	for(i = 0; i < palaceData.size; i++){
		palaceData[i] = {
			listElem: listElems[i], 
			img_url: ''
		}
	}

	// get first element and then send to client (get the rest after load)
	function getURL(i){
		if( i < listElems.length){
			listElem = '' + listElems[i]; 

			// change date 

			var url = "https://api.flickr.com" + 
			"/services/rest/?method=flickr.photos.search&" + 
			"api_key=" + FLICKR_API_KEY + 
			"&text=" + encodeURI(encodeURIComponent(listElem)) + 
			"&sort=relevance&content_type=1&" + 
			"max_upload_date=1478011191&format=json&nojsoncallback=1"; 

 
			request({
				url: url, 
				json: true
			}, function(error, response, body){
				if (!error && response.statusCode == 200){  
					var photo = body.photos.photo[0]; 
					if (photo != null){ 
						var img_url = "http://farm" + photo.farm + 
						".static.flickr.com/" + photo.server + 
						"/" + photo.id + "_" + photo.secret + 
						"_m.jpg"; 

						palaceData[i].img_url = img_url; 

						// send to client with first image
						if (req.session.palaces == null){
							req.session.palaces = [palaceData]; 
						} 
						else {
							req.session.palaces.push(palaceData); 
						}

						res.redirect('/palace' + '?id=' + (req.session.palaces.length - 1)); 
					}
					else {
						res.redirect('/'); 
					}	

				}
				else{
					// handle error 
					console.log("ERROR"); 
					res.redirect('/'); 
				}
			});
		}
		else{
			res.redirect('/');  
		}

	}
	// first call
	getURL(0);  
});



// post redirects here 
app.get('/palace', function(req, res){

	// get palace id
	var id = req.query.id; 
	palaces = req.session.palaces; 

	// if directed to manually, without a post
	if (palaces == null || id >= palaces.length){
		res.redirect('/'); 
	}


	// if directed from  post, load palace
	else {
		res.render('palace.html', {palaceData: req.session.palaces[id]}); 
	}
});


app.get('/', function(req, res){
	res.render('index.html'); 

});

// stale posts
app.get('/list_submit', function(req, res){
	res.render('index.html'); 
})

app.listen(app.get('port'), function(){
	console.log("Started on PORT " + app.get('port')); 
});

