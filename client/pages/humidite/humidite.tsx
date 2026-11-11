import { useEffect, useState } from "react";
import Header from "../header/header";
import style from "./humidite.module.css";

type HumidityReading = {
    value: number;
    receivedAt: string;
};

type ConnectionState = "loading" | "online" | "waiting" | "offline";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? `http://${window.location.hostname}:3000`;

function formatTime(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Heure inconnue";

    return new Intl.DateTimeFormat("fr-BE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(date);
}

function Humidite() {
    const [reading, setReading] = useState<HumidityReading | null>(null);
    const [history, setHistory] = useState<HumidityReading[]>([]);
    const [connection, setConnection] = useState<ConnectionState>("loading");
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let active = true;

        const fetchReading = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/api/humidite`, {
                    headers: { Accept: "application/json" },
                });

                if (response.status === 503) {
                    if (active) setConnection("waiting");
                    return;
                }
                if (!response.ok) throw new Error("Réponse du serveur invalide");

                const payload: unknown = await response.json();
                if (typeof payload !== "object" || payload === null) {
                    throw new Error("Mesure invalide");
                }

                const value = (payload as { value?: unknown }).value;
                const receivedAt = (payload as { receivedAt?: unknown }).receivedAt;
                if (
                    typeof value !== "number" ||
                    !Number.isFinite(value) ||
                    value < 0 ||
                    value > 100 ||
                    typeof receivedAt !== "string" ||
                    Number.isNaN(new Date(receivedAt).getTime())
                ) {
                    throw new Error("Mesure invalide");
                }

                if (!active) return;

                const nextReading = { value, receivedAt };
                setReading(nextReading);
                setConnection("online");
                setHistory((previous) => {
                    if (previous.at(-1)?.receivedAt === receivedAt) return previous;
                    return [...previous, nextReading].slice(-12);
                });
            } catch {
                if (active) setConnection("offline");
            }
        };

        void fetchReading();
        const intervalId = window.setInterval(() => void fetchReading(), 5000);

        return () => {
            active = false;
            window.clearInterval(intervalId);
        };
    }, [refreshKey]);

    const connectionLabel: Record<ConnectionState, string> = {
        loading: "Connexion au serveur",
        online: "Flux actif",
        waiting: "En attente d’une mesure",
        offline: "Serveur indisponible",
    };

    return (
        <div className={style.page}>
            <div className={style.shell}>
                <Header />

                <main>
                    <section className={style.headingRow}>
                        <div>
                            <p className={style.eyebrow}>ZONE DE CULTURE / CAPTEUR 01</p>
                            <h1>Humidité</h1>
                            <p className={style.subtitle}>Suivi de l’humidité relative de la serre</p>
                        </div>
                        <button
                            className={style.refreshButton}
                            type="button"
                            onClick={() => setRefreshKey((key) => key + 1)}
                        >
                            Actualiser
                        </button>
                    </section>

                    <section className={style.readingGrid} aria-label="Mesure actuelle">
                        <div className={style.currentReading}>
                            <div className={style.readingTopline}>
                                <span>HUMIDITÉ RELATIVE</span>
                                <span className={style.liveLabel}>
                                    <span />
                                    {connection === "online" ? "LIVE" : "MESURE"}
                                </span>
                            </div>
                            <div className={style.metric} aria-live="polite">
                                {reading ? reading.value.toLocaleString("fr-BE", { maximumFractionDigits: 1 }) : "--"}
                                <span>%</span>
                            </div>
                            <div
                                className={style.meter}
                                role="progressbar"
                                aria-label="Humidité relative"
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={reading?.value}
                            >
                                <span style={{ width: reading ? `${reading.value}%` : "0%" }} />
                            </div>
                            <div className={style.scale}>
                                <span>0 %</span>
                                <span>100 %</span>
                            </div>
                            <p className={style.receivedAt}>
                                {reading ? `Reçue à ${formatTime(reading.receivedAt)}` : "Aucune mesure disponible"}
                            </p>
                        </div>

                        <div className={style.statusPanel}>
                            <p className={style.panelEyebrow}>ÉTAT DU CAPTEUR</p>
                            <p className={style.sensorState}>{connectionLabel[connection]}</p>
                            <div className={style.statusDivider} />
                            <p className={style.panelEyebrow}>DERNIÈRE MESURE</p>
                            <p className={style.lastReading}>{reading ? formatTime(reading.receivedAt) : "—"}</p>
                            {connection === "offline" && (
                                <p className={style.errorMessage}>Vérifie que le backend répond sur son adresse configurée.</p>
                            )}
                        </div>
                    </section>

                    <section className={style.historySection}>
                        <div className={style.historyHeading}>
                            <div>
                                <p className={style.eyebrow}>MESURES REÇUES</p>
                                <h2>Tendance récente</h2>
                            </div>
                            <span className={style.historyCount}>{history.length} / 12</span>
                        </div>

                        {history.length > 0 ? (
                            <ol className={style.chart} aria-label="Historique des mesures reçues depuis l’ouverture de la page">
                                {history.map((item, index) => (
                                    <li className={style.barColumn} key={`${item.receivedAt}-${index}`}>
                                        <span className={style.barValue}>{item.value.toLocaleString("fr-BE", { maximumFractionDigits: 1 })}%</span>
                                        <span
                                            className={`${style.bar} ${index === history.length - 1 ? style.latestBar : ""}`}
                                            style={{ height: `${Math.max(item.value, 3)}%` }}
                                            title={`${item.value}% à ${formatTime(item.receivedAt)}`}
                                        />
                                        <time className={style.barTime} dateTime={item.receivedAt}>{formatTime(item.receivedAt)}</time>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <div className={style.emptyHistory}>
                                <span className={style.emptyMark}>%</span>
                                <p>Les mesures apparaîtront ici dès leur réception.</p>
                            </div>
                        )}
                    </section>
                </main>

                <footer className={style.footer}>
                    <span>SERRE / CAPTEUR 01</span>
                    <span>Actualisation toutes les 5 secondes</span>
                </footer>
            </div>
        </div>
    );
}

export default Humidite;
