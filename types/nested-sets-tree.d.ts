declare module 'nested-sets-tree' {
	interface CollectionEl {
	    [key: string]: number;
	}
	interface ExtremumResult {
	    index: number;
	    value: number;
	    el: CollectionEl;
	}
	interface Keys {
	    id?: string;
	    lvl?: string;
	    parentId?: string;
	    lft?: string;
	    rgt?: string;
	    hide?: string;
	}
	interface IndexedTree {
	    id?: CollectionEl[];
	}
	type stringOrNumberType = number | string;
	export default class NestedSets {
	    private _tree;
	    all: CollectionEl[];
	    allIds: stringOrNumberType[];
	    private _keys;
	    keys: Keys;
	    private _indexes;
	    results: CollectionEl[];
	    ids: stringOrNumberType[];
	    constructor(keys: Keys);
	    private _getElById(id);
	    getElById(id: string | number): NestedSets;
	    validate(): void;
	    static validateTree(tree: CollectionEl[], keys: Keys): void;
	    loadTree(data: CollectionEl[], options?: {
	        validate?: boolean;
	        createIndexes?: boolean;
	    }, indexes?: IndexedTree): this;
	    getRootCats(): NestedSets;
	    getRootEl(): this;
	    static isChild(parent: CollectionEl, child: CollectionEl, {lft, rgt}: Keys): boolean;
	    isChild(parent: CollectionEl, child: CollectionEl): boolean;
	    checkKeys(el: any): void;
	    private _normalizeElement(el);
	    getChilds(el: stringOrNumberType | CollectionEl, hide: boolean): NestedSets;
	    isValidId(id: string | number): boolean;
	    getAllChilds(el: stringOrNumberType | CollectionEl, hide: boolean): NestedSets;
	    getDepth(): number;
	    getParent(el: stringOrNumberType | CollectionEl): NestedSets;
	    getAllParents(el: stringOrNumberType | CollectionEl, hide: boolean): NestedSets;
	}
}
