"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var sortBy = require('lodash.sortby');

var NestedSetsError = function (_Error) {
	_inherits(NestedSetsError, _Error);

	function NestedSetsError(message) {
		_classCallCheck(this, NestedSetsError);

		var _this = _possibleConstructorReturn(this, (NestedSetsError.__proto__ || Object.getPrototypeOf(NestedSetsError)).call(this));

		_this.name = "NestedSetsError";
		if (typeof message === "string") {
			_this.message = message;
		}
		Error.captureStackTrace(_this, _this.constructor);
		return _this;
	}

	return NestedSetsError;
}(Error);

;

//достает из коллекции элемент у которого значение поля field является минимальным
function getMinElByField(collection, field) {
	if (!Array.isArray(collection)) {
		throw new NestedSetsError("collection must be a array!");
	}

	var min = {
		number: null,
		value: null
	};

	collection.forEach(function (el, i, collection) {
		if (typeof el[field] !== "number") {
			throw new NestedSetsError("field " + field + " does't exist in collection!");
		}

		if (min.value === null) {
			min.number = i;
			min.value = el[field];
			return;
		}

		if (min.value > el[field]) {
			min.number = i;
			min.value = el[field];
		}
	});

	return {
		number: min.number,
		value: min.value,
		el: collection[min.number]
	};
};

//достает из коллекции элемент у которого значение поля field является максимальным
function getMaxElByField(collection, field) {
	if (!Array.isArray(collection)) {
		throw new NestedSetsError("collection must be a array!");
	}

	var max = {
		number: null,
		value: null
	};

	collection.forEach(function (el, i, collection) {
		if (typeof el[field] !== "number") {
			throw new NestedSetsError("field " + field + " does't exist in collection!");
		}

		if (max.value === null) {
			max.number = i;
			max.value = el[field];
			return;
		}

		if (max.value < el[field]) {
			max.number = i;
			max.value = el[field];
		}
	});

	return {
		number: max.number,
		value: max.value,
		el: collection[max.number]
	};
};

//валидация дерева
function validateTree(data) {
	var _this2 = this;

	//массив левых и правых индексов для проверки целостности индексов
	var lftrgt = [];
	if (!Array.isArray(data) || data[0] === undefined) {
		throw new NestedSetsError('the date must be a non-empty array!');
	}

	data.forEach(function (el) {
		if (typeof el[_this2._idKey] !== "number" || typeof el[_this2._lvlKey] !== "number" || typeof el[_this2._parentKey] !== "number" || typeof el[_this2._lftKey] !== "number" || typeof el[_this2._rgtKey] !== "number") {
			throw new NestedSetsError('keys error!');
		}

		if (!Number.isInteger(el[_this2._idKey]) || el[_this2._idKey] <= 0 || !Number.isInteger(el[_this2._lvlKey]) || el[_this2._lvlKey] < 0 || !Number.isInteger(el[_this2._lftKey]) || el[_this2._lftKey] <= 0 || !Number.isInteger(el[_this2._rgtKey]) || el[_this2._rgtKey] <= 0) {
			throw new NestedSetsError('Indices must be natural numbers!');
		}

		if (el[_this2._lftKey] >= el[_this2._rgtKey]) {
			throw new NestedSetsError('Indices must be natural numbers!');
		}

		if (!(el[_this2._rgtKey] - el[_this2._lftKey] & 1)) {
			throw new NestedSetsError('the difference between the right and\
			 left index must be an odd number!');
		}

		if (el[_this2._lvlKey] & 1) {
			if (el[_this2._lftKey] & 1) {
				throw new NestedSetsError('For odd levels, the left index must be even!');
			}
		}

		if (!(el[_this2._lvlKey] & 1)) {
			if (!(el[_this2._lftKey] & 1)) {
				throw new NestedSetsError('For even levels, the left index must be odd!');
			}
		}

		lftrgt.push(el[_this2._lftKey]);
		lftrgt.push(el[_this2._rgtKey]);
	});

	lftrgt.sort(function (el1, el2) {
		return el1 - el2;
	});

	lftrgt.forEach(function (el, i, lftrgt) {
		if (lftrgt[i - 1] === lftrgt[i]) {
			throw new NestedSetsError('The set of left and right indexes \
				must be unique!');
		}
	});

	var minLft = getMinElByField(data, 'lft').value;
	var maxRgt = getMaxElByField(data, 'rgt').value;

	if (minLft !== 1) {
		throw new NestedSetsError('The smallest left index must be equal to one!');
	}

	if (maxRgt !== data.length * 2) {
		throw new NestedSetsError('The largest right index must be equal \
			to twice the number of nodes!');
	}
};

module.exports = function () {
	function NestedSets(_ref) {
		var id = _ref.id,
		    lvl = _ref.lvl,
		    parentId = _ref.parentId,
		    lft = _ref.lft,
		    rgt = _ref.rgt,
		    hide = _ref.hide;

		_classCallCheck(this, NestedSets);

		this._idKey = typeof id === "string" ? id : "id";
		this._lvlKey = typeof lvl === "string" ? lvl : "lvl";
		this._parentKey = typeof parentId === "string" ? parentId : "parentId";
		this._lftKey = typeof lft === "string" ? lft : "lft";
		this._rgtKey = typeof rgt === "string" ? rgt : "rgt";
		this._hideKey = typeof hide === "string" ? hide : "hide";

		this._tree = [];
		this.results = [];
		this._indexes = {
			id: []
		};
	}

	_createClass(NestedSets, [{
		key: "loadTree",
		value: function loadTree(data, _ref2) {
			var _ref2$validate = _ref2.validate,
			    validate = _ref2$validate === undefined ? false : _ref2$validate,
			    _ref2$createIndexes = _ref2.createIndexes,
			    createIndexes = _ref2$createIndexes === undefined ? false : _ref2$createIndexes;
			var indexes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

			/* Проверяем дерево и индексы на соответствие структуре NestedSets если включена опция валидации */
			if (validate) {
				validateTree.call(this, data);
			}
			if (validate && (typeof indexes === "undefined" ? "undefined" : _typeof(indexes)) === "object" && indexes.id !== undefined) {
				validateTree.call(this, indexes.id);
			}
			/*если включена опция создания индексов - создаем индексы для тех полей для которых они не переданы извне */
			if (createIndexes && !indexes.id) {
				this._indexes.id = sortBy(data, [this._idKey]);
			}
			/* пишем в объект переданные индексы */
			if (indexes.id) {
				this._indexes.id = indexes.id;
			}
			this._tree = data;
		}
	}, {
		key: "_validateId",
		value: function _validateId(id) {
			if (typeof id !== "number" || !Number.isInteger(id)) {
				throw new NestedSetsError('id must be a integer!');
			}
		}
		//получение прямых потомков узла 

	}, {
		key: "getChilds",
		value: function getChilds(el, hide) {
			var _this3 = this;

			var element = (typeof el === "undefined" ? "undefined" : _typeof(el)) === "object" ? el : undefined;
			var id = void 0;
			if ((typeof element === "undefined" ? "undefined" : _typeof(element)) === "object") {
				this.checkKeys(element);
				id = element[this._idKey];
			} else {
				id = el;
				this._validateId(id);
			}

			var results = [];
			this._tree.forEach(function (el) {
				if (!hide && el[_this3._parentKey] === id) {
					results.push(el);
				}

				if (hide && !el[_this3._hideKey] && el[_this3._parentKey] === id) {
					results.push(el);
				}

				if (el[_this3._idKey] === id) {
					element = el;
				}
			});

			if (!element) {
				throw new NestedSetsError('element not found!');
			}
			this.results = sortBy(results, [this._lftKey]);

			return this;
		}
	}, {
		key: "_getElById",
		value: function _getElById(id) {
			this._validateId(id);
			var element = void 0;
			var searchArray = this._indexes.id.length !== 0 ? this._indexes.id : this._tree;

			for (var i = 0; i < searchArray.length; i++) {
				var el = searchArray[i];
				if (el[this._idKey] !== id) continue;
				element = el;
				break;
			}
			if (!element) {
				throw new NestedSetsError('element not found!');
			}
			return element;
		}
	}, {
		key: "checkKeys",
		value: function checkKeys(el) {
			if (typeof el[this._lftKey] !== "number" || !Number.isInteger(el[this._lftKey]) || typeof el[this._rgtKey] !== "number" || !Number.isInteger(el[this._rgtKey]) || typeof el[this._lvlKey] !== "number" || !Number.isInteger(el[this._lvlKey]) || typeof el[this._idKey] !== "number" || !Number.isInteger(el[this._idKey]) || typeof el[this._parentKey] !== "number" || !Number.isInteger(el[this._parentKey])) {
				throw new NestedSetsError('incorrect keys by element!');
			}
		}
	}, {
		key: "getAllChilds",
		value: function getAllChilds(el, hide) {
			var _this4 = this;

			var element = (typeof el === "undefined" ? "undefined" : _typeof(el)) === "object" ? el : this._getElById(el);
			if ((typeof element === "undefined" ? "undefined" : _typeof(element)) === "object") {
				this.checkKeys(element);
			}
			var lft = element[this._lftKey];
			var rgt = element[this._rgtKey];
			var results = [];
			this._tree.forEach(function (el) {
				if (!hide && el[_this4._lftKey] >= lft && el[_this4._rgtKey] <= rgt) {
					results.push(el);
				}

				if (hide && !el[_this4._hideKey] && el[_this4._lftKey] >= lft && el[_this4._rgtKey] <= rgt) {
					results.push(el);
				}
			});

			this.results = sortBy(results, [this._lftKey]);
			return this;
		}
	}, {
		key: "getDepth",
		value: function getDepth() {
			var _this5 = this;

			var depth = 0;
			this._tree.forEach(function (el) {
				if (el[_this5._lvlKey] > depth) {
					depth = el[_this5._lvlKey];
				}
			});
			return depth;
		}
	}, {
		key: "getParent",
		value: function getParent(el) {
			var element = (typeof el === "undefined" ? "undefined" : _typeof(el)) === "object" ? el : this._getElById(el);
			if ((typeof element === "undefined" ? "undefined" : _typeof(element)) === "object") {
				this.checkKeys(element);
			}
			var parentId = element[this._parentKey];
			var searchArray = this._indexes.id.length !== 0 ? this._indexes.id : this._tree;
			var results = [];
			for (var i = 0; i < searchArray.length; i++) {
				var _el = searchArray[i];
				if (_el[this._id] !== parentId) continue;
				reults.push(_el);
				break;
			}
			this.results = results;
			return this;
		}
	}, {
		key: "getAllParents",
		value: function getAllParents(el, hide) {
			var _this6 = this;

			var element = (typeof el === "undefined" ? "undefined" : _typeof(el)) === "object" ? el : this._getElById(el);
			if ((typeof element === "undefined" ? "undefined" : _typeof(element)) === "object") {
				this.checkKeys(element);
			}
			var lft = element[this._lftKey];
			var rgt = element[this._rgtKey];
			var results = [];
			this._tree.forEach(function (el) {
				if (!hide && el[_this6._lftKey] <= lft && el[_this6._rgtKey] >= rgt) {
					results.push(el);
				}

				if (hide && !el[_this6._hideKey] && el[_this6._lftKey] <= lft && el[_this6._rgtKey] > rgt) {
					results.push(el);
				}
			});

			this.results = results;
			return this;
		}
	}, {
		key: "ids",
		get: function get() {
			var _this7 = this;

			return this.results.map(function (el) {
				return el[_this7._idKey];
			});
		}
	}]);

	return NestedSets;
}();