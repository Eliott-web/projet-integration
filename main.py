from gpiozero import Button
from signal import pause
import pompe.pompe.py as pompe

bouton = Button(27, bounce_time=0.05)  # bounce_time : anti-rebond
bouton.when_pressed = lambda: pompe.tourner(0)  # lambda sert à ajouter la variable à la fonction
bouton.when_released = pompe.arreter

try:
    pause()
finally:
    pompe.arreter()   # sécurité : pompe à l'arrêt en quittant