import time
import board
import adafruit_dht
import logging
import threading


dht_device = adafruit_dht.DHT11(board.D4)

def lire_humidite():
    try:
        humidity = dht_device.humidity

        if humidity is not None:
            print("Humidité :", humidity, "%")

    except RuntimeError:
        pass

    # Rappelle la fonction après 3 secondes
    threading.Timer(3, lire_humidite).start()


# Premier appel
lire_humidite()

import adafruit_dht
import board
import paho.mqtt.client as mqtt

BROKER = "localhost"
PORT = 1883
USERNAME = "fenetre"
PASSWORD = "1234"
TOPIC = "projet/serre/humidite"


def on_connect(client, userdata, flags, reason_code, properties):
    print(f"Connecté au broker MQTT (code {reason_code})")


dht_device = adafruit_dht.DHT11(board.D4)
mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
mqttc.username_pw_set(USERNAME, PASSWORD)
mqttc.on_connect = on_connect

try:
    print("Connexion au broker MQTT")
    mqttc.connect(BROKER, PORT, 60)
    mqttc.loop_start()

    while True:
        try:
            humidite = dht_device.humidity
            if humidite is not None:
                mqttc.publish(TOPIC, f"{humidite:.1f}", qos=1)
                print(f"Humidité publiée : {humidite:.1f} %")
        except RuntimeError:
            pass

        time.sleep(3)

except KeyboardInterrupt:
    print("\nProgramme arrêté.")

finally:
    mqttc.loop_stop()
    mqttc.disconnect()
    dht_device.exit()
