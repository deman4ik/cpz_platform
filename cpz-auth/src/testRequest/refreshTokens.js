const axios = require("axios");

(async () => {
  // берем из БД или с консоли
  const refreshToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3NmIyYThkNC03ZTkyLTQwNTAtYjkzYS01MTZiMGJkOWZmNmMiLCJpYXQiOjE1NTM2Mzg2MTAsImV4cCI6MTU1NjIzMDYxMCwiaXNzIjoiY3B6LWF1dGgtc2VydmVyIn0.4zB7T5lxmtDoUKd4l8WKugX8Yck7EIJ0DQ7e3si3hpI";
  const incorrect =
    "eyJhbGciuoJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3NmIyYThkNC03ZTkyLTQwNTAtYjkzYS01MTZiMGJkOWZmNmMiLCJpYXQiOjE1NTM2Mzg2MTAsImV4cCI6MTU1NjIzMDYxMCwiaXNzIjoiY3B6LWF1dGgtc2VydmVyIn0.4zB7T5lxmtDoUKd4l8WKugX8Yck7EIJ0DQ7e3si3hpI";
  let request;

  const endpoint = "http://localhost:8111/api/refreshTokens";

  try {
    console.log("Пробуем обновить с неправильным токеном");
    request = await axios.post(endpoint, {
      token: incorrect
    });
    console.log(request.data);
  } catch (e) {
    console.log(e.response.status, e.response.data);
  }

  try {
    console.log("Пробуем обновить с правильным токеном");
    request = await axios.post(endpoint, {
      token: refreshToken
    });
    console.log(request.data);
  } catch (e) {
    console.log(e.response.status, e.response.data);
  }
})();
