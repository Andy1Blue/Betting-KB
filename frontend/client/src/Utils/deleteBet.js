export default function deleteBet(token, email, idToDelete) {
  return new Promise((resolve, reject) => {
    fetch('http://localhost:3322/bet',{
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
        'email': email,
        'idBet': idToDelete
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
