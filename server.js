var express = require("express"); 
var session = require('express-session'); 
var bodyParser = require("body-parser"); 
var favicon = require('serve-favicon'); 
var fs = require('fs'); 
var request = require('request'); 

var app = express(); 

// export local vs dev key with palace data 
var MAPS_API_KEY = process.env.MAPS_API_KEY;  


// TO DO: fix scaling of images


app.set('port', (process.env.PORT || 5000)); 

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




// redirect to get  
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

	palaceData = {
		key: MAPS_API_KEY,  
		size: listElems.length
	}; 

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
			"api_key=" + process.env.FLICKR_API_KEY + 
			"&text=" + listElem + 
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
			//console.log(palaceData); 

			// lock palaces to this session 
			if (req.session.palaces == null){
				req.session.palaces = [palaceData];  
			}
			else {
				req.session.palaces.push(palaceData); 
			}
;
			// manually add id, fix this later 
			res.redirect('/palace' + '?id=' + (req.session.palaces.length - 1));   
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

app.listen(app.get('port'), function(){
	console.log("Started on PORT " + app.get('port')); 
});

