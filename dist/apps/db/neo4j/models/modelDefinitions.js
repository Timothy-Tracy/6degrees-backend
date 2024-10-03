"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.SHARENODE = exports.USER = void 0;
const neogma_1 = require("neogma");
const neogma_2 = __importDefault(require("./../neogma/neogma"));
exports.USER = (0, neogma_1.ModelFactory)({
    label: 'USER',
    schema: {
        username: { type: 'string', minLength: 3, required: true },
        email: { type: 'string', minLength: 3, required: true },
        uuid: { type: 'string', required: true }
    },
    primaryKeyField: 'uuid',
    methods: {
        async shareNode() {
            console.log('a');
            const shareNode = await this.findRelationships({ alias: "SHARENODE" });
            return shareNode[0].target;
        }
    },
    statics: {},
}, neogma_2.default);
exports.SHARENODE = (0, neogma_1.ModelFactory)({
    label: "SHARENODE",
    schema: {
        uuid: { type: 'string', required: true }
    },
    primaryKeyField: 'uuid',
    methods: {
        async getUser() {
            const u = await this.findRelationships({ alias: 'USER' });
            return u[0].target;
        }
    },
    statics: {}
}, neogma_2.default);
exports.POST = (0, neogma_1.ModelFactory)({
    label: 'POST',
    schema: {
        uuid: {
            type: 'string',
            required: true
        },
        query: {
            type: 'string',
            minLength: 3,
            required: true
        },
        title: {
            type: 'string',
            minLength: 3,
            required: true
        },
        body: {
            type: 'string',
            minLength: 3,
            required: true
        }
    },
    primaryKeyField: 'query',
    statics: {},
    methods: {}
}, neogma_2.default);
// Add relationships
exports.USER.addRelationships({
    SHARENODE: {
        model: exports.SHARENODE,
        direction: 'in',
        name: 'PARENT_USER'
    }
});
exports.SHARENODE.addRelationships({
    USER: {
        model: exports.USER,
        direction: 'out',
        name: 'PARENT_USER'
    },
    SHARENODE: {
        model: "self",
        direction: 'out',
        name: 'edge'
    }
});
exports.POST.addRelationships({
    SHARENODE: {
        model: exports.SHARENODE,
        direction: 'out',
        name: 'edge'
    }
});
//# sourceMappingURL=modelDefinitions.js.map