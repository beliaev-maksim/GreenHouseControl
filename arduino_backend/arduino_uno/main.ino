// main file to handle server and main loop
// in server file we initialize setup() funcion with:
// sync_time, init of dht sensor, wifi server

#include <DHT.h>

//Constants
#define DHTPIN 7     // what pin we're connected to
#define DHTTYPE DHT22   // DHT 22  (AM2302)
DHT dht(DHTPIN, DHTTYPE); //// Initialize DHT sensor for normal 16mhz Arduino

int chk;
float hum;  //Stores humidity value
float temp; //Stores temperature value

int timer_on = 0;
int timer_off = 0;
counter = 0;

void loop(void) {
  server.handleClient();
  MDNS.update();
  
  // get current system time
  time_t now;
  struct tm * timeinfo;
  time(&now);
  timeinfo = localtime(&now);  
  Serial.println(timeinfo->tm_hour);
  
  int time_in_s = timeinfo->tm_hour * timeinfo->tm_min * timeinfo->tm_sec;
  
  // current limitation  that start time is always less than stop time 
  // start 16:00, stop 02:00 is not allowed
  if (light_manual_on == true || 
      (sunrise < time_in_s < sunset && light_manual_off != true)) {
      turn_light_on()
  } else {
      turn_light_off()
  }
  
  hum = dht.readHumidity();
  temp= dht.readTemperature();
  
}
