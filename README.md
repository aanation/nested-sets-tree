# NESTED SETS TREE 

It's a small module for getting elements of Nested Sets Tree. 
It works both in browsers and NodeJS. Includes types definition for Typescript. 

## Installation 

```npm install nested-sets-tree```

## Initialization (create NestedSets instance)
When initialized, you must define the keys used in your nested sets tree array: 

Javascript:
```javascript 
const NestedSets = require('nested-sets-tree');

const tree = new NestedSets({
    id: 'id',
    lvl: 'depth',
    parentId: 'parent_id', 
    lft: 'lft', 
    rgt: 'rgt', 
    hide: 'hide'
}); 
```

In typescript + es6 import + nodejs you should use ```"esModuleInterop": true``` option in your tsconfig.json. 

Typescript:
```typescript
import NestedSets from 'nested-sets-tree'; 
import {CollectionEl} from 'nested-sets-tree'; 

const tree:NestedSets = new NestedSets({
    id: 'id',
    lvl: 'depth',
    parentId: 'parent_id', 
    lft: 'lft', 
    rgt: 'rgt', 
    hide: 'hide'
});
```

## Load tree

Javascript:
```javascript 
let array = [
    {
        id: 1, 
        lvl: 0, 
        parent_id: 0
        //...
    }//...
];

tree.loadTree(array, {});
```

Typescript:
```typescript
let array:CollectionEl[] = [
    {
        id: 1, 
        lvl: 0, 
        parent_id: 0
        //...
    }//...
];

tree.loadTree(array, {});
```
You can set the options' object together with your tree array:

**validate** true/false - if true your tree is validated. By default is false. 

**createIndexes** true/false - if true the indexes for quick binary search are created (recommended for huge amount of operations). By default false. 

**indexes** {} - object includes ready-made indexes. Set it if you already have got sorted tree.   

```javascript
tree.loadTree(array, {
    id: [] //nested sets tree array sorted by id 
});
```


## Search

```javascript 
tree.getChilds(5).ids; 
tree.getChilds(5).results; 
tree.getChilds(5, true).resutls; 
tree.getAllChilds(5).results; 
tree.getChilds({
    id: 1, 
    lvl: 0, 
    parent_id: 0
    lft: 1,
    rgt: 20, 
    name: 'parent element'
    hide: false
}).results;

```

## Hidden elements 

If you want to exclude some element's in search results, you should use ```hide: true``` flag in element:

```javascript
const NestedSets = require('nested-sets-tree');

const tree = new NestedSets({
    id: 'id',
    lvl: 'lvl',
    parentId: 'parent_id', 
    lft: 'lft', 
    rgt: 'rgt', 
    hide: 'hide'
}); 

const treeArray = [
    {
        id: 1, 
        lvl: 0, 
        parent_id: 0
        lft: 1,
        rgt: 20, 
        name: 'parent element'
        hide: false
    }, 
    {
        id: 2, 
        lvl: 1, 
        parent_id: 1, 
        lft: 2,
        rgt: 3,
        hide: false, 
        name: 'first child'
    }, 
    //exclude second element
    {
        id: 3,
        lvl: 1, 
        parent_id: 1, 
        lft: 4,
        rgt: 5,
        hide: true,
        name: 'second'
    },
    //...
]; 

tree.loadTree(treeArray);
//get all childs exclude second element
let childsWithoutHidden = tree.getAllChilds(1, true).results; 
//get all childs, ignore hide flag 
let childs = tree.getAllChilds(1).results; 

``` 

in search method:
```javascript
let childs = tree

```



## Search methods

All methods are effective for taking both element's ID and element itself. 
All methods returns the NestedSets instance. 


1) get childs of root element:
```typescript
getRootCats(): NestedSets;
```

2) get root element
```typescript
getRootEl(): NestedSets;
```

3) check child element:
```typescript
static isChild(parent: CollectionEl, child: CollectionEl, {lft, rgt}: Keys): boolean;
```

4) get childs (with el):
```typescript
getChilds(el: stringOrNumberType | CollectionEl, hide: boolean): NestedSets;
```

5) is valid id:
```typescript
isValidId(id: string | number): boolean;
```

6) get all childs:
```typescript
getAllChilds(el: stringOrNumberType | CollectionEl, hide: boolean): NestedSets;
```

7) get depth of tree:
```typescript
getDepth(): number;
```

8) get parent of element:
```typescript
getParent(el: stringOrNumberType | CollectionEl): NestedSets;
```

9) get all parents chain:
```typescript
getAllParents(el: stringOrNumberType | CollectionEl, hide: boolean): NestedSets;
```




