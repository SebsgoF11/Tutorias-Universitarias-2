// src/api/middlewares/errorHandler.js

const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${err.message}`);

    // Si el error viene de Postgres y es violación de unicidad
    if (err.code === '23505') {
        return res.status(409).json({
            error: {
                message: 'El tutor ya tiene una reserva en esa fecha y hora.',
                statusCode: 409
            }
        });
    }

    // Manejo general para otros errores
    const statusCode = err.statusCode || 500;
    const errorMessage = err.statusCode ? err.message : 'Ocurrió un error inesperado en el servidor.';

    res.status(statusCode).json({
        error: {
            message: errorMessage,
            statusCode: statusCode
        }
    });
};

module.exports = errorHandler;
