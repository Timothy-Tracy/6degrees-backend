"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("./models");
models_1.models.SHARENODE.prototype.bar = function () {
    return 'This is a SHARENODE';
};
models_1.models.SHARENODE.prototype.getUser = async function () {
    console.log('b');
    const u = await this.findRelationships({ alias: 'USER' });
    console.log(u);
    return u[0].target;
};
models_1.models.SHARENODE.foo = function () {
    return 'foo';
};
//# sourceMappingURL=SHARENODE.js.map