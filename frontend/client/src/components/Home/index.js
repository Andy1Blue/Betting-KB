import React, { Component } from 'react';
// import { Redirect } from 'react-router-dom';
import getBet from '../../utils/getBet';
import deleteBet from '../../utils/deleteBet';
import Loader from '../Loader';
import BetItem from './../../components/BetItem';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: null,
      isFetching: true,
      isLogin: false
    }
    this.delete = this.delete.bind(this);
  }

  componentWillMount() {
    if (this.props.token.id) {
      getBet(this.props.token.id, this.props.token.email)
        .then((result) => {
          console.log(result)
          this.setState({ show: result, isFetching: false, isLogin: true })
        });
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
    const { show, isFetching, isLogin } = this.state;
    return (
      <div className="App-home">
        <h1>Home</h1>
        <div className="user-bet">
          {!isLogin && <h2>Login or Signup to show your data!</h2>}
          {isLogin && isFetching && <Loader />}
          {isLogin && show != null && !isFetching &&
            <div className="last-bet">
              <b>Your bets:</b>
              <ul>
                {show.map(shows =>
                  <BetItem bets={shows} />
                )}
              </ul>
            </div>
          }
        </div>
      </div>
    );
  }
}

export default Home;
