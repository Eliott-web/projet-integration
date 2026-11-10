from gpiozero import Button
from signal import pause
#import pompe.pompe.py as pompe
import paho.mqtt.client as mqtt
import humidite.humidite as humidite
import fenetres.moteur as moteur


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
moteur.start()
try:
  print("connection au broker")
  mqttc.connect(BROKER, PORT, 60)
  mqttc.loop_forever()

except KeyboardInterrupt:
  mqttc.disconnect()
  moteur.stop()

#bouton = Button(27, bounce_time=0.05)  # bounce_time : anti-rebond
#bouton.when_pressed = lambda: pompe.tourner(0)  # lambda sert à ajouter la variable à la fonction
#bouton.when_released = pompe.arreter

#try:
#    pause()
#finally:
#    pompe.arreter()   # sécurité : pompe à l'arrêt en quittant
