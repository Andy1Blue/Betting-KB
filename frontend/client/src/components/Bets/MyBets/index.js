import React, { Component } from 'react';
// import { Redirect } from 'react-router-dom';
// import deleteBet from '../../../utils/deleteBet';
import BetsList from '../../Bets/BetsList';
import './style.css';

class MyBets extends Component {
    state = {
      isLogin: false,
      token: this.props.token
    }

  componentWillMount() {
    if (this.state.token.id) {
      this.setState({ isLogin: true })
    }
  }

//   delete(id) {
//     if (id) {
//       deleteBet(this.props.token.id, this.props.token.email, id).then((result) => {
//         alert("Deleted!");
//         window.location.href = "/";
//       });
//     }
//   }

  render() {
    const { isLogin, token } = this.state;
    return (
      <div className="App-my-bets">
        <h1>My Bets</h1>
        <div className="user-bet">
          {isLogin &&
            <div className="last-bet">
              <b>Your bets:</b>
              <BetsList token={token} />
            </div>
          }
        </div>
      </div>
    )
  }
}

export default MyBets;