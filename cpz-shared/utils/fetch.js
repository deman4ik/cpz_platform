import fetch from "node-fetch";

function fetchJSON(url, agent) {
  return fetch(url, { agent })
    .then(res => {
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      return res.json();
    })
    .then(body => {
      if (body.Response === "Error") throw new Error(body.Message);
      return body;
    });
}

export { fetchJSON };
