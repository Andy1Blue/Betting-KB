import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import logo from '../../assets/logo.png';
import './App.css';
import Footer from '../Footer';
import Login from '../Login';
import Home from '../Home';
import SignUp from '../SignUp';
import MyBets from '../Bets/MyBets';
import User from '../User';
import Matches from '../Matches';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogin: false,
      token: {
        id: null,
        email: null
      }
    };
    this.logout = this.logout.bind(this);
  }

  componentWillMount() {
    if (sessionStorage.getItem('token')) {
      this.setState({ isLogin: true, token: { id: sessionStorage.getItem('token'), email: sessionStorage.getItem('email') } });
    } else {
      this.setState({ isLogin: false });
    }
  }

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.clear();
    this.setState({ isLogin: false, token: {} });
    window.location.href = "/";
  }

  render() {
    const { token, isLogin } = this.state;
    console.log(token);
    return (
      <Router>
        <div>
          <div className="App-header">
            <div className="App-logo">
              <img src={logo} className="App-logo" alt="logo" />
            </div>
            <h1>
              Betting
          </h1>
            <h2>
              Bet your match
          </h2>

            <div className="App-navigation">
              <ul>
                {isLogin &&
                  <div>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/mybets">My Bets</Link></li>
                    <li><Link to="/matches">Matches</Link></li>
                    <li><b>Welcome: {token.email}</b> (<Link to="/user">User</Link> | <a href="/" onClick={this.logout}>Logout</a>)</li>
                  </div>}

                {!isLogin &&
                  <div>
                    <li><Link to="/login">Login</Link></li>
                    <li><Link to="/signup">Signup</Link></li>
                  </div>}
              </ul>
            </div>
          </div>

          <Route exact path="/" render={() => (
            <Home
              token={this.state.token}
            />
          )} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/signup" component={SignUp} />
          <Route exact path="/mybets" render={() => (
            <MyBets
              token={this.state.token}
            />
          )} />
          <Route exact path="/user" render={() => (
            <User
              token={this.state.token}
            />
          )} />
          <Route exact path="/matches" render={() => (
            <Matches
              token={this.state.token}
            />
          )} />

          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;
