import React, { Component } from 'react';
import logo from '../../assets/logo.png';
import './App.css';
import Footer from '../Footer';
import Main from '../Main';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
            <h1>
              Betting
            </h1>
            <h2>
            Bet your match
            </h2>
        </div>
          <Main/>
        <div>
          <Footer/>
        </div>
      </div>
    );
  }
}

export default App;
