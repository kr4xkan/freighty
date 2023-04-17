import winston from "winston";
import morgan from "morgan";

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
}
winston.addColors(colors);
const { combine, timestamp, printf, colorize } = winston.format;

//Using the printf format.
const customFormat = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
});
export const logger = winston.createLogger({
    level: 'http',
    format: combine(colorize({ all: true }), timestamp(), customFormat),
    transports: [new winston.transports.Console()],
});

export const morganMiddleware = morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    {
        stream: {
            // Configure Morgan to use our custom logger with the http severity
            write: (message) => logger.http(message.trim()),
        },
    }
);