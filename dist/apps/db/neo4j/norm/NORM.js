"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NORM = void 0;
const applogger_1 = __importDefault(require("../../../../lib/logger/applogger"));
const logger = applogger_1.default.child({ 'module': 'NORM' });
const customErrors_1 = require("../../../../lib/error/customErrors");
const neo4j_driver_1 = __importDefault(require("neo4j-driver"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class NORM {
    constructor() {
        this.initEnv = () => {
            logger.info(process.env.DB_URL);
            if (!process.env.DB_URL) {
                throw new customErrors_1.AppError('DB_URL does not exist in environment variables', 500);
            }
            else {
                this.DB_URL = process.env.DB_URL;
            }
            if (!process.env.DB_USERNAME) {
                throw new customErrors_1.AppError('DB_USERNAME does not exist in environment variables', 500);
            }
            else {
                this.DB_USERNAME = process.env.DB_USERNAME;
            }
            if (!process.env.DB_PASSWORD) {
                throw new customErrors_1.AppError('DB_PASSWORD does not exist in environment variables', 500);
            }
            else {
                this.DB_PASSWORD = process.env.DB_PASSWORD;
            }
            if (!process.env.DB_DATABASE) {
                throw new customErrors_1.AppError('DB_DATABASE does not exist in environment variables', 500);
            }
            else {
                this.DB_DATABASE = process.env.DB_DATABASE;
            }
        };
        this.initDriver = () => {
            try {
                this.driver = neo4j_driver_1.default.driver(this.DB_URL, neo4j_driver_1.default.auth.basic(this.DB_USERNAME, this.DB_PASSWORD));
            }
            catch (error) {
                throw error;
            }
            return this.driver;
        };
        this.initSession = () => {
            try {
                this.session = this.driver.session({ database: this.DB_DATABASE });
            }
            catch (error) {
                throw error;
            }
            return this.session;
        };
        //   async createRelationship(
        //     source_node: Node,
        //     relationship_label: string,
        //     relationship_properties: object,
        //     target_node: Node|null,
        // ): Promise<Node> {
        //     const log = logger.child({ 'function': 'createRelationship' });
        //     let output: any = {};
        //     }
        //   }
        this.test = async () => {
            try {
                try {
                    let t = await this.getNode(['NODE'], { 'NODE_UUID': '01910aca-02bf-7ccc-ac36-fafdee4f0901' }, 'source');
                    console.log(t);
                }
                catch (e) {
                    logger.error(e, 'caught e');
                }
            }
            catch (error) {
                logger.error(error);
            }
        };
        this.initEnv();
        this.initDriver();
        this.initSession();
    }
    async run(query, parameters, transactionConfig) {
        const log = logger.child({ 'function': 'getNode' });
        let output = {};
        await this.initSession().run(query, parameters, transactionConfig)
            .then(result => {
            output = result;
        }).catch(error => {
            log.error(error);
            throw error;
        }).finally(() => {
            this.session.close();
        });
        return output;
    }
    // processResult(result:QueryResult){
    //     return result
    //     logger.debug(result)
    //     logger.debug(result.records)
    // }
    // recordHasValue(record:Record, key:PropertyKey): boolean{
    //     if(!(record && record.has(key))){
    //         return false
    //     } else{
    //         return true
    //     }
    // }
    // assertRecordHasValue(record:Record, key:PropertyKey): void{
    //     const log = logger.child({ 'function': 'assertRecordHasValue' });
    //     if(!this.recordHasValue(record,key)){
    //         throw new AppError(`EntityNotFoundError: key \'${String(key)}\'`, 404)
    //     }
    //     log.debug('Record has value')
    // }
    async getNode(labels, properties, variableName) {
        const varName = variableName || 'x';
        const result = await this.run(`
          MATCH (${varName}:${labels[0]})
          WHERE ALL(key IN keys($properties) WHERE ${varName}[key] = $properties[key])
          RETURN ${varName}
        `, { properties: properties });
        return result;
    }
    async getNodeById(elementId, variableName) {
        const varName = variableName || 'x';
        const result = await this.run(`
          ${this.createMatchClauseById(elementId, varName)}
          RETURN ${varName}
        `);
        return result;
    }
    async createNode(label, properties) {
        const log = logger.child({ 'function': 'createNode' });
        try {
            const result = await this.run(`
            CREATE (x:${label} $properties)
            RETURN x
          `, { properties });
            if (result.records.length === 0) {
                throw new customErrors_1.AppError('Node creation failed', 500);
            }
            log.info('Node created successfully');
            return result;
        }
        catch (error) {
            log.error('Error creating node', error);
            throw error;
        }
    }
    async updateNode(elementId, updateProperties, variableName) {
        const varName = variableName || 'x';
        try {
            const result = await this.run(`
            ${this.createMatchClauseById(elementId, varName)}
            SET ${varName} += $updateProperties
            RETURN ${varName}
          `, { updateProperties });
            if (result.records.length === 0) {
                throw new Error('Node not found or update failed');
            }
            return result;
        }
        catch (error) {
            logger.error('Error updating node', error);
            throw error;
        }
    }
    async deleteNode(elementId, variableName, detach) {
        const log = logger.child({ 'function': 'deleteNode' });
        const varName = variableName || 'x';
        try {
            const result = await this.run(`
            ${this.createMatchClauseById(elementId, varName)}
            ${detach ? 'DETACH' : ''} DELETE ${varName}
            RETURN count(${varName}) as deletedCount
          `);
            const deletedCount = result.records[0].get('deletedCount').toNumber();
            if (deletedCount === 0) {
                log.warn('No nodes were deleted');
                throw new customErrors_1.AppError('No nodes were deleted', 500);
            }
            log.info(`${deletedCount} node(s) deleted successfully`);
            return result;
        }
        catch (error) {
            log.error('Error deleting node', error);
            throw error;
        }
    }
    createMatchClauseById(elementId, variableName) {
        return `MATCH (${variableName})
            WHERE elementId(${variableName}) = '${elementId}'
            `;
    }
}
exports.NORM = NORM;
const orm = new NORM();
logger.info(orm.test());
//# sourceMappingURL=NORM.js.map