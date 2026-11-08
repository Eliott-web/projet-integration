import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import style from "temperature.module.css";

function Temperature() {

    return (
        <div className={style.temperature}>
            <h1>Temperature Page</h1>
            <p>This is the temperature page content.</p>
        </div>
    );
}

export default Temperature;