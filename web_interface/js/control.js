var min_temp, max_temp;
var min_humidity, max_humidity;
var sunrise, sunset;

// functions which are invoked on button click
$('#submit').click(function(e){
    e.preventDefault();

    min_temp = $('#min_temp').val();
    max_temp = $('#max_temp').val();
    min_humidity = $('#min_humidity').val();
    max_humidity = $('#max_humidity').val(); 
    sunrise = $('#sunrise').val();
    sunset = $('#sunset').val();

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
    if (sunrise == "" || sunrise < 0) {
        return alert("Sunrise cannot be empty or negative");
    }
    if (sunset == "" ||sunset < 0) {
        return alert("Sunset cannot be empty or negative");
    }
    // use post request instead of get to send data only once
    // see security advantages of POST method
    $.post('/save?min_temp=' + min_temp + 
        '&max_temp=' + max_temp + 
        '&min_humidity=' + min_humidity + 
        '&max_humidity=' + max_humidity + 
        '&sunrise=' + sunrise + 
        '&sunset=' + sunset, function(data){
                                    console.log(data);
                                });
});      

// called when auto/manual settings are switched
$('input[name="fan_options"]').change(function(e){
    console.log(e.currentTarget.attributes.id.nodeValue);
});  

$('input[name="light_options"]').change(function(e){
    console.log(e.currentTarget.attributes.id.nodeValue);
});  

// called to sync time
$('#sync_time').click(function(e){
    e.preventDefault();
    $.post('/sync_time');
    var content = get_file_content('Server_Time.txt');
    if (content != false) {
        alert(content);
    }
});      

// called to show current settings
$('#show_settings').click(function(e){
    e.preventDefault();
    var content = get_file_content('Control_Settings.txt');
    if (content != false) {
        alert(content);
    }
});  


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