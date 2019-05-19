/*
 * BetItem Component 
 *
 */

// Imports
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import showDate from '../../../utils/showDate';
import getMatchById from '../../../utils/getMatchById';
import Loader from '../../Loader';
import './style.css';

class BetItem extends Component {
    state = {
        match: null,
        isFetching: true
    }

    componentWillMount() {
        if (this.props.token.id) {
            getMatchById(this.props.token.id, this.props.token.email, this.props.bets.id_match)
                .then((result) => {
                    let matchFormatted = "(" + result[0].team_a + " vs " + result[0].team_b + ") start at " + result[0].start;
                    this.setState({ match: matchFormatted, isFetching: false })
                });
        }
    }

    render() {
        const { bets } = this.props;
        const { match, isFetching } = this.state;

        return (
            <div>
                {isFetching && <Loader />}
                {!isFetching && match !== null &&
                    <div className='betItem'>
                        <div className='item'>
                            <span className='itemTask'>{match} {bets.bet} {showDate(bets.date)}</span>
                            <div className='itemEdit'>
                                <button className='deleteButton' type="submit" onClick={() => { this.delete(bets.id) }}>&#10006;</button>
                                <Link to={`/edit/${bets.id}`}><button className='editButton'>&#9998;</button></Link>
                            </div>
                        </div>
                    </div>
                }
            </div>
        )
    }
}

export default BetItem;