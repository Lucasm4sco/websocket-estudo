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
const wss = new WebSocketServer({ port: PORT_WEBPACK });

const stocks = { AAPL: 95.0, MSFT: 50.0, AMZN: 300.0, GOOG: 550.0, YHOO: 35.0 };

const randomNumberBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

// updates the value of stocks randomly in random time
const randomStockUpdater = () => {
  for (const symbol in stocks) {
    const randomizedChange = randomNumberBetween(-150, 150);
    const floatChange = randomizedChange / 100;
    stocks[symbol] += floatChange;
  }

  const randomMSTime = randomNumberBetween(500, 2500);
  setTimeout(() => randomStockUpdater(), randomMSTime);
};

randomStockUpdater();

let clientStocks = [];

wss.on("connection", (ws) => {
  console.log("cliente connectado");

  const sendStockUpdates = (ws) => {
    if (ws.readyState === 1) {
      const stocksObj = {};

      for (const symbol of clientStocks) {
        stocksObj[symbol] = stocks[symbol];
      }

      ws.send(JSON.stringify(stocksObj));
    }
  };

  //sends current stock values ​​every 1 seg
  let clientStockUpdater = setInterval(() => sendStockUpdates(ws), 1000);

  ws.on("message", (message) => {
    const stock_request = JSON.parse(message);
    clientStocks = stock_request["stocks"];
    sendStockUpdates(ws);
  });

  ws.on("close", () =>
    typeof clientStockUpdater !== "undefined"
      ? clearInterval(clientStockUpdater)
      : null
  );
});
