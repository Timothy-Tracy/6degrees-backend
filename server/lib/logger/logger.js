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

logger.logperf = async function(end){
    logger.info(`PERFORMANCE: ${this.bindings().module}.${this.bindings().function} Time: ${end[0]}s ${end[1]/1e6}ms`);

}

async function logperf(logger, end){
    logger.info(`PERFORMANCE: ${logger.bindings().module}.${logger.bindings().function} Time: ${end[0]}s ${end[1]/1e6}ms`);
}

module.exports = logger;