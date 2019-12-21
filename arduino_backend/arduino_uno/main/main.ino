// main file to handle server and main loop
// in server file we initialize setup() funcion with:
// sync_time, init of dht sensor, wifi server

#include <DHT.h>
#include <SoftwareSerial.h>
#include <ArduinoJson.h>

// DHT sensor
#define DHTPIN 7         // digital pin 7
#define DHTTYPE DHT22     // DHT 22    (AM2302)
DHT dht(DHTPIN, DHTTYPE); //// Initialize DHT sensor for normal 16mhz Arduino

// Port definition for NodeMCU-Uno communication
SoftwareSerial txrx23(2,3);

int timer = 0;
int timer_off = 0;
int counter = 0;
bool triger = false;

void setup()
{
    Serial.begin(9600);
    dht.begin();
}

//todo read time that is set for mcu

void loop(void) {    
    // get current system time
    time_t now;
    struct tm * timeinfo;
    time(&now);
    timeinfo = localtime(&now);    
    Serial.println(timeinfo->tm_hour);
    
    int time_in_s = timeinfo->tm_hour * timeinfo->tm_min * timeinfo->tm_sec;
    
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
    
    // todo need to read min max values from MCU
    if (timer == 90 ||
        temp > max_temp ||
        hum > max_humid) {
            turn_fan_on();
            timer = 0;
            triger = true;
            timer_off = 0;            
    }
    
    if (triger == true) {
        timer_off++;
    }
    
    // after we enable fan we will give it to work at least 15 min to have system stability
    if (timer_off == 15) {
        turn_fan_off();
        timer_off = 0;
        triger = false;
        timer = 0;
    }
    
    // send data only once per hour
    // todo maybe send every 10 min
    //if (counter == 60) {
    if (counter == 6) {
        moist1 = get_moisture(A0) // read data from analog port A0
        counter = 0;
        send_to_mcu(hum, temp, moist1);       
    }
    delay(6000);
    //delay(60000); // wait 1 min  //todo check buffer size when communicate
}

void send_to_mcu(float hum, float temp, int moist1) {
    // create JSON for sensor data
    StaticJsonDocument<200> conditions;
    conditions["hum1"] = hum;
    conditions["temp1"] = temp;
    conditions["moist1"] = moist1;
    
    // send data to NodeMCU
    if(txrx23.available() == 0){
        serializeJsonPretty(conditions, txrx23);
        Serial.println("Data sent to MCU");
    } else {
        Serial.println("NodeMCU is unavailable");
    }
}

void get_moisture(const port) {
    // definition of data for moisture sensor, collibrate analog data to RH
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