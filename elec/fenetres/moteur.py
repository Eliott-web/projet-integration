import RPi.GPIO as GPIO
import paho.mqtt.client as mqtt

# moteurs : (pin, angle_open, angle_close)
SERVOS = [
  (18, 180, 100),
  (12, 0, 80),    # angles inversés par rapport au moteur 18
]
pwms = []

def angle_to_percent(angle):
  start = 2.5
  end = 12.5
  ratio = (end - start) / 180
  return start + angle * ratio

def start():
  GPIO.setmode(GPIO.BCM)
  for pin, angle_open, angle_close in SERVOS:
    GPIO.setup(pin, GPIO.OUT)
    p = GPIO.PWM(pin, 50)  # 50Hz -> 20ms
    p.start(angle_to_percent(angle_close))
    pwms.append(p)

def stop():
  for p in pwms:
    p.stop()
  pwms.clear()
  GPIO.cleanup()

def open():
  if not pwms:
    raise RuntimeError("Les moteurs ne sont pas démarrés")
  for p, (pin, angle_open, angle_close) in zip(pwms, SERVOS):
    p.ChangeDutyCycle(angle_to_percent(angle_open))

def close():
  if not pwms:
    raise RuntimeError("Les moteurs ne sont pas démarrés")
  for p, (pin, angle_open, angle_close) in zip(pwms, SERVOS):
    p.ChangeDutyCycle(angle_to_percent(angle_close))

# MQTT
BROKER = "localhost"
PORT = 1883
USERNAME = "fenetre"
PASSWORD = "1234"
TOPIC = "projet/serre/fenetre"

def on_connect(client, userdata, flags, reason_code, properties):
  print(f"Connexion avec code {reason_code}")
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
