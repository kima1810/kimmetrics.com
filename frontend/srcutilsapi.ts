const api = axios.create({
  baseURL: 'http://YOUR-EC2-PUBLIC-IP:8000/api',  // Replace with your EC2 IP
  timeout: 120000
});