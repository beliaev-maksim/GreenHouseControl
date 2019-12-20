#include <SoftwareSerial.h>
#include <ArduinoJson.h>

//SoftwareSerial(rxPin, txPin, inverse_logic)
//rxPin: the pin on which to receive serial data
//txPin: the pin on which to transmit serial data 
SoftwareSerial s(D1, D0);
int data;
void setup() {
s.begin(9600);
Serial.begin(9600);
}
 
void loop() {
   StaticJsonDocument<350> json_doc;
  DeserializationError error = deserializeJson(json_doc, s);
  if (!error){
        serializeJsonPretty(json_doc, Serial);
        Serial.println("JSON received and parsed");
  } else {
    Serial.println("Error");
  }
}
