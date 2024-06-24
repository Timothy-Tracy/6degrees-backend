const pino = require('pino');



const logger = pino({
    level : 'debug',
    transport : {
        targets : [
            {
                target : 'pino-pretty',
                options: {
                    destination : '../../logs/output.log',
                    mkdir: true,
                    colorize : false
                }
            },
            {
                target : 'pino-pretty',
                level : 'debug',
                options : {
                    destination: process.stdout.fd,
                    colorize: true
                }
            }
    
        ]
    }
    
})

module.exports = logger;