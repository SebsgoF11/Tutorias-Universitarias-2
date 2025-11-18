const axios = require('axios');
const { usuariosServiceUrl } = require('../../config');
const CircuitBreaker = require('opossum');
const { track } = require('../../utils/dashboard'); // asegúrate de tener esta función

// Función original, solo agregamos timeout
const callUsuarioService = async (tipo, id, correlationId) => {
    const url = `${usuariosServiceUrl}/${tipo}/${id}`;
    console.log(`[SUPER-DEBUG] Iniciando llamada a getUsuario con Correlation-ID: ${correlationId}`);
    console.log(`[SUPER-DEBUG] URL de destino: ${url}`);
    console.log(`[SUPER-DEBUG] Tipo: ${tipo}, ID: ${id}`);

    try {
        const response = await axios.get(url, {
            headers: { 'X-Correlation-ID': correlationId },
            timeout: 1500 // <--- timeout de 1.5s
        });
        console.log(`[SUPER-DEBUG] Éxito en la llamada a ${url}. Status: ${response.status}`);
        return response.data;
    } catch (error) {
        console.error(`[SUPER-DEBUG] FALLO en la llamada a ${url}.`);
        if (error.response) {
            console.error(`[SUPER-DEBUG] Status: ${error.response.status}`);
            console.error(`[SUPER-DEBUG] Data:`, JSON.stringify(error.response.data));
            if (error.response.status === 404) return null;
        }
        throw error;
    }
};

// --- Opciones mínimas del Circuit Breaker ---
const options = {
    timeout: 2000,                // tiempo máximo antes de considerar fallo
    errorThresholdPercentage: 50, // % de fallos para abrir el breaker
    resetTimeout: 10000           // reintento de cierre después de 10s
};

// Crear CircuitBreaker
const breaker = new CircuitBreaker(callUsuarioService, options);

// Evento para reporte al dashboard
breaker.on('open', () => {
    console.error('Circuit Breaker ABIERTO para ms-usuarios');
    track('cb-ms-usuarios', 'Circuit Breaker ABIERTO para ms-usuarios', 'ERROR');
});

// Exportar función usando el breaker
const getUsuario = (tipo, id, correlationId) => breaker.fire(tipo, id, correlationId);

module.exports = { getUsuario };
