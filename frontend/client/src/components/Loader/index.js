import React from 'react';
import loaderSrc from '../../assets/loader.gif';
import './style.css';

const Loader = props => (
    <div className="contentLoader">
        <img className="loader" alt="Loader icon" src={loaderSrc} />
    </div>
);

export default Loader;
