// ms-tutorias/src/app.js

const express = require('express');
const config = require('./config'); // Importamos nuestra configuración centralizada
const tutoriasRouter = require('./api/routes/tutorias.routes');
const errorHandler = require('./api/middlewares/errorHandler'); // El manejador de errores reutilizable
const correlationIdMiddleware = require('./api/middlewares/correlationId.middleware.js');
const client = require('prom-client');

const app = express();

const register = new client.Registry();

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duración de las solicitudes HTTP en ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [50, 100, 300, 500, 1000, 2000]
});

register.registerMetric(httpRequestDuration);

// Activar métricas por defecto (CPU, RAM, event loop, etc.)
client.collectDefaultMetrics({
    app: 'ms_tutorias',
    prefix: 'tutorias_',
    register,
});

app.get('/metrics', async (req, res) => {
    try {
        res.setHeader('Content-Type', register.contentType);
        res.send(await register.metrics());
    } catch (err) {
        res.status(500).send(err.message);
    }
});


app.use(express.json());
app.use(correlationIdMiddleware);
app.use('/tutorias', tutoriasRouter);
app.use(errorHandler);

app.listen(config.port, () => {
    console.log(`MS_Tutorias (Orquestador) escuchando en el puerto ${config.port}`);
});

module.exports = app;
