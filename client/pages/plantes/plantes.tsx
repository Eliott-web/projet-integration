
import { useEffect, useMemo, useState, type FormEvent } from "react";
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

    const [nom, setNom] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(() => new Date().toLocaleDateString("sv-SE"));
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Gestion de la suppression
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (submitting) return;

        const trimmedNom = nom.trim();
        if (!trimmedNom) {
            setFormError("Le nom de la plante est obligatoire.");
            return;
        }

        setSubmitting(true);
        setFormError(null);

        try {
            const response = await fetch(`${apiBaseUrl}/api/plantes`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({
                    nom: trimmedNom,
                    description: description.trim() || null,
                    date,
                }),
            });

            const payload: unknown = await response.json().catch(() => null);

            if (!response.ok) {
                const message =
                    typeof payload === "object" && payload !== null && "error" in payload
                        ? String((payload as { error: unknown }).error)
                        : "Impossible d’ajouter la plante.";
                setFormError(message);
                return;
            }

            if (!isPlante(payload)) throw new Error("Réponse invalide");

            setPlantes((previous) => [...previous, { ...payload, description: payload.description ?? null }]);
            setConnection("online");
            setNom("");
            setDescription("");
            setDate(new Date().toLocaleDateString("sv-SE"));
        } catch {
            setFormError("Serveur indisponible. La plante n’a pas été ajoutée.");
        } finally {
            setSubmitting(false);
        }
    };

    // Suppression d'une plante
    const handleDelete = async (id: number) => {
        if (deletingId !== null) return;

        const confirmed = window.confirm(
            "Voulez-vous vraiment supprimer cette plante ?"
        );

        if (!confirmed) return;

        setDeletingId(id);
        setDeleteError(null);

        try {
            const response = await fetch(`${apiBaseUrl}/api/plantes/${id}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                const payload: unknown = await response.json().catch(() => null);

                const message =
                    typeof payload === "object" && payload !== null && "error" in payload
                        ? String((payload as { error: unknown }).error)
                        : "Impossible de supprimer la plante.";

                throw new Error(message);
            }

            // Retirer la plante du tableau sans recharger la page
            setPlantes((previous) =>
                previous.filter((plante) => plante.IdPlante !== id)
            );

        } catch (error) {
            setDeleteError(
                error instanceof Error
                    ? error.message
                    : "Une erreur est survenue lors de la suppression."
            );
        } finally {
            setDeletingId(null);
        }
    };

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

                    <form className={style.form} onSubmit={handleSubmit}>
                        <h2 className={style.formTitle}>Ajouter une plante</h2>
                        <div className={style.formFields}>
                            <label className={style.field}>
                                <span>Nom</span>
                                <input
                                    type="text"
                                    value={nom}
                                    maxLength={255}
                                    required
                                    onChange={(event) => setNom(event.target.value)}
                                />
                            </label>
                            <label className={style.field}>
                                <span>Date de plantation</span>
                                <input
                                    type="date"
                                    value={date}
                                    required
                                    onChange={(event) => setDate(event.target.value)}
                                />
                            </label>
                            <label className={`${style.field} ${style.fieldWide}`}>
                                <span>Description (facultatif)</span>
                                <input
                                    type="text"
                                    value={description}
                                    maxLength={255}
                                    onChange={(event) => setDescription(event.target.value)}
                                />
                            </label>
                        </div>
                        {formError && <p className={style.formError} role="alert">{formError}</p>}
                        <button className={style.refreshButton} type="submit" disabled={submitting}>
                            {submitting ? "Ajout en cours…" : "Ajouter la plante"}
                        </button>
                    </form>

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

                        {deleteError && (
                            <p className={style.formError} role="alert">
                                {deleteError}
                            </p>
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

                                            <button
                                                type="button"
                                                className={style.deleteButton}
                                                disabled={deletingId !== null}
                                                onClick={() => handleDelete(plante.IdPlante)}
                                            >
                                                {deletingId === plante.IdPlante
                                                    ? "Suppression..."
                                                    : "Supprimer"}
                                            </button>
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
