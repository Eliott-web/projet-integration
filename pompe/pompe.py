from gpiozero import OutputDevice

pompe = OutputDevice(17)
pompe.on()
pompe.off()