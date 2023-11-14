import express from "express";
import { WebSocketServer } from "ws";

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
const wss = new WebSocketServer({
  address: "http://localhost",
  port: PORT_WEBPACK,
});

wss.on("connection", (ws) => {
  console.log("cliente conectado");

  ws.on("message", (message) => {
    console.log("Mensagem recebida do cliente:", message.toString());
  });
});
