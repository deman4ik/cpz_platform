const axios = require("axios");

(async () => {
  const id = "76b2a8d4-7e92-4050-b93a-516b0bd9ff6c"; // берем из БД или с консоли
  const correctCode = "30113"; // берем с отправленного письма
  const incorrectCode = "1234567890";
  let request;

  const endpoint = "http://localhost:8104/api/checkRegistrationCode";

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
