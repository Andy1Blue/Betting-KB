import React, { Component } from 'react';
import './style.css';

class Main extends Component {
  render() {
    return (
    <p className="App-login">
      <div className="Login-form">
        <form method="POST" onSubmit={this.loginUser}>
          <p>Email:</p>
          <input type="text" name="email"/><br/>
          <p>Password:</p>
          <input type="password" name="password"/><br/>
          <button>Login</button>
        </form>
      </div>
    </p>
  )
}

}

export default Main;
