const ws = new WebSocket("ws://localhost:8181");
let nickname = "";

ws.onopen = (e) => {
  console.log("Connection to server opened");
  alert('Seja bem vindo ao nosso chat!\n\nPor padrão você receberá um nome aleatório, caso deseje trocar apenas digite: "/nick novo_nome" ao chat!\n\nAproveite e faça novos amigos!')
};

function receiveMessage(e) {
  const data = JSON.parse(e.data);
  nickname = data.nickname;
  appendLog(data.type, data.nickname, data.message);
}

ws.onmessage = receiveMessage;

function appendLog(type, nickname, message) {
  const messages = document.getElementById("messages");
  const messageElem = document.createElement("li");

  let preface_label;

  switch (type) {
    case "notification":
      preface_label = '<span class="label label-info">*</span>';
      break;
    case "nick_update":
      preface_label = '<span class="label label-warning">*</span>';
      break;
    case "error":
      preface_label = '<span class="label label-error">*</span>';
      break;
    default:
      preface_label = `<span class="label label-success">${nickname}</span>`;
  }

  const message_text = `<p>${preface_label}&nbsp;&nbsp;${message}</p>`;

  messageElem.innerHTML = message_text;
  messages.appendChild(messageElem);
  messages.scrollTo(0, messages.scrollHeight);
}

ws.onclose =  (e)  => {
  appendLog("error", "", "Connection closed");
  console.log("Connection closed");
};

function sendMessage() {
  const messageField = document.getElementById("message");
  const message = messageField.value;

  if(message.trim().length == 0)
    return alert('Defina uma mensagem válida!');

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(messageField.value);
  }

  messageField.value = "";
  messageField.focus();
}

function disconnect() {
  ws.close();
}
