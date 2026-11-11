import RPi.GPIO as GPIO
import paho.mqtt.client as mqtt

# moteur
servoPIN = 18
p = None


def angle_to_percent(angle):
  start = 2.5
  end = 12.5
  ratio = (end - start) / 180

  return start + angle * ratio


def start():
  global p
  GPIO.setmode(GPIO.BCM)
  GPIO.setup(servoPIN, GPIO.OUT)
  p = GPIO.PWM(servoPIN, 50) # 50Hz -> 20ms
  p.start(angle_to_percent(100))


def stop():
  global p
  if p is not None:
    p.stop()
    p = None
  GPIO.cleanup()


def open():
  if p is None:
    raise RuntimeError("Le moteur n'est pas démarré")
  p.ChangeDutyCycle(angle_to_percent(180))


def close():
  if p is None:
    raise RuntimeError("Le moteur n'est pas démarré")
  p.ChangeDutyCycle(angle_to_percent(100))


# MQTT
BROKER = "localhost"
PORT = 1883
USERNAME = "fenetre"
PASSWORD = "1234"
TOPIC = "projet/serre/fenetre"


def on_connect(client, userdata, flags, reason_code, properties):
  print(f"Connecttion avec code {reason_code}")
  client.subscribe(TOPIC)
  print("abonnement au topic reussi")


def on_message(client, userdata, msg):
  commande = msg.payload.decode("utf-8")
  print(commande)
  if commande == "open":
    open()
  elif commande == "close":
    close()
  else:
    print("ERREUR pas la bonne commande")


def run():
  mqttc = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
  mqttc.username_pw_set(USERNAME, PASSWORD)
  mqttc.on_connect = on_connect
  mqttc.on_message = on_message

  try:
    start()
    print("connection au broker")
    mqttc.connect(BROKER, PORT, 60)
    mqttc.loop_forever()
  except KeyboardInterrupt:
    mqttc.disconnect()
    stop()


if __name__ == "__main__":
  run()
