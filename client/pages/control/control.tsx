import { useEffect, useState, type FormEvent } from "react";
import Header from "../header/header";
import style from "../feature-page.module.css";
import automationStyle from "./control.module.css";

type WindowAutomationSettings = {
    enabled: boolean;
    temperatureLow: number;
    temperatureHigh: number;
    humidityLow: number;
    humidityHigh: number;
    openAt: string;
    closeAt: string;
};

const apiBaseUrl = import.meta.env.VITE_API_URL ?? `http://${window.location.hostname}:3000`;

function isWindowAutomationSettings(value: unknown): value is WindowAutomationSettings {
    if (typeof value !== "object" || value === null) return false;
    const candidate = value as Record<string, unknown>;
    return (
        typeof candidate.enabled === "boolean" &&
        typeof candidate.temperatureLow === "number" &&
        typeof candidate.temperatureHigh === "number" &&
        typeof candidate.humidityLow === "number" &&
        typeof candidate.humidityHigh === "number" &&
        typeof candidate.openAt === "string" &&
        typeof candidate.closeAt === "string"
    );
}

async function getErrorMessage(response: Response): Promise<string> {
    const body: unknown = await response.json().catch(() => null);
    if (typeof body === "object" && body !== null && "error" in body && typeof body.error === "string") {
        return body.error;
    }
    return "Une erreur est survenue. Veuillez réessayer.";
}

function Control() {
    const [settings, setSettings] = useState<WindowAutomationSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function loadSettings() {
            try {
                const response = await fetch(`${apiBaseUrl}/api/fenetre/automatisation`);
                if (!response.ok) throw new Error(await getErrorMessage(response));
                const result: unknown = await response.json();
                if (!isWindowAutomationSettings(result)) {
                    throw new Error("La configuration reçue par le serveur est invalide.");
                }
                if (!cancelled) setSettings(result);
            } catch (loadError) {
                if (!cancelled) {
                    setError(loadError instanceof Error ? loadError.message : String(loadError));
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void loadSettings();
        return () => {
            cancelled = true;
        };
    }, []);

    async function saveSettings(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!settings) return;
        if (settings.temperatureLow >= settings.temperatureHigh || settings.humidityLow >= settings.humidityHigh) {
            setError("Chaque seuil bas doit être inférieur au seuil haut correspondant.");
            return;
        }
        if (settings.openAt === settings.closeAt) {
            setError("Les heures d’ouverture et de fermeture doivent être différentes.");
            return;
        }

        setSaving(true);
        setError("");
        setSaved(false);
        try {
            const response = await fetch(`${apiBaseUrl}/api/fenetre/automatisation`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (!response.ok) throw new Error(await getErrorMessage(response));
            const result: unknown = await response.json();
            if (!isWindowAutomationSettings(result)) {
                throw new Error("La configuration enregistrée par le serveur est invalide.");
            }
            setSettings(result);
            setSaved(true);
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : String(saveError));
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className={style.page}>
            <div className={style.shell}>
                <Header />

                <main>
                    <section className={style.heading}>
                        <div>
                            <p className={style.eyebrow}>ZONE DE CULTURE / ÉQUIPEMENTS</p>
                            <h1>Contrôle</h1>
                            <p className={style.subtitle}>État des équipements et commandes de la serre.</p>
                        </div>
                        <span className={style.statusBadge}>
                            <span className={style.statusDot} aria-hidden="true" />
                            {settings
                                ? settings.enabled ? "AUTOMATISATIONS ACTIVÉES" : "AUTOMATISATIONS DÉSACTIVÉES"
                                : "CHARGEMENT DES RÉGLAGES"}
                        </span>
                    </section>

                    <section className={style.manualControlGrid} aria-label="Commandes manuelles">
                        <article className={style.manualControlCard}>
                            <div className={style.manualControlHeader}>
                                <span className={style.equipmentIcon} aria-hidden="true">↻</span>
                                <div>
                                    <p className={style.panelEyebrow}>ARROSAGE</p>
                                    <h2 className={style.panelTitle}>Pompe</h2>
                                </div>
                                <span className={style.equipmentState}>NON CONNECTÉE</span>
                            </div>
                            <p className={style.panelText}>
                                Démarre ou arrête la pompe lorsque sa connexion au système sera configurée.
                            </p>
                            <div className={style.controls}>
                                <button className={style.controlButton} type="button" disabled>
                                    Démarrer
                                </button>
                                <button className={`${style.controlButton} ${style.controlButtonSecondary}`} type="button" disabled>
                                    Arrêter
                                </button>
                            </div>
                        </article>

                        <article className={style.manualControlCard}>
                            <div className={style.manualControlHeader}>
                                <span className={style.equipmentIcon} aria-hidden="true">↗</span>
                                <div>
                                    <p className={style.panelEyebrow}>AÉRATION</p>
                                    <h2 className={style.panelTitle}>Fenêtre</h2>
                                </div>
                                <span className={style.equipmentState}>AUTOMATISATION</span>
                            </div>
                            <p className={style.panelText}>
                                Personnalisez les seuils et les horaires utilisés par l’automatisation.
                            </p>
                            <div className={style.controls}>
                                <button className={style.controlButton} type="button" disabled>
                                    Ouvrir
                                </button>
                                <button className={`${style.controlButton} ${style.controlButtonSecondary}`} type="button" disabled>
                                    Fermer
                                </button>
                            </div>
                            <form className={automationStyle.settingsForm} onSubmit={saveSettings}>
                                <div className={automationStyle.formHeading}>
                                    <div>
                                        <p className={style.panelEyebrow}>RÉGLAGES</p>
                                        <h3 className={style.panelTitle}>Automatisation de la fenêtre</h3>
                                    </div>
                                    <label className={automationStyle.toggleLabel}>
                                        <input
                                            type="checkbox"
                                            checked={settings?.enabled ?? false}
                                            disabled={loading || !settings}
                                            onChange={(event) => {
                                                setSettings((current) => current
                                                    ? { ...current, enabled: event.currentTarget.checked }
                                                    : current);
                                                setSaved(false);
                                            }}
                                        />
                                        <span>Activer</span>
                                    </label>
                                </div>

                                {loading && <p className={automationStyle.formMessage}>Chargement des réglages…</p>}
                                {!loading && settings && (
                                    <>
                                        <fieldset className={automationStyle.fieldset} disabled={!settings.enabled || saving}>
                                            <legend>Seuils de température et d’humidité</legend>
                                            <div className={automationStyle.fieldGrid}>
                                                <label className={automationStyle.field}>
                                                    <span>Température basse (°C)</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="50"
                                                        step="0.5"
                                                        required
                                                        value={settings.temperatureLow}
                                                        onChange={(event) => {
                                                            setSettings({ ...settings, temperatureLow: Number(event.currentTarget.value) });
                                                            setSaved(false);
                                                        }}
                                                    />
                                                </label>
                                                <label className={automationStyle.field}>
                                                    <span>Température haute (°C)</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="50"
                                                        step="0.5"
                                                        required
                                                        value={settings.temperatureHigh}
                                                        onChange={(event) => {
                                                            setSettings({ ...settings, temperatureHigh: Number(event.currentTarget.value) });
                                                            setSaved(false);
                                                        }}
                                                    />
                                                </label>
                                                <label className={automationStyle.field}>
                                                    <span>Humidité basse (%)</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        step="1"
                                                        required
                                                        value={settings.humidityLow}
                                                        onChange={(event) => {
                                                            setSettings({ ...settings, humidityLow: Number(event.currentTarget.value) });
                                                            setSaved(false);
                                                        }}
                                                    />
                                                </label>
                                                <label className={automationStyle.field}>
                                                    <span>Humidité haute (%)</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        step="1"
                                                        required
                                                        value={settings.humidityHigh}
                                                        onChange={(event) => {
                                                            setSettings({ ...settings, humidityHigh: Number(event.currentTarget.value) });
                                                            setSaved(false);
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                            <p className={automationStyle.hint}>
                                                Un seuil haut ouvre la fenêtre; un seuil bas la ferme.
                                            </p>
                                            <div className={automationStyle.fieldGrid}>
                                                <label className={automationStyle.field}>
                                                    <span>Heure d’ouverture</span>
                                                    <input
                                                        type="time"
                                                        required
                                                        value={settings.openAt}
                                                        onChange={(event) => {
                                                            setSettings({ ...settings, openAt: event.currentTarget.value });
                                                            setSaved(false);
                                                        }}
                                                    />
                                                </label>
                                                <label className={automationStyle.field}>
                                                    <span>Heure de fermeture</span>
                                                    <input
                                                        type="time"
                                                        required
                                                        value={settings.closeAt}
                                                        onChange={(event) => {
                                                            setSettings({ ...settings, closeAt: event.currentTarget.value });
                                                            setSaved(false);
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        </fieldset>

                                        <div className={automationStyle.formFooter}>
                                            <button className={automationStyle.saveButton} type="submit" disabled={saving}>
                                                {saving ? "Enregistrement…" : "Enregistrer les réglages"}
                                            </button>
                                            {saved && <span className={automationStyle.success} role="status">Réglages enregistrés.</span>}
                                        </div>
                                    </>
                                )}
                                {error && <p className={automationStyle.error} role="alert">{error}</p>}
                            </form>
                        </article>
                    </section>

                    <section className={style.infoBanner}>
                        <span className={style.infoIcon} aria-hidden="true">i</span>
                        <div>
                            <p className={style.panelEyebrow}>FONCTIONNEMENT</p>
                            <p className={style.infoText}>
                                Les créneaux déclenchent une ouverture et une fermeture chaque jour. Les seuils de
                                température et d’humidité restent actifs en permanence et peuvent modifier l’état
                                de la fenêtre après une commande programmée.
                            </p>
                        </div>
                    </section>
                </main>

                <footer className={style.footer}>
                    <span>SERRE / CONTRÔLE</span>
                    <span>Commandes manuelles</span>
                </footer>
            </div>
        </div>
    );
}

export default Control;