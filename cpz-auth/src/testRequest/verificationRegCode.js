const axios = require("axios");

(async () => {
  const id = "10bf914d-8acd-4d97-a6ad-5d6dce87e5da"; // берем из БД или с консоли
  const correctCode = "70882"; // берем с отправленного письма
  const incorrectCode = "1234567890";
  let request;

  const endpoint = "http://localhost:8111/api/finalizeRegistration";

  try {
    console.log("Пробуем зарегистрироваться с неправильным кодом");
    request = await axios.post(endpoint, {
      id,
      code: incorrectCode
    });
    console.log(request.data);
  } catch (e) {
    console.log(e.response.status, e.response.data);
  }

  try {
    console.log("Пробуем зарегистрироваться с правильным кодом");
    request = await axios.post(endpoint, {
      id,
      code: correctCode
    });
    console.log(request.data);
    console.log("Код отправлен на почту");
  } catch (e) {
    console.log(e.response.status, e.response.data);
  }
})();
