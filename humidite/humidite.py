import time

import RPi.GPIO as GPIO
import dht11
import paho.mqtt.client as mqtt

BROKER = "localhost"
PORT = 1883
USERNAME = "fenetre"
PASSWORD = "1234"
TOPIC = "projet/serre/humidite"


def on_connect(client, userdata, flags, reason_code, properties):
    print(f"Connecté au broker MQTT (code {reason_code})")


mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
mqttc.username_pw_set(USERNAME, PASSWORD)
mqttc.on_connect = on_connect

try:
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)
    capteur = dht11.DHT11(pin=4)

    print("Connexion au broker MQTT")
    mqttc.connect(BROKER, PORT, 60)
    mqttc.loop_start()

    while True:
        resultat = capteur.read()

        if resultat.is_valid():
            humidite = resultat.humidity
            mqttc.publish(TOPIC, f"{humidite:.1f}", qos=1)
            print(f"Humidité publiée : {humidite:.1f} %")

        time.sleep(2)

except KeyboardInterrupt:
    print("\nProgramme arrêté.")

finally:
    mqttc.loop_stop()
    mqttc.disconnect()
    GPIO.cleanup()