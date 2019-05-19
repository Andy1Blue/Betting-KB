/*
 * BetsList Component 
 *
 */

// Imports
import React, { Component } from 'react';
import getBet from '../../../utils/getBet';
import BetItem from '../BetItem';

class BetsList extends Component {
  state = {
    show: null,
    isFetching: true,
    isLogin: false,
    token: this.props.token
  }

  componentWillMount() {
    if (this.state.token.id) {
      getBet(this.state.token.id, this.state.token.email)
        .then((result) => {
          console.log(result)
          this.setState({ show: result, isFetching: false, isLogin: true })
        });
    }
  }

  render() {
    const { show, token } = this.state;
    return (
      <div className='itemConatiner'>
        {show !== null &&
          show.map(shows =>
            <BetItem
              bets={shows}
              token={token}
              id={shows.id}
              key={shows.id} />
          )}
      </div>)
  }

}

export default BetsList;