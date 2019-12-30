int min_temp, max_temp;
int min_humidity, max_humidity;
String sunrise, sunset;
File settings_file;
File server_time_file;

uint8_t const O_READ = 0X01;
uint8_t const O_WRITE = 0X02;
uint8_t const O_APPEND = 0X04;
uint8_t const O_CREAT = 0X10;
uint8_t const O_TRUNC = 0X40;

void change_settings() {
  // function called when you click Set button on Control web page
  time_t now = time(nullptr);
  settings["generated_time"] = ctime(&now);
  settings["server_time"] = now;
  
  if (server.arg("min_temp")!= ""){
    Serial.println("min_temp: " + server.arg("min_temp"));
    settings["min_temp"] = server.arg("min_temp").toFloat();
  }
  
  if (server.arg("max_temp")!= ""){
    Serial.println("max_temp: " + server.arg("max_temp"));
    settings["max_temp"] = server.arg("max_temp").toFloat();
  }
  
  if (server.arg("min_humidity")!= ""){
    Serial.println("min_humidity: " + server.arg("min_humidity"));
    settings["min_humidity"] = server.arg("min_humidity").toFloat();
  }
  
  if (server.arg("max_humidity")!= ""){
    Serial.println("max_humidity: " + server.arg("max_humidity"));
    settings["max_humidity"] = server.arg("max_humidity").toFloat();
  }
  
  if (server.arg("sunrise_in_s")!= ""){
    Serial.println("sunrise_in_s: " + server.arg("sunrise_in_s"));
    settings["sunrise_in_s"] = server.arg("sunrise_in_s").toInt();
  }
  
  if (server.arg("sunset_in_s")!= ""){
    Serial.println("sunset_in_s: " + server.arg("sunset_in_s"));
    settings["sunset_in_s"] = server.arg("sunset_in_s").toInt();
  }

  if (server.arg("fan_mode")!= ""){
    Serial.println("fan_mode: " + server.arg("fan_mode"));
    settings["fan_mode"] = server.arg("fan_mode").toInt();
  }

  if (server.arg("light_mode")!= ""){
    Serial.println("light_mode: " + server.arg("light_mode"));
    settings["light_mode"] = server.arg("light_mode").toInt();
  }

  // write all new setting on SD card
  // open the file. note that only one file can be open at a time,
  // so you have to close this one before opening another.
  settings_file = SD.open("Control_Settings.txt", O_READ | O_WRITE | O_CREAT);
  
  // if the file opened okay, write to it:
  if (settings_file) {
    Serial.print("Writing to Control_Settings.txt...");
    serializeJsonPretty(settings, settings_file);
    settings_file.close();
    Serial.println("done.");
  } else {
    // if the file didn't open, print an error:
    Serial.println("error opening Control_Settings.txt");
  }

  // send data to arduino UNO
  serializeJsonPretty(settings, rxtx);
}


void sync_time() {
  // function to update the time on Arduino by button click and to popup message box on HTML page
  float time_zone = 2.0; // default time zone GMT+2
 
  if (server.arg("time_zone")!= ""){
    Serial.println("time_zone: " + server.arg("time_zone"));
    time_zone = server.arg("time_zone").toFloat();
  }
  
  // void configTime(int timezone, int daylightOffset_sec, const char* server1, const char* server2, const char* server3
  configTime( int(time_zone * 3600), 0, "0.de.pool.ntp.org", "1.de.pool.ntp.org");
  Serial.println("\nWaiting for time");
  while (!time(nullptr)) {
    Serial.print(".");
    delay(1000);
  }
  delay(1500);  // need delay to sync with server
  time_t now = time(nullptr);; 
  Serial.println(ctime(&now));
  Serial.println(now);

  server_time_file = SD.open("Server_Time.txt", O_READ | O_WRITE | O_CREAT);
  if (server_time_file) {
    server_time_file.print("Time on the server is: ");
    server_time_file.println(ctime(&now));
    server_time_file.close();
  }

  settings["server_time"] = now;
  // send data to arduino UNO
  serializeJsonPretty(settings, rxtx);
}
