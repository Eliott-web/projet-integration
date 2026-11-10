import { Link, NavLink } from "react-router-dom";
import style from "./header.module.css";

function Header() {
    return (
        <header className={style.topbar}>
            <Link className={style.brand} to="/" aria-label="Serre, accueil">
                <span className={style.brandMark}>S</span>
                <span>Serre<span className={style.brandDetail}> / MONITORING</span></span>
            </Link>

            <nav className={style.navigation} aria-label="Navigation principale">
                <NavLink className={({ isActive }) => `${style.navLink}${isActive ? ` ${style.activeLink}` : ""}`} to="/" end>
                    Vue d'ensemble
                </NavLink>
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
                <NavLink className={({ isActive }) => `${style.navLink}${isActive ? ` ${style.activeLink}` : ""}`} to="/control">
                    Contrôle
                </NavLink>
                <NavLink className={({ isActive }) => `${style.navLink}${isActive ? ` ${style.activeLink}` : ""}`} to="/pompe">
                    Pompe
                </NavLink>
                <NavLink className={({ isActive }) => `${style.navLink}${isActive ? ` ${style.activeLink}` : ""}`} to="/notification">
                    Notifications
                </NavLink>
            </nav>
        </header>
    );
}

export default Header;