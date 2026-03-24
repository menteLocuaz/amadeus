import http from 'http';

const reqOpts = {
  hostname: 'localhost',
  port: 9090,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(reqOpts, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const authData = JSON.parse(data);
    const token = authData.data?.token;

    if (!token) {
      console.log('Login failed:', authData);
      return;
    }

    const sucReq = http.request({
      hostname: 'localhost',
      port: 9090,
      path: '/api/v1/sucursales',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (resSuc) => {
      let sData = '';
      resSuc.on('data', chunk => sData += chunk);
      resSuc.on('end', () => {
        console.log('Sucursales Response:', JSON.stringify(JSON.parse(sData), null, 2));
      });
    });
    sucReq.end();
  });
});

req.write(JSON.stringify({ email: "admin@prunus.com", password: "password123" }));
req.end();
