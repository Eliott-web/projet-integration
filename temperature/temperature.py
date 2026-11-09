import RPi.GPIO as GPIO
import dht11
import time
import paho.mqtt.client as mqtt

# MQTT
BROKER = "localhost"
PORT = 1883
USERNAME = "fenetre"
PASSWORD = "1234"
TOPIC = "projet/serre/temperature"

def on_connect(client, userdata, flags, reason_code, properties):
    print(f"Connecttion avec code {reason_code}")
    client.subscribe(TOPIC)
    print("abonnement au topic reussi")

def on_message(client, userdata, msg):
    commande = msg.payload.decode("utf-8")
    print(commande)
    if commande == "read" :
        read_temperature()

    else :
        print("ERREUR pas la bonne commande")

def read_temperature():
    # Je désactive les messages d'erreur
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)

    capteur = dht11.DHT11(pin=4)


    try:
        resultat = capteur.read()

        if resultat.is_valid():
            print(f"Température : {resultat.temperature:.1f} °C")

    except KeyboardInterrupt:
        print("\nProgramme arrêté.")

    finally:
        GPIO.cleanup()

try:
    # client mqtt
    mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    mqttc.username_pw_set(USERNAME, PASSWORD)
    mqttc.on_connect = on_connect
    mqttc.on_message = on_message

    mqttc.connect(BROKER, PORT)
    mqttc.loop_forever()
except KeyboardInterrupt:
    mqttc.disconnect()
    GPIO.cleanup()
    GPIO.cleanup()
