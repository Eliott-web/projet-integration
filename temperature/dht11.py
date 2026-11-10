import adafruit_dht
import board
from time import sleep

dht_device = adafruit_dht.DHT11(board.D4, use_pulseio=False)

def read_temperature():
    try:
        temperature = dht_device.temperature
    except RuntimeError as error:
        print(f"Lecture de la température impossible : {error}")
        return None

    if temperature is None:
        print("Aucune température reçue du capteur.")
    return temperature


def read_humidity():
    try:
        humidity = dht_device.humidity
    except RuntimeError as error:
        print(f"Lecture de l'humidité impossible : {error}")
        return None

    if humidity is None:
        print("Aucune humidité reçue du capteur.")
    return humidity


def cleanup():
    dht_device.exit()

if __name__ == "__main__":
    try:
        while True:
            print(read_temperature())
            sleep(5)
    except KeyboardInterrupt:
        pass
    finally:
        cleanup()