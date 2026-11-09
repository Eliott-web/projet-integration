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
