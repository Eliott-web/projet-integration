from gpiozero import Button
from signal import pause
#import pompe.pompe.py as pompe
import RPi.GPIO as GPIO
import paho.mqtt.client as mqtt
import humidite.humidite as humidite

#moteur
servoPIN = 18
GPIO.setmode(GPIO.BCM)
GPIO.setup(servoPIN, GPIO.OUT)
p = GPIO.PWM(servoPIN, 50) # 50Hz -> 20ms

def angle_to_percent (angle) :
  start = 2.5
  end = 12.5
  ratio = (end - start)/180 #Calcul ratio from angle to percent

  angle_as_percent = angle * ratio

  return start + angle_as_percent

def open():
  p.ChangeDutyCycle(angle_to_percent(180))

def close():
  p.ChangeDutyCycle(angle_to_percent(100))


# MQTT
BROKER = "localhost"
PORT = 1883
USERNAME = "fenetre"
PASSWORD = "1234"
TOPICF = "projet/serre/fenetre"
TOPICT = "projet/serre/temperature"
TOPICH = "projet/serre/humidite"

def on_connect(client, userdata, flags, reason_code, properties):
  print(f"Connecttion avec code {reason_code}")
  client.subscribe(TOPICF)
  client.subscribe(TOPICT)
  client.subscribe(TOPICH)
  print("abonnement au topic reussi")

def on_message(client, userdata, msg):
  commande = msg.payload.decode("utf-8")

  if msg.topic == "projet/serre/fenetre" :
    if commande == "open" :
      open()

    elif commande == "close" :
      close()

    else :
      print("ERREUR pas la bonne commande")

  elif msg.topic == "projet/serre/temperature" :
    print("il y a pas encore de truc du coup je met ça sinon j'ai une erreur quand je lance le script")

  elif msg.topic == "projet/serre/humidite" :
    print("tkt")

  else :
    print("il existe pas ton topic, chef !")

# client mqtt
mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
mqttc.username_pw_set(USERNAME, PASSWORD)
mqttc.on_connect = on_connect
mqttc.on_message = on_message

# boucle qui fait tourner le code
p.start(angle_to_percent(100))
try:
  print("connection au broker")
  mqttc.connect(BROKER, PORT, 60)
  mqttc.loop_forever()

except KeyboardInterrupt:
  mqttc.disconnect()
  p.stop()
  GPIO.cleanup()

#bouton = Button(27, bounce_time=0.05)  # bounce_time : anti-rebond
#bouton.when_pressed = lambda: pompe.tourner(0)  # lambda sert à ajouter la variable à la fonction
#bouton.when_released = pompe.arreter

#try:
#    pause()
#finally:
#    pompe.arreter()   # sécurité : pompe à l'arrêt en quittant
