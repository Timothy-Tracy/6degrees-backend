"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_SHARENODE_REL = exports.POST = exports.SHARENODE = exports.USER = void 0;
const neogma_1 = require("neogma");
const neogma_2 = __importDefault(require("./../neogma/neogma"));
const customErrors_1 = require("../../../../lib/error/customErrors");
exports.USER = (0, neogma_1.ModelFactory)({
    label: 'USER',
    schema: {
        username: { type: 'string', minLength: 3, required: true },
        email: { type: 'string', minLength: 3, required: true },
        uuid: { type: 'string', required: true },
        createdAt: {
            type: 'string',
            required: false
        },
        updatedAt: {
            type: 'string',
            required: false
        }
    },
    primaryKeyField: 'uuid',
    methods: {
        async shareNode() {
            console.log('a');
            const shareNode = await this.findRelationships({ alias: "SHARENODE" });
            return shareNode[0].target;
        }
    },
    statics: {
        async getUserByUsername(username) {
            const user = await exports.USER.findOne({ where: { username: username } });
            if (!user) {
                throw new customErrors_1.AppError('User not found in the database', 404);
            }
            return user;
        },
        async getShareNodeByUsername(username) {
            const user = await this.getUserByUsername(username);
            return user.shareNode();
        },
    },
}, neogma_2.default);
exports.SHARENODE = (0, neogma_1.ModelFactory)({
    label: "SHARENODE",
    schema: {
        uuid: { type: 'string', required: true },
        createdAt: {
            type: 'string',
            required: false
        },
        updatedAt: {
            type: 'string',
            required: false
        }
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
        },
        createdAt: {
            type: 'string',
            required: false
        },
        updatedAt: {
            type: 'string',
            required: false
        }
    },
    relationships: {},
    primaryKeyField: 'query',
    statics: {
        findByQuery: async function (query) {
            const x = await exports.POST.findOne({ where: { query: query } });
            return x;
        }
    },
    methods: {}
}, neogma_2.default);
exports.USER_SHARENODE_REL = ({
    type: 'OWNS',
    schema: {
        createdAt: {
            type: 'string',
            format: 'date-time',
            default: () => new Date().toISOString()
        }
    },
    properties: {
        source: exports.USER,
        target: exports.SHARENODE,
        direction: 'out'
    }
});
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
        name: 'NEXT',
        properties: {
            uuid: {
                property: 'uuid',
                schema: {
                    type: 'string',
                    required: true
                }
            },
            post_uuid: {
                property: 'post_uuid',
                schema: {
                    type: 'string',
                    required: true
                }
            },
            degree: {
                property: 'degree',
                schema: {
                    type: 'any',
                    required: true
                }
            },
            createdAt: {
                property: 'createdAt',
                schema: {
                    type: 'string',
                    required: false
                }
            },
            updatedAt: {
                property: 'updatedAt',
                schema: {
                    type: 'string',
                    required: false
                }
            }
        }
    }
});
exports.POST.addRelationships({
    SHARENODE: {
        model: exports.SHARENODE,
        direction: 'out',
        name: 'NEXT',
        properties: {
            uuid: {
                property: 'uuid',
                schema: {
                    type: 'string',
                    required: true
                }
            },
            post_uuid: {
                property: 'post_uuid',
                schema: {
                    type: 'string',
                    required: true
                }
            },
            degree: {
                property: 'degree',
                schema: {
                    type: 'any',
                    required: true
                }
            },
            createdAt: {
                property: 'createdAt',
                schema: {
                    type: 'string',
                    required: false
                }
            },
            updatedAt: {
                property: 'updatedAt',
                schema: {
                    type: 'string',
                    required: false
                }
            }
        }
    }
});
//# sourceMappingURL=modelDefinitions.js.map