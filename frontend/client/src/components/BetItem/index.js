import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import showDate from '../../utils/showDate';
import './style.css';

class BetItem extends Component {
    static defaultProps = {
        bets: null
    }

    render() {
        const { bets } = this.props;
        return (
            <div className='betItem'>
                <ul>
                    <li>Bet: {bets.bet}</li>
                    <li>Match: {bets.id_match}</li>
                    <li>Date: {showDate(bets.date)}</li>
                    <li><Link to={`/edit/${bets.id}`}><button className='editButton'>&#9998;</button></Link></li>
                    <li><button type="submit" onClick={() => { this.delete(bets.id) }}>DELETE</button></li>
                </ul>
            </div>
        )
    }
}

export default BetItem;