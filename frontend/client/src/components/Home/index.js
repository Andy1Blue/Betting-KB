/*
 * Home Component
 *
 */

// Imports
import React, { Component } from 'react';
// import deleteBet from '../../utils/deleteBet';

class Home extends Component {
  state = {
    isLogin: false,
    token: this.props.token
  }

  componentWillMount() {
    if (this.state.token.id) {
      this.setState({ isLogin: true })
    }
  }

  // delete(id) {
  //   if (id) {
  //     deleteBet(this.props.token.id, this.props.token.email, id).then((result) => {
  //       alert("Deleted!");
  //       window.location.href = "/";
  //     });
  //   }
  // }

  render() {
    const { isLogin } = this.state;
    return (
      <div className="App-home">
        <h1>Home</h1>
        <div className="user-bet">
          {!isLogin && <h2>Login or Signup to show your data!</h2>}
          {isLogin &&
            <div className="last-bet">
              <p><b>Hello!</b></p>
            </div>
          }
        </div>
      </div>
    )
  }
}

export default Home;
