function gps_distance(lat1, lon1, lat2, lon2)
{
    var R = 6371; // km
    var dLat = (lat2-lat1) * (Math.PI / 180);
    var dLon = (lon2-lon1) * (Math.PI / 180);
    var lat1 = lat1 * (Math.PI / 180);
    var lat2 = lat2 * (Math.PI / 180);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    
    return d;
}




document.addEventListener("deviceready", function(){
	
	if(navigator.network.connection.type == Connection.NONE){
		$("#home_network_button").text('No Internet Access')
								 .attr("data-icon", "delete")
								 .button('refresh');
        
	}

});


var track_id = '';      // Name/ID of the exercise
var watch_id = null;    // ID of the geolocation
var tracking_data = []; // Array containing GPS position objects

$("#startTracking_start").live('click', function(){
    
	// Start tracking the User
    watch_id = navigator.geolocation.watchPosition(
    
    	// Success
        function(position){
           
            tracking_data.push(position);
        },
        
        // Error
        function(error){
            console.log(error);
        },
        
        // Settings
        { frequency: 3000, enableHighAccuracy: true });
    
   // alert("watch id is" + watch_id);
    
    // Tidy up the UI
    track_id = $("#track_id").val();
    
    //alert(track_id);
    
    $("#track_id").hide();
    
    $("#startTracking_status").html("Tracking workout: <strong>" + track_id + "</strong>");
});


$("#startTracking_stop").live('click', function(){
   
	
	// Stop tracking the user
	navigator.geolocation.clearWatch(watch_id);
    
    //alert("tracking id is" + tracking_data);
	
	// Save the tracking data
	window.localStorage.setItem(track_id, JSON.stringify(tracking_data));
    
    alert("watch id is" + watch_id);
    
	// Reset watch_id and tracking_data 
   
   // if(watch_id !=null)  
	 watch_id = null;
    //if(tracking_data != null )
	 tracking_data = null;

	// Tidy up the UI
	$("#track_id").val("").show();
	
	$("#startTracking_status").html("Stopped tracking workout: <strong>" + track_id + "</strong>");
    
       // adding accelerometer functionaly to compute the nos of steps taken
    
    // navigator.accelerometer.getCurrentAcceleration(onSuccess, onError);

});

$("#home_clearstorage_button").live('click', function(){
	window.localStorage.clear();
});

$("#home_seedgps_button").live('click', function(){
	window.localStorage.setItem('Sample block', '[{"timestamp":1335700802000,"coords":{"heading":null,"altitude":null,"longitude":77.62391,"accuracy":0,"latitude":12.94398,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700803000,"coords":{"heading":null,"altitude":null,"longitude":77.62454,"accuracy":0,"latitude":12.94432,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700804000,"coords":{"heading":null,"altitude":null,"longitude":77.62529,"accuracy":0,"latitude":12.94474,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700805000,"coords":{"heading":null,"altitude":null,"longitude":77.62596,"accuracy":0,"latitude":12.94375,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700806000,"coords":{"heading":null,"altitude":null,"longitude":77.62560,"accuracy":0,"latitude":12.94353,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700807000,"coords":{"heading":null,"altitude":null,"longitude":77.62527,"accuracy":0,"latitude":12.94333,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700808000,"coords":{"heading":null,"altitude":null,"longitude":77.62454,"accuracy":0,"latitude":12.94296,"speed":null,"altitudeAccuracy":null}},{"timestamp":1335700809000,"coords":{"heading":null,"altitude":null,"longitude":77.62391,"accuracy":0,"latitude":12.94398,"speed":null,"altitudeAccuracy":null}}]');

});

// When the user views the history page
$('#history').live('pageshow', function () {
	
	// Count the number of entries in localStorage and display this information to the user
	tracks_recorded = window.localStorage.length;
	$("#tracks_recorded").html("<strong>" + tracks_recorded + "</strong> workout(s) recorded");
	
	// Empty the list of recorded tracks
	$("#history_tracklist").empty();
	
	// Iterate over all of the recorded tracks, populating the list
	for(i=0; i<tracks_recorded; i++){
		$("#history_tracklist").append("<li><a href='#track_info' data-ajax='false'>" + window.localStorage.key(i) + "</a></li>");
	}
	
	// Tell jQueryMobile to refresh the list
	$("#history_tracklist").listview('refresh');

});

// When the user clicks a link to view track info, set/change the track_id attribute on the track_info page.
$("#history_tracklist li a").live('click', function(){

	$("#track_info").attr("track_id", $(this).text());
	
});


// When the user views the Track Info page
$('#track_info').live('pageshow', function(){

	// Find the track_id of the workout they are viewing
	var key = $(this).attr("track_id");
    
    //alert(key);
	
	// Update the Track Info page header to the track_id
	$("#track_info div[data-role=header] h1").text(key);
	
	// Get all the GPS data for the specific workout
	var data = window.localStorage.getItem(key);
    
    //alert(data);
	
	// Turn the stringified GPS data back into a JS object
	data = JSON.parse(data);
    
       //alert(data);

	// Calculate the total distance travelled
	total_km = 0;

	for(i = 0; i < data.length; i++){
	    
	    if(i == (data.length - 1)){
	        break;
	    }
	    
	    total_km += gps_distance(data[i].coords.latitude, data[i].coords.longitude, data[i+1].coords.latitude, data[i+1].coords.longitude);
	}
	
	total_km_rounded = total_km.toFixed(2);
	
	// Calculate the total time taken for the track
	start_time = new Date(data[0].timestamp).getTime();
	end_time = new Date(data[data.length-1].timestamp).getTime();

	total_time_ms = end_time - start_time;
	total_time_s = total_time_ms / 1000;
	
	final_time_m = Math.floor(total_time_s / 60);
    
	final_time_s = Math.ceil(total_time_s - (final_time_m * 60)); // added ceil function
   
    // final_time_s = Math.round(total_time_s - (final_time_m * 60)).toFixed(2); // another option

	// Display total distance and time
	$("#track_info_info").html('Travelled <strong>' + total_km_rounded + '</strong> km in <strong>' + final_time_m + 'm</strong> and <strong>' + final_time_s + 's</strong>');
	
	   
    
    // Set the initial Lat and Long of the Google Map
	
    var myLatLng = new google.maps.LatLng(data[0].coords.latitude, data[0].coords.longitude);
    //var myLatLng = new google.maps.LatLng(12.936118600000000000, 77.605952000000000000);
    //var myLatLng = new google.maps.LatLng(0.0000, 0.0000);
    
    //alert(myLatLng);

	// Google Map options
	var myOptions = {
      zoom: 16,
      center: myLatLng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    // Create the Google Map, set options
    var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    
    //alert(map);

    var trackCoords = [];
    
    // Add each GPS entry to an array
    for(i=0; i<data.length; i++){
        
      
    	trackCoords.push(new google.maps.LatLng(data[i].coords.latitude, data[i].coords.longitude));
    }
    
    // Plot the GPS entries as a line on the Google Map
    var trackPath = new google.maps.Polyline({
      path: trackCoords,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    // Apply the line to the map
    trackPath.setMap(map);
   
		
});


/*
// adding accelerometer functionality

    function onSuccess(acceleration) {
        //alert('Acceleration X: ' + acceleration.x + '\n' +
              'Acceleration Y: ' + acceleration.y + '\n' +
              'Acceleration Z: ' + acceleration.z + '\n' +
              'Timestamp: '      + acceleration.timestamp + '\n');
        
            x= acceleration.x;
        	y= acceleration.y;
        	z= acceleration.z;
            acc_timestamp=acceleration.timestamp;
        
        //adding steps
        	
        stepcount=0;
       	 length = sqrt(x * x + y * y + z * z);
			if(length>=2){
   				stepcount+=1;
				}
        
        // Display total Steps
	$("#track_info_step").html('Travelled <strong>' + stepcount + '</strong> Steps  <strong>');
	
	
        
    }

    // onError: Failed to get the acceleration
    //
    function onError() {
        alert('onError!');
    }


*/




