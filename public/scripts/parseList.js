$(document).ready(function(){
	$("form").submit(function(){
		console.log("submitted"); 
		document.getElementById("list_input").innerHTML = "temporary loading page"; 
	})
});