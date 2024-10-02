"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultProcessor = void 0;
const RecordProcessor_1 = require("./RecordProcessor");
const customErrors_1 = require("../../../../lib/error/customErrors");
class ResultProcessor {
    constructor(result) {
        this.records = result.records.map((record) => new RecordProcessor_1.RecordProcessor(record));
        this.summary = result.summary;
        this.count = this.records.length;
        this.containsUpdates = this.summary.counters.containsUpdates();
        this.stats = this.summary.counters.updates();
    }
    isEmpty() {
        if (this.count === 0) {
            return true;
        }
        else {
            return false;
        }
    }
    isNotEmpty() {
        return !this.isEmpty();
    }
    first() {
        if (this.isEmpty()) {
            throw new customErrors_1.AppError('Records are empty', 500);
        }
        return this.records[0];
    }
}
exports.ResultProcessor = ResultProcessor;
//# sourceMappingURL=ResultProcessor.js.map