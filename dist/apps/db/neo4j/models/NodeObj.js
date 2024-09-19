"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeObj = void 0;
const applogger_1 = __importDefault(require("../../../../lib/logger/applogger"));
const logger = applogger_1.default.child({ 'module': 'NORM' });
const customErrors_1 = require("../../../../lib/error/customErrors");
class NodeObj {
    constructor(orm, node) {
        this.node = node;
        this.orm = orm;
    }
    // async create(){
    //   if (!this.isNew()) {
    //     throw new AppError('This node has already been saved', 500)
    //   }
    //   this.assertORM()
    //   // Update the current instance with the saved data
    //   await this.orm.createNode(this.labels[0], this.properties).then((result)=>{
    //     const savedNode = new NodeObj(this.orm, result.identity, result.labels, result.properties,  result.elementId)
    //     Object.assign(this, savedNode)
    //   }
    //   )
    // }
    // async update(updateProperties: Properties){
    //   this.assertORM()
    //   // Update the current instance with the saved data
    //   await this.orm.updateNode(this.node.labels[0], this.node.properties, updateProperties).then((result)=>{
    //     const savedNode = new NodeObj(this.orm, result.identity, result.labels, result.properties,  result.elementId)
    //     Object.assign(this, savedNode)
    //   }
    //   )
    // }
    async remove(orm, detach) {
        this.assertORM();
        if (!detach) {
            detach = false;
        }
        await this.orm.deleteNode(this.node.labels[0], this.node.properties, detach);
    }
    getId() { return this.node.elementId; }
    isNew() { return this.node.elementId === ''; }
    verifyORM() { if (this.orm) {
        return true;
    }
    else {
        return false;
    } }
    assertORM() { if (!this.verifyORM()) {
        throw new customErrors_1.AppError('The ORM is not initialized', 500);
    } }
}
exports.NodeObj = NodeObj;
//# sourceMappingURL=NodeObj.js.map