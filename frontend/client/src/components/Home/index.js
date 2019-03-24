import React, { Component } from 'react';
// import { Redirect } from 'react-router-dom';
import getBet from '../../Utils/getBet';
import Loader from '../Loader';

class Home extends Component {
  state = {
      show: null,
      isFetching: true,
      isLogin: false
}

  componentWillMount() {
    if(this.props.token.id) {
  getBet(this.props.token.id, this.props.token.email)
  .then((result) => {
    this.setState({show: result, isFetching: false, isLogin: true})
  });
}
}

  render() {
    const {show, isFetching, isLogin} = this.state;
    return (
        <div className="App-home">
         <h1>Home</h1>
         <div className="user_bet">
            {isLogin && isFetching && <Loader />}
            {isLogin && show != null && !isFetching && <div><h2>Your last bet:</h2>
              <ul>Bet: {show[0].bet}</ul>
              <ul>Match: {show[0].id_match}</ul>
              <ul>Date: {show[0].date}</ul>
              </div>}
          </div>
        </div>
  );
}
}

export default Home;
