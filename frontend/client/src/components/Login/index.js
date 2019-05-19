/*
 * Login Component
 *
 */

// Imports
import React, { Component } from 'react';
import serializeForm from 'form-serialize';
import './style.css';
import LoginData from '../../services/LoginData';
import authorizationToken from '../../utils/authorizationToken';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      isLogin: false,
      token: {}
    }
  }

  componentWillMount() {
    if(sessionStorage.getItem('token')) {
      this.setState({isLogin: true});
    } else {
      this.setState({isLogin: false});
    }
  }

  loginUser = (e) => {
     e.preventDefault();
     const values = serializeForm(e.target, {hash: true});
     const email = /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(values.email.trim())
     if(email) {
       LoginData(values).then((result) => {
         if(result.Error) {
           this.setState({isLogin: false, error: result.Error});
         }
         if(result.id) {
           console.log(result.id);
           this.setState({isLogin: true, token: result});
           authorizationToken(result);
          }
       });
     }
   };

  render() {
    if(this.state.isLogin) {
      window.location.href = "/";
    }

    const {error, isLogin} = this.state;
    return (
      <div>
      {this.state.isLogin === false &&
    <div className="App-login">
      <div className="Login-form" hidden={isLogin}>
        <form method="POST" onSubmit={this.loginUser}>
          <p>Email:</p>
          <input type="text" name="email"/><br/>
          <p>Password:</p>
          <input type="password" name="password"/><br/>
          <button>Login</button>
            {<p>{error}</p>}
        </form>
      </div>
    </div>
  }
  </div>
  )
}

}

export default Login;
