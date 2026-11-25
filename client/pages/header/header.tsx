import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import style from "./header.module.css";

function Header() {
    const [currentTime, setCurrentTime] = useState(() => new Date());

    useEffect(() => {
        const clockIntervalId = window.setInterval(() => setCurrentTime(new Date()), 1000);
        return () => window.clearInterval(clockIntervalId);
    }, []);

    return (
        <header className={style.topbar}>
            <Link className={style.brand} to="/" aria-label="Serre, accueil">
                <span className={style.brandMark}>S</span>
                <span>Serre<span className={style.brandDetail}> / MONITORING</span></span>
            </Link>

            <nav className={style.navigation} aria-label="Navigation principale">
                <NavLink className={({ isActive }) => `${style.navLink}${isActive ? ` ${style.activeLink}` : ""}`} to="/humidite">
                    Humidité
                </NavLink>
                <NavLink className={({ isActive }) => `${style.navLink}${isActive ? ` ${style.activeLink}` : ""}`} to="/temperature">
                    Température
                </NavLink>
                <NavLink className={({ isActive }) => `${style.navLink}${isActive ? ` ${style.activeLink}` : ""}`} to="/luminosite">
                    Luminosité
                </NavLink>
                <NavLink className={({ isActive }) => `${style.navLink}${isActive ? ` ${style.activeLink}` : ""}`} to="/fenetre">
                    Fenêtre
                </NavLink>
                <NavLink className={({ isActive }) => `${style.navLink}${isActive ? ` ${style.activeLink}` : ""}`} to="/pompe">
                    Pompe
                </NavLink>
                <NavLink className={({ isActive }) => `${style.navLink}${isActive ? ` ${style.activeLink}` : ""}`} to="/control">
                    Contrôle
                </NavLink>
            </nav>

            <div className={style.clock}>
                <span className={style.clockLabel}>HEURE ACTUELLE</span>
                <time dateTime={currentTime.toISOString()}>
                    {new Intl.DateTimeFormat("fr-BE", {
                        hour: "2-digit",
                        minute: "2-digit",
                    }).format(currentTime)}
                </time>
                <span className={style.clockDate}>
                    {new Intl.DateTimeFormat("fr-BE", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                    }).format(currentTime)}
                </span>
            </div>
        </header>
    );
}

export default Header;