import adafruit_dht
import board
import paho.mqtt.client as mqtt

TOPIC = "projet/serre/humidite"

dht_device = adafruit_dht.DHT11(board.D4)

def on_controller_tick(mqtt_client: mqtt.Client) -> None:
    try:
        humidity = dht_device.humidity
        if humidity is not None:
            mqtt_client.publish(TOPIC, f"{humidity:.1f}", qos=1)
            print(f"Humidité publiée : {humidity:.1f} %")
    except RuntimeError:
        pass


def cleanup() -> None:
    dht_device.exit()
