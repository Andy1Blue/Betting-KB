export default function getMatchById(token, email, idmatch) {
    return new Promise((resolve, reject) => {
      fetch('http://localhost:3322/match',{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': token,
          'email': email,
          'idmatch': idmatch
        }
      })
      .then(data => data.json())
      .then(data => {
        console.log(data);
        resolve(data);
      })
      .catch((error) => {
        reject(error)
      });
    });
  }