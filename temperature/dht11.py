import threading
import adafruit_dht
import board
from time import sleep, monotonic

dht_device = adafruit_dht.DHT11(board.D4)

_lock = threading.Lock()
_data = {"temperature": None, "humidity": None, "time": 0.0}
_stop = threading.Event()
MAX_AGE = 30  # secondes : au-delà, la valeur est considérée périmée

_ok = 0
_fail = 0


def _loop():
    global _ok, _fail
    while not _stop.is_set():
        try:
            t = dht_device.temperature
            h = dht_device.humidity
            if t is not None and h is not None:
                with _lock:
                    _data["temperature"] = t
                    _data["humidity"] = h
                    _data["time"] = monotonic()
                _ok += 1
            else:
                _fail += 1
        except RuntimeError:
            _fail += 1  # erreur normale du DHT, on réessaie
        _stop.wait(2.0)


def start():
    threading.Thread(target=_loop, daemon=True).start()


def _get(key):
    with _lock:
        if monotonic() - _data["time"] > MAX_AGE:
            return None
        return _data[key]


def read_temperature():
    return _get("temperature")


def read_humidity():
    return _get("humidity")


def stats():
    total = _ok + _fail
    return f"{_ok}/{total} lectures réussies" if total else "aucune lecture"


def cleanup():
    _stop.set()
    dht_device.exit()


if __name__ == "__main__":
    start()
    try:
        while True:
            sleep(5)
            print(read_temperature(), read_humidity(), "|", stats())
    except KeyboardInterrupt:
        pass
    finally:
        cleanup()
