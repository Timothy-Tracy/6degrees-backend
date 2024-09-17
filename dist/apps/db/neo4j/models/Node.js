"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeObj = void 0;
const applogger_1 = __importDefault(require("../../../../lib/logger/applogger"));
const logger = applogger_1.default.child({ 'module': 'NORM' });
const neo4j_driver_1 = require("neo4j-driver");
class NodeObj extends neo4j_driver_1.Node {
    constructor(labels, properties, identity, elementId) {
        super(identity || '', labels, properties || {}, elementId || '');
    }
    async save(orm) {
        if (!this.isNew()) {
            throw new Error('This node has already been saved');
        }
        // Update the current instance with the saved data
        await orm.createNode(this.labels[0], this.properties).then((result) => {
            const savedNode = new NodeObj(result.labels, result.properties, result.identity, result.elementId);
            Object.assign(this, savedNode);
        });
    }
    getId() {
        return this.elementId;
    }
    isNew() {
        return this.elementId === '';
    }
}
exports.NodeObj = NodeObj;
//# sourceMappingURL=Node.js.map