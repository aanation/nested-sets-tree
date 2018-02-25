const NestedSets = require('../dist/tree');

const assert = require('chai').assert;
const expect = require('chai').expect; 
const fs = require('fs'); 
const path = require('path'); 
const _ = require('lodash');


function randomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1)
    rand = Math.round(rand);
    return rand;
}


describe('constructor', function() {
    it('set default indexes', function() {
        let tree = new NestedSets();
        expect(tree.keys).to.deep.equal({
            id: 'id', 
            lft: 'lft',
            rgt: 'rgt', 
            lvl: 'lvl',
            parentId: 'parentId',
            hide: 'hide'
        });
    }); 

    it('set only id index', function() {
        let tree = new NestedSets({
            id: '_id'
        });
        expect(tree.keys).to.deep.equal({
            id: '_id',
            lft: 'lft',
            rgt: 'rgt',
            lvl: 'lvl', 
            hide: 'hide',
            parentId: 'parentId'
        }); 
    }); 

    it('set only parentKey', function() {
        let tree = new NestedSets({
            parentId: 'PARENT' 
        });
        expect(tree.keys).to.deep.include({
            parentId: 'PARENT'
        });
    }); 
}); 

const treeData = JSON.parse(fs.readFileSync(path.resolve('./test/data/tree.json'))); 
const rootCategoriesData = JSON.parse(fs.readFileSync(path.resolve('./test/data/root.json')));

describe('loadTree', function() {
    let tree = new NestedSets({
        'id': 'category_id', 
        'parentId': 'parent_id', 
        'lvl': 'depth'
    });

    it('load tree without validation and indexes', function(){
        tree.loadTree(treeData); 
    }); 

    it('load tree with validation', function() {
        tree.loadTree(treeData, {validate: true}); 
    });

    let indexes = {};
    indexes.id = _.sortBy(treeData.slice(), 'id');
    it('load tree with indexes without validation', function() {
        tree.loadTree(treeData, {},indexes);  
    }); 

    it('load tree with indexes and validate indexes', function() {
        tree.loadTree(treeData, {validate: true}, indexes);
    });
}); 

describe('validateTree', function() {
    let tree = new NestedSets({
        'id': 'category_id', 
        'parentId': 'parent_id', 
        'lvl': 'depth'
    });

    it('correct validation tree', function() {
        tree.loadTree(treeData); 
        tree.validate();
    }); 

    it('incorrect rgt index', function() {
        let incorrectTree = treeData.slice(); 
        let randomIndex = randomInteger(0, incorrectTree.length - 1);
        incorrectTree[randomIndex].rgt = incorrectTree[randomIndex].lft - 1;
        tree.loadTree(incorrectTree);
        let error; 
        try {
            tree.validate();
        } catch(err) {
            error = err; 
        } finally { 
            assert.isOk(error && error.name === "NestedSetsValidationError", 'coorect validation');
        }
    });

    it('incorrect parent id', function() {
        let incorrectTree = treeData.slice(); 
        let randomIndex = randomInteger(0, incorrectTree.length - 1);
        incorrectTree[randomIndex].parent_id = [1,2,3]; //array instead of string|number
        tree.loadTree(incorrectTree);
        let error; 
        try {
            tree.validate();
        } catch(err) {
            error = err; 
        } finally { 
            assert.isOk(error && error.name === "NestedSetsValidationError", 'coorect validation');
        }
    });

    it('incorrect diff beenwen lft and rgt indexes', function() {
        let incorrectTree = treeData.slice(); 
        let randomIndex = randomInteger(0, incorrectTree.length - 1);
        incorrectTree[randomIndex].rgt = incorrectTree.rgt + 1; 
        tree.loadTree(incorrectTree);
        let error; 
        try {
            tree.validate();
        } catch(err) {
            error = err; 
        } finally { 
            assert.isOk(error && error.name === "NestedSetsValidationError", 'coorect validation');
        }        
    }); 
});

describe('get elements', function() {
    let tree = new NestedSets({
        'id': 'category_id', 
        'parentId': 'parent_id', 
        'lvl': 'depth'
    });
    tree.loadTree(treeData);

    it('get root element', function() {
        let [rootEl] = tree.getRootEl().results;  
        expect(rootEl).to.deep.equal({
            "category_id": 1,
            "depth": 0,
            "lft": 1,
            "rgt": 2664,
            "parent_id": 0,
            "required": 0,
            "category_slug": "koren",
            "category_name": "Корень",
            "category_icon": null,
            "synonyms": "",
            "hint": null
        });
    }); 

    it('get root categories', function() {
        let rootCategories = tree.getRootCats().results; 
        expect(rootCategories).to.deep.equal(rootCategoriesData);
    });

    it('is child', function() {
        let parent =  {
            "category_id": 268,
            "depth": 3,
            "lft": 1000,
            "rgt": 1009,
            "parent_id": 228,
            "required": 1,
            "category_slug": "sol",
            "category_name": "Соль",
            "category_icon": null,
            "synonyms": "",
            "hint": "<p>Минерал природного происхождения, его химическая формула NaCl. В измельчённом виде представляет собой бесцветные кристаллы. Имеет широкое применение, производится в разных видах: крупного и мелкого помола, чистая и с различными добавками и пр.</p>"
        }; 

        let child = {
            "category_id": 304,
            "depth": 4,
            "lft": 1005,
            "rgt": 1006,
            "parent_id": 268,
            "required": 1,
            "category_slug": "tekhnicheskaya",
            "category_name": "Техническая",
            "category_icon": null,
            "synonyms": "",
            "hint": "<p>Техническая соль имеет сероватый оттенок. Обычно имеет структуру, содержащую множество крупных частиц. Её особенно часто используют зимой для борьбы с гололёдом и снегом.</p>"
        }; 

        let notChild = {
            "category_id": 460,
            "depth": 4,
            "lft": 349,
            "rgt": 350,
            "parent_id": 220,
            "required": 1,
            "category_slug": "irga",
            "category_name": "Ирга",
            "category_icon": null,
            "synonyms": "",
            "hint": "<p>Ирга – плод невысокого кустарника. Ягода ирга обладает приятным вкусом, за свою сладость она даже получила прозвище «северный виноград». Плоды, фиолетового цвета, с налетом. Мякоть сочная, мягкая, ароматная. Созревают плоды в июле. Само растение имеет мощную систему корней, толстые ветки, достигает 3 метров в длину. Листья ирги темно зеленые, округлой или овальной формы, по краям с зубчиками, слегка опушенные сверху. Осенью краснеют. Цветы белые или кремовые, собранные в соцветие щиток. Цветет около 10 дней. Ирга не боится заморозков, может выдерживать морозы до -40 градусов. Дикая ирга произрастает в Крыму и на Кавказе. Культурные сорта произрастают в Сибири, на Урале, в Казахстане. Его используют как медоносное, декоративное плодовое растение.  </p>"
        }; 

        expect(NestedSets.isChild(parent, child, { lft: 'lft', rgt: 'rgt'})).to.be.true;
        expect(NestedSets.isChild(parent, notChild, { lft: 'lft', rgt: 'rgt'})).to.be.false;
    }); 


}); 