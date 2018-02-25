export class NestedSetsError extends Error {
    constructor(message:string) {
        super(); 
        this.name = 'NestedSetsError'; 
        this.message = message; 
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error()).stack;
        }
    }
}; 

export class NestedSetsValidationError extends Error {
    constructor(message:string) {
        super(); 
        this.name = 'NestedSetsValidationError'; 
        this.message = message; 
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error()).stack;
        }
    }
}; 