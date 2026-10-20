from gpiozero import OutputDevice
from time import sleep

pompe = OutputDevice(17)

def pompeOn():
    pompe.on()
def pompeOff():
    pompe.off()

pompeOn()
sleep(5)
pompeOff()