from gpiozero import OutputDevice
from time import sleep

gpio_dir = OutputDevice(17)  # direction
gpio_en = OutputDevice(18)   # enable (marche/arrêt)

temps_mort = 0.5        # temps mort (s) avant de changer de sens


def arreter(): # stoppe la pompe
    gpio_en.off()

def tourner(sens): # sens : 0 ou 1.
    # Si la pompe tourne déjà dans l'autre sens, temps_mort avant d'inverser
    if gpio_en.value and gpio_dir.value != sens:
        arreter()
        sleep(temps_mort)

    gpio_dir.value = sens
    gpio_en.on()