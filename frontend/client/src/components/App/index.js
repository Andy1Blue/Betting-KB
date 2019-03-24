import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import logo from '../../assets/logo.png';
import './App.css';
import Footer from '../Footer';
// import Main from '../Main';
import Login from '../Login';
import Home from '../Home';
import SignUp from '../SignUp';
import {Redirect} from 'react-router-dom';
// import authorizationToken from '../../Utils/authorizationToken';

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
    if(sessionStorage.getItem('token')) {
      this.setState({isLogin: true, token: {id: sessionStorage.getItem('token'), email: sessionStorage.getItem('email')}});
    } else {
      this.setState({isLogin: false});
    }
  }

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.clear();
    this.setState({isLogin: false, token: {}});
    window.location.href = "/";
  }

render() {
 const {token, isLogin} = this.state;
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
              {isLogin && <li><b>Welcome: {token.email}</b></li>}
              <li>
                <Link to="/">Home</Link>
              </li>
              {!isLogin && <li><Link to="/login">Login</Link></li>}
              {!isLogin && <li><Link to="/signup">Signup</Link></li>}
              {isLogin && <li><button onClick={this.logout}>Logout</button></li>}
            </ul>
          </div>
        </div>

        <Route exact path="/" render={() => (
          <Home
          token={this.state.token}
          />
          )}/>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={SignUp} />

        <Footer/>
      </div>
    </Router>
  );
}
}

export default App;
