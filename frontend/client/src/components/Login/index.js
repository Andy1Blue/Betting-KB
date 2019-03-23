import React, { Component } from 'react';

class Main extends Component {
  render() {
    return (
    <p className="App-login">
      <form method="POST" onSubmit={this.loginUser}>
        <p>Email:</p>
        <input type="text" name="email"/><br/>
        <p>Password:</p>
        <input type="password" name="password"/><br/>
        <button>Login</button>
      </form>
      </p>
  )
}

}

export default Main;
