import { Link } from "react-router-dom";
import Header from "../header/header";
import style from "../feature-page.module.css";

function Luminosite() {
    return (
        <div className={style.page}>
            <div className={style.shell}>
                <Header />

                <main>
                    <section className={style.heading}>
                        <div>
                            <p className={style.eyebrow}>ZONE DE CULTURE / CAPTEUR 03</p>
                            <h1>Luminosité</h1>
                            <p className={style.subtitle}>Suivi de la lumière reçue par les plantes.</p>
                        </div>
                        <span className={style.statusBadge}>
                            <span className={style.statusDot} aria-hidden="true" />
                            CAPTEUR NON CONNECTÉ
                        </span>
                    </section>

                    <section className={style.grid} aria-label="État du capteur de luminosité">
                        <article className={style.panel}>
                            <p className={style.panelEyebrow}>MESURE ACTUELLE</p>
                            <h2 className={style.panelTitle}>Intensité lumineuse</h2>
                            <div className={style.metricArea} aria-live="polite">
                                <span className={style.metricLabel}>LUMINOSITÉ DE LA SERRE</span>
                                <p className={style.metric}>--<span className={style.metricUnit}>lux</span></p>
                                <p className={style.metricCaption}>Aucune mesure reçue</p>
                            </div>
                        </article>

                        <aside className={style.infoPanel}>
                            <p className={style.panelEyebrow}>ÉTAT DU CAPTEUR</p>
                            <p className={style.statusValue}>En attente de connexion</p>
                            <div className={style.divider} />
                            <p className={style.panelEyebrow}>DERNIÈRE MESURE</p>
                            <p className={style.infoText}>Aucune donnée disponible pour le moment.</p>
                            <p className={style.infoText}>
                                La mesure en lux apparaîtra ici lorsque le capteur et son endpoint seront raccordés.
                            </p>
                        </aside>
                    </section>

                    <section className={style.infoBanner}>
                        <span className={style.infoIcon} aria-hidden="true">i</span>
                        <div>
                            <p className={style.panelEyebrow}>PROCHAINE ÉTAPE</p>
                            <p className={style.infoText}>
                                Le capteur de luminosité n’est pas encore exposé par le backend.
                                Cette page affichera les valeurs réelles dès que l’endpoint sera disponible.
                            </p>
                        </div>
                    </section>
                </main>

                <footer className={style.footer}>
                    <span>SERRE / LUMINOSITÉ</span>
                    <span>Mesure du capteur</span>
                </footer>
            </div>
        </div>
    );
}

export default Luminosite;