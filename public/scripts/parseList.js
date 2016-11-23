var srcArray; 
var listElems;
var data; 
var srcArray = new Array(); 



$(document).ready(function(){
	$("button").click(function(){
		listElems = document.getElementById("list").value;
		listElems = listElems.split('\n'); 

		data = {size: listElems.length}; 
		for (var i = 0; i < data.size; i++){
			data["n" + i] = {
				listElem: listElems[i],
				img_url: ''
			}
		}


		// flickr api goes here
		// fuckr api goes here
		for (var j = 0; j < listElems.length; j++){		  
			// protect j in immediately called function 
			// IIFE 
			(function(j){
				//console.log("pass: " + j); 
				var url = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=6ddcc51aac317ff8f54371029b81f85e&text=" 
				+ listElems[j] + "&sort=relevance&content_type=1&max_upload_date=1478011191";	
				var src; 
				$.ajax({
					type: 'GET', 
					url: url + "&format=json&jsoncallback=?",
					dataType: 'json', 
					success: function(data){
						console.log("success! at " + j); 
						$.each(data.photos.photo, function(i,item){
        					src = "http://farm"+ item.farm +".static.flickr.com/"+ item.server +"/"+ item.id +"_"+ item.secret +"_m.jpg"; 
       						srcArray[j] = src; 
       						console.log(src); 
       						processData(j);
        					if ( i == 0 ) return false;
    					});
					}, 
					data: {}, 
					async: false
				}); 
 
			})(j); 
			// ADD SPACES FOR PLUS 
		}
	});
});

function processData(j){
	// well, this line might cause problems later v
	data["n" + j].img_url = srcArray[j]; 
	console.log(JSON.stringify(data, null, 2)); 
}	