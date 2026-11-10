from pompe import arreter_pompe, tourner_pompe
from time import sleep

tourner_pompe(0,10)
print("tourner 0")
sleep(2)
tourner_pompe(0,5)
print("tourner 0")
sleep(2)
tourner_pompe(1,10)
print("tourner 1")
sleep(2)
tourner_pompe(1,5)
print("tourner 1")
sleep(2)
pompe.arreter()