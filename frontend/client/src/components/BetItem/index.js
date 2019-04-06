import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import showDate from '../../utils/showDate';
import getMatchById from '../../utils/getMatchById';
import './style.css';

class BetItem extends Component {
state = {
    match:null
}

    componentWillMount() {
        if (this.props.token.id) {
            getMatchById(this.props.token.id, this.props.token.email, this.props.bets.id_match)
            .then((result) => {
              let matchFormatted = "(" + result[0].team_a + " vs " + result[0].team_b + ") start at " + result[0].start;
              this.setState({ match: matchFormatted })
            });
        }
      }

    render() {
        const { bets } = this.props;
        const { match } = this.state;
        
        return (
            <div className='betItem'>
                <ul>
                    <li>Bet: {bets.bet}</li>
                    <li>Match: {match}</li>
                    <li>Date: {showDate(bets.date)}</li>
                    <li><Link to={`/edit/${bets.id}`}><button className='editButton'>&#9998;</button></Link></li>
                    <li><button type="submit" onClick={() => { this.delete(bets.id) }}>DELETE</button></li>
                </ul>
            </div>
        )
    }
}

export default BetItem;