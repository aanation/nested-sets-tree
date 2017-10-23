const sortBy = require('lodash.sortby');

class NestedSetsError extends Error {
	constructor(message) {
		super();
		this.name = "NestedSetsError";
		if (typeof message === "string") {
			this.message = message;
		}  
		Error.captureStackTrace(this, this.constructor); 
	}
};

//достает из коллекции элемент у которого значение поля field является минимальным
function getMinElByField(collection, field) {
	if (!Array.isArray(collection)) {
		throw new NestedSetsError(`collection must be a array!`);
	}

	let min = {
		number: null, 
		value: null 
	}; 

	collection.forEach((el, i, collection) => {
		if (typeof el[field] !== "number") {
			throw new NestedSetsError(`field ${field} does't exist in collection!`);
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
	}
};


//достает из коллекции элемент у которого значение поля field является максимальным
function getMaxElByField(collection, field) {
	if (!Array.isArray(collection)) {
		throw new NestedSetsError(`collection must be a array!`);
	}

	let max = {
		number: null, 
		value: null 
	}; 

	collection.forEach((el, i, collection) => {
		if (typeof el[field] !== "number") {
			throw new NestedSetsError(`field ${field} does't exist in collection!`);
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
	}
};

//валидация дерева
function validateTree(data) {
	//массив левых и правых индексов для проверки целостности индексов
	let lftrgt = [];
	if (!Array.isArray(data) || data[0] === undefined) {
		throw new NestedSetsError('the date must be a non-empty array!');
	}

	data.forEach(el => {
		if ( typeof el[this._idKey]     !== "number"    || 
			 typeof el[this._lvlKey]    !== "number"    || 
			 typeof el[this._parentKey] !== "number"    || 
			 typeof el[this._lftKey]    !== "number"    || 
			 typeof el[this._rgtKey]    !== "number" ) {
			throw new NestedSetsError('keys error!'); 
		}

		if ( !Number.isInteger(el[this._idKey])  || el[this._idKey] <= 0  || 
			 !Number.isInteger(el[this._lvlKey]) || el[this._lvlKey] < 0  || 
			 !Number.isInteger(el[this._lftKey]) || el[this._lftKey] <= 0 || 
			 !Number.isInteger(el[this._rgtKey]) || el[this._rgtKey] <= 0 ) {
			throw new NestedSetsError('Indices must be natural numbers!'); 
		}

		if (el[this._lftKey] >= el[this._rgtKey]) {
			throw new NestedSetsError('Indices must be natural numbers!'); 
		}	

		if ( !((el[this._rgtKey] - el[this._lftKey]) & 1) ) {
			throw new NestedSetsError('the difference between the right and\
			 left index must be an odd number!'); 
		}

		if (el[this._lvlKey] & 1)  {
			if (el[this._lftKey] & 1) {
				throw new NestedSetsError('For odd levels, the left index must be even!'); 
			}
		}

		if (!(el[this._lvlKey] & 1))  {
			if (!(el[this._lftKey] & 1)) {
				throw new NestedSetsError('For even levels, the left index must be odd!');
			}
		}			

		lftrgt.push(el[this._lftKey]);
		lftrgt.push(el[this._rgtKey]);			

	}); 


	lftrgt.sort((el1, el2) => {
		return el1 - el2;
	});	

	lftrgt.forEach((el, i, lftrgt) => {
		if (lftrgt[i-1] === lftrgt[i]) {
			throw new NestedSetsError('The set of left and right indexes \
				must be unique!');
		}
	});

	let minLft = getMinElByField(data, 'lft').value;
	let maxRgt = getMaxElByField(data, 'rgt').value;

	if (minLft !== 1) {
		throw new NestedSetsError('The smallest left index must be equal to one!');
	}

	if (maxRgt !== data.length*2) {
		throw new NestedSetsError('The largest right index must be equal \
			to twice the number of nodes!');
	}
};


module.exports = class NestedSets {
	constructor({id, lvl, parentId, lft, rgt, hide}) {
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
		return this; 
	}

	get ids() {
		return this.results.map(el => {
			return el[this._idKey];
		}); 
	} 

	loadTree(data, options={}, indexes={}) {
		const validate = options.validate !== undefined ? !!options.validate : false;
		const createIndexes = options.createIndexes !== undefined ? !!options.createIndexes : false; 

		/* Проверяем дерево и индексы на соответствие структуре NestedSets если включена опция валидации */
		if (validate) {
			validateTree.call(this, data); 
		}
		if (validate &&  typeof indexes === "object" && indexes.id !== undefined) {
			validateTree.call(this, indexes.id); 
		}
		/*если включена опция создания индексов - создаем индексы для тех полей для которых они не переданы извне */
		if (createIndexes && !indexes.id) {
			this._indexes.id = sortBy(data, [this._idKey]);
		}
		/* пишем в объект переданные индексы */
		if (indexes.id) {
			this._indexes.id = indexes.id;
		}		
		this._tree = data; 

		return this; 

	}

	_validateId(id) {
		if (typeof id !=="number" || !Number.isInteger(id)) {
			throw new NestedSetsError('id must be a integer!');
		}
	}
	//получение категорий первого уровня 
	getRootCats() {
		this.results = sortBy(this._tree.filter(el => {
			return el[this._lvlKey] === 1; 
		}), this._lftKey); 
		return this; 
	}

	getRootEl() {
		let results = []; 
		for (let i = 0; i < this._tree.length; i++) {
			let el = this._tree[i];
			if (el[this._lvlKey] !== 0) continue; 
			results.push(el); 
			break;
		} 
		this.results = results;
		return this; 
	}

	isChild(parent, child) {
		return child[this._lftKey] > parent[this._lftKey] && 
			child[this._rgtKey] < parent[this._rgtKey];
	}

	static isChild(parent, child, {lft, rgt}) {
		return child[lft] > parent[lft] && 
			child[rgt] < parent[rgt];		
	}

	//получение прямых потомков узла 
	getChilds(el, hide) {
		let element = typeof el === "object" ? el : undefined; 
		let id; 
		if (typeof element === "object") {
			this.checkKeys(element); 
			id = element[this._idKey]; 
		} else {
			id = el; 
			this._validateId(id); 
		}
		
		let results = []; 
		this._tree.forEach(el => {
			if (!hide && el[this._parentKey] === id) {
				results.push(el);
			}

			if (hide && !el[this._hideKey] && el[this._parentKey] === id) {
				results.push(el); 
			}

			if (el[this._idKey] === id) {
				element = el; 
			}
		});

		if(!element) {
			throw new NestedSetsError('element not found!');
		}
		this.results = sortBy(results, [this._lftKey]);

		return this; 
	}
	//приватный метод для получения эллемента по его id
	_getElById(id) {
		this._validateId(id); 
		let element; 
		let searchArray = this._indexes.id.length !== 0 ? this._indexes.id : this._tree;

		for (let i = 0; i < searchArray.length; i++) {
			let el = searchArray[i];
			if (el[this._idKey] !== id) continue;
			element = el;
			break;  
		}
		if (!element) {
			throw new NestedSetsError('element not found!');
		}
		return element; 
	}
	//публичный метод для получения элемента по его id
	getElById(id) {
		try {
			this.results = [this._getElById(id)];
		} catch(err) {
			if (err instanceof NestedSetsError) {
				this.results = []; 
			}
		}
		return this; 

	}

	checkKeys(el) {
		if (typeof el[this._lftKey]    !== "number" || !Number.isInteger(el[this._lftKey]) ||
		 	typeof el[this._rgtKey]    !== "number" || !Number.isInteger(el[this._rgtKey]) ||
			typeof el[this._lvlKey]    !== "number" || !Number.isInteger(el[this._lvlKey]) ||			 
			typeof el[this._idKey]     !== "number" || !Number.isInteger(el[this._idKey])  ||
			typeof el[this._parentKey] !== "number" || !Number.isInteger(el[this._parentKey])
		) {
			throw new NestedSetsError('incorrect keys by element!');
		}
	}

	getAllChilds(el, hide) {
		let element = typeof el === "object" ? el : this._getElById(el); 
		if (typeof element === "object") {
			this.checkKeys(element); 
		}
		let lft = element[this._lftKey];
		let rgt = element[this._rgtKey];
		let results = [];
		this._tree.forEach(el => {
			if (!hide && el[this._lftKey] >= lft && el[this._rgtKey] <= rgt) {
				results.push(el);
			}

			if (hide && !el[this._hideKey] && el[this._lftKey] >= lft && el[this._rgtKey] <= rgt) {
				results.push(el); 
			}			
		});

		this.results = sortBy(results, [this._lftKey]);
		return this;  
	}

	getDepth() {
		let depth = 0; 
		this._tree.forEach(el => {
			if (el[this._lvlKey] > depth) {
				depth = el[this._lvlKey];
			}
		});
		return depth;
	}

	getParent(el) {
		let element = typeof el === "object" ? el : this._getElById(el); 
		if (typeof element === "object") {
			this.checkKeys(element); 
		}
		let parentId = element[this._parentKey];
		let searchArray = this._indexes.id.length !== 0 ? this._indexes.id : this._tree; 
		let results = [];
		for (let i = 0; i <  searchArray.length; i++) {
			let el = searchArray[i];
			if (el[this._id] !== parentId) continue;
			reults.push(el); 
			break;
		}
		this.results = results;
		return this; 		
	}

	getAllParents(el, hide) {
		let element = typeof el === "object" ? el : this._getElById(el); 
		if (typeof element === "object") {
			this.checkKeys(element); 
		}
		let lft = element[this._lftKey]; 
		let rgt = element[this._rgtKey];
		let results = []; 
		this._tree.forEach(el => {
			if (!hide && el[this._lftKey] <= lft && el[this._rgtKey] >= rgt) {
				results.push(el);
			}

			if (hide && !el[this._hideKey] && el[this._lftKey] <= lft && el[this._rgtKey] > rgt) {
				results.push(el);
			}			
		});
		this.results = sortBy(results, this._lvlKey);
		return this; 
	}
}

