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
  if (server.arg("min_temp")!= ""){
    Serial.println("min_temp: " + server.arg("min_temp"));
    min_temp = server.arg("min_temp").toInt();
  }
  
  if (server.arg("max_temp")!= ""){
    Serial.println("max_temp: " + server.arg("max_temp"));
    max_temp = server.arg("max_temp").toInt();
  }
  
  if (server.arg("min_humidity")!= ""){
    Serial.println("min_humidity: " + server.arg("min_humidity"));
    min_humidity = server.arg("min_humidity").toInt();
  }
  
  if (server.arg("max_humidity")!= ""){
    Serial.println("max_humidity: " + server.arg("max_humidity"));
    max_humidity = server.arg("max_humidity").toInt();
  }
  
  if (server.arg("sunrise")!= ""){
    Serial.println("sunrise: " + server.arg("sunrise"));
    sunrise = server.arg("sunrise");
  }
  
  if (server.arg("sunset")!= ""){
    Serial.println("sunset: " + server.arg("sunset"));
    sunset = server.arg("sunset");
  }

  // write all new setting on SD card
  // open the file. note that only one file can be open at a time,
  // so you have to close this one before opening another.
  settings_file = SD.open("Control_Settings.txt", O_READ | O_WRITE | O_CREAT);
  time_t now = time(nullptr);
  // if the file opened okay, write to it:
  if (settings_file) {
    Serial.print("Writing to Control_Settings.txt...");
    settings_file.print("Was generated: ");
    settings_file.println(ctime(&now));
    settings_file.println("min_temp: " + server.arg("min_temp"));
    settings_file.println("max_temp: " + server.arg("max_temp"));
    settings_file.println("min_humidity: " + server.arg("min_humidity"));
    settings_file.println("max_humidity: " + server.arg("max_humidity"));
    settings_file.println("sunrise: " + server.arg("sunrise"));
    settings_file.println("sunset: " + server.arg("sunset"));
    settings_file.close();
    Serial.println("done.");
  } else {
    // if the file didn't open, print an error:
    Serial.println("error opening Control_Settings.txt");
  }
}


void sync_time() {
  // function to update the time on Arduino by button click and to popup message box on HTML page
  WiFiClient client = server.client();
  // void configTime(int timezone, int daylightOffset_sec, const char* server1, const char* server2, const char* server3
  configTime(2 * 3600, 0, "0.de.pool.ntp.org", "1.de.pool.ntp.org");
  Serial.println("\nWaiting for time");
  while (!time(nullptr)) {
    Serial.print(".");
    delay(1000);
  }
  Serial.println("");
  time_t now; 
  Serial.println(ctime(&now));

  server_time_file = SD.open("Server_Time.txt", O_READ | O_WRITE | O_CREAT);
  if (server_time_file) {
    server_time_file.print("Time on the server is: ");
    server_time_file.println(ctime(&now));
    server_time_file.close();
  }
}
