$("#date_selector").change(function(e){
  file_name = $("#date_selector").val();

  data = get_file_content("/stats/" + file_name + ".txt");

  data_array = data.split("\n");
  temp1 = [];
  humidity1 = [];
  temp2 = [];
  humidity2 = [];
  moisture1 = [];
  moisture2 = [];
  moisture3 = [];
  date_time = [];

  for(var i in data_array) {
    time_point = data_array[i].split("\t");
    if (time_point[0] == "Time") continue; //header
    date_time.push(time_point[0])
    temp1.push(time_point[2]);
    humidity1.push(time_point[1]);

    temp2.push(time_point[4]);
    humidity2.push(time_point[3]);

    moisture1.push(time_point[5]);
    moisture2.push(time_point[6]);
    moisture3.push(time_point[7]);   
  };

  new Chart(document.getElementById("temperature_chart"), {
      type: 'line',
      data: {
        labels: date_time,
        datasets: [{ 
            data: temp1,
            label: "Sensor1",
            borderColor: "#3e95cd",
            fill: false
          }, { 
            data: temp2,
            label: "Sensor2",
            borderColor: "#8e5ea2",
            fill: false
          }
        ]
      },
      options: {
        title: {
          display: true,
          text: 'Temperature'
        }
      }
    });

    new Chart(document.getElementById("humidity_chart"), {
      type: 'line',
      data: {
        labels: date_time,
        datasets: [{ 
            data: humidity1,
            label: "Sensor1",
            borderColor: "#3e95cd",
            fill: false
          }, { 
            data: humidity2,
            label: "Sensor2",
            borderColor: "#8e5ea2",
            fill: false
          }
        ]
      },
      options: {
        title: {
          display: true,
          text: 'Humidity'
        }
      }
    });

    new Chart(document.getElementById("moisture_chart"), {
      type: 'line',
      data: {
        labels: date_time,
        datasets: [{ 
            data: moisture1,
            label: "Sensor1",
            borderColor: "#3e95cd",
            fill: false
          }, { 
            data: moisture2,
            label: "Sensor2",
            borderColor: "#8e5ea2",
            fill: false
          }, { 
            data: moisture3,
            label: "Sensor3",
            borderColor: "#044715",
            fill: false
          }
        ]
      },
      options: {
        title: {
          display: true,
          text: 'Moisture'
        }
      }
    });
});   

window.onload = function() {
    // get the list of files and creates drop down
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            files = JSON.parse(xhr.responseText);
            set_selector(files);
        };
    };
    xhr.open("GET", "/list?dir=/stats", true);
    xhr.send();
}


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

// set drop down menu with files in stats folder
function set_selector(files){
  var str = "";

  for (i in files){
    if (files[i].type == "file") {
      name = files[i].name.slice(0, -4);
      str += '<option value="' + name + '">' + name + '</option>';
    }
  }

  selector = document.getElementById("date_selector");
  selector.insertAdjacentHTML('beforeend', str);
  $("#date_selector").val("");
}