int min_temp, max_temp;
int min_humidity, max_humidity;
String sunrise, sunset;

File settings_file;
File server_time_file;
File stats_file;

int stats_line_counter = 0;

uint8_t const O_READ = 0X01;
uint8_t const O_WRITE = 0X02;
uint8_t const O_APPEND = 0X04;
uint8_t const O_CREAT = 0X10;
uint8_t const O_TRUNC = 0X40;

void change_settings() {
  // function called when you click Set button on Control web page
  for (int i = 0; i < server.args(); i++) { 
    String arg_name = server.argName(i);
    if (arg_name == "min_temp" ||
          arg_name == "max_temp" ||
          arg_name == "min_humidity" ||
          arg_name == "max_humidity" ||
          arg_name == "water_day_duration" ||
          arg_name == "water_day_pause" ||
          arg_name == "water_night_duration" ||
          arg_name == "water_night_pause"
          ){
      settings[arg_name] = server.arg(arg_name).toFloat();
    } else {
      settings[arg_name] = server.arg(arg_name).toInt();
    }
  } 
  sync_time();

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
}

void sync_time() {
  // function to update the time on Arduino by button click and to popup message box on HTML page  
  if (server.arg("time_zone")!= ""){
    Serial.println("time_zone: " + server.arg("time_zone"));
    settings["time_zone"] = server.arg("time_zone").toFloat();
  }
  
  // void configTime(int timezone, int daylightOffset_sec, const char* server1, const char* server2, const char* server3
  configTime(int(settings["time_zone"].as<float>() * 3600), 0, "0.de.pool.ntp.org", "1.de.pool.ntp.org");
  while (!time(nullptr)) {
    Serial.print(".");
    delay(1000);
  }
  delay(1500);  // need delay to sync with server
  time_t now = time(nullptr);

  if (server.arg("time_zone")!= ""){
      String output = "Time on the server is: " + String(ctime(&now));
      server.sendContent(output);
  }
  
  settings["server_time"] = now;
  // send data to arduino UNO
  serializeJsonPretty(settings, rxtx);
}

int read_json() {
  // function to create file with stats
  StaticJsonDocument<350> json_doc; 
  
  String file_name = "stats/" + get_date();
  String current_hour = get_time();
  String header_line = "Time\tHumidity1\tTemperature1\tHumidity2\tTemperature2\tMoisture1\tMoisture2\tMoisture3";
  
  DeserializationError error = deserializeJson(json_doc, rxtx);
  if (error){
      Serial.println("Error in JSON data received from Uno");
      return 0;
  }

  if (json_doc["give_me"] == 1){
    Serial.println("Uno requested settings");
    sync_time();
    return 1;
  }
  
  if (SD.exists(file_name)){
    stats_file = SD.open(file_name, O_READ | O_APPEND | O_WRITE);
  } else {
    stats_file = SD.open(file_name, O_READ | O_WRITE | O_CREAT);
    stats_file.println(header_line);
    stats_line_counter = 0;
  }
  
  if (!stats_file) {
    return 0;
  }
  if (stats_line_counter > 9) {
    // write a file about columns every 10 lines
    stats_file.print("Time\tHumidity1\tTemperature1\tHumidity2\tTemperature2");
    stats_file.println("\tMoisture1\tMoisture2\tMoisture3");
    stats_line_counter = 0;
  }
  
  stats_file.print(current_hour);
  stats_file.print(json_doc["hum1"].as<float>());  // explicitely specify JSON type to avoid overload issue
  stats_file.print("\t");
  stats_file.print(json_doc["temp1"].as<float>());
  stats_file.print("\t");
  stats_file.print(json_doc["hum2"].as<float>());
  stats_file.print("\t");
  stats_file.print(json_doc["temp2"].as<float>());
  stats_file.print("\t");
  stats_file.print(json_doc["moist1"].as<int>());
  stats_file.print("\t");
  stats_file.print(json_doc["moist2"].as<int>());
  stats_file.print("\t");
  stats_file.println(json_doc["moist3"].as<int>());
  
  stats_file.close();

  stats_line_counter++;
}

String get_date(){
  // return file name  that has format 2020-01-09.txt
  String month_part, day_part;
  time_t now = time(nullptr);
  struct tm * timeinfo;
  timeinfo = localtime(&now);

  if (timeinfo->tm_mon < 9) {
    //months since January
    month_part = "-0" + String(timeinfo->tm_mon + 1) + "-";
  } else {
    month_part = "-" + String(timeinfo->tm_mon + 1) + "-";
  }

  if (timeinfo->tm_mday < 10) {
    day_part = "0" + String(timeinfo->tm_mday);
  } else {
    day_part = String(timeinfo->tm_mday);
  }

  // years since 1900
  String file_name = String(timeinfo->tm_year + 1900) + month_part + day_part + ".txt";
  return file_name;
}

String get_time(){
  // return hour+min in format "02:09\t"
  String hour_part, min_part;
  time_t now = time(nullptr);
  struct tm * timeinfo;
  timeinfo = localtime(&now);

  if (timeinfo->tm_hour < 10) {
    hour_part = "0" + String(timeinfo->tm_hour);
  } else {
    hour_part = String(timeinfo->tm_hour);
  }

  if (timeinfo->tm_min < 10) {
    min_part = "0" + String(timeinfo->tm_min);
  } else {
    min_part = String(timeinfo->tm_min);
  }

  return hour_part + ":" + min_part + "\t";
}

void read_settings(){
  // read settings from JSON file with saved config
  if (SD.exists("Control_Settings.txt")){
    settings_file = SD.open("Control_Settings.txt", O_READ);
    DeserializationError error = deserializeJson(settings, settings_file);
  } else {
    settings["time_zone"] = 2.0; // default zone GMT+2
  }
}
