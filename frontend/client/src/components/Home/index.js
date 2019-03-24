import React, { Component } from 'react';
// import { Redirect } from 'react-router-dom';
import getBet from '../../utils/getBet';
import showDate from '../../utils/showDate';
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
         <div className="user-bet">
            {isLogin && isFetching && <Loader />}
            {isLogin && show != null && !isFetching &&
              <div className="last-bet">
                <b>Your last bet:</b>
                <ul>
                  <li>Bet: {show[0].bet}</li>
                  <li>Match: {show[0].id_match}</li>
                  <li>Date: {showDate(show[0].date)}</li>
                </ul>
              </div>}
          </div>
        </div>
  );
}
}

export default Home;
