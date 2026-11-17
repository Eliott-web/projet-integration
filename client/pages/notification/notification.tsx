import { useEffect, useState } from "react";
import Header from "../header/header";
import style from "../feature-page.module.css";
import notificationStyle from "./window-notifications.module.css";
import {
    clearWindowNotifications,
    deleteWindowNotification,
    fetchWindowNotifications,
    type WindowNotification,
} from "./window-notifications";

function Notification() {
    const [notifications, setNotifications] = useState<WindowNotification[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [busyNotificationId, setBusyNotificationId] = useState<number | null>(null);
    const [isClearing, setIsClearing] = useState(false);

    useEffect(() => {
        let active = true;

        const loadNotifications = async () => {
            try {
                const result = await fetchWindowNotifications();
                if (active) {
                    setNotifications(result.reverse());
                    setError(null);
                }
            } catch (loadError) {
                console.error("Erreur lors du chargement des notifications :", loadError);
                if (active) setError("Impossible de récupérer les notifications.");
            }
        };

        void loadNotifications();
        const interval = setInterval(() => void loadNotifications(), 5000);
        return () => {
            active = false;
            clearInterval(interval);
        };
    }, []);

    const removeNotification = async (id: number) => {
        setBusyNotificationId(id);
        setError(null);
        try {
            await deleteWindowNotification(id);
            setNotifications((current) => current.filter((item) => item.id !== id));
        } catch (deleteError) {
            console.error("Erreur lors de la suppression de la notification :", deleteError);
            setError("Impossible de supprimer cette notification.");
        } finally {
            setBusyNotificationId(null);
        }
    };

    const clearNotifications = async () => {
        setIsClearing(true);
        setError(null);
        try {
            await clearWindowNotifications();
            setNotifications([]);
        } catch (deleteError) {
            console.error("Erreur lors de la suppression des notifications :", deleteError);
            setError("Impossible de vider les notifications.");
        } finally {
            setIsClearing(false);
        }
    };

    return (
        <div className={style.page}>
            <div className={style.shell}>
                <Header />

                <main>
                    <section className={style.heading}>
                        <div>
                            <p className={style.eyebrow}>ESPACE DE CULTURE / SUIVI</p>
                            <h1>Notifications</h1>
                            <p className={style.subtitle}>Retrouve ici les alertes et événements de la serre.</p>
                        </div>
                        <span className={style.statusBadge}>
                            <span className={style.statusDot} aria-hidden="true" />
                            ÉVÉNEMENTS DE LA FENÊTRE
                        </span>
                    </section>

                    <section aria-live="polite">
                        {error && notifications.length > 0 && (
                            <p className={style.panelText} role="alert">{error}</p>
                        )}
                        {error && notifications.length === 0 ? (
                            <div className={style.emptyPanel}>
                                <h2 className={style.panelTitle}>Notifications indisponibles</h2>
                                <p className={style.panelText}>{error}</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className={style.emptyPanel}>
                                <span className={style.emptyIcon} aria-hidden="true">i</span>
                                <h2 className={style.panelTitle}>Aucune notification</h2>
                                <p className={style.panelText}>
                                    Les ouvertures et fermetures de la fenêtre apparaîtront ici avec leur raison.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className={notificationStyle.historyHeader}>
                                    <p className={notificationStyle.historyCount}>
                                        {notifications.length} notification{notifications.length > 1 ? "s" : ""}
                                    </p>
                                    <button
                                        className={notificationStyle.clearButton}
                                        type="button"
                                        disabled={notifications.length === 0 || isClearing || busyNotificationId !== null}
                                        onClick={() => void clearNotifications()}
                                    >
                                        {isClearing ? "Suppression..." : "Tout vider"}
                                    </button>
                                </div>
                                {notifications.length > 0 ? (
                                    <div className={style.equipmentList}>
                                        {notifications.map((item) => (
                                            <article
                                                className={`${style.panel} ${notificationStyle.notificationCard}`}
                                                key={item.id}
                                            >
                                                <div className={notificationStyle.notificationCopy}>
                                                    <p className={style.panelEyebrow}>
                                                        FENÊTRE {item.command === "open" ? "OUVERTE" : "FERMÉE"}
                                                    </p>
                                                    <h2 className={style.panelTitle}>{item.reason}</h2>
                                                    <time className={style.panelText} dateTime={item.sentAt}>
                                                        {new Date(item.sentAt).toLocaleString()}
                                                    </time>
                                                </div>
                                                <button
                                                    className={notificationStyle.deleteButton}
                                                    type="button"
                                                    disabled={busyNotificationId !== null || isClearing}
                                                    aria-label={`Supprimer la notification : fenêtre ${item.command === "open" ? "ouverte" : "fermée"}, ${item.reason}`}
                                                    onClick={() => void removeNotification(item.id)}
                                                >
                                                    {busyNotificationId === item.id ? "..." : "Supprimer"}
                                                </button>
                                            </article>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={style.emptyPanel}>
                                        <span className={style.emptyIcon} aria-hidden="true">i</span>
                                        <h2 className={style.panelTitle}>Aucune notification</h2>
                                        <p className={style.panelText}>
                                            Les ouvertures et fermetures de la fenêtre apparaîtront ici avec leur raison.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </main>

                <footer className={style.footer}>
                    <span>SERRE / NOTIFICATIONS</span>
                    <span>Centre d’alertes</span>
                </footer>
            </div>
        </div>
    );
}

export default Notification;