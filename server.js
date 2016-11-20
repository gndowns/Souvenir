var express = require("express"); 
var bodyParser = require("body-parser"); 
var favicon = require('serve-favicon'); 
var fs = require('fs'); 

var app = express(); 


// anything in public can be loaded now 
app.use(express.static('public')); 

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

// handle the list submit 
app.post('/palace', function(req, res){
	// TO DO : change th form submit to a jquery post instead
	// that way we don't necessarily have to redirect..?
	// nah i really don't know
	// "i don know!" 
	// i fixed it its sweet check it out down there v v v <-- those are arrows


	// split the list into array based on newlines 
	var listElems = req.body.list 
	listElems = listElems.split('\r\n');

	for(var i = 0; i < listElems.length; i++){
		console.log('list item at ' + i + ': ' + listElems[i]); 
	}

	// write the list to file on server
	// its temporary, really...
	fs.writeFile(__dirname + '/list.json', JSON.stringify(listElems, null, 2)); 
	// this is getting sketchy..

	// change this to res.render(send em to the place with the google maps(the crazy place!!_))
	// i'll change it later i sweear
	res.sendFile(__dirname + '/palace.html'); 
});

// get '/' 
// ie first thing they see when they go to the domain 
app.get('/', function(req, res){
	res.sendFile(__dirname + '/' + 'index.html'); 
});

app.listen(3000, function(){
	console.log("Started on PORT 3000"); 
});

