// set PINs for sensors
#define DHT1PIN 6         // digital pin 6 for DHT sensor
#define DHT2PIN 7         // digital pin 7 for DHT sensor (red)

#define RXPIN 2         // rxPin: the pin on which to receive serial data 
#define TXPIN 3         // txPin: the pin on which to transmit serial data 

#define LIGHTPIN 10     // pin for relay, light
#define FANPIN 11       // pin for relay, fan

#define LEDPIN 12       // pin for LED, when moister < 10%

const uint8_t moisture_sens1_pin = A0; // set analog pin for moisture sensor (red)
const uint8_t moisture_sens2_pin = A1; // set analog pin for moisture sensor (white)
const uint8_t moisture_sens3_pin = A2; // set analog pin for moisture sensor (blue)

// define data that you got from callibration of moisture sensor
// for sensor red
int water1 = 2108;  // totally wet, sensor was in water
int air1 = 3750;  // totally dry, sensor was in air
// for sensor white
int water2 = 2193;  // totally wet, sensor was in water
int air2 = 3800;  // totally dry, sensor was in air
// for sensor blue
int water3 = 2055;  // totally wet, sensor was in water
int air3 = 3670;  // totally dry, sensor was in air

// time settings
const long send_data_every = 1200000; // send data to MCU every 20min
const long read_dht_every = 10000; // read data from DHT sensor every 10s, not less 2s!
const long enable_fan_every = 5400000; // 5400s->90min, needed to circulate air
const long fan_on_time = 900000; // fan will be ON during this time frame

// default values for system
float max_humid = 65.0;
float min_humid = 30.0;
float max_temp = 25.0;
float min_temp = 15.0;
unsigned long sunrise = 25200;
unsigned long sunset = 82800;

int light_mode = 2;
int fan_mode = 2;
