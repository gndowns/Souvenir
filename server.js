var express = require("express"); 
var session = require('express-session'); 
var bodyParser = require("body-parser"); 
var favicon = require('serve-favicon'); 
var fs = require('fs'); 
var request = require('request'); 

var app = express(); 

// TO DO: fix scaling of images


// anything in public can be loaded now 
app.use(express.static(__dirname + '/public')); 

// makes favicon
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



// I guess we'll do the views 
// plain html tho, we'll learn jade later
app.set('views', __dirname + '/views'); 
app.engine('html', require('ejs').renderFile); 
app.set('view engine', 'ejs'); 




// redirect to get below
app.get('/list_submit', function(req, res){
	res.render('palace.html', {palaceData: req.session.palaceData});
}); 



// redirected here 
app.post('/list_submit', function(req, res){

	// global var for use in flickr call
	var listElem = ''; 
	var listElems = '' + req.body.list;

	// insert flickr here
	console.log("Starting flickr getting images"); 
	console.log("with list: \n" + listElems + "\n");
	listElems = listElems.split('\r\n'); 

	// add '+' for spaces
	for (var i = 0; i < listElems.length; i++){ 
		for(var j = 0; j < listElems[i].length; j++){
			if (listElems[i][j] == ' '){
				listElems[i][j] = '+'; 
			}
		}
	}

	palaceData = {size: listElems.length}; 

	for(i = 0; i < palaceData.size; i++){
		palaceData[i] = {
			listElem: listElems[i], 
			img_url: ''
		}
	}

	// forget a for loop 
	// we'll do it recursively to deal with the asynchronous calls to flickr
	function getURL(i){
		if( i < listElems.length){
			listElem = '' + listElems[i]; 

			var url = "https://api.flickr.com" + 
			"/services/rest/?method=flickr.photos.search&" + 
			"api_key=6ddcc51aac317ff8f54371029b81f85e&text=" 
			+ listElem + 
			"&sort=relevance&content_type=1&" + 
			"max_upload_date=1478011191&format=json&nojsoncallback=1"; 


			// use request to do this whoops 
			console.log("making request for: " + listElem); 
			request({
				url: url, 
				json: true
			}, function(error, response, body){
				if (!error && response.statusCode == 200){ 
					console.log("success!"); 
					var photo = body.photos.photo[0]; 
					var img_url = "http://farm" + photo.farm + 
					".static.flickr.com/" + photo.server + 
					"/" + photo.id + "_" + photo.secret + 
					"_m.jpg"; 

					palaceData[i].img_url = img_url; 
					

					// TO DO: can't concatenate listELem as string
					// freaks out when logged with other string literals

					console.log(img_url); 

					// recurse
					console.log("\nrecursing\n"); 
					getURL(i + 1); 
				}
			});
		}
		else{
			console.log("all done!~\n");  
			console.log(palaceData); 

			// send to palace here 
			req.session.palaceData = palaceData;
			res.redirect('list_submit');   
		}

	}


	// first call
	getURL(0);  
});



// get '/' 
// ie first thing they see when they go to the domain 
app.get('/', function(req, res){
	res.render('index.html'); 
});

app.listen(3000, function(){
	console.log("Started on PORT 3000"); 
});

