/*
 * User Component
 *
 */

// Imports
import React, { Component } from 'react';
import getUser from '../../utils/getUser';
import Loader from '../Loader';

class User extends Component {
    state = {
        isLogin: false,
        token: this.props.token,
        isFetching: true,
        user: null
    }

    componentWillMount() {
        if (this.state.token.id) {
            this.setState({ isLogin: true })
            getUser(this.state.token.id, this.state.token.email)
                .then((result) => {
                    this.setState({ user: result, isFetching: false })
                });
        }
    }

    render() {
        const { isFetching, user, isLogin } = this.state;
        return (
            <div className="App-user">
                <h1>User</h1>
                <div className="user">
                    {isLogin &&
                        <div>
                            <b>Your data:</b>
                            {isFetching && <Loader />}
                            {!isFetching && user !== null &&
                                <div className='user-data'>
                                        <ul>
                                            <li>{user[0].name}</li>
                                            <li>{user[0].email}</li>
                                        </ul>
                                </div>
                            }
                        </div>
                    }
                </div>
            </div>
        )
    }
}

export default User;