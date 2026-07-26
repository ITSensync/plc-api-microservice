const { WebSocket } = require("ws");
const { setWss } = require("./socketManager");

exports.mainWebSocket = (server) => {
  const wss = new WebSocket.Server(server);

  setWss(wss);

  wss.on("connection", (ws) => {
    console.log("Client Connected");

    ws.on("message", (message) => {
      const payload = JSON.parse(message);

      // simpan machineId yang di-subscribe client
      ws.machineId = payload.machineId;
      // ws.section = payload.section;

      ws.send(JSON.stringify({
        type: "subscribed"
      }));
    });
  });

  console.log(`WebSocket server initialize on ws://localhost:${process.env.WS_PORT}`);
};