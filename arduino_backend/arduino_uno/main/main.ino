// main file to handle server and main loop
// in server file we initialize setup() funcion with:
// sync_time, init of dht sensor, wifi server
#include "settings.h"
#include <DHT.h>
#include <SoftwareSerial.h>
#include <ArduinoJson.h>
#include <TimeLib.h> 

// DHT sensor
#define DHTTYPE DHT22     // DHT 22    (AM2302)
DHT dht1(DHT1PIN, DHTTYPE); // Initialize DHT sensor for normal 16mhz Arduino
DHT dht2(DHT2PIN, DHTTYPE);

// Port definition for NodeMCU-Uno communication
SoftwareSerial rxtx(RXPIN,TXPIN);

// define variable to store time, used instead of delay()
unsigned long previous_millis = 0; 
unsigned long previous_sent_timer = 0; // timer to count when we send data to MCU
unsigned long previous_dht_read = 0; // timer to count when we send data to MCU

float hum1, temp1, hum2, temp2;
float temp_measur_max, hum_measur_max, temp_measur_min, hum_measur_min;

void setup()
{
    Serial.begin(9600);
    dht1.begin();
    dht2.begin();
    rxtx.begin(9600);
}

//todo read time that is set for mcu

void loop(void) {    
    // get current system wake up time
    unsigned long current_millis = millis();

    //convert to seconds
    int time_in_s = (hour() * 60 * 60) + (minute() * 60) + second();
    Serial.println(time_in_s);
    
    // current limitation    that start time is always less than stop time 
    // start 16:00, stop 02:00 is not allowed
    if (light_manual_on == true || 
        (sunrise < time_in_s < sunset && light_manual_off != true)) {
            int a = 1; //turn_light_on();  // todo
    } else {
            int a = 1; //turn_light_off();
    }
    
    //Stores humidity and temperature value from DHT sensor, read values every 10s
    if (current_millis - previous_dht_read >= read_dht_every){
      previous_dht_read = current_millis;
      
      hum1, temp1, hum2, temp2 = get_dht_data();
      temp_measur_max = max(temp1, temp2);
      hum_measur_max = max(hum1, hum2);
      temp_measur_min = min(temp1, temp2);
      hum_measur_min = min(hum1, hum2);
      
      Serial.print("temperature:  ");
      Serial.println(temp2);
    }

    // todo need to read min max for temp and humid values from MCU
    if (current_millis - previous_millis >= enable_fan_every ||
        temp_measur_max > max_temp ||
        hum_measur_max > max_humid) {
            previous_millis = current_millis;
            //turn_fan_on();     
    }

    // after we enable fan we will give it to work at least 15 min to have system stability
    if (current_millis - previous_millis >= fan_on_time ||
        temp_measur_min < min_temp ||
        hum_measur_min < min_humid) {
        //turn_fan_off();
        int b = 4;
    }
    
    // send data only once per hour
    // todo maybe send every 10 min
    if (current_millis - previous_sent_timer >= send_data_every) {
        previous_sent_timer = current_millis;
        int moist1 = get_moisture(moisture_sens1_pin);
        send_to_mcu(hum1, temp1, hum2, temp2, moist1);       
    }
}

void send_to_mcu(float hum1, float temp1, float hum2, float temp2, int moist1) {
    // create JSON for sensor data
    StaticJsonDocument<200> conditions;
    conditions["hum1"] = hum1;
    conditions["temp1"] = temp1;
    conditions["moist1"] = moist1;
    
    // send data to NodeMCU
    serializeJsonPretty(conditions, rxtx);
    Serial.println("Data sent to MCU");
}

int get_moisture(const uint8_t port) {
    // definition of data for moisture sensor, collibrate analog data to RH
    // to defind port as argument need "const uint8_t" type

    int rh = (air - water)/100;

    float sensor_value = 0;

    // make 100 samples of data every 1ms
    for (int i = 0; i <= 100; i++) { 
        sensor_value += analogRead(port); 
        delay(1); 
    } 

    // get average value of data
    sensor_value  /= 100.0; 

    int moisture = round((air - sensor_value) / rh);

    // remove noisy values, cannot be less or greater than 0 and 100%
    if (moisture < 0) {
        moisture = 0;
    } else if (moisture > 100) {
        moisture = 100;
    }

    return moisture;
}

int get_dht_data(){

  float hum1 = 0, temp1 = 0, hum2 = 0, temp2 = 0;

  // make 100 samples of data every 1ms
  for (int i = 0; i <= 100; i++) { 
      hum1 += dht1.readHumidity();
      temp1 += dht1.readTemperature();
    
      hum2 += dht2.readHumidity();
      temp2 += dht2.readTemperature();
      delay(1); 
  } 

    // get average value of data
    hum1  /= 100.0; 
    temp1  /= 100.0; 
    hum2  /= 100.0; 
    temp2  /= 100.0; 
    
  return hum1, temp1, hum2, temp2;
}
