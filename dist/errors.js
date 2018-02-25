"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NestedSetsError extends Error {
    constructor(message) {
        super();
        this.name = 'NestedSetsError';
        this.message = message;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
        else {
            this.stack = (new Error()).stack;
        }
    }
}
exports.NestedSetsError = NestedSetsError;
;
class NestedSetsValidationError extends Error {
    constructor(message) {
        super();
        this.name = 'NestedSetsValidationError';
        this.message = message;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
        else {
            this.stack = (new Error()).stack;
        }
    }
}
exports.NestedSetsValidationError = NestedSetsValidationError;
;
//# sourceMappingURL=errors.js.map