const { v7: uuidv7 } = require('uuid');

export function uuid(){
    return uuidv7()
}
export default uuid