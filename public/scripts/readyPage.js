
function createDivs(n){
	var panFrame = document.getElementById("panFrame"); 

	for (var i = 0; i < n; i++){
		var newDiv = document.createElement('div'); 
		newDiv.id = "markerDiv" + i; 
		newDiv.className = "markerDiv"; 
		newDiv.style = "" +
			"position: relative;" + 
			"top: 0px; left: 0px;" +
			"z-index: 1000; display: none;" +
			"cursor: pointer;" ; 
		panFrame.appendChild(newDiv); 
	}
}

function loadMarkers(n){
	// we already loaded first image, 
	// start at 1
	svo = new SVO(51.5075137, -0.1282853); 
	svo.m_initPanorama(0); 
	svo.m_initMarker(0); 


	for(var i = 1; i < n; i++){
		(function(index) {
			console.log('fetching ' + index); 
			var url = "https://api.flickr.com" + 
			"/services/rest/?method=flickr.photos.search&" + 
			"api_key=" + pData.flickrKey + 
			"&text=" + pData[index].listElem + 
			"&sort=relevance&content_type=1&" + 
			"max_upload_date=1478011191&format=json&nojsoncallback=1"; 
		
			$.get(url, function(data){
				console.log('got ' + index); 

				var photo = data.photos.photo[0]; 
				var img_url = "http://farm" + photo.farm +
				".static.flickr.com/" + photo.server + 
				"/" + photo.id + "_" + photo.secret + 
				"_m.jpg"; 

				svo.image[index] = img_url;  

				svo.m_initPanorama(index); 
				svo.m_initMarker(index); 
			});
		})(i); 
	}
}


$(document).ready(function(){
	createDivs(pData.size); 

	// import google images 
	$.getScript("http://maps.google.com/maps/api/js?key="+
		pData.mapKey + 
    	"&sensor=false&libraries=geometry",
    	function(){ 
    		loadMarkers(pData.size); 
    }); 

    $("#panFrame").on("click", ".markerDiv", function(){
    	markerClick(); 
    })

}); 
