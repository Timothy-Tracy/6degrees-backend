"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordProcessor = void 0;
class RecordProcessor {
    constructor(record) {
        this.record = record;
        this.keys = this.record.keys;
        this.excludedKeys = [];
    }
    excludeKeys(keys) {
        keys.forEach((key) => {
            this.excludedKeys.push(key);
        });
    }
    get(key) {
        return this.record.get(key);
    }
    toObject() {
        return this.record.toObject();
    }
    toNode(key) {
        return this.record.get(key);
    }
}
exports.RecordProcessor = RecordProcessor;
//# sourceMappingURL=RecordProcessor.js.map