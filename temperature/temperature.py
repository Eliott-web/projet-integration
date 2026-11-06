import time
import board
import adafruit_dht

# J'ai initialisé mon capteur à la pin GPIO4
capteur = adafruit_dht.DHT11(board.D4, use_pulseio=False)

# Je récupère la température et je l'affiche
temperature = capteur.temperature
print(temperature)