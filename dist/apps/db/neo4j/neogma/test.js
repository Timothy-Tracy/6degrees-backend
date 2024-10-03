"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models/models");
const { v7: uuidv7 } = require('uuid');
async function test() {
    const user = await models_1.models.USER.findOne({ where: { username: 'timothytracytest', }, throwIfNotFound: true, });
    if (user) {
        console.log(user);
        const snf = await user.shareNode();
        console.log(snf);
        if (snf) {
            const uf = await models_1.models.SHARENODE.findRelationships({ alias: "USER", where: { source: { uuid: snf.uuid } } });
            console.log(uf[0].target);
        }
    }
}
test();
//# sourceMappingURL=test.js.map