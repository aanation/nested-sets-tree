import * as _ from 'lodash'; 
import {NestedSetsError, NestedSetsValidationError} from "./errors";
import binarySearch from './binarysearch';



export interface CollectionEl {
    [key:string]: number; 
};

export interface ExtremumResult {
    index: number, 
    value: number,
    el: CollectionEl
}; 


function getMinElByField(collection:CollectionEl[], field:string) :ExtremumResult {
    let min :ExtremumResult = {
        index: null, 
        value: null, 
        el: null 
    }; 
    collection.forEach((el, index, collection) => {
        if (typeof el[field] !== "number") {
            throw new NestedSetsError(`field ${field} does't exist in collection!`); 
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
};

function getMaxElByField(collection:CollectionEl[], field:string) :ExtremumResult {
    let max :ExtremumResult = {
        index: null, 
        value: null, 
        el: null
    }; 
    collection.forEach((el, index, collection) => {
        if (typeof el[field] !== "number") {
            throw new NestedSetsError(`field ${field} does't exist in collection!`); 
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
}; 

export interface Keys {
    id?: string,
    lvl?: string, 
    parentId?: string,
    lft?: string, 
    rgt?: string, 
    hide?: string
}; 

export interface IndexedTree {
    id?:CollectionEl[]
};

export type stringOrNumberType = number | string;

module.exports = class NestedSets {
    private _tree: CollectionEl[] = [];
    private _keys:Keys ={
        id: 'id',
        lvl: 'lvl',
        parentId: 'parentId', 
        lft: 'lft', 
        rgt: 'rgt',
        hide: 'hide' 
    };
    get keys():Keys {
        return this._keys; 
    }
    set keys(keys: Keys) {
        this._keys = keys;
    } 
    private _indexes:IndexedTree = {
        id: [],
    };
    public results: CollectionEl[] = []; 
    get ids():stringOrNumberType[] {
        return _.map(this.results, this._keys.id);
    }
    constructor(keys: Keys) {
        this._keys = Object.assign(this._keys, keys); 
    }

    private _getElById(id: string|number):CollectionEl {
        if (this._indexes.id && this._indexes.id.length) {
            let el:CollectionEl = binarySearch(this._indexes.id, id, this._keys.id);
            let p;
            return el;
        } else {
            let searchObj = {};
            searchObj[this._keys.id] = id;
            return _.find(this._tree, searchObj); 
        }
    }

    public getElById(id: string|number):NestedSets {
        let element = this._getElById(id);
        this.results = element ? [element] : [];
        return this; 
    }

    public validate() {
        NestedSets.validateTree(this._tree, this._keys); 
    }

    public static validateTree(tree: CollectionEl[], keys:Keys) {
        let lftrgt: number[] = []; //массив левых и правых индексов
        
        tree.forEach(el => {
            if ((typeof el[keys.id]       !== 'number'  &&
                 typeof el[keys.id]       !== 'string') ||
                 typeof el[keys.hide]     !== 'boolean' ||
                 typeof el[keys.lvl]      !== 'number'  ||
                (typeof el[keys.parentId] !== 'number'  &&
                 typeof el[keys.parentId] !== 'string') ||
                 typeof el[keys.lft]      !== 'number'  ||
                 typeof el[keys.rgt]      !== 'number') {
                throw new NestedSetsValidationError('keys error!'); 
            }

            if (!Number.isInteger(el[keys.lvl]) || el[keys.lvl] < 0  || 
                !Number.isInteger(el[keys.lft]) || el[keys.lft] <= 0 || 
                !Number.isInteger(el[keys.rgt]) || el[keys.rgt] <= 0 ) {
                throw new NestedSetsValidationError('lvl, rgt, lft keys must be natural numbers!'); 
            }

            if (el[keys.lft] >= el[keys.rgt]) {
                throw new NestedSetsValidationError('every rgt key of element must be more than lft key!'); 
            }	

            if ( !((el[keys.rgt] - el[keys.lft]) & 1) ) {
                throw new NestedSetsValidationError('the difference between the right and\
                 left index must be an odd number!'); 
            }

            if (el[keys.lvl] & 1)  {
                if (el[keys.lft] & 1) {
                    throw new NestedSetsValidationError('For odd levels, the left index must be even!'); 
                }
            }

            if (!(el[keys.lvl] & 1))  {
                if (!(el[keys.lft] & 1)) {
                    throw new NestedSetsValidationError('For even levels, the left index must be odd!');
                }
            }	

            lftrgt.push(el[keys.lft]);
            lftrgt.push(el[keys.rgt]);
        });

        lftrgt.sort((el1, el2) => {
            return el1 - el2;
        });	

        lftrgt.forEach((el, i, lftrgt) => {
            if (lftrgt[i-1] === lftrgt[i]) {
                throw new NestedSetsValidationError('The set of left and right indexes \
                    must be unique!');
            }
        });

        let minLft:number = getMinElByField(tree, 'lft').value;
        let maxRgt:number = getMaxElByField(tree, 'rgt').value;

        if (minLft !== 1) {
            throw new NestedSetsValidationError('The smallest left index must be equal to one!');
        }
        if (maxRgt !== tree.length*2) {
            throw new NestedSetsValidationError('The largest right index must be equal \
                to twice the number of nodes!');
        }


    }

    public loadTree(data: CollectionEl[], options?: {validate?:boolean, createIndexes?:boolean}, indexes?:IndexedTree) {
        this._tree = data; 
        options = options || {};
        const validate: boolean = options.validate !== undefined ? options.validate : false; 
        const createIndexes: boolean = options.createIndexes !== undefined ? options.createIndexes : false; 

        if (validate) {
            this.validate(); 
        }

        if (validate && indexes && indexes.id) {
            NestedSets.validateTree(indexes.id, this._keys);
        }

        if (indexes && indexes.id.length) {
            this._indexes.id = indexes.id;
        }

        if(createIndexes && (!indexes || !indexes.id || !indexes.id.length)) {
            this._indexes.id = _.sortBy(data, [this._keys.id]);
        }

        return this; 
    }

    public getRootCats() :NestedSets {
        let rootCats:CollectionEl[] = this._tree.filter(el => {
            return el[this._keys.lvl] === 1; 
        });
        this.results = _.sortBy(rootCats, this._keys.lft);
        return this;
    }

    public getRootEl() {
        let results:CollectionEl[] = []; 
		for (let i = 0; i < this._tree.length; i++) {
			let el:CollectionEl = this._tree[i];
			if (el[this._keys.lvl] !== 0) continue; 
			results.push(el); 
			break;
		} 
		this.results = results;
		return this; 
    }
    //статическая версия метода проверки на потомка без загрузки дерева
    static isChild(parent:CollectionEl, child:CollectionEl, {lft, rgt}:Keys) :boolean {
		return child[lft] > parent[lft] && 
			child[rgt] < parent[rgt];		
    }

    public isChild(parent: CollectionEl, child: CollectionEl) :boolean {
		return child[this._keys.lft] > parent[this._keys.lft] && 
			child[this._keys.rgt] < parent[this._keys.rgt];
    }
    
	public checkKeys(el) {
        let keys:Keys = this._keys; 
        if ((typeof el[keys.id]       !== 'number'  &&
             typeof el[keys.id]       !== 'string') ||
             typeof el[keys.lvl]      !== 'number'  ||
             typeof el[keys.hide]     !== 'boolean' ||
            (typeof el[keys.parentId] !== 'number'  &&
             typeof el[keys.parentId] !== 'string') ||
             typeof el[keys.lft]      !== 'number'  ||
             typeof el[keys.rgt]      !== 'number') {

            throw new NestedSetsValidationError('keys error!'); 
        }
    }
    
    public getChilds(el:string|number|CollectionEl, hide:boolean):NestedSets {
        let id:string|number; 
        let element:CollectionEl; 
        if (typeof el === "string" || typeof el === "number") {
            id = el;
            element = this._getElById(id);
        } else {
            id = el[this._keys.id]; 
            element = el;
        }

		let results:CollectionEl[] = []; 
		//если у элемента правый ключ минус левый равен единицы - значит у него точно нет потомков 
		//и проходка по дереву не имеет смысла 
		if ((el[this._keys.rgt] - el[this._keys.lft] === 1)) {
			this.results = [];
			return this;  
        }
        
		this._tree.forEach(el => {
            //если исключать элементы нет нужды - проверяем parentKey
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
    


};