export default function Register(values) {
  return new Promise((resolve, reject) => {
    fetch('http://localhost:3322/register',{
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
