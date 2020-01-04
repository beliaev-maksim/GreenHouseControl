// main file to handle server and main loop
// in server file we initialize setup() funcion with:
// getting server settings from MCU, init of dht and moisture sensor
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

// variable for server time in seconds
time_t server_time = 0; 

// define structure for data from  DHT sensors
typedef struct
 {
     float hum1, temp1, hum2, temp2;
     float temp_max, hum_max, temp_min, hum_min;
 }  dht_struct;
dht_struct dht_vals;  // initialize dht_values with just defined struct


void setup()
{
    Serial.begin(9600);
    dht1.begin();
    dht2.begin();
    rxtx.begin(9600);

    // relay
    pinMode(LIGHTPIN, OUTPUT);
    pinMode(FANPIN, OUTPUT);

    // init moisture sensors since first value is wrong
    get_moisture(moisture_sens1_pin);
    get_moisture(moisture_sens2_pin);
    get_moisture(moisture_sens3_pin);

    request_settings();
}

//todo read time that is set for mcu

void loop(void) {    
    // get system settings from NodeMCU
    // use of available to check if there is any data in buffer. DO NOT use it for sending info
    if (rxtx.available() > 0){
        read_json();
    }
    // get current system wake up time
    unsigned long current_millis = millis();

    //convert to seconds,do not forget to convert numbers to unsigned long
    unsigned long time_in_s = (unsigned long) 3600 * hour() + (unsigned long) 60 * minute() + second();     

    bool time_in_range = sunrise < time_in_s && time_in_s < sunset;
    if (light_mode == 1 || (light_mode == 2 && time_in_range)) {
        // auto mode or forced ON mode
        // current limitation    that start time is always less than stop time 
        // start 16:00, stop 02:00 is not allowed
        digitalWrite(LIGHTPIN, HIGH); 
    } else {
        digitalWrite(LIGHTPIN, LOW); 
    }
    
    //Stores humidity and temperature value from DHT sensor, read values every 10s
    if (current_millis - previous_dht_read >= read_dht_every){
        previous_dht_read = current_millis;
  
        dht_vals = get_dht_data();
    }

    // todo need to read min max for temp and humid values from MCU
    if (fan_mode == 2) {
        // auto mode
        if (current_millis - previous_millis >= enable_fan_every ||
            dht_vals.temp_max > max_temp ||
            dht_vals.hum_max > max_humid) {
            previous_millis = current_millis;
            digitalWrite(FANPIN, HIGH);     
        }
    
        // after we enable fan we will give it to work at least 15 min to have system stability
        if (current_millis - previous_millis >= fan_on_time ||
            dht_vals.temp_min < min_temp ||
            dht_vals.hum_min < min_humid) {
            digitalWrite(FANPIN, LOW); 
        }
    } else if (fan_mode == 1) {
        // ON mode
        digitalWrite(FANPIN, HIGH);  
    } else {
        digitalWrite(FANPIN, LOW); 
    }
    
    // send data only once per hour
    // todo maybe send every 10 min
    if (current_millis - previous_sent_timer >= send_data_every) {
        previous_sent_timer = current_millis;
        int moist1 = get_moisture(moisture_sens1_pin);
        delay(500); // need delay for proper work
        int moist2 = get_moisture(moisture_sens2_pin);
        delay(500);
        int moist3 = get_moisture(moisture_sens3_pin);
        
        send_to_mcu(dht_vals, moist1, moist2, moist3);       
    }
}

void send_to_mcu(dht_struct dht_vals, int moist1, int moist2, int moist3) {
    // create JSON for sensor data
    StaticJsonDocument<350> conditions;
    conditions["hum1"] = dht_vals.hum1;
    conditions["temp1"] = dht_vals.temp1;
    conditions["hum2"] = dht_vals.hum2;
    conditions["temp2"] = dht_vals.temp2;
    conditions["moist1"] = moist1;
    conditions["moist2"] = moist2;
    conditions["moist3"] = moist3;
    
    // send data to NodeMCU
    serializeJsonPretty(conditions, rxtx);
    Serial.println("Data sent to MCU");
}

void request_settings(){
    // function to request MCU to send settings, after reboot or power off
    delay(1000); // wait to initialize
    StaticJsonDocument<60> reqs;
    reqs["give_me"] = (int) 1;

    // send data to NodeMCU
    serializeJsonPretty(reqs, rxtx);
    Serial.println("Settings are requested from MCU");
}

int get_moisture(const uint8_t port) {
    // definition of data for moisture sensor, collibrate analog data to RH
    // to defind port as argument need "const uint8_t" type

    int air, water;
    if (port == moisture_sens1_pin){
        air = air1;
        water = water1;
    } else if (port == moisture_sens2_pin){
        air = air2;
        water = water2;
    } else if (port == moisture_sens3_pin){
        air = air3;
        water = water3;
    }

    int rh = (air - water)/100;

    float sensor_value = 0;

    // make 100 samples of data every 2ms
    for (int i = 0; i <= 100; i++) { 
        sensor_value += analogRead(port); 
        delay(2); 
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

dht_struct get_dht_data(){
    // function to calculate AVG from multiple measurments from two sensors
    // should be defined as dht_struct type to be assigned later to a dht_vals structure
    // dht sensors can read data once per 2s, not more
    
    // initialize new structure and all members as zeros
    dht_struct dht_vals = {0, 0, 0, 0, 0, 0, 0, 0};

    dht_vals.hum1 = dht1.readHumidity();
    dht_vals.temp1 = dht1.readTemperature();
  
    dht_vals.hum2 = dht2.readHumidity();
    dht_vals.temp2 = dht2.readTemperature();

    // sensor is showing less value compared to other 3 hygrometers. Add 13% to balance
    dht_vals.hum2 *= 1.13; 

    // evaluate min and max values
    dht_vals.temp_max = max(dht_vals.temp1, dht_vals.temp2);
    dht_vals.hum_max = max(dht_vals.hum1, dht_vals.hum2);
    dht_vals.temp_min = min(dht_vals.temp1, dht_vals.temp2);
    dht_vals.hum_min = min(dht_vals.hum1, dht_vals.hum2);
    
    return dht_vals;
}

void read_json() {
    StaticJsonDocument<300> json_doc;
    DeserializationError error = deserializeJson(json_doc, rxtx);
    if (!error){
        serializeJsonPretty(json_doc, Serial);
        Serial.println("JSON received and parsed");

        fan_mode = json_doc["fan_mode"];
        light_mode = json_doc["light_mode"];

        min_humid = json_doc["min_humidity"];
        max_humid = json_doc["max_humidity"];

        min_temp = json_doc["min_temp"];
        max_temp = json_doc["max_temp"];
        
        sunrise = json_doc["sunrise_in_s"];
        sunset = json_doc["sunset_in_s"];

        server_time = json_doc["server_time"];
        setTime(server_time);     
    } else {
        Serial.println("Error");
    }
}
