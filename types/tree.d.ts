export interface CollectionEl {
    [key: string]: number;
}
export interface ExtremumResult {
    index: number;
    value: number;
    el: CollectionEl;
}
export interface Keys {
    id?: string;
    lvl?: string;
    parentId?: string;
    lft?: string;
    rgt?: string;
    hide?: string;
}
export interface IndexedTree {
    id?: CollectionEl[];
}
export declare type stringOrNumberType = number | string;
