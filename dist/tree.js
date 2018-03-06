"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const errors_1 = require("./errors");
const binarysearch_1 = require("./binarysearch");
;
;
function getMinElByField(collection, field) {
    let min = {
        index: null,
        value: null,
        el: null
    };
    collection.forEach((el, index, collection) => {
        if (typeof el[field] !== "number") {
            throw new errors_1.NestedSetsError(`field ${field} does't exist in collection!`);
        }
        if (min.index === null || el[field] < min.value) {
            min = {
                index,
                value: el[field],
                el
            };
        }
    });
    return min;
}
;
function getMaxElByField(collection, field) {
    let max = {
        index: null,
        value: null,
        el: null
    };
    collection.forEach((el, index, collection) => {
        if (typeof el[field] !== "number") {
            throw new errors_1.NestedSetsError(`field ${field} does't exist in collection!`);
        }
        if (max.index === null || el[field] > max.value) {
            max = {
                index,
                value: el[field],
                el
            };
        }
    });
    return max;
}
;
;
;
module.exports = class NestedSets {
    constructor(keys) {
        this._tree = [];
        this._keys = {
            id: 'id',
            lvl: 'lvl',
            parentId: 'parentId',
            lft: 'lft',
            rgt: 'rgt',
            hide: 'hide'
        };
        this._indexes = {
            id: [],
        };
        this.results = [];
        this._keys = Object.assign(this._keys, keys);
    }
    get all() {
        return this._tree;
    }
    get allIds() {
        return _.map(this._tree, this._keys.id);
    }
    get keys() {
        return this._keys;
    }
    set keys(keys) {
        this._keys = keys;
    }
    get ids() {
        return _.map(this.results, this._keys.id);
    }
    _getElById(id) {
        if (this._indexes.id && this._indexes.id.length) {
            let el = binarysearch_1.default(this._indexes.id, id, this._keys.id);
            let p;
            return el;
        }
        else {
            let searchObj = {};
            searchObj[this._keys.id] = id;
            return _.find(this._tree, searchObj);
        }
    }
    getElById(id) {
        let element = this._getElById(id);
        this.results = element ? [element] : [];
        return this;
    }
    validate() {
        NestedSets.validateTree(this._tree, this._keys);
    }
    static validateTree(tree, keys) {
        let lftrgt = [];
        tree.forEach(el => {
            if ((typeof el[keys.id] !== 'number' &&
                typeof el[keys.id] !== 'string') ||
                typeof el[keys.hide] !== 'boolean' ||
                typeof el[keys.lvl] !== 'number' ||
                (typeof el[keys.parentId] !== 'number' &&
                    typeof el[keys.parentId] !== 'string') ||
                typeof el[keys.lft] !== 'number' ||
                typeof el[keys.rgt] !== 'number') {
                throw new errors_1.NestedSetsValidationError('keys error!');
            }
            if (!Number.isInteger(el[keys.lvl]) || el[keys.lvl] < 0 ||
                !Number.isInteger(el[keys.lft]) || el[keys.lft] <= 0 ||
                !Number.isInteger(el[keys.rgt]) || el[keys.rgt] <= 0) {
                throw new errors_1.NestedSetsValidationError('lvl, rgt, lft keys must be natural numbers!');
            }
            if (el[keys.lft] >= el[keys.rgt]) {
                throw new errors_1.NestedSetsValidationError('every rgt key of element must be more than lft key!');
            }
            if (!((el[keys.rgt] - el[keys.lft]) & 1)) {
                throw new errors_1.NestedSetsValidationError('the difference between the right and\
                 left index must be an odd number!');
            }
            if (el[keys.lvl] & 1) {
                if (el[keys.lft] & 1) {
                    throw new errors_1.NestedSetsValidationError('For odd levels, the left index must be even!');
                }
            }
            if (!(el[keys.lvl] & 1)) {
                if (!(el[keys.lft] & 1)) {
                    throw new errors_1.NestedSetsValidationError('For even levels, the left index must be odd!');
                }
            }
            lftrgt.push(el[keys.lft]);
            lftrgt.push(el[keys.rgt]);
        });
        lftrgt.sort((el1, el2) => {
            return el1 - el2;
        });
        lftrgt.forEach((el, i, lftrgt) => {
            if (lftrgt[i - 1] === lftrgt[i]) {
                throw new errors_1.NestedSetsValidationError('The set of left and right indexes \
                    must be unique!');
            }
        });
        let minLft = getMinElByField(tree, 'lft').value;
        let maxRgt = getMaxElByField(tree, 'rgt').value;
        if (minLft !== 1) {
            throw new errors_1.NestedSetsValidationError('The smallest left index must be equal to one!');
        }
        if (maxRgt !== tree.length * 2) {
            throw new errors_1.NestedSetsValidationError('The largest right index must be equal \
                to twice the number of nodes!');
        }
    }
    loadTree(data, options, indexes) {
        this._tree = data;
        options = options || {};
        const validate = options.validate !== undefined ? options.validate : false;
        const createIndexes = options.createIndexes !== undefined ? options.createIndexes : false;
        if (validate) {
            this.validate();
        }
        if (validate && indexes && indexes.id) {
            NestedSets.validateTree(indexes.id, this._keys);
        }
        if (indexes && indexes.id.length) {
            this._indexes.id = indexes.id;
        }
        if (createIndexes && (!indexes || !indexes.id || !indexes.id.length)) {
            this._indexes.id = _.sortBy(data, [this._keys.id]);
        }
        return this;
    }
    getRootCats() {
        let rootCats = this._tree.filter(el => {
            return el[this._keys.lvl] === 1;
        });
        this.results = _.sortBy(rootCats, this._keys.lft);
        return this;
    }
    getRootEl() {
        let results = [];
        for (let i = 0; i < this._tree.length; i++) {
            let el = this._tree[i];
            if (el[this._keys.lvl] !== 0)
                continue;
            results.push(el);
            break;
        }
        this.results = results;
        return this;
    }
    static isChild(parent, child, { lft, rgt }) {
        return child[lft] > parent[lft] &&
            child[rgt] < parent[rgt];
    }
    isChild(parent, child) {
        return child[this._keys.lft] > parent[this._keys.lft] &&
            child[this._keys.rgt] < parent[this._keys.rgt];
    }
    checkKeys(el) {
        let keys = this._keys;
        if ((typeof el[keys.id] !== 'number' &&
            typeof el[keys.id] !== 'string') ||
            typeof el[keys.lvl] !== 'number' ||
            typeof el[keys.hide] !== 'boolean' ||
            (typeof el[keys.parentId] !== 'number' &&
                typeof el[keys.parentId] !== 'string') ||
            typeof el[keys.lft] !== 'number' ||
            typeof el[keys.rgt] !== 'number') {
            throw new errors_1.NestedSetsValidationError('keys error!');
        }
    }
    _normalizeElement(el) {
        let element;
        if (typeof el === "string" || typeof el === "number") {
            element = this._getElById(el);
        }
        else {
            element = el;
        }
        if (!element)
            throw new errors_1.NestedSetsError('incorrect element!');
        return element;
    }
    getChilds(el, hide) {
        let element = this._normalizeElement(el);
        let id = element[this._keys.id];
        let results = [];
        if ((element[this._keys.rgt] - element[this._keys.lft] === 1)) {
            this.results = [];
            return this;
        }
        this._tree.forEach(el => {
            if (!hide && el[this._keys.parentId] === id) {
                results.push(el);
            }
            if (hide && !el[this._keys.hide] && el[this._keys.parentId] === id) {
                results.push(el);
            }
        });
        this.results = _.sortBy(results, [this._keys.lft]);
        return this;
    }
    isValidId(id) {
        let el = this._getElById(id);
        return !!el;
    }
    getAllChilds(el, hide) {
        let element = this._normalizeElement(el);
        let lft = element[this._keys.lft];
        let rgt = element[this._keys.rgt];
        let results = [];
        if ((element[this._keys.rgt] - element[this._keys.lft] === 1)) {
            this.results = [];
            return this;
        }
        this._tree.forEach(el => {
            if (!hide && el[this._keys.lft] >= lft && el[this._keys.rgt] <= rgt) {
                results.push(el);
            }
            if (hide && !el[this._keys.hide] && el[this._keys.lft] >= lft && el[this._keys.rgt] <= rgt) {
                results.push(el);
            }
        });
        this.results = _.sortBy(results, [this._keys.lft]);
        return this;
    }
    getDepth() {
        let depth = 0;
        this._tree.forEach(el => {
            if (el[this._keys.lvl] > depth) {
                depth = el[this._keys.lvl];
            }
        });
        return depth;
    }
    getParent(el) {
        let element = this._normalizeElement(el);
        let parentId = element[this._keys.parentId];
        let depth = element[this._keys.lvl];
        let results = [];
        if (!depth) {
            results = [];
        }
        else {
            let parent = this._getElById(parentId);
            results.push(parent);
        }
        this.results = results;
        return this;
    }
    getAllParents(el, hide) {
        let element = this._normalizeElement(el);
        let lft = element[this._keys.lft];
        let rgt = element[this._keys.rgt];
        let results = [];
        this._tree.forEach(el => {
            if (!hide && el[this._keys.lft] <= lft && el[this._keys.rgt] >= rgt) {
                results.push(el);
            }
            if (hide && !el[this._keys.hide] && el[this._keys.lft] <= lft && el[this._keys.rgt] > rgt) {
                results.push(el);
            }
        });
        this.results = _.sortBy(results, this._keys.lvl);
        return this;
    }
    ;
};
//# sourceMappingURL=tree.js.map