// =====================================
// 1. LES PAGES
// =====================================

const pages = [
    ["home", "Accueil", "⌂"],
    ["temperature", "Température", "♨"],
    ["humidity", "Humidité", "◉"],
    ["light", "Luminosité", "☀"],
    ["control", "Contrôle", "⚙"],
    ["notifications", "Notifications", "♧"]
];

// =====================================
// 2. LES CAPTEURS
// =====================================

const capteurs = {
    temp: {
        nom: "Température",
        icone: "🌡️",
        valeur: 24.5,
        unite: "°C",
        couleur: "#4c9d74"
    },

    air: {
        nom: "Humidité de l'air",
        icone: "💧",
        valeur: 68,
        unite: "%",
        couleur: "#66a8c9"
    },

    soil: {
        nom: "Humidité du sol",
        icone: "🌱",
        valeur: 42,
        unite: "%",
        couleur: "#78ae73"
    },

    light: {
        nom: "Luminosité",
        icone: "☀️",
        valeur: 7850,
        unite: "lux",
        couleur: "#e5b15c"
    }
};

// =====================================
// 3. LES VARIABLES
// =====================================

let pageActuelle = "home";
let periode = "24h";
let modeEdition = false;

let widgets = charger("widgets", [
    "temp",
    "air",
    "soil",
    "light",
    "chart",
    "devices",
    "alerts"
]);

let tailles = charger("sizes", {
    chart: "wide",
    devices: "wide",
    alerts: "full"
});

let appareils = charger("devices", {
    fan: true,
    water: false,
    lamps: true,
    automatic: true
});

let seuils = charger("thresholds", {
    temp: 30,
    air: 40,
    soil: 30,
    light: 12000
});

let graphiques = [];
let widgetDeplace = null;

const nomsWidgets = {
    temp: "Température",
    air: "Humidité de l'air",
    soil: "Humidité du sol",
    light: "Luminosité",
    chart: "Graphique des capteurs",
    devices: "État des équipements",
    alerts: "Dernières alertes"
};

// =====================================
// 4. SAUVEGARDE DES PARAMÈTRES
// =====================================

function sauvegarder(nom, valeur) {
    localStorage.setItem("gh_" + nom, JSON.stringify(valeur));
}

function charger(nom, valeurDefaut) {
    try {
        let resultat = localStorage.getItem("gh_" + nom);

        if (resultat === null) {
            return valeurDefaut;
        }

        return JSON.parse(resultat);
    } catch (erreur) {
        return valeurDefaut;
    }
}

// =====================================
// 5. FONCTIONS UTILES
// =====================================

function formatNombre(nombre) {
    return Number(nombre).toLocaleString("fr-BE", {
        maximumFractionDigits: 1
    });
}

function supprimerGraphiques() {
    for (let graphique of graphiques) {
        graphique.destroy();
    }

    graphiques = [];
}

function changerPage(nouvellePage) {
    pageActuelle = nouvellePage;
    modeEdition = false;

    afficherPage();

    let menu = document.querySelector(".sidebar");

    if (menu) {
        menu.classList.remove("open");
    }
}

// =====================================
// 6. EN-TÊTE DES PAGES
// =====================================

function creerEntete(titre, description, boutons = "") {
    return `
        <div class="page-head">
            <div>
                <div class="eyebrow">
                    SERRE CONNECTÉE / SUPERVISION
                </div>

                <h1>${titre}</h1>

                <div class="subtitle">
                    ${description}
                </div>
            </div>

            <div class="actions">
                ${boutons}
            </div>
        </div>
    `;
}

// =====================================
// 7. AFFICHAGE D'UN CAPTEUR
// =====================================

function afficherCapteur(id) {
    let capteur = capteurs[id];

    return `
        <div class="stat-top">
            <span class="stat-icon">
                ${capteur.icone}
            </span>

            <span style="color:#a3b1a8;font-size:12px">
                ● En direct
            </span>
        </div>

        <div class="stat-name">
            ${capteur.nom}
        </div>

        <div class="stat-value">
            <span data-metric="${id}">
                ${formatNombre(capteur.valeur)}
            </span>

            <span class="stat-unit">
                ${capteur.unite}
            </span>
        </div>

        <div class="stat-foot">
            ↗ Valeur simulée en temps réel
        </div>
    `;
}

// =====================================
// 8. ÉTAT DES APPAREILS
// =====================================

function afficherAppareils() {
    let liste = [
        ["fan", "🌀", "Ventilation"],
        ["water", "💦", "Arrosage automatique"],
        ["lamps", "💡", "Éclairage"]
    ];

    let html = `
        <h3 class="card-title">État des équipements</h3>
        <p class="card-sub">Vue rapide de vos appareils</p>
        <div class="status-list">
    `;

    for (let appareil of liste) {
        let id = appareil[0];
        let icone = appareil[1];
        let nom = appareil[2];

        let etat = appareils[id] ? "ACTIF" : "ARRÊT";
        let classe = appareils[id] ? "" : "off";
        let mode = appareils.automatic ? "automatique" : "manuelle";

        html += `
            <div class="status-row">
                <span class="status-ico">${icone}</span>

                <div>
                    <div class="status-label">${nom}</div>
                    <div class="status-desc">
                        Commande ${mode}
                    </div>
                </div>

                <span class="status-state ${classe}">
                    ${etat}
                </span>
            </div>
        `;
    }

    html += "</div>";

    return html;
}

// =====================================
// 9. DERNIÈRES ALERTES
// =====================================

function afficherAlertes() {
    return `
        <h3 class="card-title">
            Dernières notifications
        </h3>

        <p class="card-sub">
            Exemples d'événements et d'alertes
        </p>

        <div class="notice">
            ⚠️ Humidité du sol proche du seuil minimum
        </div>

        <div class="notice">
            ☀️ Pic de luminosité détecté aujourd'hui
        </div>
    `;
}

// =====================================
// 10. CRÉATION DES WIDGETS
// =====================================

function creerWidget(id) {
    let contenu = "";

    if (capteurs[id]) {
        contenu = afficherCapteur(id);
    }

    else if (id === "chart") {
        contenu = `
            <div class="card-header">
                <h3 class="card-title">
                    Évolution des capteurs
                </h3>

                <span class="mini-pill">
                    24 dernières heures
                </span>
            </div>

            <p class="card-sub">
                Température et humidité de l'air
            </p>

            <div class="chart-wrap">
                <canvas id="chart-home"></canvas>
            </div>
        `;
    }

    else if (id === "devices") {
        contenu = afficherAppareils();
    }

    else if (id === "alerts") {
        contenu = afficherAlertes();
    }

    let boutons = "";

    if (modeEdition) {
        boutons = `
            <div class="widget-actions">
                <button data-resize="${id}">↔</button>
                <button data-remove="${id}">×</button>
            </div>
        `;
    }

    let taille = tailles[id] || "";
    let classeEdition = modeEdition ? "editing" : "";
    let draggable = modeEdition ? 'draggable="true"' : "";

    return `
        <article
            class="card widget ${taille} ${classeEdition}"
            data-widget="${id}"
            ${draggable}
        >
            ${boutons}
            ${contenu}
        </article>
    `;
}

// =====================================
// 11. PAGE D'ACCUEIL
// =====================================

function afficherAccueil() {
    let texteBouton = modeEdition
        ? "✓ Terminer"
        : "✎ Personnaliser";

    let classeBouton = modeEdition ? "primary" : "";

    let bouton = `
        <button class="btn ${classeBouton}" id="editBtn">
            ${texteBouton}
        </button>
    `;

    let html = creerEntete(
        "Bonjour, bienvenue 👋",
        "Voici un aperçu de votre serre et de ses conditions actuelles.",
        bouton
    );

    if (modeEdition) {
        html += `
            <div class="edit-hint">
                ✦ Déplacez les cartes, changez leur taille
                ou supprimez-les.
            </div>

            <div class="picker">
        `;

        for (let id in nomsWidgets) {
            if (!widgets.includes(id)) {
                html += `
                    <button data-add="${id}">
                        ＋ ${nomsWidgets[id]}
                    </button>
                `;
            }
        }

        html += "</div>";
    }

    html += '<div class="grid" id="widgets">';

    for (let id of widgets) {
        html += creerWidget(id);
    }

    html += "</div>";

    return html;
}

// =====================================
// 12. DONNÉES SIMULÉES DES GRAPHIQUES
// =====================================

function creerDonnees(valeur, variation, nombre) {
    let donnees = [];

    for (let i = 0; i < nombre; i++) {
        let resultat =
            valeur +
            Math.sin(i / 3) * variation +
            Math.cos(i * 1.9) * variation * 0.25;

        donnees.push(Number(resultat.toFixed(1)));
    }

    return donnees;
}

// =====================================
// 13. CRÉATION DES GRAPHIQUES
// =====================================

function creerGraphique(idCanvas, idsCapteurs) {
    let canvas = document.getElementById(idCanvas);

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    let nombre = 24;

    if (periode === "7j") {
        nombre = 7;
    }

    if (periode === "30j") {
        nombre = 30;
    }

    let labels = [];

    for (let i = 0; i < nombre; i++) {
        if (periode === "24h") {
            labels.push(i + "h");
        }

        else if (periode === "7j") {
            let jours = [
                "Lun", "Mar", "Mer", "Jeu",
                "Ven", "Sam", "Dim"
            ];

            labels.push(jours[i]);
        }

        else {
            labels.push("J" + (i + 1));
        }
    }

    let datasets = [];

    for (let id of idsCapteurs) {
        let capteur = capteurs[id];

        let variation = 8;

        if (id === "temp") {
            variation = 2;
        }

        if (id === "light") {
            variation = 1500;
        }

        datasets.push({
            label: capteur.nom,
            data: creerDonnees(
                capteur.valeur,
                variation,
                nombre
            ),
            borderColor: capteur.couleur,
            backgroundColor: capteur.couleur + "18",
            fill: idsCapteurs.length === 1,
            tension: 0.4,
            pointRadius: periode === "7j" ? 3 : 0,
            borderWidth: 2.5,
            yAxisID: id === "temp" ? "y" : "y1"
        });
    }

    let graphique = new Chart(canvas, {
        type: "line",

        data: {
            labels: labels,
            datasets: datasets
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {
                legend: {
                    display: true,
                    position: "bottom"
                }
            },

            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },

                y: {
                    display: idsCapteurs.includes("temp")
                },

                y1: {
                    display: idsCapteurs.some(id => id !== "temp"),
                    position: "right",
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });

    graphiques.push(graphique);
}

// =====================================
// 14. CHOIX DE LA PÉRIODE
// =====================================

function afficherPeriodes() {
    let html = '<div class="period-picker">';

    let periodes = ["24h", "7j", "30j"];

    for (let valeur of periodes) {
        let classe = periode === valeur ? "selected" : "";

        html += `
            <button
                class="period ${classe}"
                data-period="${valeur}"
            >
                ${valeur}
            </button>
        `;
    }

    html += "</div>";

    return html;
}

// =====================================
// 15. PAGES DES CAPTEURS
// =====================================

function afficherDetails(type) {
    let ids = [];
    let titre = "";

    if (type === "temperature") {
        ids = ["temp"];
        titre = "Température";
    }

    else if (type === "humidity") {
        ids = ["air", "soil"];
        titre = "Humidité";
    }

    else {
        ids = ["light"];
        titre = "Luminosité";
    }

    let html = creerEntete(
        titre,
        "Surveillance et historique des mesures de " +
        titre.toLowerCase() + "."
    );

    html += '<div class="detail-grid">';

    for (let id of ids) {
        html += `
            <div class="card">
                ${afficherCapteur(id)}
            </div>
        `;
    }

    let idSeuil = "light";

    if (type === "temperature") {
        idSeuil = "temp";
    }

    if (type === "humidity") {
        idSeuil = "soil";
    }

    let unite = capteurs[idSeuil].unite;

    html += `
        <div class="card">
            <div class="stat-name">
                Seuil d'alerte
            </div>

            <div class="stat-value">
                ${seuils[idSeuil]}
                <span class="stat-unit">${unite}</span>
            </div>

            <div class="stat-foot">
                Personnalisable dans Contrôle
            </div>
        </div>
    `;

    html += "</div>";

    html += `
        <div class="split section">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        Historique des mesures
                    </h3>

                    ${afficherPeriodes()}
                </div>

                <p class="card-sub">
                    Données de démonstration
                </p>

                <div class="chart-wrap">
                    <canvas id="chart-detail"></canvas>
                </div>
            </div>

            <div class="card">
                <h3 class="card-title">
                    À propos des mesures
                </h3>

                <p class="card-sub">
                    Informations sur la supervision
                </p>

                <div class="status-list">
    `;

    for (let id of ids) {
        html += `
            <div class="status-row">
                <span class="status-ico">
                    ${capteurs[id].icone}
                </span>

                <div>
                    <div class="status-label">
                        ${capteurs[id].nom}
                    </div>

                    <div class="status-desc">
                        Actualisation toutes les 5 secondes
                    </div>
                </div>

                <span class="status-state">OK</span>
            </div>
        `;
    }

    html += `
                </div>

                <div class="notice" style="margin-top:24px">
                    Les mesures sont simulées.
                    Connectez votre backend pour utiliser
                    les vraies données.
                </div>
            </div>
        </div>
    `;

    html += `
        <div class="card section">
            <div class="card-header">
                <h3 class="card-title">
                    Journal des dernières mesures
                </h3>

                <span class="mini-pill">
                    Données simulées
                </span>
            </div>

            <div class="table-scroll">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Heure</th>
                            <th>Capteur</th>
                            <th>Mesure</th>
                            <th>État</th>
                        </tr>
                    </thead>

                    <tbody>
    `;

    for (let id of ids) {
        for (let i = 0; i < 5; i++) {
            let heure = String(12 - i).padStart(2, "0");

            let variation = 2;

            if (id === "temp") {
                variation = 0.4;
            }

            if (id === "light") {
                variation = 170;
            }

            let valeur = capteurs[id].valeur + (i - 2) * variation;

            html += `
                <tr>
                    <td>${heure}:00</td>
                    <td>${capteurs[id].nom}</td>
                    <td>
                        ${formatNombre(valeur)}
                        ${capteurs[id].unite}
                    </td>
                    <td>
                        <span class="good-tag">
                            Normal
                        </span>
                    </td>
                </tr>
            `;
        }
    }

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    return html;
}

// =====================================
// 16. PAGE CONTRÔLE
// =====================================

function afficherControle() {
    let html = creerEntete(
        "Centre de contrôle",
        "Pilotez les équipements et personnalisez les seuils de votre serre."
    );

    html += `
        <div class="split">
            <div class="card">
                <h3 class="card-title">
                    Gestion des équipements
                </h3>

                <p class="card-sub">
                    Mode manuel et automatique
                </p>
    `;

    let liste = [
        ["automatic", "🤖", "Mode automatique",
            "Autoriser la régulation automatique"],

        ["fan", "🌀", "Ventilation",
            "Activer ou arrêter le ventilateur"],

        ["water", "💦", "Arrosage",
            "Activer ou arrêter la pompe"],

        ["lamps", "💡", "Éclairage",
            "Allumer ou éteindre les lampes"]
    ];

    for (let appareil of liste) {
        let id = appareil[0];
        let icone = appareil[1];
        let nom = appareil[2];
        let description = appareil[3];

        let classe = appareils[id] ? "on" : "";

        html += `
            <div class="control-row">
                <div class="status-row">
                    <span class="status-ico">
                        ${icone}
                    </span>

                    <div>
                        <div class="status-label">
                            ${nom}
                        </div>

                        <div class="status-desc">
                            ${description}
                        </div>
                    </div>
                </div>

                <button
                    class="toggle ${classe}"
                    data-toggle="${id}"
                    aria-label="${nom}"
                    aria-pressed="${appareils[id]}"
                ></button>
            </div>
        `;
    }

    html += `
            </div>

            <div class="card">
                <h3 class="card-title">
                    Seuils d'alerte
                </h3>

                <p class="card-sub">
                    Modifiez les valeurs déclenchant une alerte
                </p>
    `;

    let reglages = [
        ["temp", "Température maximum", "°C", 15, 45],
        ["air", "Humidité de l'air minimum", "%", 10, 90],
        ["soil", "Humidité du sol minimum", "%", 10, 90],
        ["light", "Luminosité maximum", "lux", 1000, 20000]
    ];

    for (let reglage of reglages) {
        let id = reglage[0];
        let nom = reglage[1];
        let unite = reglage[2];
        let minimum = reglage[3];
        let maximum = reglage[4];

        html += `
            <div class="setting">
                <label>
                    ${nom}

                    <span id="threshold-${id}">
                        ${seuils[id]} ${unite}
                    </span>
                </label>

                <input
                    class="range"
                    type="range"
                    min="${minimum}"
                    max="${maximum}"
                    step="1"
                    value="${seuils[id]}"
                    data-threshold="${id}"
                    data-unit="${unite}"
                >
            </div>
        `;
    }

    html += `
                <div class="notice">
                    Les commandes modifient uniquement
                    la simulation.
                    Aucun appareil physique n'est piloté.
                </div>
            </div>
        </div>
    `;

    return html;
}

// =====================================
// 17. PAGE NOTIFICATIONS
// =====================================

function afficherNotifications() {
    let html = creerEntete(
        "Notifications",
        "Consultez les alertes et les événements récents."
    );

    html += `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">
                    Centre de notifications
                </h3>

                <button class="btn" id="clearNotices">
                    Effacer les notifications
                </button>
            </div>

            <p class="card-sub">
                Historique de démonstration
            </p>
    `;

    let notifications = [
        [
            "⚠️",
            "Humidité du sol faible",
            "Le niveau d'humidité du sol se rapproche du seuil défini.",
            "Il y a 12 min"
        ],

        [
            "☀️",
            "Luminosité élevée",
            "Une exposition lumineuse importante a été détectée.",
            "Il y a 1 h"
        ],

        [
            "✅",
            "Ventilation activée",
            "La ventilation a été mise en marche.",
            "Il y a 3 h"
        ],

        [
            "💧",
            "Arrosage terminé",
            "Le dernier cycle d'arrosage s'est terminé.",
            "Hier"
        ]
    ];

    for (let notification of notifications) {
        html += `
            <div class="alert-row">
                <span class="alert-icon">
                    ${notification[0]}
                </span>

                <div style="flex:1">
                    <strong>${notification[1]}</strong>
                    <small>${notification[2]}</small>
                </div>

                <span class="subtitle">
                    ${notification[3]}
                </span>
            </div>
        `;
    }

    html += "</div>";

    return html;
}

// =====================================
// 18. AFFICHAGE DE LA PAGE
// =====================================

function afficherPage() {
    supprimerGraphiques();

    let menuHTML = "";

    for (let element of pages) {
        let id = element[0];
        let nom = element[1];
        let icone = element[2];

        let classe = pageActuelle === id ? "active" : "";

        menuHTML += `
            <div class="nav-item ${classe}" data-page="${id}">
                <span class="nav-icon">${icone}</span>
                ${nom}
            </div>
        `;
    }

    document.getElementById("nav").innerHTML = menuHTML;

    for (let element of pages) {
        if (element[0] === pageActuelle) {
            document.getElementById("crumb").textContent = element[1];
        }
    }

    let contenu = "";

    if (pageActuelle === "home") {
        contenu = afficherAccueil();
    }

    else if (
        pageActuelle === "temperature" ||
        pageActuelle === "humidity" ||
        pageActuelle === "light"
    ) {
        contenu = afficherDetails(pageActuelle);
    }

    else if (pageActuelle === "control") {
        contenu = afficherControle();
    }

    else if (pageActuelle === "notifications") {
        contenu = afficherNotifications();
    }

    document.getElementById("app").innerHTML = contenu;

    // Créer les graphiques après l'affichage du HTML

    if (pageActuelle === "home") {
        creerGraphique("chart-home", ["temp", "air"]);
    }

    if (pageActuelle === "temperature") {
        creerGraphique("chart-detail", ["temp"]);
    }

    if (pageActuelle === "humidity") {
        creerGraphique("chart-detail", ["air", "soil"]);
    }

    if (pageActuelle === "light") {
        creerGraphique("chart-detail", ["light"]);
    }
}

// =====================================
// 19. GESTION DES CLICS
// =====================================

document.addEventListener("click", function(event) {

    // Changer de période
    let boutonPeriode = event.target.closest("[data-period]");

    if (boutonPeriode) {
        periode = boutonPeriode.dataset.period;
        afficherPage();
        return;
    }

    // Effacer les notifications
    if (event.target.closest("#clearNotices")) {
        let notifications = document.querySelectorAll(".alert-row");

        for (let notification of notifications) {
            notification.remove();
        }

        return;
    }

    // Navigation
    let boutonPage = event.target.closest("[data-page]");

    if (boutonPage) {
        changerPage(boutonPage.dataset.page);
        return;
    }

    // Activer le mode édition
    if (event.target.closest("#editBtn")) {
        modeEdition = !modeEdition;
        afficherPage();
        return;
    }

    // Ajouter un widget
    let boutonAjouter = event.target.closest("[data-add]");

    if (boutonAjouter) {
        widgets.push(boutonAjouter.dataset.add);

        sauvegarder("widgets", widgets);
        afficherPage();
        return;
    }

    // Supprimer un widget
    let boutonSupprimer = event.target.closest("[data-remove]");

    if (boutonSupprimer) {
        let id = boutonSupprimer.dataset.remove;

        widgets = widgets.filter(function(widget) {
            return widget !== id;
        });

        sauvegarder("widgets", widgets);
        afficherPage();
        return;
    }

    // Changer la taille d'un widget
    let boutonTaille = event.target.closest("[data-resize]");

    if (boutonTaille) {
        let id = boutonTaille.dataset.resize;

        if (tailles[id] === "wide") {
            tailles[id] = "full";
        }

        else if (tailles[id] === "full") {
            tailles[id] = "";
        }

        else {
            tailles[id] = "wide";
        }

        sauvegarder("sizes", tailles);
        afficherPage();
        return;
    }

    // Allumer ou éteindre un appareil
    let boutonAppareil = event.target.closest("[data-toggle]");

    if (boutonAppareil) {
        let id = boutonAppareil.dataset.toggle;

        appareils[id] = !appareils[id];

        sauvegarder("devices", appareils);
        afficherPage();
        return;
    }

    // Ouvrir les notifications
    if (event.target.closest("#notifBtn")) {
        changerPage("notifications");
        return;
    }

    // Ouvrir le menu mobile
    if (event.target.closest("#menuBtn")) {
        document.querySelector(".sidebar").classList.toggle("open");
    }
});

// =====================================
// 20. MODIFICATION DES SEUILS
// =====================================

document.addEventListener("input", function(event) {
    if (event.target.matches("[data-threshold]")) {
        let id = event.target.dataset.threshold;
        let unite = event.target.dataset.unit;

        seuils[id] = Number(event.target.value);

        sauvegarder("thresholds", seuils);

        document.getElementById("threshold-" + id).textContent =
            seuils[id] + " " + unite;
    }
});

// =====================================
// 21. DÉPLACEMENT DES WIDGETS
// =====================================

document.addEventListener("dragstart", function(event) {
    let widget = event.target.closest(".widget.editing");

    if (!widget) {
        return;
    }

    widgetDeplace = widget.dataset.widget;
    widget.classList.add("dragging");

    event.dataTransfer.effectAllowed = "move";
});

document.addEventListener("dragover", function(event) {
    if (widgetDeplace && event.target.closest(".widget")) {
        event.preventDefault();
    }
});

document.addEventListener("drop", function(event) {
    let cible = event.target.closest(".widget");

    if (!widgetDeplace || !cible) {
        return;
    }

    event.preventDefault();

    let anciennePosition = widgets.indexOf(widgetDeplace);
    let nouvellePosition = widgets.indexOf(cible.dataset.widget);

    if (anciennePosition !== nouvellePosition) {
        widgets.splice(anciennePosition, 1);
        widgets.splice(nouvellePosition, 0, widgetDeplace);

        sauvegarder("widgets", widgets);
    }

    widgetDeplace = null;

    afficherPage();
});

document.addEventListener("dragend", function() {
    widgetDeplace = null;

    let elements = document.querySelectorAll(".dragging");

    for (let element of elements) {
        element.classList.remove("dragging");
    }
});

// =====================================
// 22. SIMULATION DES CAPTEURS
// =====================================

function actualiserCapteurs() {
    for (let id in capteurs) {
        let capteur = capteurs[id];

        let variation = 1.2;

        if (id === "temp") {
            variation = 0.12;
        }

        if (id === "light") {
            variation = 120;
        }

        let changement = (Math.random() - 0.5) * variation;

        capteur.valeur += changement;

        if (capteur.valeur < 0) {
            capteur.valeur = 0;
        }

        let elements = document.querySelectorAll(
            `[data-metric="${id}"]`
        );

        for (let element of elements) {
            element.textContent = formatNombre(capteur.valeur);
        }
    }
}

// Actualiser toutes les 5 secondes
setInterval(actualiserCapteurs, 5000);

// =====================================
// 23. DÉMARRAGE
// =====================================

afficherPage();