#include <SoftwareSerial.h>
#include <ArduinoJson.h>
SoftwareSerial s(2,3);
 
void setup() {
s.begin(9600);
Serial.begin(9600);
}
 
void loop() {
 StaticJsonDocument<200> weather;
  weather["data1"] = 100;
  weather["data2"] = 200;
if(s.available()>0)
{
 serializeJsonPretty(weather, s);
 Serial.println("sent");
} else {
  Serial.println("NodeMCU is unavailable");
}
delay(1000);
}
