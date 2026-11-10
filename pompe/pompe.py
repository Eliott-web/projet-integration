from gpiozero import OutputDevice
from time import sleep

gpio_dir = OutputDevice(22)  # direction -> PmodHB5 J1 pin 1 (DIR)
gpio_en = OutputDevice(23)   # enable    -> PmodHB5 J1 pin 2 (EN)

def arreter_pompe():  # stoppe la pompe
    gpio_en.off()

def tourner_pompe(sens, temps):
    sens = int(bool(sens))
    if temps <= 0:
        raise ValueError("temps doit être supérieur à 0")
    # Inversion de sens : on s'assure que le moteur est arrêté depuis temps_mort
    if gpio_dir.value != sens:
        if gpio_en.value:
            arreter_pompe()
        sleep(1) # attente pour le changement de polarité

    gpio_dir.value = sens
    gpio_en.on()
    try:
        sleep(temps)
    finally:
        arreter_pompe()  # arrêt garanti