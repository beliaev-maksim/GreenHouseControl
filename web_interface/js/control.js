var min_temp, max_temp;
var min_humidity, max_humidity;
var sunrise, sunset;

var light_setting;
var fan_setting;

var fan_dict = {
  "fan_off": 0,
  "fan_on": 1,
  "fan_auto": 2
};

var light_dict ={
  "light_off": 0,
  "light_on": 1,
  "light_auto": 2
};

// functions which are invoked on "Set" button click
$('#submit').click(function(e){
    e.preventDefault();

    min_temp = $('#min_temp').val();
    max_temp = $('#max_temp').val();
    min_humidity = $('#min_humidity').val();
    max_humidity = $('#max_humidity').val(); 
    sunrise = $('#sunrise').val();
    sunset = $('#sunset').val();


    fan_setting = get_radio_value(fan_dict);
    light_setting = get_radio_value(light_dict);   

    if (fan_setting == "fan_auto") {
      // check settings only if Auto mode
      if (min_temp == "" || min_temp > max_temp || min_temp < 0) {
          return alert("Minimum temperature cannot be empty, negative or greater than Maximum temperature");
      }
      
      if (max_temp == "") {
          return alert("Maximum temperature cannot be empty");
      }
      
      if (min_humidity == "" || min_humidity > max_humidity || min_humidity < 0) {
          return alert("Minimum humidity cannot be empty, negative or greater than Maximum humidity");
      }
      
      if (max_humidity == "") {
          return alert("Maximum humidity cannot be empty");
      }
    }
    
    if (light_setting == "light_auto"){
      if (sunrise == "" || sunrise < 0) {
          return alert("Sunrise cannot be empty or negative");
      } else {
        sunrise = sunrise.split(":");
        var hour = parseInt(sunrise[0]);
        var minute = parseInt(sunrise[1]);
        var sunrise_in_s = hour * 60 * 60 + minute * 60;
      }
      
      if (sunset == "" ||sunset < 0) {
          return alert("Sunset cannot be empty or negative");
      } else {
        sunset = sunset.split(":");
        hour = parseInt(sunset[0]);
        minute = parseInt(sunset[1]);
        var sunset_in_s = hour * 60 * 60 + minute * 60;
      }
    }
    
    // use post request instead of get to send data only once
    // see security advantages of POST method
    $.post('/save?min_temp=' + min_temp + 
        '&max_temp=' + max_temp + 
        '&min_humidity=' + min_humidity + 
        '&max_humidity=' + max_humidity + 
        '&sunrise_in_s=' + sunrise_in_s + 
        '&sunset_in_s=' + sunset_in_s +
        '&fan_setting=' + fan_dict[fan_setting] +
        '&light_setting=' + light_dict[light_setting], function(data){
                                    console.log(data);
                                });
});      

// function to return ID of the radio button which is activated
function get_radio_value(element_dict) {
  for (var key in element_dict){
    var label_class = document.getElementById(key).parentElement.classList;
    if (label_class.value.includes("active")){
      return key;
    }
  } 
}

// called when auto/manual settings are switched
// may be uncommented if needed
// $('input[name="fan_options"]').change(function(e){
//     fan_setting = e.currentTarget.attributes.id.nodeValue;
// });  

// $('input[name="light_options"]').change(function(e){
//     light_setting = e.currentTarget.attributes.id.nodeValue;
// });  

// called to sync time
$('#sync_time').click(function(e){
    e.preventDefault();
    $.post('/sync_time');
    var content = get_file_content('Server_Time.txt');
    if (content != false) {
        
        result = content.match(/[^\r\n]+/g);
        alert(result[0]);
    }
});      

// specify a method to convert integer to time string
Number.prototype.toHHMMSS = function () {
    var sec_num = this;
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}

    return hours + ':' + minutes;
}

// called to prefill current settings
window.onload = function() {
    var content = get_file_content('Control_Settings.txt');
    if (content != false) {
        var settings = JSON.parse(content);
        $('#min_temp').val(settings.min_temp);
        $('#max_temp').val(settings.max_temp);
        
        $('#min_humidity').val(settings.min_humidity);
        $('#max_humidity').val(settings.max_humidity);
        
        $('#sunrise').val(settings.sunrise_in_s.toHHMMSS());

        $('#sunset').val(settings.sunset_in_s.toHHMMSS());
        
        // first unactivate default values  
        document.getElementById("fan_on").parentElement.classList.remove('active');
        document.getElementById("light_on").parentElement.classList.remove('active');
        
        var id;
        switch(settings.fan_setting){
          case 0: 
            id = 'fan_off';
            break;
          case 1: 
            id = 'fan_on';
            break;
          case 2: 
            id = 'fan_auto';
            break;
        }
        document.getElementById(id).parentElement.classList.add('active');
        
        switch(settings.light_setting){
          case 0: 
            id = 'light_off';
            break;
          case 1: 
            id = 'light_on';
            break;
          case 2: 
            id = 'light_auto';
            break;
        }
        document.getElementById(id).parentElement.classList.add('active');

    }
};


function get_file_content(file_name) {
    // following code serves to read data from file located on SD card
    // 1. create new XMLHttpRequest
    var xhr = new XMLHttpRequest();
    // 2. Configure: GET-request for file_name
    xhr.open('GET', file_name, false);
    // 3. Send this request
    xhr.send();
    // 4. If server reply is not 200 than we have some error
    if (xhr.status != 200) {
        // alert( + ': ' + xhr.statusText); // example: 404: Not Found
        return false;
    } else {
        return xhr.responseText;  // return content of a file
    }
}