/*(document).ready(function(){
	$("form").submit(function() {
		// do flickr stuff here 
		// before the actual post
		console.log("starting flickr"); 
		counter = 0; 
		listElems = document.getElementById("list").value; 
		listElems = listElems.split('\n'); 

		palaceData = {size: listElems.length}; 
		for (var i = 0; i < palaceData.size; i++){
			palaceData[i] = {
				listElem: listElems[i], 
				img_url: ''
			}
		}



		// flickr api 
		for (var i = 0; i < listElems.length; i++){
			var url = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=6ddcc51aac317ff8f54371029b81f85e&text=" 
				+ listElems[i] + "&sort=relevance&content_type=1&max_upload_date=1478011191";

			console.log("beginning at " + i); 

			$.ajax({
				type: 'GET', 
				url: url + "&format=json&jsoncallback=?", 
				data: {}, 
				dataType: 'json', 
				success: function(data) {
					console.log("success at " + i); 
					//if (data.stat == "ok") {
						var photo = data.photos.photo[0]; 
						console.log(photo); 
						palaceData[i].img_url = "https://farm" + photo.farm + ".staticflickr.com/"
						+ photo.server + "/" + photo.id + "_" + photo.secret + "_b.jpg";		
					//}
				}
			});
		}

		// literally inject the json into the textarea 
		// RAW
		document.getElementById("list").value = JSON.stringify(palaceData, null, 2);

		// now post with flickr url
		return false; 
	}); 
}); 
*/ 