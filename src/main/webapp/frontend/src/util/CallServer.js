export default async function CallServer(endpoint, method, data=null) {
  switch (method) {
    case 'GET':
      break;
    case 'POST':
      break;
    case 'PUT':
      break;
    case 'DELETE':
      break;
    default:
      // unsupported operation
      console.error("Error calling server: Unsupported HTTP method: " + method);
      return;
  }

  const token = localStorage.getItem('jwtToken'); // TODO - Temporary
  const optionsObj = {  
    method: `${method}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include',
  }

  if ((method === 'POST' || method === 'PUT') && data !== null) {
    optionsObj.body = JSON.stringify(data);
  }

  // Make the call
  const response = await fetch(endpoint, optionsObj);

  return response;
}