"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const neogma_1 = require("neogma");
const neogma_2 = __importDefault(require("../neogma/neogma"));
const POST = (0, neogma_1.ModelFactory)({
    /* --> the label that the nodes of this Model have. For multiple labels, an array can be provided like ['User', 'New'] */
    label: 'User',
    /* --> The properties of the nodes of this Model and the validation for them. This follows the revalidator schema configuration */
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
    /* --> all the possible relationships (with other Models or itself), for relationship-related functions to work properly */
    //relationships: {
    /* --> an arbitrary alias to be used for identifying this relationship when using the relationship-related functions. It must be a key of UsersRelatedNodesI */
    //    Orders: {
    //         /* --> reference to the Orders Model. For reference to this model, the value 'self' can be used */
    //         model: Orders,
    //         /* --> the direction of the relationship. Valid values are 'in' | 'out' | 'none' */
    //         direction: 'out',
    //         /* --> the name of this relationship */
    //         name: 'CREATES',
    //         /* --> (optional) properties of the relationship between the nodes */
    //         properties: {
    //             /* --> the key to be used that the property is a relationship property */
    //             Rating: {
    //                 /* --> the actual property to be created in the relationship (a key of of fourth generic of ModelRelatedNodesI, if given) */
    //                 property: 'rating',
    //                 /* --> schema validation for it */
    //                 schema: {
    //                     type: 'number',
    //                     required: true,
    //                 },
    //             },
    //         }
    //     },
    //},
    /* --> (optional) the key to be used as a unique identifier, which enables some Instance methods */
    primaryKeyField: 'query',
    /* --> (optional) statics to be added to the Model. In this example, can be called using `Users.foo()` */
    statics: {
        foo: () => {
            return 'foo';
        }
    },
    /* --> (optional) methods to be added to the Instance of this Model. In this example, they can be called on a Users Instance using `user.bar()` */
    methods: {
        bar: function () {
            /* --> returns the name of this node with a friendly text */
            return 'The query of this post is: ' + this.query;
        }
    }
}, neogma_2.default); // <-- the neogma instance is used
/* --> relationships can also be defined after the model definition, to avoid potential circular references */
/* --> The same param as "relationships" is used */
POST.addRelationships({
/* --> Orders can be defined either here or in the "relationships" param. Choose one! */
// Orders: {...}
});
/* --> statics can also be defined after the model definition, to avoid potential circular references. It should be defined either here or in the statics param. Choose one! */
POST.foo = function () {
    return 'foo';
};
/* --> methods can also be defined after the model definition, to avoid potential circular references. It should be defined either here or in the methods param. Choose one! */
POST.prototype.bar = function () {
    return this.query;
};
//# sourceMappingURL=POST.js.map