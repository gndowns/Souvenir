/* 
streetview overlay script originally 
written by team maps
Adapted by Gabriel Downs, 2017 

You are free to use and modify this code provided that you:
(1) Include this notice within the javascript code
(2) Display a link to http://teammaps.com on the page that contains the Street View Tour.

*/ 

// current item we're looking for 
var currentElem = 0; 


var svo = null;

// the main application object
function SVO(LAT, LNG)
{
    // Trafalgar Square

    // self location 
    this.slat = LAT; 
    this.slng = LNG; 

    this.zoom = 16;


    // dynamically assign images 
    this.image = new Object(); 
    for(var i = 0; i < pData.size; i++){
        this.image[i] = pData[i].img_url; 
    }

    // marker locations
    var lat = 51.507768; 
    var lng = -0.127957; 

    // 51.5075496,-0.1288616

    this.pt = new Array(pData.size);  
    for (var i = 0; i < pData.size; i++){
        this.pt[i] = new google.maps.LatLng(lat, lng); 
        lat -= 0.000385;
        lng -= 0.0015188;
    }


    // where you are
    this.streetPt = new google.maps.LatLng(this.slat, this.slng);

    // initial POV
    this.sheading = 69.58;
    this.spitch = 0;
    this.szoom = 1;

    this.distance = 0;  // distance in metres from street view to marker
    this.maximumDistance = 61;     // distance beyond which marker is hidden

    // dimensions of street view container (fixed)
    this.panWidth = 500;
    this.panHeight = 500;

    // dimensions of marker container (resized according to current pov)
    this.markerWidth = 120;
    this.markerHeight = 80;
} 


// create street view
SVO.prototype.m_initPanorama = function (i)
{
    var visible = false;
    var l_panDiv = eid("panDiv");

    // controls can be hidden here to prevent the position being changed by the user
    var l_panOptions =
    {
        // zoomControl: false,
        // linksControl: false
    };

    l_panOptions.position = this.streetPt;
    l_panOptions.pov =
    {
        heading: this.sheading,
        pitch: this.spitch,
        zoom: this.szoom
    };

    // create new panorama only if first pass 
    if(i == 0){
        pan = new google.maps.StreetViewPanorama(l_panDiv, l_panOptions);
        //map.setStreetView(pan);
    }

    // event handlers    
    google.maps.event.addListener(pan, 'pov_changed', function ()
    {
       // console.log('updating pov ' + i); 
        svo.m_updateMarker(i);
    });

    google.maps.event.addListener(pan, 'zoom_changed', function ()
    {
        //console.log('updating zoom ' + i); 
        svo.m_updateMarker(i);
    });

    google.maps.event.addListener(pan, 'position_changed', function ()
    {
       // console.log('updating position ' + i ); 

        // your position 
        svo.streetPt = pan.getPosition();

        svo.m_updateMarker(i);
    });

}



SVO.prototype.updateDirections = function(angle){
    var directions = eid("directions"); 

    var mssg = "";
    var range = 25;  

    if (angle <= range && angle >= -range){
        mssg = "Go Straight!!"; 
    }
    // to the left of image
    else if (angle > range) {
        mssg = "Turn Right!";
    }
    // to the right of the image
    else if (angle < range) {
        mssg = "Turn Left!"; 
    }

    directions.innerHTML = mssg; 
}


function Marker(p_name, p_icon, p)
{
    this.m_icon = "";

    this.pt = null;
    this.m_pov = null;

    this.m_pixelpt = null;
}

// convert the current heading and pitch (degrees) into pixel coordinates
SVO.prototype.m_convertPointProjection = function (p_pov, p_zoom, i)
{
    var l_fovAngleHorizontal = 90 / p_zoom;
    var l_fovAngleVertical = 90 / p_zoom;

    var l_midX = this.panWidth / 2;
    var l_midY = this.panHeight / 2;

    var l_diffHeading = this.sheading - p_pov.heading;


    l_diffHeading = normalizeAngle(l_diffHeading); 

    // update directions
    if (i == currentElem) svo.updateDirections(l_diffHeading); 

    //console.log("heading: " + l_diffHeading); 


    l_diffHeading /= l_fovAngleHorizontal;



    var l_diffPitch = (p_pov.pitch - this.spitch) / l_fovAngleVertical;

    var x = l_midX + l_diffHeading * this.panWidth;
    var y = l_midY + l_diffPitch * this.panHeight;

    var l_point = new google.maps.Point(x, y);

    return l_point;
}

// create the 'marker' (a div containing an image which can be clicked)
SVO.prototype.m_initMarker = function (i)
{ 
    var l_markerDiv = eid("markerDiv" + i);
    
    l_markerDiv.style.width = this.markerWidth + "px";
    l_markerDiv.style.height = this.markerHeight + "px";

    var l_iconDiv = eid("markerDiv" + i);
    l_iconDiv.innerHTML = "<img src='" + this.image[i] + "' width='100%' height='100%' alt='' />";

    this.m_updateMarker(i);
}


SVO.prototype.m_updateMarker = function (i)
{
    var l_pov = pan.getPov();
    if (l_pov)
    {
        var l_zoom = pan.getZoom();

        // scale according to street view zoom level
        var l_adjustedZoom = Math.pow(2, l_zoom) / 2;


        // this.pt is fixed, it is where the div is
        // it never "moves" on the map

        // recalulate icon heading and pitch now0
        this.sheading = google.maps.geometry.spherical.computeHeading(this.streetPt, this.pt[i])
        this.distance = google.maps.geometry.spherical.computeDistanceBetween(this.streetPt, this.pt[i]);




        var l_pixelPoint = this.m_convertPointProjection(l_pov, l_adjustedZoom, i);

        var l_markerDiv = eid("markerDiv" + i);


        var l_distanceScale = 50 / this.distance;
        l_adjustedZoom = l_adjustedZoom * l_distanceScale;

        // _TODO scale marker according to distance from view point to marker 
        // beyond maximum range a marker will not be visible

        // apply position and size to the marker div
        var wd = this.markerWidth * l_adjustedZoom;
        var ht = this.markerHeight * l_adjustedZoom;

        var x = l_pixelPoint.x - Math.floor(wd / 2);
        var y = l_pixelPoint.y - Math.floor(ht / 2);

        // update position 
        l_markerDiv.style.display = "block";
        l_markerDiv.style.left = x + "px";
        l_markerDiv.style.top = y + "px";
        l_markerDiv.style.width = wd + "px";
        l_markerDiv.style.height = ht + "px";


        // hide marker when its beyond the maximum distance
        if (this.distance < this.maximumDistance){
            l_markerDiv.style.display = "block"; 
            if (i == currentElem){
                eid("directions").innerHTML = "Click the picture to move on to the next item!";
            }
        }
        else {
            l_markerDiv.style.display = "none"; 
        }

        // glog("distance = " + Math.floor(this.distance) + " m (" + l_markerDiv.style.display + ") distance scale = " + l_distanceScale + " l_adjustedZoom = " + l_adjustedZoom);

    }
}

// TO DO: WHEN LIST MAXES OUT 

// udpate currentElem when they find (click) the last one

// MAKE IT OWRK 
function markerClick(){
    console.log('updating'); 
    console.log
    if (++currentElem >= pData.size) currentElem = 0; 

    console.log(currentElem);

    eid("directions").innerHTML = "Good! " +
    "Look around to find the next item...";
}



// utils
function eid(id)
{
    return document.getElementById(id);
}

function glog(a)
{
    if (typeof (console) != "undefined" && console && console.log)
    {
        console.log(a);
    }
}


function formatFloat(n, d)
{
    var m = Math.pow(10, d);
    return Math.round(n * m, 10) / m;
}


function normalizeAngle(a)
{

    while (a > 180)
    {
        a -= 360;
    }

    while (a < -180)
    {
        a += 360;
    }

    return a;
}
