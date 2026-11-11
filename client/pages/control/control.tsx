import Header from "../header/header";
import style from "../feature-page.module.css";

function Control() {
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
                            COMMANDES DÉSACTIVÉES
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
                                <span className={style.equipmentState}>NON CONNECTÉE</span>
                            </div>
                            <p className={style.panelText}>
                                Ouvre ou ferme la fenêtre lorsque les commandes du backend seront disponibles.
                            </p>
                            <div className={style.controls}>
                                <button className={style.controlButton} type="button" disabled>
                                    Ouvrir
                                </button>
                                <button className={`${style.controlButton} ${style.controlButtonSecondary}`} type="button" disabled>
                                    Fermer
                                </button>
                            </div>
                        </article>
                    </section>

                    <section className={style.infoBanner}>
                        <span className={style.infoIcon} aria-hidden="true">i</span>
                        <div>
                            <p className={style.panelEyebrow}>CONNEXION REQUISE</p>
                            <p className={style.infoText}>
                                Les API de commande de la pompe et de la fenêtre ne sont pas encore raccordées.
                                Les commandes restent désactivées jusqu’à ce que le système puisse les exécuter
                                et confirmer leur état.
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