import RPi.GPIO as GPIO
from time import sleep

servoPIN = 18
GPIO.setmode(GPIO.BCM)
GPIO.setup(servoPIN, GPIO.OUT)

p = GPIO.PWM(servoPIN, 50) # GPIO 17 for PWM with 50Hz
p.start(12) # Initialization

def open():
  p.ChangeDutyCycle(6)
  sleep(1)

def close():
  p.ChangeDutyCycle(12)
  sleep(1)

open()
close()
