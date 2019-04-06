export default function getMatch(token, email) {
  return new Promise((resolve, reject) => {
    fetch('http://localhost:3322/match',{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
        'email': email
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