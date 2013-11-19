(function (HLD) {
	'use strict'

	HLD.Desktop = HLD.Desktop || {};
	//magic here: deffered 
	var jqDeffered = jQuery.Deferred(),
		geoLocation,
		countryName,
		geoLatitude,
		geoLongitude,
		googleGEOCoding,
		postalCode,
		//Method varibles
		getGEOLocationinformation;


	//private functions
	getGEOLocationinformation = function() {
			var onSuccess = function(location){		
					
					geoLocation = location;
					countryName = geoLocation.country.names.en;
					geoLatitude = geoLocation.location.latitude;
					geoLongitude = geoLocation.location.longitude;
					postalCode = geoLocation.postal.code; 
					
					if(postalCode==null && "Australia" == countryName ){
						 getPostcodeFromGeocodingReverse(geoLatitude,geoLongitude);
					}else{
						createCookie("accSelectedPostcode",postalCode,"30");
					}
					jqDeffered.resolve(geoLocation);
			};
		
			var onError = function(error){	
				geoLocation.status ="error";
				jqDeffered.resolve(geoLocation);
			};
		
			$.ajaxSetup({"error":function(XMLHttpRequest,textStatus, errorThrown) {   
				geoLocation="The service is not available, please try again later";
				jqDeffered.resolve(geoLocation);
			  }});
			
			geoip2.city(onSuccess, onError, { w3cGeolocationDisabled: true });
			
		
	};
	
	var getPostcodeFromGeocodingReverse = function (geoLatitude,geoLongitude){

		var serviceUrl="http://maps.googleapis.com/maps/api/geocode/json?latlng="+geoLatitude+","+geoLongitude+"&sensor=false";
					 
		$.getJSON(serviceUrl, function(data) {
			if(data.status == "OK"){
				googleGEOCoding =data;
				postalCode= data.results[0].address_components[5].long_name;
				geoLocation.postal.code = postalCode;
				geoLocation.status ="OK";
				//set the postcode in the goobal cookie
				createCookie("accSelectedPostcode",postalCode,"30");
			}else{
				geoLocation.status ="error";
			}
			//margic deffed resolve
			jqDeffered.resolve(geoLocation);
		});	
	};
	
	//public functions
	HLD.Desktop.GEOInformation = {
		init: function() {
			var postcode =readCookie("accSelectedPostcode");
			
			// If no postcode, prompt
			if (postcode === null || postcode == undefined || postcode == "") {
				 getGEOLocationinformation();
			}else{
				jqDeffered.resolve(geoLocation);
			}
		},

		checkPostcode: jqDeffered
	}

}(window.HLD || {}));

//on DOM load
$(function () {
	HLD.Desktop.GEOInformation.init();
});