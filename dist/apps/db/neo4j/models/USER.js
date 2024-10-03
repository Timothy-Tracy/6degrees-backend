"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("./models");
models_1.models.USER.prototype.bar = function () {
    return 'The username of this user is: ' + this.username;
};
models_1.models.USER.prototype.shareNode = async function () {
    console.log('a');
    const shareNode = await this.findRelationships({ alias: "SHARENODE" });
    return shareNode[0].target;
};
models_1.models.USER.foo = function () {
    return 'foo';
};
//# sourceMappingURL=USER.js.map