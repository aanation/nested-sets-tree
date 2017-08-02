## NESTED SETS TREE 

# Инициализация 
При инициализации конструктору передается объект с названиями ключей в массиве

```javascript 
const nestedTree = require('agris-nested-sets-tree');

let tree = new nestedTree({
    id: 'id',
    lvl: 'depth',
    parentId: 'parent_id', 
    lft: 'lft', 
    rgt: 'rgt', 
    hide: 'hide'
}); 
```
## Загрузка дерева 

```javascript 
let array = [
    {
        id: 1, 
        lvl: 0, 
        parent_id: 0
        //...
    }//...
];

tree.loadTree(array);
```
При загрузке данных вместе с самим деревом можно передать объект опций:

**validate** true/false - валидировать ли данные на соответствие формату данных nested sets (проверка индексов). По умолчанию false; 

**createIndexes** true/false - создавать ли индексы для полей для ускорения поиска 
По умолчанию false. 

**indexes** {} - объект с готовыми индексами. Можно передать уже сформирвоанный заранее массив индексов, отсортированных по определнными полям. 

```javascript
tree.loadTree(array, {
    lvl: [//...массив отсортированных элементов]
});
```
## Поиск по дереву 

```javascript 
tree.getChilds(5).ids; //получение id всех прямых потомков элемента с id 5 
tree.getChilds(5).results; //получение самих элементов потомков 
tree.getChilds(5, true).resutls; //поиск прямых потомков за вычетом тех, что отмечены флагом hide
```
Методы поиска: 

**getChilds** - получить только потомков первого уровня

**getAllChilds** - получить всех потомков

**getDepth** - получить глубину дерева

**getParent** - получить прямого предка элемента

**getAllParents** - получить цепочку предков элемента вплоть до корня


