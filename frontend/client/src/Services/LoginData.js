export default function LoginData(values) {
  return new Promise((resolve, reject) => {
    fetch('http://localhost:3322/login',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
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
