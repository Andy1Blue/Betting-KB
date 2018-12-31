/*
 *
 *
 * Bet API
 * 
 */

//Dependecies
const helpers = require('./helpers');
const db = require('./db');

//container for bet methods
const bet = {}

//Required data: token, email, bet: id user, id match, bet
bet.post = (req, res) => {
    req.on('data', (data) => {
        let payload = Buffer.from(data).toString();
        const payloadObject = helpers.parseJsonToObject(payload);
        // const name = typeof (payloadObject.name) == 'string' && payloadObject.name.trim().length > 0 ? payloadObject.name.trim() : false;
        const email = typeof (payloadObject.email) == 'string' && payloadObject.email.trim().length > 0 && /[\w+0-9._%+-]+@[\w+0-9.-]+\.[\w+]{2,3}/.test(payloadObject.email.trim()) ? payloadObject.email.trim() : false;
        // const bets = typeof (payloadObject.bets) == 'object' && payloadObject.bets instanceof Array && payloadObject.length > 0 ? payloadObject.bets : false;
        // const idUser = typeof(payloadObject.idUser) == 'string' && payloadObject.idUser.trim().length > 0 ? payloadObject.idUser.trim() : false;
        const idMatch = typeof (payloadObject.idMatch) == 'number' && payloadObject.idMatch > 0 ? payloadObject.idMatch : false;
        const bet = typeof (payloadObject.bet) == 'number' && [1, 2, 3].indexOf(payloadObject.bet) > -1 ? payloadObject.bet : false;
        console.log(email, idMatch, bet)

        if (email && idMatch && bet) {

            //Get the token from the headers
            const token = typeof (req.headers.token) == 'string' && req.headers.token.length == 20 ? req.headers.token : false;

            helpers.verifyToken(token, email, (tokenIsValid) => {

                //TODO adding to check idMatch in db
                if (tokenIsValid) {
                    db.read('user', 'email', email)
                        .then(userData => {
                            const userId = userData[0].id;
                            const dataBet = {
                                'id_user': userId,
                                'id_match': idMatch,
                                'bet': bet
                            }
                            db.read('bet', 'id_user', userId)
                                .then(betData => {
                                    let isBetExist = false
                                    betData.forEach(bet => {
                                        if (bet.id_user === userId && bet.id_match === idMatch) {
                                            isBetExist = true;
                                        }
                                    });

                                    if (isBetExist) {
                                        helpers.response(res, 403, {
                                            'Error': 'this bet already exist'
                                        });
                                    } else {
                                        db.create('bet', dataBet)
                                            .then(() => {
                                                helpers.response(res, 200, {
                                                    'Message': 'New bet has been added'
                                                });
                                            })
                                            .catch((err) => {
                                                helpers.response(res, 500, {
                                                    'Error': 'Could not add new bet'
                                                });
                                            });

                                    }
                                })
                                .catch(() => {
                                    db.create('bet', dataBet)
                                        .then(() => {
                                            helpers.response(res, 200, {
                                                'Message': 'New bet has been added'
                                            });
                                        })
                                        .catch((err) => {
                                            helpers.response(res, 500, {
                                                'Error': 'Could not add new bet'
                                            });
                                        });
                                })
                        });


                } else {
                    helpers.response(res, 403, {
                        'Error': 'Missing required token in header, or token is invalid'
                    });
                }
            });
        } else {
            helpers.response(res, 403, {
                'Error': 'Missing required field(s)'
            });
        }
    });
};

module.exports = bet