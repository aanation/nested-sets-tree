'use strict';

var _ = require('lodash');

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var NestedSetsError = function (_Error) {
    inherits(NestedSetsError, _Error);

    function NestedSetsError(message) {
        classCallCheck(this, NestedSetsError);

        var _this = possibleConstructorReturn(this, (NestedSetsError.__proto__ || Object.getPrototypeOf(NestedSetsError)).call(this));

        _this.name = 'NestedSetsError';
        _this.message = message;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(_this, _this.constructor);
        } else {
            _this.stack = new Error().stack;
        }
        return _this;
    }

    return NestedSetsError;
}(Error);

var NestedSetsValidationError = function (_Error2) {
    inherits(NestedSetsValidationError, _Error2);

    function NestedSetsValidationError(message) {
        classCallCheck(this, NestedSetsValidationError);

        var _this2 = possibleConstructorReturn(this, (NestedSetsValidationError.__proto__ || Object.getPrototypeOf(NestedSetsValidationError)).call(this));

        _this2.name = 'NestedSetsValidationError';
        _this2.message = message;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(_this2, _this2.constructor);
        } else {
            _this2.stack = new Error().stack;
        }
        return _this2;
    }

    return NestedSetsValidationError;
}(Error);

function binarySearch (array, target, key) {
    var min = 0,
        max = array.length - 1,
        temp = void 0,
        mid = void 0;
    while (min <= max) {
        mid = Math.round(min + (max - min) / 2);
        temp = array[mid] ? array[mid][key] : undefined;
        if (temp === target) {
            return array[mid];
        } else if (temp < target) {
            min = mid + 1;
        } else {
            max = mid - 1;
        }
    }
}

function getMinElByField(collection, field) {
    var min = {
        index: null,
        value: null,
        el: null
    };
    collection.forEach(function (el, index, collection) {
        if (typeof el[field] !== "number") {
            throw new NestedSetsError('field ' + field + ' does\'t exist in collection!');
        }
        if (min.index === null || el[field] < min.value) {
            min = {
                index: index,
                value: el[field],
                el: el
            };
        }
    });
    return min;
}
function getMaxElByField(collection, field) {
    var max = {
        index: null,
        value: null,
        el: null
    };
    collection.forEach(function (el, index, collection) {
        if (typeof el[field] !== "number") {
            throw new NestedSetsError('field ' + field + ' does\'t exist in collection!');
        }
        if (max.index === null || el[field] > max.value) {
            max = {
                index: index,
                value: el[field],
                el: el
            };
        }
    });
    return max;
}

var NestedSets = function () {
    function NestedSets(keys) {
        classCallCheck(this, NestedSets);

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
            id: []
        };
        this.results = [];
        this._keys = Object.assign(this._keys, keys);
    }

    createClass(NestedSets, [{
        key: '_getElById',
        value: function _getElById(id) {
            if (this._indexes.id && this._indexes.id.length) {
                var el = binarySearch(this._indexes.id, id, this._keys.id);
                return el;
            } else {
                var searchObj = {};
                searchObj[this._keys.id] = id;
                return _.find(this._tree, searchObj);
            }
        }
    }, {
        key: 'getElById',
        value: function getElById(id) {
            var element = this._getElById(id);
            this.results = element ? [element] : [];
            return this;
        }
    }, {
        key: 'validate',
        value: function validate() {
            NestedSets.validateTree(this._tree, this._keys);
        }
    }, {
        key: 'loadTree',
        value: function loadTree(data, options, indexes) {
            this._tree = data;
            options = options || {};
            var validate = options.validate !== undefined ? options.validate : false;
            var createIndexes = options.createIndexes !== undefined ? options.createIndexes : false;
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
    }, {
        key: 'getRootCats',
        value: function getRootCats() {
            var _this = this;

            var rootCats = this._tree.filter(function (el) {
                return el[_this._keys.lvl] === 1;
            });
            this.results = _.sortBy(rootCats, this._keys.lft);
            return this;
        }
    }, {
        key: 'getRootEl',
        value: function getRootEl() {
            var results = [];
            for (var i = 0; i < this._tree.length; i++) {
                var el = this._tree[i];
                if (el[this._keys.lvl] !== 0) continue;
                results.push(el);
                break;
            }
            this.results = results;
            return this;
        }
    }, {
        key: 'isChild',
        value: function isChild(parent, child) {
            return child[this._keys.lft] > parent[this._keys.lft] && child[this._keys.rgt] < parent[this._keys.rgt];
        }
    }, {
        key: 'checkKeys',
        value: function checkKeys(el) {
            var keys = this._keys;
            if (typeof el[keys.id] !== 'number' && typeof el[keys.id] !== 'string' || typeof el[keys.lvl] !== 'number' || typeof el[keys.hide] !== 'boolean' || typeof el[keys.parentId] !== 'number' && typeof el[keys.parentId] !== 'string' || typeof el[keys.lft] !== 'number' || typeof el[keys.rgt] !== 'number') {
                throw new NestedSetsValidationError('keys error!');
            }
        }
    }, {
        key: '_normalizeElement',
        value: function _normalizeElement(el) {
            var element = void 0;
            if (typeof el === "string" || typeof el === "number") {
                element = this._getElById(el);
            } else {
                element = el;
            }
            if (!element) throw new NestedSetsError('incorrect element!');
            return element;
        }
    }, {
        key: 'getChilds',
        value: function getChilds(el, hide) {
            var _this2 = this;

            var element = this._normalizeElement(el);
            var id = element[this._keys.id];
            var results = [];
            if (element[this._keys.rgt] - element[this._keys.lft] === 1) {
                this.results = [];
                return this;
            }
            this._tree.forEach(function (el) {
                if (!hide && el[_this2._keys.parentId] === id) {
                    results.push(el);
                }
                if (hide && !el[_this2._keys.hide] && el[_this2._keys.parentId] === id) {
                    results.push(el);
                }
            });
            this.results = _.sortBy(results, [this._keys.lft]);
            return this;
        }
    }, {
        key: 'isValidId',
        value: function isValidId(id) {
            var el = this._getElById(id);
            return !!el;
        }
    }, {
        key: 'getAllChilds',
        value: function getAllChilds(el, hide) {
            var _this3 = this;

            var element = this._normalizeElement(el);
            var lft = element[this._keys.lft];
            var rgt = element[this._keys.rgt];
            var results = [];
            if (element[this._keys.rgt] - element[this._keys.lft] === 1) {
                this.results = [];
                return this;
            }
            this._tree.forEach(function (el) {
                if (!hide && el[_this3._keys.lft] >= lft && el[_this3._keys.rgt] <= rgt) {
                    results.push(el);
                }
                if (hide && !el[_this3._keys.hide] && el[_this3._keys.lft] >= lft && el[_this3._keys.rgt] <= rgt) {
                    results.push(el);
                }
            });
            this.results = _.sortBy(results, [this._keys.lft]);
            return this;
        }
    }, {
        key: 'getDepth',
        value: function getDepth() {
            var _this4 = this;

            var depth = 0;
            this._tree.forEach(function (el) {
                if (el[_this4._keys.lvl] > depth) {
                    depth = el[_this4._keys.lvl];
                }
            });
            return depth;
        }
    }, {
        key: 'getParent',
        value: function getParent(el) {
            var element = this._normalizeElement(el);
            var parentId = element[this._keys.parentId];
            var depth = element[this._keys.lvl];
            var results = [];
            if (!depth) {
                results = [];
            } else {
                var parent = this._getElById(parentId);
                results.push(parent);
            }
            this.results = results;
            return this;
        }
    }, {
        key: 'getAllParents',
        value: function getAllParents(el, hide) {
            var _this5 = this;

            var element = this._normalizeElement(el);
            var lft = element[this._keys.lft];
            var rgt = element[this._keys.rgt];
            var results = [];
            this._tree.forEach(function (el) {
                if (!hide && el[_this5._keys.lft] <= lft && el[_this5._keys.rgt] >= rgt) {
                    results.push(el);
                }
                if (hide && !el[_this5._keys.hide] && el[_this5._keys.lft] <= lft && el[_this5._keys.rgt] > rgt) {
                    results.push(el);
                }
            });
            this.results = _.sortBy(results, this._keys.lvl);
            return this;
        }
    }, {
        key: 'all',
        get: function get$$1() {
            return this._tree;
        }
    }, {
        key: 'allIds',
        get: function get$$1() {
            return _.map(this._tree, this._keys.id);
        }
    }, {
        key: 'keys',
        get: function get$$1() {
            return this._keys;
        },
        set: function set$$1(keys) {
            this._keys = keys;
        }
    }, {
        key: 'ids',
        get: function get$$1() {
            return _.map(this.results, this._keys.id);
        }
    }], [{
        key: 'validateTree',
        value: function validateTree(tree, keys) {
            var lftrgt = [];
            tree.forEach(function (el) {
                if (typeof el[keys.id] !== 'number' && typeof el[keys.id] !== 'string' || typeof el[keys.hide] !== 'boolean' || typeof el[keys.lvl] !== 'number' || typeof el[keys.parentId] !== 'number' && typeof el[keys.parentId] !== 'string' || typeof el[keys.lft] !== 'number' || typeof el[keys.rgt] !== 'number') {
                    throw new NestedSetsValidationError('keys error!');
                }
                if (!Number.isInteger(el[keys.lvl]) || el[keys.lvl] < 0 || !Number.isInteger(el[keys.lft]) || el[keys.lft] <= 0 || !Number.isInteger(el[keys.rgt]) || el[keys.rgt] <= 0) {
                    throw new NestedSetsValidationError('lvl, rgt, lft keys must be natural numbers!');
                }
                if (el[keys.lft] >= el[keys.rgt]) {
                    throw new NestedSetsValidationError('every rgt key of element must be more than lft key!');
                }
                if (!(el[keys.rgt] - el[keys.lft] & 1)) {
                    throw new NestedSetsValidationError('the difference between the right and\
                    left index must be an odd number!');
                }
                if (el[keys.lvl] & 1) {
                    if (el[keys.lft] & 1) {
                        throw new NestedSetsValidationError('For odd levels, the left index must be even!');
                    }
                }
                if (!(el[keys.lvl] & 1)) {
                    if (!(el[keys.lft] & 1)) {
                        throw new NestedSetsValidationError('For even levels, the left index must be odd!');
                    }
                }
                lftrgt.push(el[keys.lft]);
                lftrgt.push(el[keys.rgt]);
            });
            lftrgt.sort(function (el1, el2) {
                return el1 - el2;
            });
            lftrgt.forEach(function (el, i, lftrgt) {
                if (lftrgt[i - 1] === lftrgt[i]) {
                    throw new NestedSetsValidationError('The set of left and right indexes \
                    must be unique!');
                }
            });
            var minLft = getMinElByField(tree, 'lft').value;
            var maxRgt = getMaxElByField(tree, 'rgt').value;
            if (minLft !== 1) {
                throw new NestedSetsValidationError('The smallest left index must be equal to one!');
            }
            if (maxRgt !== tree.length * 2) {
                throw new NestedSetsValidationError('The largest right index must be equal \
                to twice the number of nodes!');
            }
        }
    }, {
        key: 'isChild',
        value: function isChild(parent, child, _ref) {
            var lft = _ref.lft,
                rgt = _ref.rgt;

            return child[lft] > parent[lft] && child[rgt] < parent[rgt];
        }
    }]);
    return NestedSets;
}();

module.exports = NestedSets;
//# sourceMappingURL=tree.js.map
