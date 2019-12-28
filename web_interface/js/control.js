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

var time_zone_dict = {
  "(GMT-12:00) International Date Line West": "-12",
  "(GMT-11:00) Midway Island, Samoa": "-11",
  "(GMT-10:00) Hawaii": "-10",
  "(GMT-09:00) Alaska": "-9",
  "(GMT-08:00) Pacific Time (US & Canada)": "-8",
  "(GMT-08:00) Tijuana, Baja California": "-8",
  "(GMT-07:00) Arizona": "-7",
  "(GMT-07:00) Chihuahua, La Paz, Mazatlan": "-7",
  "(GMT-07:00) Mountain Time (US & Canada)": "-7",
  "(GMT-06:00) Central America": "-6",
  "(GMT-06:00) Central Time (US & Canada)": "-6",
  "(GMT-05:00) Bogota, Lima, Quito, Rio Branco": "-5",
  "(GMT-05:00) Eastern Time (US & Canada)": "-5",
  "(GMT-05:00) Indiana (East)": "-5",
  "(GMT-04:00) Atlantic Time (Canada)": "-4",
  "(GMT-04:00) Caracas, La Paz": "-4",
  "(GMT-04:00) Manaus": "-4",
  "(GMT-04:00) Santiago": "-4",
  "(GMT-03:30) Newfoundland": "-3.5",
  "(GMT-03:00) Brasilia": "-3",
  "(GMT-03:00) Buenos Aires, Georgetown": "-3",
  "(GMT-03:00) Greenland": "-3",
  "(GMT-03:00) Montevideo": "-3",
  "(GMT-02:00) Mid-Atlantic": "-2",
  "(GMT-01:00) Cape Verde Is.": "-1",
  "(GMT-01:00) Azores": "-1",
  "(GMT+00:00) Casablanca, Monrovia, Reykjavik": "0",
  "(GMT+00:00) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London": "0",
  "(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna": "1",
  "(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague": "1",
  "(GMT+01:00) Brussels, Copenhagen, Madrid, Paris": "1",
  "(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb": "1",
  "(GMT+01:00) West Central Africa": "1",
  "(GMT+02:00) Amman": "2",
  "(GMT+02:00) Athens, Bucharest, Istanbul": "2",
  "(GMT+02:00) Beirut": "2",
  "(GMT+02:00) Cairo": "2",
  "(GMT+02:00) Harare, Pretoria": "2",
  "(GMT+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius": "2",
  "(GMT+02:00) Jerusalem": "2",
  "(GMT+02:00) Minsk": "2",
  "(GMT+02:00) Windhoek": "2",
  "(GMT+03:00) Kuwait, Riyadh, Baghdad": "3",
  "(GMT+03:00) Moscow, St. Petersburg, Volgograd": "3",
  "(GMT+03:00) Nairobi": "3",
  "(GMT+03:00) Tbilisi": "3",
  "(GMT+03:30) Tehran": "3.5",
  "(GMT+04:00) Abu Dhabi, Muscat": "4",
  "(GMT+04:00) Baku": "4",
  "(GMT+04:00) Yerevan": "4",
  "(GMT+04:30) Kabul": "4.5",
  "(GMT+05:00) Yekaterinburg": "5",
  "(GMT+05:00) Islamabad, Karachi, Tashkent": "5",
  "(GMT+05:30) Sri Jayawardenapura": "5.5",
  "(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi": "5.5",
  "(GMT+05:45) Kathmandu": "5.75",
  "(GMT+06:00) Almaty, Novosibirsk": "6","(GMT+06:00) Astana, Dhaka": "6",
  "(GMT+06:30) Yangon (Rangoon)": "6.5",
  "(GMT+07:00) Bangkok, Hanoi, Jakarta": "7",
  "(GMT+07:00) Krasnoyarsk": "7",
  "(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi": "8",
  "(GMT+08:00) Kuala Lumpur, Singapore": "8",
  "(GMT+08:00) Irkutsk, Ulaan Bataar": "8",
  "(GMT+08:00) Perth": "8",
  "(GMT+08:00) Taipei": "8",
  "(GMT+09:00) Osaka, Sapporo, Tokyo": "9",
  "(GMT+09:00) Seoul": "9",
  "(GMT+09:00) Yakutsk": "9",
  "(GMT+09:30) Adelaide": "9.5",
  "(GMT+09:30) Darwin": "9.5",
  "(GMT+10:00) Brisbane": "10",
  "(GMT+10:00) Canberra, Melbourne, Sydney": "10",
  "(GMT+10:00) Hobart": "10",
  "(GMT+10:00) Guam, Port Moresby": "10",
  "(GMT+10:00) Vladivostok": "10",
  "(GMT+11:00) Magadan, Solomon Is., New Caledonia": "11",
  "(GMT+12:00) Auckland, Wellington": "12",
  "(GMT+12:00) Fiji, Kamchatka, Marshall Is.": "12",
  "(GMT+13:00) Nuku'alofa": "13"
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
  set_selector();

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

function set_selector(){
  var str = "";
  for (var key in time_zone_dict){
    str += '<option value="' + time_zone_dict[key] + '">' + key + '</option>'
  } 

  selector = document.getElementById("time_zone_selector");
  selector.insertAdjacentHTML('beforeend', str);
}