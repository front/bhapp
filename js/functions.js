function SetCurrentLocation(){ navigator.geolocation.getCurrentPosition(SetCurrentLocation_OnSuccess, SetCurrentLocation_OnError,{maximumAge:0, timeout:15000}); }

function SetCurrentLocation_OnSuccess(position) {
	sLatitude = position.coords.latitude;
	sLongitude = position.coords.longitude;
	//alert("Din Posisjon er " + sLatitude + " + "+ sLongitude );
	
	var mapcanvas = document.createElement('div');
	mapcanvas.id = 'mapcanvas';
	mapcanvas.style.height = '400px'; // Cannot set to % ?!
	mapcanvas.style.width = '100%';

	document.querySelector('div#loc div.ui-content').appendChild(mapcanvas);

	//alert( "useragent:" + useragent.indexOf('iPhone') );
  var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  var myOptions = {
	    zoom: 16,
	    center: latlng,
	    mapTypeControl: false,
	    navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
	    mapTypeId: google.maps.MapTypeId.ROADMAP
	  };
	  var map = new google.maps.Map(document.getElementById("mapcanvas"), myOptions);

	  var marker = new google.maps.Marker({
	      position: latlng, 
	      map: map, 
	      title:"Du er her! (Med " + position.coords.accuracy + " meters nøyaktighet)"
	  });
	var distance  = CalculateDistance(position.coords.latitude, position.coords.longitude, 59.132534, 10.565337)/10;
	alert("Du er " + distance + " km fra huset til Thor Andre (i luftlinje). Stikk innom da vel!");
  
}

function SetCurrentLocation_OnError(error) {
		alert("Location not found");
}
function getImages( GALLERY_URI, SERVICE_URI){

  $.getJSON(SERVICE_URI, function(data){

  // For each node, add some html to the DOM
	  $.each(data.nodes, function(){
		  var img_full =  this.node.full;
		  var img_thumb = this.node.thumb;
		  var img_title = this.node.title;
		
		  var new_img = "<li><a href='" + img_full + "' rel='external'><img src='" + img_thumb + "' alt='" + img_title + "' /></a></li>";
		  $("#Gallery1 .gallery").append( new_img);					
	    }); // end each

    }); //end getJSON()
}

function toRad(deg) {
    return deg * Math.PI / 180;
  }

/*
function CalculateDistance(lat1,lon1,lat2,lon2){
  var R = 6371; // Radius of the earth in km
  var dLat = (lat2-lat1).toRad();  // Javascript functions in radians
  var dLon = (lon2-lon1).toRad(); 
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  alert("here");
  
  return d;
} */

function CalculateDistance(lat1, lon1, lat2, lon2) {
    //Radius of the earth in:  1.609344 miles,  6371 km  | var R = (6371 / 1.609344);
    var R = 6371; // Radius of earth in Miles 
    var dLat = toRad(lat2-lat1);
    var dLon = toRad(lon2-lon1); 
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    return d;
}