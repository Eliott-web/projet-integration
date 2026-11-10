import Header from "../header/header";
import style from "./fenetre.module.css";

function Fenetre() {
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
                                    INCONNU
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
                            <p className={style.windowState}>État indisponible</p>
                            <p className={style.windowHint}>
                                La fenêtre n’est pas encore reliée à l’interface.
                            </p>
                        </div>

                        <div className={style.commandsPanel}>
                            <p className={style.panelEyebrow}>COMMANDES</p>
                            <h2>Positionner la fenêtre</h2>
                            <p className={style.commandDescription}>
                                Les commandes manuelles sont également regroupées dans la page Contrôle.
                            </p>
                            <div className={style.buttonGroup}>
                                <button className={style.openButton} type="button" disabled>
                                    Ouvrir
                                </button>
                                <button className={style.closeButton} type="button" disabled>
                                    Fermer
                                </button>
                            </div>
                            <p className={style.commandNote}>
                                Commandes MQTT : <code>projet/serre/fenetre</code>
                            </p>
                        </div>
                    </section>

                    <section className={style.infoSection} aria-labelledby="info-title">
                        <div className={style.infoIcon} aria-hidden="true">i</div>
                        <div>
                            <p className={style.panelEyebrow}>PROCHAINE ÉTAPE</p>
                            <h2 id="info-title">Connexion du contrôle</h2>
                            <p className={style.infoText}>
                                Cette page est prête pour accueillir l’état de la fenêtre et ses commandes.
                                Le raccordement au backend reste à mettre en place.
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