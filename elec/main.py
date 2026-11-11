from gpiozero import Button
from signal import pause
#import pompe.pompe.py as pompe
import paho.mqtt.client as mqtt
import elec.fenetres.moteur as moteur
import elec.temperature.dht11 as dht11


# MQTT
BROKER = "localhost"
PORT = 1883
USERNAME = "fenetre"
PASSWORD = "1234"
TOPICF = "projet/serre/fenetre"
TOPICT_CMD = "projet/serre/temperature/cmd"
TOPICT = "projet/serre/temperature"
TOPICH_CMD = "projet/serre/humidite/cmd"
TOPICH = "projet/serre/humidite"

def on_connect(client, userdata, flags, reason_code, properties):
  print(f"Connexion avec code {reason_code}")
  client.subscribe(TOPICF)
  client.subscribe(TOPICT_CMD)
  client.subscribe(TOPICH_CMD)
  print("abonnement aux topics reussi")

def on_message(client, userdata, msg):
  commande = msg.payload.decode("utf-8")

  if msg.topic == TOPICF:
    if commande == "open":
      moteur.open()
    elif commande == "close":
      moteur.close()
    else:
      print("ERREUR pas la bonne commande")

  elif msg.topic == TOPICT_CMD and commande == "read":
    temperature = dht11.read_temperature()
    if temperature is not None:
      print(f"Temperature : {temperature:.1f} °C")
      client.publish(TOPICT, f"{temperature:.1f}", qos=1)
    else:
      print("erreur avec l'humidité")

  elif msg.topic == TOPICH_CMD and commande == "read":
    humidity = dht11.read_humidity()
    if humidity is not None:
      print(f"Humidité : {humidity:.1f} %")
      client.publish(TOPICH, f"{humidity:.1f}", qos=1)
    else:
      print("erreur avec l'humidité")

# client mqtt
mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
mqttc.username_pw_set(USERNAME, PASSWORD)
mqttc.on_connect = on_connect
mqttc.on_message = on_message

# boucle qui fait tourner le code
moteur.start()
dht11.start()
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
