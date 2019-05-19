/*
 * Matches Component
 *
 */

// Imports
import React, { Component } from 'react';
import getMatch from '../../utils/getMatch';
import Loader from '../Loader';
import './style.css';

class Matches extends Component {
    state = {
        isLogin: false,
        token: this.props.token,
        isFetching: true,
        matches: null
    }

    componentWillMount() {
        if (this.state.token.id) {
            this.setState({ isLogin: true })
            getMatch(this.state.token.id, this.state.token.email)
                .then((result) => {
                    this.setState({ matches: result, isFetching: false })
                });
        }
    }

    render() {
        const { isFetching, matches, isLogin } = this.state;
        return (
            <div className="App-matches">
                <h1>Matches</h1>
                <div className="user-bet">
                    {isLogin &&
                        <div className="matches-list">
                            <b>All matches:</b>
                            {isFetching && <Loader />}
                            {!isFetching && matches !== null &&
                                <div className='matches'>
                                    {matches.map(match =>
                                        <div className='matchItem'>
                                            <ul>
                                                <li>Ihe match will start in ... hour</li>
                                                <li>{match.team_a} vs {match.team_b}</li>
                                                <li>Result: {match.result}</li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            }
                        </div>
                    }
                </div>
            </div>
        )
    }
}

export default Matches;