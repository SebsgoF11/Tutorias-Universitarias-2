// ms-agenda/src/app.js
const express = require('express');
const config = require('./config'); // <-- USAR EL NUEVO CONFIG
const agendaRouter = require('./api/routes/agenda.routes');
const errorHandler = require('./api/middlewares/errorHandler');
const correlationIdMiddleware = require('./api/middlewares/correlationId.middleware.js');
const messageProducer = require('./infrastructure/messaging/message.producer'); // <-- IMPORTAR PRODUCTOR

const client = require("prom-client");
const Registry = client.Registry;
const register = new Registry();

const app = express();

app.use(express.json());
app.use(correlationIdMiddleware);
app.use('/agenda', agendaRouter);
app.use(errorHandler);

client.collectDefaultMetrics({ register });

app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.send(await register.metrics());
  } catch (err) {
    res.status(500).send(err.message);
  }
});


app.listen(config.port, () => { // <-- Usar config.port
    console.log(`MS_Agenda escuchando en el puerto ${config.port}`);
    messageProducer.connect(); // <-- INICIAR CONEXIÓN A RABBITMQ
});