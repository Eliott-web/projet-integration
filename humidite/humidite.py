import paho.mqtt.client as mqtt

from temperature import dht11


def publish_humidity(mqtt_client: mqtt.Client, topic: str) -> None:
    humidity = dht11.read_humidity()
    if humidity is not None:
        mqtt_client.publish(topic, f"{humidity:.1f}", qos=1)
        print(f"Humidité publiée : {humidity:.1f} %")
