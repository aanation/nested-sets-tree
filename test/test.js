const NestedSets = require('../dist/tree');
const assert = require('../node_modules/chai').assert;
const expect = require('../node_modules/chai').expect; 
const _ = require('../node_modules/lodash');


function randomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1)
    rand = Math.round(rand);
    return rand;
};


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

const treeData = require('./data/tree.js'); 
const rootCategoriesData = require('./data/root.js');
const childsData = require('./data/childs.js');
const parentsChains = require('./data/parentsChains.js');

describe('loadTree', function() {
    let tree = new NestedSets({
        'id': 'category_id', 
        'parentId': 'parent_id', 
        'lvl': 'depth',
        'hide': 'hide_category'
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
        'lvl': 'depth',
        'hide': 'hide_category'
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
        'lvl': 'depth',
        'hide': 'hide_category'
    });
    tree.loadTree(treeData);

    let treeWithIndexes = new NestedSets({
        'id': 'category_id', 
        'parentId': 'parent_id', 
        'lvl': 'depth',
        'hide': 'hide_category'
    });
    treeWithIndexes.loadTree(treeData, {
        createIndexes: true
    });

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
            "hint": null,
            "hide_category": false
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
            "hint": "<p>Минерал природного происхождения, его химическая формула NaCl. В измельчённом виде представляет собой бесцветные кристаллы. Имеет широкое применение, производится в разных видах: крупного и мелкого помола, чистая и с различными добавками и пр.</p>",
            "hide_category": false
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
            "hint": "<p>Техническая соль имеет сероватый оттенок. Обычно имеет структуру, содержащую множество крупных частиц. Её особенно часто используют зимой для борьбы с гололёдом и снегом.</p>",
            "hide_category": false
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
            "hint": "<p>Ирга – плод невысокого кустарника. Ягода ирга обладает приятным вкусом, за свою сладость она даже получила прозвище «северный виноград». Плоды, фиолетового цвета, с налетом. Мякоть сочная, мягкая, ароматная. Созревают плоды в июле. Само растение имеет мощную систему корней, толстые ветки, достигает 3 метров в длину. Листья ирги темно зеленые, округлой или овальной формы, по краям с зубчиками, слегка опушенные сверху. Осенью краснеют. Цветы белые или кремовые, собранные в соцветие щиток. Цветет около 10 дней. Ирга не боится заморозков, может выдерживать морозы до -40 градусов. Дикая ирга произрастает в Крыму и на Кавказе. Культурные сорта произрастают в Сибири, на Урале, в Казахстане. Его используют как медоносное, декоративное плодовое растение.  </p>",
            "hide_category": false
        }; 

        expect(NestedSets.isChild(parent, child, { lft: 'lft', rgt: 'rgt'})).to.be.true;
        expect(NestedSets.isChild(parent, notChild, { lft: 'lft', rgt: 'rgt'})).to.be.false;
    }); 

    it('get child elements', function() {
        let element = {
            "category_id": 125,
            "depth": 3,
            "lft": 6,
            "rgt": 17,
            "parent_id": 60,
            "required": 1,
            "category_slug": "maslo-i-maslozhirovyye-produkty",
            "category_name": "Масло и масложировые продукты",
            "category_icon": null,
            "synonyms": "Твёрдое масло, Мягкое масло, Топлёное масло, Бутербродное масло, Масло сливочное солёное, Несолёное масло, Крестьянское масло, Масляная паста,",
            "hint": null,
            "hide_category": false
        }; 

        let childs = [
            {
                "category_id": 137,
                "depth": 4,
                "lft": 7,
                "rgt": 8,
                "parent_id": 125,
                "required": 1,
                "category_slug": "maslo-slivochnoye",
                "category_name": "Масло сливочное",
                "category_icon": null,
                "synonyms": "Масло топленое и молочный жир, Твёрдое масло, Мягкое масло, Топлёное масло, Бутербродное масло, Масло сливочное солёное, Несолёное масло, Крестьянское масло,",
                "hint": "<p>Пищевой продукт, изготавливаемый сепарированием <wbr>или сбиванием сливок, полученных из  молока.</p>",
                "hide_category": false
            },
            {
                "category_id": 1471,
                "depth": 4,
                "lft": 9,
                "rgt": 10,
                "parent_id": 125,
                "required": 1,
                "category_slug": "maslyanaya-pasta",
                "category_name": "Масляная паста",
                "category_icon": null,
                "synonyms": "",
                "hint": "<p>Молочный продукт или молочный составной продукт на\r\n        эмульсионной жировой основе, в котором  массовая доля жира составляет от 39 до 49 процентов включительно и\r\n        который произведен из молока, молочных продуктов и (или)\r\n        побочных продуктов переработки молока путем использования\r\n        стабилизаторов с добавлением или без добавления немолочных\r\n        компонентов не в целях замены составных частей молока.</p>",
                "hide_category": false
            },
            {
                "category_id": 138,
                "depth": 4,
                "lft": 11,
                "rgt": 12,
                "parent_id": 125,
                "required": 1,
                "category_slug": "maslo-toplenoye-i-molochnyy-zhir",
                "category_name": "Масло топлёное и молочный жир",
                "category_icon": null,
                "synonyms": "Масляная паста,",
                "hint": "<p>Топленое масло – это продукт, получаемый в результате термического воздействия на сливочное. Под влиянием высокой температуры и в результате определенных манипуляций из продукта-основы удаляется молочная составная, вода и примеси. Правильно приготовленное топленое масло имеет янтарный цвет и легкий ореховый аромат. В отличие от сливочного, топленый продукт имеет больший срок годности.</p><p>Молочный жир, изготовляемый из молока и/или молочных продуктов удалением молочной плазмы, предназначенные для непосредственного употребления в пищу, кулинарных целей, при производстве рекомбинированных молочных продуктов и использования в других отраслях пищевой промышленности. Жирность не менее 99,8%.</p>",
                "hide_category": false
            }, 
            {
                "category_id": 139,
                "depth": 4,
                "lft": 13,
                "rgt": 14,
                "parent_id": 125,
                "required": 1,
                "category_slug": "spred",
                "category_name": "Спред",
                "category_icon": null,
                "synonyms": "Топленая смесь,",
                "hint": "<p>Эмульсионный жировой продукт с массовой долей общего жира не менее 39%, имеющий пластичную консистенцию, с температурой плавления жировой фазы не выше 36 °С, изготавливаемый из молочного жира, и (или) сливок, и (или) сливочного масла и натуральных и (или) модифицированных растительных масел или только из натуральных и (или) модифицированных растительных масел с добавлением или без добавления пищевых добавок и других ингредиентов, содержащий не более 8% массовой доли трансизомеров олеиновой кислоты в жире, выделенном из продукта (в пересчете на метилэлаидат). ГОСТ Р 52100-2003.</p>",
                "hide_category": true
            }, {
                "category_id": 140,
                "depth": 4,
                "lft": 15,
                "rgt": 16,
                "parent_id": 125,
                "required": 1,
                "category_slug": "margarin",
                "category_name": "Маргарин",
                "category_icon": null,
                "synonyms": "Жир, Кондитерский жир, Пищевой жир, ",
                "hint": "<p>Эмульсионный жировой продукт с массовой долей жира не менее 20%, состоящий из немодифицированных и (или) модифицированных растительных масел с (или без) животными жирами, с (или без) жирами рыб и морских млекопитающих, воды с добавлением или без добавления молока и (или) продуктов его переработки, пищевых добавок и других пищевых ингредиентов.ГОСТ 32188-2013.</p>",
                "hide_category": false
            }
        ];

        expect(tree.getChilds(element).results).to.deep.equal(childs); //get childs by element object
        expect(tree.getChilds(element['category_id']).results).to.deep.equal(childs); //get childs by id
        //get childs by element exlude hided
        expect(tree.getChilds(element, true).results).to.deep.equal(_.filter(childs, {
            "hide_category": false
        }));
    });

    it('get element by id', function() {
        let element = {
            "category_id": 806,
            "depth": 3,
            "lft": 2106,
            "rgt": 2107,
            "parent_id": 320,
            "required": 1,
            "category_slug": "akhimenes",
            "category_name": "Ахименес",
            "category_icon": null,
            "synonyms": "",
            "hint": null,
            "hide_category": false
        };

        expect(tree.getElById(806).results).to.deep.equal([element]);
        expect(treeWithIndexes.getElById(806).results).to.deep.equal([element]);
    });

    it('is valid id', function() {
        //генерируем из дерева массив корректных и некорректных id и проверяем их на валидность 
        let allIds = treeWithIndexes.allIds;
        let endElement = Math.floor(allIds.length / 5);
        let elementsIds = allIds.slice(0, endElement);

        elementsIds.forEach(id => {tree
            expect(treeWithIndexes.isValidId(id)).to.be.true; 
        }); 
        let maxId = Math.max(...allIds); 
        let incorrectIds = [];
        for (let i = maxId+1; i<maxId+100; i++) {
            incorrectIds.push(i); 
        }
        incorrectIds.forEach(id => {
            expect(treeWithIndexes.isValidId(id)).to.be.false;
        }); 
    });

    it('check keys', function() {
        let correctElement = {
            "category_id": 806,
            "depth": 3,
            "lft": 2106,
            "rgt": 2107,
            "parent_id": 320,
            "hide_category": false
        };

        let incorrectElement = {
            "category_id": 806,
            "depth": 3,
            "lft": 2106,
            "rgt": '234',
            "parent_id": [2],
            "hide_category": 'false'
        };

        tree.checkKeys(correctElement); 

        let error; 
        try {
            tree.checkKeys(incorrectElement); 
        } catch(err) {
            error = err; 
        } finally { 
            assert.isOk(error && error.name === "NestedSetsValidationError", 'coorect validation');
        }
    });

    it('get all childs', function() {
        let el = {
            "category_id": 6,
            "depth": 2,
            "lft": 1119,
            "rgt": 1144,
            "parent_id": 5,
            "required": 1,
            "category_slug": "zhivyye-ptitsy",
            "category_name": "Живые птицы",
            "category_icon": null,
            "synonyms": "",
            "hint": null,
            "hide_category": false
        }; 
        let ch = tree.getAllChilds(el); 
        expect(tree.getAllChilds(el).results).to.deep.equal(childsData);
        expect(tree.getAllChilds(6).results).to.deep.equal(childsData);
        expect(treeWithIndexes.getAllChilds(6).results).to.deep.equal(childsData);
    });

    it('get depth', function() {
        expect(tree.getDepth()).to.be.equal(4);
    });

    it('get parent', function() {
        let element = {
            "category_id": 1370,
            "depth": 4,
            "lft": 1747,
            "rgt": 1748,
            "parent_id": 1350,
            "required": 1,
            "category_slug": "borona",
            "category_name": "Борона",
            "category_icon": null,
            "synonyms": "",
            "hint": "<p>Сельскохозяйственное орудие для обработки почвы. Боронование – поверхностная обработка почвы, проводимая с целью рыхления, выравнивания поверхности, заделки влаги, вычесывания и присыпания сорняков, заделки семян и удобрений, прореживания посевов. </p>",
            "hide_category": false
        };
        let parent = {
            "category_id": 1350,
            "depth": 3,
            "lft": 1742,
            "rgt": 1781,
            "parent_id": 1340,
            "required": 1,
            "category_slug": "pochvoobrabatyvayushchaya-tekhnika",
            "category_name": "Почвообрабатывающая техника",
            "category_icon": null,
            "synonyms": "",
            "hint": null,
            "hide_category": false
        }; 

        expect(tree.getParent(element).results[0]).to.deep.equal(parent);
        expect(tree.getParent(element.category_id).results[0]).to.deep.equal(parent); 
        let elements = tree.all.slice(0,100).forEach(el => {
            if (el.depth === 0) return;
            expect(tree.getParent(el).results[0].category_id).to.be.equal(el.parent_id);
        }); 
    }); 

    it('get all parents', function() {
        parentsChains.forEach(chain => {
            chain.forEach((el,index) => {
                if (index === 0) return; //root element
                let parents = chain.slice(0, index+1);
                expect(tree.getAllParents(el).results).to.deep.equal(parents);
            });
        });
    });
}); 