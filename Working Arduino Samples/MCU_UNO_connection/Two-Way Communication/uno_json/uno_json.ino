#include <SoftwareSerial.h>
#include <ArduinoJson.h>
SoftwareSerial s(2,3);
 
void setup() {
s.begin(9600);
Serial.begin(9600);
}
 
void loop() {
 StaticJsonDocument<200> weather;
 StaticJsonDocument<200> json_doc;
 
  weather["data1"] = 99;
  weather["data2"] = 999;

DeserializationError error = deserializeJson(json_doc, s);
if (!error){
        serializeJsonPretty(json_doc, Serial);
        Serial.println("JSON received and parsed");
  } else {
    Serial.println("Error");
  }
  
if(s.available() == 0)
{
 serializeJsonPretty(weather, s);
 Serial.println("sent");
} else {
  Serial.println("NodeMCU is unavailable");
}
delay(1000);
}
