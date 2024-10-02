"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeObj = void 0;
const applogger_1 = __importDefault(require("../../../../lib/logger/applogger"));
const logger = applogger_1.default.child({ 'module': 'NORM' });
const customErrors_1 = require("../../../../lib/error/customErrors");
const NORM_1 = require("../norm/NORM");
const ResultProcessor_1 = require("../norm/ResultProcessor");
class NodeObj {
    constructor(labels, properties, identity, elementId) {
        this.labels = labels;
        this.properties = properties;
        this.identity = identity || null;
        this.elementId = elementId || '';
    }
    async create() {
        if (!this.isNew()) {
            throw new customErrors_1.AppError('This node has already been saved', 500);
        }
        const orm = new NORM_1.NORM();
        // Update the current instance with the saved data
        const result = await orm.createNode(this.labels[0], this.properties, 'n');
        const rp = new ResultProcessor_1.ResultProcessor(result);
        const n = rp.first().get('n');
        Object.assign(this, new NodeObj(n.labels, n.properties, n.identity, n.elementID));
    }
    // async update(updateProperties: Properties){
    //   this.assertORM()
    //   // Update the current instance with the saved data
    //   await this.orm.updateNode(this.node.labels[0], this.node.properties, updateProperties).then((result)=>{
    //     const savedNode = new NodeObj(this.orm, result.identity, result.labels, result.properties,  result.elementId)
    //     Object.assign(this, savedNode)
    //   }
    //   )
    // }
    getId() { return this.elementId; }
    isNew() { return this.elementId === ''; }
}
exports.NodeObj = NodeObj;
//# sourceMappingURL=NodeObj.js.map