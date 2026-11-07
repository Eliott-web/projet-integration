import RPi.GPIO as GPIO
import dht11
import time

# Je désactive les messages d'erreur
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)

capteur = dht11.DHT11(pin=4)


try:
    while True:
        resultat = capteur.read()

        if resultat.is_valid():
            print(f"Température : {resultat.temperature:.1f} °C")

        time.sleep(2)

except KeyboardInterrupt:
    print("\nProgramme arrêté.")

finally:
    GPIO.cleanup()