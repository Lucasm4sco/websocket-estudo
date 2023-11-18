import express from "express";
import { WebSocketServer } from "ws";
import uuid from "node-uuid";

const PORT_APP = 3000;
const PORT_WEBPACK = 8181;

// client configs
const app = express();

app.listen(PORT_APP, () =>
  console.log(
    `App client listening on port ${PORT_APP}, the server Websocket will connect to the port ${PORT_WEBPACK}`
  )
);

app.use(express.static("public"));

app.get("/", (req, res) => res.redirect("/client.html"));

// websocket configs
const wss = new WebSocketServer({ port: PORT_WEBPACK });

/**
 * @type {{
 *  id: string,
 *  ws: WebSocket
 *  nickname: string
 * }[]}
 */
let clients = [];

/**
 *
 * @param {"message" | "notification" | "error"} type
 * @param {string} client_uuid
 * @param {string} nickname
 * @param {string} message
 */
function sendMessageForAllClients(type, client_uuid, nickname, message) {
  clients.forEach((client) => {
    client.ws.readyState === client.ws.OPEN &&
      client.ws.send(
        JSON.stringify({
          type: type,
          id: client_uuid,
          nickname: nickname,
          message: message,
        })
      );
  });
}

wss.on("connection", (ws) => {
  const client_uuid = uuid.v4();
  const nickname = "AnonymousUser" + (clients.length + 1);
  const client = { id: client_uuid, ws, nickname };
  clients.push(client);

  sendMessageForAllClients(
    "notification",
    client.id,
    client.nickname,
    `${client.nickname} entrou ao chat`
  );

  ws.on("message", (message) => {
    if (message.indexOf("/nick") == 0) {
      try {
        const new_nickname = message.toString().split(" ")[1];
        const old_nickname = client.nickname;

        const hasUser = clients.some(
          (client) => client.nickname === new_nickname
        );

        if (hasUser) throw new Error();

        client.nickname = new_nickname;
        const messageForUsers = `Cliente ${old_nickname} mudou seu nome para ${new_nickname}`;
        sendMessageForAllClients(
          "nick_update",
          client.id,
          client.nickname,
          messageForUsers
        );
      } catch (error) {
        console.log(error);
        const message = "Erro: Não foi possível atualizar o seu nome";
        ws.send(
          JSON.stringify({ nickname: client.nickname, message, type: "error" })
        );
      }
    } else {
      sendMessageForAllClients(
        "message",
        client.id,
        client.nickname,
        message.toString()
      );
    }
  });

  ws.on("close", function () {
    sendMessageForAllClients(
      "notification",
      client.id,
      client.nickname,
      `${client.nickname} saiu do chat`
    );

    clients = clients.filter((c) => c.id !== client.id);
  });

  process.on("SIGINT", function () {
    console.log("Closing things");
    process.exit();
  });
});
