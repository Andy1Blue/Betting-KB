import React, { Component } from 'react';
import serializeForm from 'form-serialize';
import './style.css';
// import {Redirect} from 'react-router-dom';
import Register from '../../services/Register';
import authorizationToken from '../../utils/authorizationToken';

class SignUp extends Component {
  registerUser = (e) => {
     e.preventDefault();
     const values = serializeForm(e.target, {hash: true});
     const email = /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(values.email.trim())
     if(email) {
       Register(values).then((result) => {
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
    return (
      <div>
    <div className="App-register">
      <div className="Register-form">
        <form method="POST" onSubmit={this.registerUser}>
          <p>Name:</p>
          <input type="text" name="name"/><br/>
          <p>Email:</p>
          <input type="text" name="email"/><br/>
          <p>Password:</p>
          <input type="password" name="password"/><br/>
          <button>Register</button>
        </form>
      </div>
    </div>
  </div>
  )
}

}

export default SignUp;
