import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../header/header";
import style from "./dashboard.module.css";

type SensorReading = {
    value: number;
    receivedAt: string;
};

type SensorState = "loading" | "online" | "waiting" | "offline" | "unavailable";
type WindowCommand = "open" | "close";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? `http://${window.location.hostname}:3000`;

async function fetchSensorReading(
    endpoint: string,
    maxValue: number,
): Promise<{ reading: SensorReading | null; state: SensorState }> {
    try {
        const response = await fetch(`${apiBaseUrl}${endpoint}`, {
            headers: { Accept: "application/json" },
        });

        if (response.status === 503) return { reading: null, state: "waiting" };
        if (response.status === 404) return { reading: null, state: "unavailable" };
        if (!response.ok) return { reading: null, state: "offline" };

        const payload: unknown = await response.json();
        if (typeof payload !== "object" || payload === null) {
            return { reading: null, state: "offline" };
        }

        const value = (payload as { value?: unknown }).value;
        const receivedAt = (payload as { receivedAt?: unknown }).receivedAt;
        if (
            typeof value !== "number" ||
            !Number.isFinite(value) ||
            value < 0 ||
            value > maxValue ||
            typeof receivedAt !== "string" ||
            Number.isNaN(new Date(receivedAt).getTime())
        ) {
            return { reading: null, state: "offline" };
        }

        return { reading: { value, receivedAt }, state: "online" };
    } catch {
        return { reading: null, state: "offline" };
    }
}

function formatTime(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Heure inconnue";

    return new Intl.DateTimeFormat("fr-BE", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function Dashboard() {
    const [humidity, setHumidity] = useState<SensorReading | null>(null);
    const [humidityState, setHumidityState] = useState<SensorState>("loading");
    const [temperature, setTemperature] = useState<SensorReading | null>(null);
    const [temperatureState, setTemperatureState] = useState<SensorState>("loading");
    const [windowCommand, setWindowCommand] = useState<WindowCommand>("close");
    const [brokerConnected, setBrokerConnected] = useState(false);
    const [currentTime, setCurrentTime] = useState(() => new Date());

    useEffect(() => {
        let active = true;

        const refreshReadings = async () => {
            const [humidityResult, temperatureResult] = await Promise.all([
                fetchSensorReading("/api/humidite", 100),
                fetchSensorReading("/api/temperature", 50),
            ]);

            if (!active) return;
            if (humidityResult.reading) setHumidity(humidityResult.reading);
            if (temperatureResult.reading) setTemperature(temperatureResult.reading);
            setHumidityState(humidityResult.state);
            setTemperatureState(temperatureResult.state);
        };

        const refreshWindowCommand = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/api/fenetre`, {
                    headers: { Accept: "application/json" },
                });
                if (!response.ok) {
                    if (active) setBrokerConnected(false);
                    return;
                }

                const payload: unknown = await response.json();
                if (
                    typeof payload !== "object" ||
                    payload === null ||
                    !("lastCommand" in payload) ||
                    !("brokerConnected" in payload) ||
                    typeof payload.brokerConnected !== "boolean"
                ) {
                    if (active) setBrokerConnected(false);
                    return;
                }
                if (active) setBrokerConnected(payload.brokerConnected);

                const lastCommand = payload.lastCommand;
                if (lastCommand === null) {
                    if (active) setWindowCommand("close");
                } else if (
                    typeof lastCommand === "object" &&
                    lastCommand !== null &&
                    "command" in lastCommand &&
                    (lastCommand.command === "open" || lastCommand.command === "close")
                ) {
                    if (active) setWindowCommand(lastCommand.command);
                }
            } catch (error) {
                console.error("Impossible de récupérer la dernière commande de la fenêtre :", error);
                if (active) setBrokerConnected(false);
            }
        };

        void refreshReadings();
        void refreshWindowCommand();
        const intervalId = window.setInterval(() => void refreshReadings(), 5000);
        const windowIntervalId = window.setInterval(() => void refreshWindowCommand(), 5000);

        return () => {
            active = false;
            window.clearInterval(intervalId);
            window.clearInterval(windowIntervalId);
        };
    }, []);

    useEffect(() => {
        const clockIntervalId = window.setInterval(() => setCurrentTime(new Date()), 1000);
        return () => window.clearInterval(clockIntervalId);
    }, []);

    const sensorStatus: Record<SensorState, string> = {
        loading: "Connexion...",
        online: "Capteur actif",
        waiting: "En attente d'une mesure",
        offline: "Serveur indisponible",
        unavailable: "Endpoint non disponible",
    };

    const sensorStatusClass: Record<SensorState, string> = {
        loading: style.pillWaiting,
        online: style.pillOnline,
        waiting: style.pillWaiting,
        offline: style.pillOffline,
        unavailable: style.pillUnavailable,
    };
    const connectedSensors = Number(humidityState === "online") + Number(temperatureState === "online");

    return (
        <div className={style.page}>
            <div className={style.shell}>
                <Header />
                <div className={style.clock}>
                    <time dateTime={currentTime.toISOString()}>
                        {new Intl.DateTimeFormat("fr-BE", {
                            hour: "2-digit",
                            minute: "2-digit"
                        }).format(currentTime)}
                    </time>
                </div>

                <main>
                    <section className={style.heading}>
                        <div>
                            <p className={style.eyebrow}>ESPACE DE CULTURE / TABLEAU DE BORD</p>
                            <h1>Vue d'ensemble</h1>
                            <p className={style.subtitle}>
                                Les conditions de la serre en un coup d'œil.
                            </p>
                        </div>
                        <div className={style.headingActions}>
                            <Link className={style.notificationButton} to="/notification" aria-label="Ouvrir les notifications" title="Notifications">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                                    <path d="M10 21h4" />
                                </svg>
                            </Link>
                            <div className={style.updateBadge}>
                                <span
                                    className={`${style.statusDot} ${
                                        humidityState === "online"
                                            ? style.isOnline
                                            : humidityState === "offline"
                                              ? style.isOffline
                                              : style.isWaiting
                                    }`}
                                    aria-hidden="true"
                                />
                                {connectedSensors > 0
                                    ? `${connectedSensors} / 2 mesures disponibles`
                                    : "Aucune mesure disponible"}
                            </div>
                        </div>
                    </section>

                    <section className={style.summary} aria-label="Résumé de la serre">
                        <article className={style.summaryCard}>
                            <div className={style.cardHeader}>
                                <span className={style.iconHumidity} aria-hidden="true">H%</span>
                                <span className={`${style.statusPill} ${sensorStatusClass[humidityState]}`}>
                                    {sensorStatus[humidityState]}
                                </span>
                            </div>
                            <p className={style.cardLabel}>HUMIDITÉ</p>
                            <p className={style.metric}>
                                {humidity?.value.toLocaleString("fr-BE", { maximumFractionDigits: 1 }) ?? "--"}
                                <span>%</span>
                            </p>
                            <p className={style.cardFootnote}>
                                {humidity ? `Dernière mesure à ${formatTime(humidity.receivedAt)}` : sensorStatus[humidityState]}
                            </p>
                            <Link className={style.cardLink} to="/humidite">
                                Voir le détail <span aria-hidden="true">→</span>
                            </Link>
                        </article>

                        <article className={style.summaryCard}>
                            <div className={style.cardHeader}>
                                <span className={style.iconTemperature} aria-hidden="true">°C</span>
                                <span className={`${style.statusPill} ${sensorStatusClass[temperatureState]}`}>
                                    {sensorStatus[temperatureState]}
                                </span>
                            </div>
                            <p className={style.cardLabel}>TEMPÉRATURE</p>
                            <p className={style.metric}>
                                {temperature?.value.toLocaleString("fr-BE", { maximumFractionDigits: 1 }) ?? "--"}
                                <span>°C</span>
                            </p>
                            <p className={style.cardFootnote}>
                                {temperature ? `Dernière mesure à ${formatTime(temperature.receivedAt)}` : sensorStatus[temperatureState]}
                            </p>
                            <Link className={style.cardLink} to="/temperature">
                                Voir le détail <span aria-hidden="true">→</span>
                            </Link>
                        </article>

                        <article className={style.summaryCard}>
                            <div className={style.cardHeader}>
                                <span className={style.iconLight} aria-hidden="true">☀</span>
                                <span className={`${style.statusPill} ${style.pillUnavailable}`}>NON CONNECTÉ</span>
                            </div>
                            <p className={style.cardLabel}>LUMINOSITÉ</p>
                            <p className={style.windowState}>--<span className={style.unit}> lux</span></p>
                            <p className={style.cardFootnote}>Capteur et mesure non disponibles</p>
                            <Link className={style.cardLink} to="/luminosite">
                                Voir le détail <span aria-hidden="true">→</span>
                            </Link>
                        </article>

                        <article className={style.summaryCard}>
                            <div className={style.cardHeader}>
                                <span className={style.iconWindow} aria-hidden="true">↗</span>
                                <span className={`${style.statusPill} ${brokerConnected ? style.pillOnline : style.pillOffline}`}>
                                    BROKER MQTT : {brokerConnected ? "CONNECTÉ" : "NON CONNECTÉ"}
                                </span>
                            </div>
                            <p className={style.cardLabel}>FENÊTRE</p>
                            <p className={style.windowState}>
                                {windowCommand === "open" ? "Ouverte" : "Fermée"}
                            </p>
                            <p className={style.cardFootnote}>
                                {windowCommand === "open" ? "Dernière commande : ouvrir" : "Dernière commande : fermer"}
                                {" · Position réelle non mesurée"}
                            </p>
                            <Link className={style.cardLink} to="/fenetre">
                                Voir le détail <span aria-hidden="true">→</span>
                            </Link>
                        </article>

                        <article className={style.summaryCard}>
                            <div className={style.cardHeader}>
                                <span className={style.iconPump} aria-hidden="true">↻</span>
                                <span className={`${style.statusPill} ${style.pillUnavailable}`}>NON CONNECTÉE</span>
                            </div>
                            <p className={style.cardLabel}>POMPE D’ARROSAGE</p>
                            <p className={style.windowState}>Indisponible</p>
                            <p className={style.cardFootnote}>État et commandes non raccordés</p>
                            <Link className={style.cardLink} to="/pompe">
                                Voir le détail <span aria-hidden="true">→</span>
                            </Link>
                        </article>

                        <article className={style.summaryCard}>
                            <div className={style.cardHeader}>
                                <span className={style.iconControl} aria-hidden="true">⚙</span>
                                <span className={`${style.statusPill} ${style.pillUnavailable}`}>DÉSACTIVÉ</span>
                            </div>
                            <p className={style.cardLabel}>CONTRÔLE</p>
                            <p className={style.windowState}>Mode manuel inactif</p>
                            <p className={style.cardFootnote}>Aucune commande ne peut être envoyée</p>
                            <Link className={style.cardLink} to="/control">
                                Voir les équipements <span aria-hidden="true">→</span>
                            </Link>
                        </article>

                    </section>

                    <section className={style.overview} aria-labelledby="overview-title">
                        <div className={style.overviewCopy}>
                            <p className={style.eyebrow}>SUIVI DE LA SERRE</p>
                            <h2 id="overview-title">État des raccordements</h2>
                            <p>
                                Les mesures d’humidité et de température sont actualisées automatiquement.
                                Les autres rubriques signalent les capteurs ou commandes qui restent à raccorder.
                            </p>
                        </div>
                        <div className={style.overviewDetails}>
                            <div>
                                <span className={style.detailValue}>{connectedSensors} / 2</span>
                                <span className={style.detailLabel}>mesures disponibles</span>
                            </div>
                            <span className={style.detailDivider} aria-hidden="true" />
                            <div>
                                <span className={style.detailValue}>5</span>
                                <span className={style.detailLabel}>rubriques à raccorder</span>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className={style.footer}>
                    <span>SERRE / MONITORING</span>
                    <span>Tableau de bord</span>
                </footer>
            </div>
        </div>
    );
}

export default Dashboard;
