data = get_file_content("/data/2019-06.txt");

data_array = data.split("\n");
temp1 = [];
humidity1 = [];
date_time = [];
for(var i in data_array) {
  if (i == 0) continue;
  time_point = data_array[i].split("\t");
  temp1.push(time_point[2]);
  humidity1.push(time_point[3]);
  date_time.push(time_point[0] + "\t" + time_point[1])
};

new Chart(document.getElementById("line-chart"), {
    type: 'line',
    data: {
      labels: date_time,
      datasets: [{ 
          data: temp1,
          label: "Sensor1",
          borderColor: "#3e95cd",
          fill: false
        }, { 
          data: temp1,
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

  new Chart(document.getElementById("line-chart2"), {
    type: 'line',
    data: {
      labels: date_time,
      datasets: [{ 
          data: humidity1,
          label: "Sensor1",
          borderColor: "#3e95cd",
          fill: false
        }, { 
          data: humidity1,
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