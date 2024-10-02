"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClauseBuilder = void 0;
class ClauseBuilder {
    constructor() {
        this.query = '';
        this.parameters = {};
        this.paramCount = 0;
    }
    append(cypher, parameters) {
        this.query += cypher;
        if (parameters) {
            const newParamStr = `param${this.paramCount}`;
            this.paramCount += 1;
            this.parameters[newParamStr] = parameters;
        }
        return this;
    }
    match() {
        this.query += ' MATCH ';
        return this;
    }
    create() {
        this.query += ' CREATE ';
        return this;
    }
    optional() {
        this.query += ' OPTIONAL ';
        return this;
    }
    node(variableName, labels, parameters) {
        this.query += `(${variableName}${labels ? `:${labels?.join(':')}` : ''} ${parameters ? `$${`${variableName}_parameters`}` : ''})`;
        if (parameters) {
            const newParamStr = `param${this.paramCount}`;
            this.paramCount += 1;
            this.parameters[newParamStr] = parameters;
        }
        return this;
    }
    relationshipBox(variableName, label, parameters) {
        this.query += `[${variableName}${label ? `:${label}` : ''} ${parameters ? `$${`${variableName}_parameters`}` : ''}]`;
        if (parameters) {
            const newParamStr = `param${this.paramCount}`;
            this.paramCount += 1;
            this.parameters[newParamStr] = parameters;
        }
        return this;
    }
    relationship(variableName, label, parameters) {
        this.query += '-';
        this.relationshipBox(variableName, label, parameters);
        this.query += '-';
        return this;
    }
    leftRelationship(variableName, label, parameters) {
        this.query += '<-';
        this.relationshipBox(variableName, label, parameters);
        this.query += '-';
        return this;
    }
    rightRelationship(variableName, label, parameters) {
        this.query += '-';
        this.relationshipBox(variableName, label, parameters);
        this.query += '->';
        return this;
    }
    emptyNode() {
        this.query += '()';
        return this;
    }
    matchByElementId(variableName, elementId) {
        this.query += ` MATCH (${variableName}) WHERE elementId(${variableName}) = '${elementId} '
            `;
        return this;
    }
    detach() {
        this.query += ' DETACH ';
        return this;
    }
    delete(variables) {
        this.query += ` DELETE ${variables.join(', ')}`;
        return this;
    }
    terminate() {
        this.query += ';';
        return this;
    }
    return(variables) {
        this.query += ` RETURN ${variables.join(', ')}`;
        return this;
    }
    orderBy(variableName, someProperty) {
        this.query += ` ORDER BY ${variableName}.${someProperty} `;
        return this;
    }
    skip(offset) {
        this.query += ` SKIP  ${offset}`;
        return this;
    }
    limit(resultCount) {
        this.query += ` LIMIT  ${resultCount}`;
        return this;
    }
    descending() {
        this.query += ' DESC ';
        return this;
    }
    ascending() {
        this.query += ' ASC ';
        return this;
    }
}
exports.ClauseBuilder = ClauseBuilder;
//# sourceMappingURL=ClauseBuilder.js.map