export default function authorizationToken(token) {
  let actualDate = Date.now();
  if(token) {
    if(token.expires > actualDate) {
  //  console.log(token.id, token.expires, actualDate);
    sessionStorage.setItem('token', token.id);
    sessionStorage.setItem('email', token.email);
    return true;
  } else {
        console.warn("Token data expires!");
  }
  } else {
    console.warn("Token is not exist!");
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('email');
    return false;
  }
}
