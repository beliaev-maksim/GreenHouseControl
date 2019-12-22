// main file to handle server and main loop
// in server file we initialize setup() funcion with:
// sync_time, init of dht sensor, wifi server

#include <DHT.h>
#include <SoftwareSerial.h>
#include <ArduinoJson.h>
#include <time.h>

// DHT sensor
#define DHTPIN 7         // digital pin 7
#define DHTTYPE DHT22     // DHT 22    (AM2302)
DHT dht(DHTPIN, DHTTYPE); //// Initialize DHT sensor for normal 16mhz Arduino

// Port definition for NodeMCU-Uno communication
SoftwareSerial txrx23(2,3);

// define variable to store time, used instead of delay()
unsigned long previousMillis = 0; 
unsigned long previous_sent_timer = 0; // timer to count when we send data to MCU
const long send_data_every = 10000; // send data to MCU every 10s
const long enable_fan_every = 5400000; // 5400s->90min, needed to circulate air
const long fan_on_time = 900000; // fan will be ON during this time frame

int timer = 0;
int timer_off = 0;
int counter = 0;
bool triger = false;

// test data
int max_humid = 65;
int min_humid = 30;
int max_temp = 25;
int min_temp = 15;
int sunrise = 25200;
int sunset = 82800;

bool light_manual_off = false;
bool light_manual_on = false;

void setup()
{
    Serial.begin(9600);
    dht.begin();
    txrx23.begin(9600);
}

//todo read time that is set for mcu

void loop(void) {    
    // get current system time
    time_t now;
    struct tm * timeinfo;
    time(&now);
    timeinfo = localtime(&now);    
    Serial.println(timeinfo->tm_hour);

    //convert to seconds
    int time_in_s = (timeinfo->tm_hour * 60 * 60) + (timeinfo->tm_min * 60) + timeinfo->tm_sec;
    
    // current limitation    that start time is always less than stop time 
    // start 16:00, stop 02:00 is not allowed
    if (light_manual_on == true || 
        (sunrise < time_in_s < sunset && light_manual_off != true)) {
            int a = 1; //turn_light_on();  // todo
    } else {
            int a = 1; //turn_light_off();
    }
    
    //Stores humidity and temperature value from DHT sensor
    float hum = dht.readHumidity();
    float temp= dht.readTemperature();

    unsigned long current_millis = millis();
    // todo need to read min max for temp and humid values from MCU
    if (current_millis - previousMillis >= enable_fan_every ||
        temp > max_temp ||
        hum > max_humid) {
            previousMillis = current_millis;
            //turn_fan_on();     
    }

    // after we enable fan we will give it to work at least 15 min to have system stability
    if (current_millis - previousMillis >= fan_on_time ||
        temp < min_temp ||
        hum < min_humid) {
        //turn_fan_off();
        int b = 4;
    }
    
    // send data only once per hour
    // todo maybe send every 10 min
    if (current_millis - previous_sent_timer >= send_data_every) {
        previous_sent_timer = current_millis;
        int moist1 = get_moisture(A0); // read data from analog port A0
        send_to_mcu(hum, temp, moist1);       
    }
}

void send_to_mcu(float hum, float temp, int moist1) {
    // create JSON for sensor data
    StaticJsonDocument<200> conditions;
    conditions["hum1"] = hum;
    conditions["temp1"] = temp;
    conditions["moist1"] = moist1;
    
    // send data to NodeMCU
    serializeJsonPretty(conditions, txrx23);
    Serial.println("Data sent to MCU");
}

int get_moisture(const uint8_t port) {
    // definition of data for moisture sensor, collibrate analog data to RH
    // to defind port as argument need "const uint8_t" type
    int water = 1900;  // totally wet, sensor was in water
    int air = 3600;  // totally dry, sensor was in air
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
