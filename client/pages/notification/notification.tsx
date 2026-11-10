import { Link } from "react-router-dom";
import Header from "../header/header";
import style from "../feature-page.module.css";

function Notification() {
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
                            ALERTES NON CONNECTÉES
                        </span>
                    </section>

                    <section className={style.emptyPanel} aria-live="polite">
                        <span className={style.emptyIcon} aria-hidden="true">i</span>
                        <h2 className={style.panelTitle}>Aucune notification</h2>
                        <p className={style.panelText}>
                            Les alertes apparaîtront ici lorsque le système de notifications sera configuré.
                            Aucune alerte n’a été inventée ou simulée.
                        </p>
                        <Link className={style.actionLink} to="/">Retour au tableau de bord</Link>
                    </section>

                    <section className={style.infoBanner}>
                        <span className={style.infoIcon} aria-hidden="true">i</span>
                        <div>
                            <p className={style.panelEyebrow}>CONFIGURATION EN ATTENTE</p>
                            <p className={style.infoText}>
                                Les seuils d’alerte et l’historique ne sont pas encore fournis par le backend.
                                Cette page sera alimentée dès que ces événements seront disponibles.
                            </p>
                        </div>
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