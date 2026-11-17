import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import style from "./window-notifications.module.css";

export type WindowNotification = {
    id: number;
    command: "open" | "close";
    reason: string;
    sentAt: string;
};

const apiBaseUrl = import.meta.env.VITE_API_URL ?? `http://${window.location.hostname}:3000`;

export async function fetchWindowNotifications(afterId?: number): Promise<WindowNotification[]> {
    const query = afterId === undefined ? "" : `?after=${afterId}`;
    const response = await fetch(`${apiBaseUrl}/api/notifications${query}`, {
        headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error("Impossible de récupérer les notifications.");

    const payload: unknown = await response.json();
    if (typeof payload !== "object" || payload === null || !("notifications" in payload) ||
        !Array.isArray(payload.notifications)) {
        throw new Error("Réponse de notifications invalide.");
    }

    return payload.notifications.map((value: unknown) => {
        if (
            typeof value !== "object" ||
            value === null ||
            !("id" in value) ||
            typeof value.id !== "number" ||
            !Number.isSafeInteger(value.id) ||
            !("command" in value) ||
            (value.command !== "open" && value.command !== "close") ||
            !("reason" in value) ||
            typeof value.reason !== "string" ||
            !("sentAt" in value) ||
            typeof value.sentAt !== "string" ||
            Number.isNaN(new Date(value.sentAt).getTime())
        ) {
            throw new Error("Notification reçue invalide.");
        }

        return {
            id: value.id,
            command: value.command,
            reason: value.reason,
            sentAt: value.sentAt,
        };
    });
}

export async function deleteWindowNotification(id: number): Promise<void> {
    const response = await fetch(`${apiBaseUrl}/api/notifications/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Impossible de supprimer cette notification.");
}

export async function clearWindowNotifications(): Promise<void> {
    const response = await fetch(`${apiBaseUrl}/api/notifications`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Impossible de vider les notifications.");
}

function WindowNotifications() {
    const [notification, setNotification] = useState<WindowNotification | null>(null);

    useEffect(() => {
        let active = true;
        let firstRequest = true;
        let lastId = 0;
        let timeout: ReturnType<typeof setTimeout>;

        const poll = async () => {
            try {
                const notifications = await fetchWindowNotifications(firstRequest ? undefined : lastId);
                if (!active) return;

                if (notifications.length > 0) {
                    lastId = Math.max(lastId, ...notifications.map(({ id }) => id));
                    if (!firstRequest) setNotification(notifications[notifications.length - 1]);
                }
                firstRequest = false;
            } catch (error) {
                console.error("Erreur lors de la récupération des notifications :", error);
            } finally {
                if (active) timeout = setTimeout(() => void poll(), 3000);
            }
        };

        void poll();
        return () => {
            active = false;
            clearTimeout(timeout);
        };
    }, []);

    useEffect(() => {
        if (!notification) return;
        const timeout = setTimeout(() => setNotification(null), 8000);
        return () => clearTimeout(timeout);
    }, [notification]);

    if (!notification) return null;

    const isOpen = notification.command === "open";
    return (
        <aside className={style.toast} role="status" aria-live="polite">
            <span className={`${style.icon} ${isOpen ? style.open : style.closed}`} aria-hidden="true">
                {isOpen ? "↗" : "↙"}
            </span>
            <div className={style.content}>
                <p className={style.title}>Fenêtre {isOpen ? "ouverte" : "fermée"}</p>
                <p className={style.reason}>{notification.reason}</p>
                <time className={style.timestamp} dateTime={notification.sentAt}>
                    {new Date(notification.sentAt).toLocaleString()}
                </time>
                <Link className={style.link} to="/notification">Voir les notifications</Link>
            </div>
            <button
                className={style.dismiss}
                type="button"
                aria-label="Fermer la notification"
                onClick={() => setNotification(null)}
            >
                ×
            </button>
        </aside>
    );
}

export default WindowNotifications;