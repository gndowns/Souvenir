 
var webService = new google.maps.StreetViewService(); 
var panorama; 

function randomSVLocation() { 
	var latlng = randomLatLng(); 
	var random = new google.maps.LatLng(latlng[0], latlng[1]);  
	getNearestPan(random, 50); 
}


// ZONE IN BOUNDS TO AVOID OCEANS 
// ADD CHOOSE BETWEEN 'CONTINENT' BY ROUGH BOUNDARY 

// get random LatLng on Earth as google maps latlng 
function randomLatLng() {
	/*
	// random lat between -90 and 90
	var randomLat = ((Math.random() * (90 + 90)) - 90).toFixed(7); 
	// random lng between -180 and 180
	var randomLng = ((Math.random() *(180 + 180)) - 180).toFixed(7);
	*/ 
	var bords = borders[5]; 
	var randomLat = (Math.random() * (bords.latMax - bords.latMin) + bords.latMin); 
	var randomLng = (Math.random() * (bords.lngMax - bords.lngMin) + bords.lngMin); 
	
	return [randomLat, randomLng];   
}

// finds valid streetview panorama closest to given LatLng
function getNearestPan(LatLng, bounds){
	
	// google maps webservice function 
	webService.getPanoramaByLocation(LatLng, bounds, function(data){
		if (data && data.location && data.location.latLng) {
			console.log('valid location'); 
			updatePanorama(data.location.latLng); 
		}
		else {
			console.log('recursing'); 
			// recursive call double boundaries 
			getNearestPan(LatLng, bounds * 2); 
		}
	});

}

function updatePanorama(latLng) {
	if (panorama) {
		panorama.setLocation(latLng); 
	}
	else {
		//initialize new panorama 
		panDiv = document.getElementById("panDiv"); 
		panOptions = {
			position: latLng, 
			pov: {
				heading: 65, 
				pitch: 0,
				zoom: 1
			}
		}
		panorama = new google.maps.StreetViewPanorama(panDiv, panOptions); 
	}
}

function initialize() {
	 randomSVLocation(); 
}


// ^ clean that shit up 

// Rough Continent Borders 
// put this in JSON later 
var borders = {
	0: {
		// Cali to Newfoundland, S.Am to the 60th 
		name: "North America", 
		latMin: 7.0, 
		latMax: 60.0, 
		lngMin: -124.554687, 
		lngMax: -52.529740
	}, 

	// virginia 	
	1: {
		name: "Virginia", 
		latMin: 36.0,
		latMax: 40.0, 
		lngMin: -82.0, 
		lngMax: -76.0
	}, 

	// DC 
	2: {
		name: "Washington DC", 
		latMin: 38.853251, 
		latMax: 38.995228, 
		lngMin: -77.118765, 
		lngMax: -76.909252
	},

	// narrower DC 
	3: {
		name: "DC Monuments", 
		latMin: 38.856696, 
		latMax: 38.900156, 
		lngMin: -77.065597, 
		lngMax: -76.960599
	},

	// France 
	4: {
		name: "Just France", 
		latMin: 42.358213, 
		latMax: 51.088366, 
		lngMin: -4.776154,
		lngMax: 8.239855
	},

	// shannon's town? 
	5: {
		latMin: 48.891657, 
		latMax: 48.896106,  
		lngMin: 2.273328, 
		lngMax: 2.302344
	}, 

	6: {
		name: "Lesser Montreal", 
		latMin: 45.494821, 
		latMax: 45.519557, 
		lngMin: -73.580889, 
		lngMax: -73.556684 
	}
}