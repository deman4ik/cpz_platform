import VError from "verror";
import io from "socket.io-client";
import { currentToObject } from "./utils";

// Текущее состояние процесса
const state = {
  taskId: "",
  hostId: "",
  socketStatus: "unknown"
};
process.send(process.env.HOST_ID);
// Создаем новое подключение к провайдеру Cryptocompare
const socket = io("https://streamer.cryptocompare.com/");

socket.on("connect", () => {
  state.socketStatus = "connect";
});
// При получении нового сообщения
socket.on("m", message => {
  const currentPrice = currentToObject(message);
  if (currentPrice) process.send(JSON.stringify(currentPrice));
});

// При disconnectе
socket.on("disconnect", reason => {
  state.socketStatus = reason;
  if (reason === "io server disconnect") {
    // the disconnection was initiated by the server, you need to reconnect manually
    socket.connect();
  }
  // else the socket will automatically try to reconnect
});

// Если произошла ошибка
socket.on("error", error => {
  state.socketStatus = "error";
  const cpzError = new VError(
    {
      name: "CryptocompareStreamingError",
      cause: new Error(error),
      info: {
        socketState: state
      }
    },
    'Cryptocompare streaming error - task "%s" on host "%s"',
    state.taskId,
    state.hostId
  );
  process.send(JSON.stringify(cpzError));
});

// Если все попытки переподключения исчерпаны
socket.on("reconnect_failed", () => {
  state.socketStatus = "reconnect_failed";
  const cpzError = new VError(
    {
      name: "CryptocompareStreamingError",
      info: {
        socketState: state
      }
    },
    'Cryptocompare streaming error - Reconnect failed - task "%s" on host "%s"',
    state.taskId,
    state.hostId
  );
  process.send(JSON.stringify(cpzError));
});

function start(newState) {
  try {
    const newSubs = newState.subscriptions.map(
      sub => `2~${sub.exchange}~${sub.asset}~${sub.currency}`
    );

    state.taskId = newState.taskId;
    state.hostId = newState.hostId;

    // Если сокет не подключен
    if (state.socketStatus !== "connect") {
      // Ждем секунду
      setTimeout(() => {
        // И проверяем повторно
        if (state.socketStatus !== "connect") {
          // Если все еще не подключен - генерируем ошибку
          throw new VError(
            {
              name: "CryptocompareStreamingError",

              info: {
                taskId: state.taskId,
                hostId: state.hostId
              }
            },
            'Can\'t open connection to Cryptocompare - task "%s" on host "%s"',
            state.taskId,
            state.hostId
          );
        }
      }, 1000);
    }

    socket.emit("SubAdd", { subs: newSubs });
  } catch (error) {
    const cpzError = new VError(
      {
        name: "CryptocompareStreamingError",
        cause: error,
        info: {
          socketState: state,
          startInput: newState
        }
      },
      'Cryptocompare start streaming error - task "%s" on host "%s"',
      state.taskId,
      state.hostId
    );
    process.send(JSON.stringify(cpzError));
  }
}

function stop() {
  socket.close();
  process.exit(0);
}

function subscribe(subscriptions) {
  try {
    const newSubs = subscriptions.map(
      sub => `2~${sub.exchange}~${sub.asset}~${sub.currency}`
    );

    socket.emit("SubAdd", { subs: newSubs });
  } catch (error) {
    const cpzError = new VError(
      {
        name: "CryptocompareStreamingError",
        cause: error,
        info: {
          socketState: state,
          subscribeInput: subscriptions
        }
      },
      'Cryptocompare subscribe streaming error - task "%s" on host "%s"',
      state.taskId,
      state.hostId
    );
    process.send(JSON.stringify(cpzError));
  }
}

function unsubscribe(subscriptions) {
  try {
    const delSubs = subscriptions.map(
      sub => `2~${sub.exchange}~${sub.asset}~${sub.currency}`
    );
    socket.emit("SubRemove", { subs: delSubs });
  } catch (error) {
    const cpzError = new VError(
      {
        name: "CryptocompareStreamingError",
        cause: error,
        info: {
          socketState: state,
          unsubscribeInput: subscriptions
        }
      },
      'Cryptocompare unsubscribe streaming error - task "%s" on host "%s"',
      state.taskId,
      state.hostId
    );
    process.send(JSON.stringify(cpzError));
  }
}

process.on("message", m => {
  const eventData = JSON.parse(m);
  switch (eventData.type) {
    case "start":
      start(eventData);
      break;
    case "stop":
      stop();
      break;
    case "subscribe":
      subscribe(eventData.subscriptions);
      break;
    case "unsubscribe":
      unsubscribe(eventData.subscriptions);
      break;
    default:
      break;
  }
});
