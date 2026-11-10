import adafruit_dht
import board
import paho.mqtt.client as mqtt

TOPIC = "projet/serre/temperature"

dht_device = adafruit_dht.DHT11(board.D4)

def on_controller_tick(mqtt_client: mqtt.Client) -> None:
    try:
        temperature = dht_device.temperature
        if temperature is not None:
            mqtt_client.publish(TOPIC, f"{temperature:.1f}", qos=1)
            print(f"Température publiée : {temperature:.1f} °C")
    except RuntimeError:
        pass


def cleanup() -> None:
    dht_device.exit()
