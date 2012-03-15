// 'CONSTANTS'
var THORANDRE_LAT = 59.22370640;
var THORANDRE_LON = 10.9481590;
var FRANK_LAT = 59.2163787;
var FRANK_LON = 10.9524835;
var IMPORTANT_DATES_JSON_FEED = "http://localhost/barnehage/api/rest/important_dates/retrieve.json?keys=temp";
var GALLERY_URI = "http://barnehage.vps4.front.no/sites/default/files/gallery/";
var GALLERY_SERVICE_URI = "http://barnehage.vps4.front.no/api/datasource/";
var SEARCH_SERVICE_URI = 'http://barnehage.vps4.front.no/api/rest/search_node/retrieve.json';


function SetCurrentLocation(){ navigator.geolocation.getCurrentPosition(SetCurrentLocation_OnSuccess, SetCurrentLocation_OnError,{maximumAge:0, timeout:15000}); }

function SetCurrentLocation_OnSuccess(position) {
	
	//Build the DOM
	$('#Location-Page div.ui-content').append("<div id='mapcanvas' style='height:400px' style='width:100%'></div");
	$('#Location-Page div.ui-content').append("<ul id='mapinfo' data-role='listview' data-inset='true'></ul").trigger("create");
	
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
	$('ul#mapinfo').append( "<li>Du er " + air_distance + " km fra huset til Thor Andre i luftlinje</li>");
	$('ul#mapinfo').listview("refresh");

  // Call asynchmethod SetDriveDistance to calculate driving distance and then add it to the DOM
  SetTravelDistance(position.coords.latitude, position.coords.longitude, THORANDRE_LAT, THORANDRE_LON, "driving");
  SetTravelDistance(position.coords.latitude, position.coords.longitude, THORANDRE_LAT, THORANDRE_LON, "walking");		
  SetTravelDistance(position.coords.latitude, position.coords.longitude, THORANDRE_LAT, THORANDRE_LON, "bicycling");		

}

function SetCurrentLocation_OnError(error) {
	alert("Location not found");
}

function ShowGallery(){

	$.getJSON(GALLERY_SERVICE_URI, function(data){

  // For each node, add some html to the DOM
  $.each(data.nodes, function(){
  	var new_img = "<li><a href='" + this.node.full + "' rel='external'><img src='" + 
  	this.node.thumb + "' alt='" + this.node.title + "' /></a></li>";

  	$("#Gallery-Page .gallery").append( new_img);					
  }); 
}); 

	(function(window, $, PhotoSwipe){
		$('div.gallery-page').on('pageshow', function(e){
			console.log("e.target:");
			console.log(e.target);
			var photoSwipeInstance = $("ul.gallery a").photoSwipe( { jQueryMobile: true } );

			console.log(photoSwipeInstance);
			return true;
		});

		$('div.gallery-page').on('pagehide', function(e){
			var 
			currentPage = $(e.target),
			photoSwipeInstance = PhotoSwipe.getInstance(currentPage.attr('id'));
			if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance != null) {
				PhotoSwipe.detatch(photoSwipeInstance);
			}
			return true;
		});
	}(window, window.jQuery, window.Code.PhotoSwipe));

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

function CreateCalendar(){
	alert("here");
	$("#calendar").fullCalendar({
		weekends:false,
		events: IMPORTANT_DATES_JSON_FEED
	});
}

function ShowSearch(){
	$("form").submit(function(){
		var q = $("#search").val();
		var request = $.ajax({
			type:"GET",
			url: SEARCH_SERVICE_URI,
			data:"keys=" + q,
			dataType: "json"
		});

	// SUCCESS
	request.done(function( msg ){
		$.each(msg,function(){ 
			$("div#Result ul").append( "<li class='ui-li ui-li-static ui-body-c'><p class='ui-li-aside'>" + this.type + "</p><a href='" + this.link + "'><h3>" + this.title + "</h3></a><p>" + this.snippet + "</p></li>");	
		});
	});

	// FAILURE
	request.fail(function(jqXHR, textStatus){
		alert("Search failed: " + textStatus);
	});

	  // Return false to avoid standard submit funcionality
	  return false;
	});
}




function showkna(){
	

	// $('#knacontent').append( '<form id="form" action="form.php" method="post">') ;

	// $('#knacontent').append( '<label for="basic">Text Input:</label><input type="text" name="name" id="basic" data-mini="false" />');

	// $('#knacontent').append( '<a href="index.html" data-role="button" data-icon="delete">Delete</a>' );

	// $('#knacontent').append( '</form>' );
// jQuery('<form />', {
//     id: 'form',
//     href: 'http://google.com',
//     title: 'next',
//     rel: 'external',
//     text: 'Go to Google!'
// }).appendTo('#knacontent').trigger('create');


// 	//var html = '<form id="form" action="form.php" method="post">';
// 	//	html += '</form>';
// 	var html = "";
// 	//html += '<label for="basic">Text Input:</label><input type="text" name="name" id="basic" />';
// 	//html +=	'<a href="index.html" data-role="button" data-icon="ta_bilde">Ta bilde</a>';


// 	html += '<div data-role="collapsible>';
// 	html += '<h3>Im a header</h3>';
// 	html += '<p>Im the collapsible content. By default Im closed, but you can click the header to open me.</p>';
// 	html += '</div>';	


// 	$('#form').append( '<h3>Im a header</h3>' ).trigger('create');





}