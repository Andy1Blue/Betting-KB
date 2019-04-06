import React, { Component } from 'react';
// import { Redirect } from 'react-router-dom';
import deleteBet from '../../utils/deleteBet';
import BetsList from '../Bets/BetsList';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogin: false,
      token: this.props.token
    }
    this.delete = this.delete.bind(this);
  }

  componentWillMount() {
    if (this.state.token.id) {
      this.setState({ isLogin: true })
    }
  }

  delete(id) {
    if (id) {
      deleteBet(this.props.token.id, this.props.token.email, id).then((result) => {
        alert("Deleted!");
        window.location.href = "/";
      });
    }
  }

  render() {
    const { isLogin, token } = this.state;
    return (
      <div className="App-home">
        <h1>Home</h1>
        <div className="user-bet">
          {!isLogin && <h2>Login or Signup to show your data!</h2>}
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

export default Home;
