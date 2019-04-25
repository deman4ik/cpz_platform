const axios = require("axios");

(async () => {
  const correctLogin = "";
  const correctPass = "!Qwertyuiop0";
  const incorrectLogin = "test@tes,r";
  const incorrectPass = "1234567890";
  let request;

  const endpoint = "http://localhost:8111/api/registration";

  try {
    console.log("Пробуем зарегистрироваться с неправильной почтой");
    request = await axios.post(endpoint, {
      email: incorrectLogin,
      password: correctPass
    });
    console.log(request.data);
    console.log("Код отправлен на почту");
  } catch (e) {
    console.log(e.response.status, e.response.data);
  }

  try {
    console.log("Пробуем зарегистрироваться с неправильным паролем");
    request = await axios.post(endpoint, {
      email: correctLogin,
      password: incorrectPass
    });
    console.log(request.data);
    console.log("Код отправлен на почту");
  } catch (e) {
    console.log(e.response.status, e.response.data);
  }

  try {
    console.log("Пробуем зарегистрироваться с правильными данными");
    request = await axios.post(endpoint, {
      email: correctLogin,
      password: correctPass
    });
    console.log(request.data);
  } catch (e) {
    console.log(e.response.status, e.response.data);
  }

  try {
    console.log("Пробуем зарегистрироваться с той же почтой");
    request = await axios.post(endpoint, {
      email: correctLogin,
      password: correctPass
    });
    console.log(request.data);
  } catch (e) {
    console.log(e.response.status, e.response.data);
  }
})();
