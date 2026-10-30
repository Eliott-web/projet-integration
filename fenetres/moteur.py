import RPi.GPIO as GPIO
import paho.mqtt.client as mqtt

# moteur
servoPIN = 18
GPIO.setmode(GPIO.BCM)
GPIO.setup(servoPIN, GPIO.OUT)

p = GPIO.PWM(servoPIN, 50) # 50Hz -> 20ms
p.start(5) # on met le moteur a 90°

def open():
  p.ChangeDutyCycle(12.5)

def close():
  p.ChangeDutyCycle(7.5)

# MQTT
BROKER = "localhost"
PORT = 1883
USERNAME = "fenetre"
PASSWORD = "1234"
TOPIC = "projet/serre/fenetre"

def on_connect(client, userdata, flags, reason_code, properties):
  print(f"Connecttion avec code {reason_code}")
  client.subscribe(TOPIC)
  print("abonnement au topic reussi")

def on_message(client, userdata, msg):
  commande = msg.payload.decode("utf-8")
  print(commande)
  if commande == "open" :
    open()

  elif commande == "close" :
    close()

  else :
    print("ERREUR pas la bonne commande")

# client mqtt
mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
mqttc.username_pw_set(USERNAME, PASSWORD)
mqttc.on_connect = on_connect
mqttc.on_message = on_message

# code
try:
  print("connection au broker")
  mqttc.connect(BROKER, PORT, 60)
  mqttc.loop_forever()

except KeyboardInterrupt:
  mqttc.disconnect()
  p.stop()
  GPIO.cleanup()
