from gpiozero import OutputDevice
from time import sleep

gpio_en = OutputDevice(22)

def allumer_pompe(temps):
    if temps <= 0:
        raise ValueError("temps doit être supérieur à 0")
    gpio_en.on()
    try:
        sleep(temps)
    finally:
        gpio_en.off()