import React from "react";
import './style.css'
import Logo from '../../images/logo.png'

export default function Nav() {
    return (
        <div className='topnav' >
            <img className='logo' src={Logo} alt='Chronos pay logo' />
        </div>
    );
}