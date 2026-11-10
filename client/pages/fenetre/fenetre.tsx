import { useEffect, useState } from "react";
import Header from "../header/header";
import style from "./fenetre.module.css";

type WindowCommand = "open" | "close";

type LastWindowCommand = {
    command: WindowCommand;
    sentAt: string;
};

const apiBaseUrl = import.meta.env.VITE_API_URL ?? `http://${window.location.hostname}:3000`;

function Fenetre() {
    const [lastCommand, setLastCommand] = useState<LastWindowCommand | null>(null);
    const [pendingCommand, setPendingCommand] = useState<WindowCommand | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        const fetchLastCommand = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/api/fenetre`, {
                    headers: { Accept: "application/json" },
                });
                if (!response.ok) throw new Error("Impossible de lire la dernière commande.");

                const payload: unknown = await response.json();
                if (typeof payload !== "object" || payload === null || !("lastCommand" in payload)) {
                    throw new Error("Réponse du serveur invalide.");
                }

                const value = payload.lastCommand;
                if (value !== null) {
                    if (
                        typeof value !== "object" ||
                        !("command" in value) ||
                        (value.command !== "open" && value.command !== "close") ||
                        !("sentAt" in value) ||
                        typeof value.sentAt !== "string"
                    ) {
                        throw new Error("Commande de fenêtre invalide.");
                    }
                    if (Number.isNaN(new Date(value.sentAt).getTime())) {
                        throw new Error("Date de commande invalide.");
                    }
                    if (active) setLastCommand({ command: value.command, sentAt: value.sentAt });
                } else if (active) {
                    setLastCommand(null);
                }
            } catch {
                if (active) setError("Impossible de récupérer la dernière commande.");
            }
        };

        void fetchLastCommand();
        return () => {
            active = false;
        };
    }, []);

    const sendCommand = async (command: WindowCommand) => {
        setPendingCommand(command);
        setError(null);
        try {
            const response = await fetch(`${apiBaseUrl}/api/fenetre`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ command }),
            });
            if (!response.ok) throw new Error("Le backend n’a pas accepté la commande.");

            const payload: unknown = await response.json();
            if (
                typeof payload !== "object" ||
                payload === null ||
                !("command" in payload) ||
                payload.command !== command ||
                !("sentAt" in payload) ||
                typeof payload.sentAt !== "string" ||
                Number.isNaN(new Date(payload.sentAt).getTime())
            ) {
                throw new Error("Réponse du serveur invalide.");
            }

            setLastCommand({ command, sentAt: payload.sentAt });
        } catch {
            setError("Impossible d’envoyer la commande. Vérifie la connexion au backend et au broker.");
        } finally {
            setPendingCommand(null);
        }
    };

    return (
        <div className={style.page}>
            <div className={style.shell}>
                <Header />

                <main>
                    <section className={style.headingRow}>
                        <div>
                            <p className={style.eyebrow}>ZONE DE CULTURE / OUVERTURE</p>
                            <h1>Fenêtre</h1>
                            <p className={style.subtitle}>
                                Consulte l’état et prépare les commandes de la fenêtre de la serre.
                            </p>
                        </div>
                    </section>

                    <section className={style.controlGrid} aria-label="État et commandes de la fenêtre">
                        <div className={style.windowPanel}>
                            <div className={style.panelTopline}>
                                <span>ÉTAT DE LA FENÊTRE</span>
                                <span className={style.stateBadge}>
                                    <span />
                                    {lastCommand ? `CMD : ${lastCommand.command === "open" ? "OUVRIR" : "FERMER"}` : "INCONNUE"}
                                </span>
                            </div>
                            <div className={style.windowIllustration} aria-hidden="true">
                                <span className={style.windowFrame}>
                                    <span className={style.windowPane} />
                                    <span className={style.windowPane} />
                                    <span className={style.windowPane} />
                                    <span className={style.windowPane} />
                                </span>
                            </div>
                            <p className={style.windowState} aria-live="polite">
                                {lastCommand
                                    ? `Dernière commande : ${lastCommand.command === "open" ? "ouvrir" : "fermer"}`
                                    : "Aucune commande envoyée"}
                            </p>
                            <p className={style.windowHint}>
                                Cette information ne confirme pas la position physique de la fenêtre.
                            </p>
                        </div>

                        <div className={style.commandsPanel}>
                            <p className={style.panelEyebrow}>COMMANDES</p>
                            <h2>Positionner la fenêtre</h2>
                            <p className={style.commandDescription}>
                                Les commandes sont transmises au Raspberry Pi via le backend.
                            </p>
                            <div className={style.buttonGroup}>
                                <button
                                    className={style.openButton}
                                    type="button"
                                    disabled={pendingCommand !== null}
                                    onClick={() => void sendCommand("open")}
                                >
                                    {pendingCommand === "open" ? "Envoi..." : "Ouvrir"}
                                </button>
                                <button
                                    className={style.closeButton}
                                    type="button"
                                    disabled={pendingCommand !== null}
                                    onClick={() => void sendCommand("close")}
                                >
                                    {pendingCommand === "close" ? "Envoi..." : "Fermer"}
                                </button>
                            </div>
                            {error && <p className={style.windowHint} role="alert">{error}</p>}
                            <p className={style.commandNote}>
                                Commandes MQTT : <code>projet/serre/fenetre</code>
                            </p>
                        </div>
                    </section>

                    <section className={style.infoSection} aria-labelledby="info-title">
                        <div className={style.infoIcon} aria-hidden="true">i</div>
                        <div>
                            <p className={style.panelEyebrow}>INFORMATION</p>
                            <h2 id="info-title">Retour de position</h2>
                            <p className={style.infoText}>
                                Le servo ne renvoie pas sa position réelle. La page affiche seulement la dernière
                                commande confirmée par le broker MQTT.
                            </p>
                        </div>
                    </section>
                </main>

                <footer className={style.footer}>
                    <span>SERRE / FENÊTRE</span>
                    <span>Contrôle manuel</span>
                </footer>
            </div>
        </div>
    );
}

export default Fenetre;