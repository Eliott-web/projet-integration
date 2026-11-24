import { useEffect, useMemo, useState } from "react";
import Header from "../header/header";
import style from "./plantes.module.css";

type Plante = {
    IdPlante: number;
    nom: string;
    description: string | null;
    date: string;
};

type ConnectionState = "loading" | "online" | "offline";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? `http://${window.location.hostname}:3000`;

function formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date inconnue";

    return new Intl.DateTimeFormat("fr-BE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date);
}

function isPlante(value: unknown): value is Plante {
    if (typeof value !== "object" || value === null) return false;
    const item = value as Record<string, unknown>;

    return (
        typeof item.IdPlante === "number" &&
        typeof item.nom === "string" &&
        (typeof item.description === "string" || item.description === null || item.description === undefined) &&
        typeof item.date === "string"
    );
}

function Plantes() {
    const [plantes, setPlantes] = useState<Plante[]>([]);
    const [connection, setConnection] = useState<ConnectionState>("loading");
    const [search, setSearch] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let active = true;

        const fetchPlantes = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/api/plantes`, {
                    headers: { Accept: "application/json" },
                });
                if (!response.ok) throw new Error("Réponse du serveur invalide");

                const payload: unknown = await response.json();
                if (!Array.isArray(payload) || !payload.every(isPlante)) {
                    throw new Error("Liste de plantes invalide");
                }

                if (!active) return;

                setPlantes(payload.map((item) => ({ ...item, description: item.description ?? null })));
                setConnection("online");
            } catch {
                if (active) setConnection("offline");
            }
        };

        setConnection("loading");
        void fetchPlantes();

        return () => {
            active = false;
        };
    }, [refreshKey]);

    const visiblePlantes = useMemo(() => {
        const query = search.trim().toLowerCase();

        return [...plantes]
            .filter((plante) => plante.nom.toLowerCase().includes(query))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [plantes, search]);

    return (
        <div className={style.page}>
            <div className={style.shell}>
                <Header />

                <main>
                    <section className={style.headingRow}>
                        <div>
                            <p className={style.eyebrow}>ZONE DE CULTURE / PLANTES</p>
                            <h1>Plantes</h1>
                            <p className={style.subtitle}>Les plantes suivies dans la serre</p>
                        </div>
                        <button
                            className={style.refreshButton}
                            type="button"
                            onClick={() => setRefreshKey((key) => key + 1)}
                        >
                            Actualiser
                        </button>
                    </section>

                    <section className={style.toolbar}>
                        <input
                            className={style.searchInput}
                            type="search"
                            placeholder="Rechercher une plante"
                            aria-label="Rechercher une plante par nom"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                        <span className={style.count} aria-live="polite">
                            {visiblePlantes.length} plante{visiblePlantes.length > 1 ? "s" : ""}
                        </span>
                    </section>

                    <section className={style.listSection} aria-label="Liste des plantes">
                        {connection === "loading" && (
                            <div className={style.emptyState}>
                                <p>Chargement des plantes…</p>
                            </div>
                        )}

                        {connection === "offline" && (
                            <div className={style.emptyState}>
                                <p>Serveur indisponible.</p>
                                <p className={style.errorMessage}>
                                    Vérifie que le backend répond sur son adresse configurée.
                                </p>
                            </div>
                        )}

                        {connection === "online" && visiblePlantes.length === 0 && (
                            <div className={style.emptyState}>
                                <p>{plantes.length === 0 ? "Aucune plante enregistrée." : "Aucune plante ne correspond à ta recherche."}</p>
                            </div>
                        )}

                        {connection === "online" && visiblePlantes.length > 0 && (
                            <ul className={style.list}>
                                {visiblePlantes.map((plante) => (
                                    <li className={style.item} key={plante.IdPlante}>
                                        <div className={style.itemMain}>
                                            <h2 className={style.itemName}>{plante.nom}</h2>
                                            <p className={style.itemDescription}>
                                                {plante.description?.trim() || "Pas de description."}
                                            </p>
                                        </div>
                                        <div className={style.itemMeta}>
                                            <span className={style.metaLabel}>Plantée le</span>
                                            <time dateTime={plante.date}>{formatDate(plante.date)}</time>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </main>

                <footer className={style.footer}>
                    <span>SERRE / PLANTES</span>
                    <span>{plantes.length} enregistrée{plantes.length > 1 ? "s" : ""}</span>
                </footer>
            </div>
        </div>
    );
}

export default Plantes;