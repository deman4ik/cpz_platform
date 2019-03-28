const axios = require("axios");

(async () => {
  // берем из регистрации
  const correctLogin = "govolojin@postemail.net";
  const correctPass = "1oLksdsl90l";
  const incorrectLogin = "test@tes,r";
  const incorrectPass = "1234567890";
  let request;
  let token;

  const endpoint = "http://localhost:8104/api/login";

  try {
    console.log("Пробуем обновить с неправильными данными");
    request = await axios.post(endpoint, {
      email: correctLogin,
      password: incorrectPass
    });
    console.log(request.data);
  } catch (e) {
    console.log(e.response.status, e.response.data);
  }

  try {
    console.log("Пробуем обновить с правильными данными");
    request = await axios.post(endpoint, {
      email: correctLogin,
      password: correctPass
    });
    console.log(request.data);
  } catch (e) {
    console.log(e.response.status, e.response.data);
  }
})();
