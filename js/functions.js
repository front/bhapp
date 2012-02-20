var THORANDRE_LAT = 59.22370640;
var THORANDRE_LON = 10.9481590;
var FRANK_LAT = 59.2163787;
var FRANK_LON = 10.9524835;

function SetCurrentLocation(){ navigator.geolocation.getCurrentPosition(SetCurrentLocation_OnSuccess, SetCurrentLocation_OnError,{maximumAge:0, timeout:15000}); }

function SetCurrentLocation_OnSuccess(position) {
	
	//Build the DOM
	$('div#loc div.ui-content').append("<div id='mapcanvas' style='height:400px' style='width:100%'></div");
	$('div#loc div.ui-content').append("<ul id='mapinfo' data-role='listview' data-inset='true'></ul").trigger("create");
	
	// Build posistions
	var myPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	var ThorAndrePosition = new google.maps.LatLng(THORANDRE_LAT,THORANDRE_LON);
	
	// Build the Map
  var myOptions = {
	    zoom: 16,
	    center: myPosition,
	    mapTypeControl: false,
	    navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
	    mapTypeId: google.maps.MapTypeId.ROADMAP
	  };
	var map = new google.maps.Map(document.getElementById("mapcanvas"), myOptions);

  // Build Markers
	var marker = new google.maps.Marker({
	  position: myPosition, 
	  map: map, 
	  title:"Du er her! (Med " + position.coords.accuracy + " meters nøyaktighet)"
	  });
  var marker = new google.maps.Marker({
	  position: ThorAndrePosition, 
	  map: map, 
	  title:"Thor Andre"
	  });
	  
	// Build the Air distance and add the result to the DOM
	var air_distance  = CalculateAirDistance(position.coords.latitude, position.coords.longitude, THORANDRE_LAT, THORANDRE_LON);
	$('ul#mapinfo').append("<li>Du er " + air_distance + " km fra huset til Thor Andre i luftlinje</li>");
	$('ul#mapinfo').listview("refresh");
  
  // Call asynchmethod SetDriveDistance to calculate driving distance and then add it to the DOM
	SetTravelDistance(position.coords.latitude, position.coords.longitude, THORANDRE_LAT, THORANDRE_LON, "driving");
	SetTravelDistance(position.coords.latitude, position.coords.longitude, THORANDRE_LAT, THORANDRE_LON, "walking");		
	SetTravelDistance(position.coords.latitude, position.coords.longitude, THORANDRE_LAT, THORANDRE_LON, "bicycling");		
			
}

function SetCurrentLocation_OnError(error) {
		alert("Location not found");
}

function getImages( GALLERY_URI, SERVICE_URI){

  $.getJSON(SERVICE_URI, function(data){

  // For each node, add some html to the DOM
	  $.each(data.nodes, function(){
		  var new_img = "<li><a href='" + this.node.full + "' rel='external'><img src='" + 
		                this.node.thumb + "' alt='" + this.node.title + "' /></a></li>";
		  
		  $("#Gallery1 .gallery").append( new_img);					
    }); 
  }); 
}

function SetTravelDistance(lat1,lon1,lat2,lon2, mode){
  
  var url = "http://maps.googleapis.com/maps/api/directions/json";
  var data =  "origin=" + lat1 + "," + lon1 + 
              "&destination=" + lat2 + "," + lon2 + 
              "&mode=" + mode + 
              "&sensor=false";
  
	var request = $.ajax({
		type:"GET",
		url: url,
		data: data,
		dataType: "json"
		});
	
	// Handle the data from Google
	request.success( function( response ){
	  
	  // Get the distance from the object
	  try{
	  distance =  response.routes[0].legs[0].distance.value;
    }catch(e){}
	  // Add the distance to the DOM
	  var transport_method;
	  switch(mode){
	    case "driving":
	      transport_method = "med bil";
	      break;
	    case "walking":
	      transport_method = "til fots";
	      break;
	    case "bicycling":
	      transport_method = "med sykkel";
	      break;
	      
	  }
	  
	  $('ul#mapinfo').append("<li>Du er " + distance/1000 + " km fra huset til Thor Andre " + transport_method + "</li>");
	  $('ul#mapinfo').listview("refresh");
	  });
		
		request.fail( function( j, text){
	  alert("Kunne ikke finne kjøredistanse");
	});
}

// Small helper function
function toRad(degrees) {
    return degrees * Math.PI / 180;
}

function CalculateAirDistance(lat1, lon1, lat2, lon2) {
    //Radius of the earth in:  1.609344 miles,  6371 km  | var R = (6371 / 1.609344);
    var R = 6371; // Radius of earth in Km 
    var dLat = toRad(lat2-lat1);
    var dLon = toRad(lon2-lon1); 
    
    // Math Stuff
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    return d;
}