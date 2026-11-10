from gpiozero import Button
from signal import pause
#import pompe.pompe.py as pompe
import paho.mqtt.client as mqtt
import fenetres.moteur as moteur
import humidite.humidite as humidite
import temperature.dht11 as dht11


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
      moteur.open()

    elif commande == "close" :
      moteur.close()

    else :
      print("ERREUR pas la bonne commande")

  elif msg.topic == "projet/serre/temperature" :
    if commande == "read":
      temperature = dht11.read_temperature()
      if temperature is not None:
        client.publish(TOPICT, f"{temperature:.1f}", qos=1)

  elif msg.topic == "projet/serre/humidite" :
    if commande == "read":
      humidite.publish_humidity(client, TOPICH)

  else :
    print("il existe pas ton topic, chef !")

# client mqtt
mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
mqttc.username_pw_set(USERNAME, PASSWORD)
mqttc.on_connect = on_connect
mqttc.on_message = on_message

# boucle qui fait tourner le code
moteur.start()
try:
  print("connection au broker")
  mqttc.connect(BROKER, PORT, 60)
  mqttc.loop_forever()

except KeyboardInterrupt:
  mqttc.disconnect()
  moteur.stop()
  dht11.cleanup()

#bouton = Button(27, bounce_time=0.05)  # bounce_time : anti-rebond
#bouton.when_pressed = lambda: pompe.tourner(0)  # lambda sert à ajouter la variable à la fonction
#bouton.when_released = pompe.arreter

#try:
#    pause()
#finally:
#    pompe.arreter()   # sécurité : pompe à l'arrêt en quittant
