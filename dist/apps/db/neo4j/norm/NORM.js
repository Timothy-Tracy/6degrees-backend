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
const ResultProcessor_1 = require("./ResultProcessor");
const CypherBuilder_1 = require("./CypherBuilder");
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
                    //let t = await this.getNodeByProperty(['NODE'], {'NODE_UUID': '01910aca-02bf-7ccc-ac36-fafdee4f0901'}, 'source') 
                    let p = await this.getWithPagination(new CypherBuilder_1.CypherBuilder().match().node('user', ['USER']).query.toString(), {}, 'user', 3, 10, 'identity', false);
                    logger.info(p);
                    //let z = await this.deleteNode('yyy', 'x', true)
                    let rp = new ResultProcessor_1.ResultProcessor(p);
                    let ids = rp.records.map((record) => record.get('user').identity.low);
                    logger.info(ids);
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
            .then(result => { output = result; }).catch(error => { log.error(error); throw error; }).finally(() => { this.session.close(); });
        return output;
    }
    async getNodeByProperty(labels, properties, variableName) {
        const varName = variableName || 'x';
        const result = await this.run(`
          MATCH (${varName}:${labels.join(':')})
          WHERE ALL(key IN keys($properties) WHERE ${varName}[key] = $properties[key])
          RETURN ${varName}
        `, { properties: properties });
        return result;
    }
    async getNodeById(elementId, variableName) {
        const varName = variableName || 'x';
        const cb = new CypherBuilder_1.CypherBuilder();
        cb.matchByElementId(varName, elementId).return([varName]);
        const result = await this.run(cb.query, cb.parameters);
        return result;
    }
    async getWithPagination(cypher, parameters, variableName, page, pageSize, orderBy, ascending) {
        const varName = variableName || 'x';
        const cb = new CypherBuilder_1.CypherBuilder();
        cb.append(cypher, parameters).return([varName]);
        if (orderBy) {
            cb.orderBy(varName, orderBy);
            if (ascending != null) {
                if (ascending == true) {
                    cb.ascending();
                }
                else {
                    cb.descending();
                }
            }
        }
        cb.skip((page - 1) * pageSize);
        cb.limit(pageSize);
        const result = await this.run(cb.query, cb.parameters);
        return result;
    }
    async createNode(labels, properties, variableName) {
        const varName = variableName || 'x';
        const cb = new CypherBuilder_1.CypherBuilder();
        cb.create().node(varName, [labels], properties).return([varName]).terminate();
        const result = await this.run(cb.query, cb.parameters);
        return result;
    }
    async updateNode(elementId, updateProperties, variableName) {
        const varName = variableName || 'x';
        const cb = new CypherBuilder_1.CypherBuilder();
        cb.matchByElementId(varName, elementId).append(`SET ${varName} += $updateProperties`, updateProperties).return([varName]).terminate();
        const result = await this.run(cb.query, cb.parameters);
        return result;
    }
    async deleteNode(elementId, variableName, detach) {
        const log = logger.child({ 'function': 'deleteNode' });
        const varName = variableName || 'x';
        const cb = new CypherBuilder_1.CypherBuilder();
        cb.matchByElementId(varName, elementId);
        detach ? cb.detach() : '';
        cb.delete([varName]).append(` RETURN count(${varName}) as deletedCount;`);
        const result = await this.run(cb.query, cb.parameters);
        return result;
    }
    async createRelationship(sourceElementId, relationshipLabel, relationshipProperties, targetElementId) {
        const cb = new CypherBuilder_1.CypherBuilder();
        cb.matchByElementId('source', sourceElementId).matchByElementId('target', targetElementId).create().node('source').rightRelationship('relationship', relationshipLabel, relationshipProperties).node('target').return(['source', 'relationship', 'target']);
        const result = await this.run(cb.query, cb.parameters);
        return result;
    }
}
exports.NORM = NORM;
const orm = new NORM();
logger.info(orm.test());
//# sourceMappingURL=NORM.js.map