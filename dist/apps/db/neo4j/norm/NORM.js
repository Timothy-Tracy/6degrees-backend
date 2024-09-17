"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NORM = void 0;
const applogger_1 = __importDefault(require("../../../../lib/logger/applogger"));
const logger = applogger_1.default.child({ 'module': 'NORM' });
const customErrors_1 = require("../../../../lib/error/customErrors");
const neo4j_driver_1 = __importStar(require("neo4j-driver"));
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
        this.test = async () => {
            try {
                //const t = await this.getNode('NODE', {'NODE_UUID':'0190d1d6-ca93-7009-81f5-c94ce35b8c89'})
                //const t = await this.getNode('TEST', {'test':'test'})
                const x = await this.createNode('TEST', { 'test': 'test' });
                const d = await this.deleteNode('TEST', { 'test': 'test' });
                // if(t){
                //     logger.info(t.elementId)
                // }
                // if(x){
                //     logger.info(x.toString())
                // }
            }
            catch (error) {
                logger.error(error);
            }
        };
        this.initEnv();
        this.initDriver();
        this.initSession();
    }
    async getNode(label, properties) {
        const log = logger.child({ 'function': 'get' });
        let output = {};
        await this.initSession().run(`
          MATCH (x:${label})
          WHERE ALL(key IN keys($properties) WHERE x[key] = $properties[key])
          RETURN x
        `, { label: label, properties: properties })
            .then(result => {
            if (result.records.length === 0) {
                output = null;
            }
            else {
                log.info(result);
                output = result.records[0].get('x');
            }
        }).catch(error => {
            throw error;
        }).finally(() => {
            this.session.close();
        });
        return new neo4j_driver_1.Node(output.identity, output.labels, output.properties, output.elementID);
    }
    async createNode(label, properties) {
        const log = logger.child({ 'function': 'createNode' });
        let output = {};
        try {
            const result = await this.initSession().run(`
            CREATE (x:${label} $properties)
            RETURN x
          `, { properties });
            if (result.records.length === 0) {
                throw new customErrors_1.AppError('Node creation failed', 500);
            }
            output = result.records[0].get('x');
            log.info('Node created successfully', output);
            return new neo4j_driver_1.Node(output.identity, output.labels, output.properties, output.elementId);
        }
        catch (error) {
            log.error('Error creating node', error);
            throw error;
        }
        finally {
            await this.session.close();
        }
    }
    async updateNode(label, identifier, updateProperties) {
        const log = logger.child({ 'function': 'updateNode' });
        let output = {};
        try {
            const result = await this.initSession().run(`
            MATCH (x:${label})
            WHERE ALL(key IN keys($identifier) WHERE x[key] = $identifier[key])
            SET x += $updateProperties
            RETURN x
          `, { identifier, updateProperties });
            if (result.records.length === 0) {
                throw new Error('Node not found or update failed');
            }
            output = result.records[0].get('x');
            log.info('Node updated successfully', output);
            return new neo4j_driver_1.Node(output.identity, output.labels, output.properties, output.elementId);
        }
        catch (error) {
            log.error('Error updating node', error);
            throw error;
        }
        finally {
            await this.session.close();
        }
    }
    async deleteNode(label, identifier, detach) {
        const log = logger.child({ 'function': 'deleteNode' });
        try {
            const result = await this.initSession().run(`
            MATCH (x:${label})
            WHERE ALL(key IN keys($identifier) WHERE x[key] = $identifier[key])
            ${detach ? 'DETACH' : ''} DELETE x
            RETURN count(x) as deletedCount
          `, { identifier });
            log.info(result);
            const deletedCount = result.records[0].get('deletedCount').toNumber();
            if (deletedCount === 0) {
                log.warn('No nodes were deleted');
                return false;
            }
            log.info(`${deletedCount} node(s) deleted successfully`);
            return true;
        }
        catch (error) {
            log.error('Error deleting node', error);
            throw error;
        }
        finally {
            await this.session.close();
        }
    }
}
exports.NORM = NORM;
const orm = new NORM();
logger.info(orm.test());
//# sourceMappingURL=NORM.js.map