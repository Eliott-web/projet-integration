import { Link } from "react-router-dom";
import Header from "../header/header";
import style from "../feature-page.module.css";
import pageStyle from "./pompe.module.css";

function Pompe() {
    return (
        <div className={style.page}>
            <div className={style.shell}>
                <Header />

                <main>
                    <section className={style.heading}>
                        <div>
                            <p className={style.eyebrow}>ZONE DE CULTURE / ARROSAGE</p>
                            <h1>Pompe</h1>
                            <p className={style.subtitle}>
                                Consulte l’état de la pompe et ses commandes.
                            </p>
                        </div>
                        <span className={style.statusBadge}>
                            <span className={style.statusDot} aria-hidden="true" />
                            NON CONNECTÉE
                        </span>
                    </section>

                    <section className={style.grid} aria-label="État et commandes de la pompe">
                        <article className={style.panel}>
                            <p className={style.panelEyebrow}>ÉTAT DE L’ÉQUIPEMENT</p>
                            <h2 className={style.panelTitle}>Pompe d’arrosage</h2>
                            <div className={style.metricArea} aria-live="polite">
                                <span className={style.metricLabel}>ÉTAT ACTUEL</span>
                                <p className={`${style.metric} ${pageStyle.stateLabel}`}>
                                    Indisponible
                                </p>
                                <p className={style.metricCaption}>
                                    Aucun retour d’état n’est fourni par le système.
                                </p>
                            </div>
                        </article>

                        <aside className={style.infoPanel}>
                            <p className={style.panelEyebrow}>COMMANDE MANUELLE</p>
                            <h2 className={style.panelTitle}>Piloter la pompe</h2>
                            <p className={style.panelText}>
                                Les commandes seront disponibles lorsque la pompe sera reliée à l’interface.
                            </p>
                            <div className={style.controls}>
                                <button className={style.controlButton} type="button" disabled>
                                    Démarrer
                                </button>
                                <button className={`${style.controlButton} ${style.controlButtonSecondary}`} type="button" disabled>
                                    Arrêter
                                </button>
                            </div>
                            <p className={style.infoText}>
                                Les boutons sont désactivés tant qu’aucune API de commande n’est configurée.
                            </p>
                        </aside>
                    </section>

                    <section className={style.infoBanner}>
                        <span className={style.infoIcon} aria-hidden="true">i</span>
                        <div>
                            <p className={style.panelEyebrow}>CONNEXION REQUISE</p>
                            <p className={style.infoText}>
                                Le code de la pompe existe, mais il n’est pas encore raccordé au backend
                                ni à une commande MQTT depuis l’interface. Aucun ordre ne sera envoyé depuis cette page.
                            </p>
                            <Link className={style.actionLink} to="/control">
                                Retour aux équipements
                            </Link>
                        </div>
                    </section>
                </main>

                <footer className={style.footer}>
                    <span>SERRE / POMPE</span>
                    <span>Arrosage manuel</span>
                </footer>
            </div>
        </div>
    );
}

export default Pompe;