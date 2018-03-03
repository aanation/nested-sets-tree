const binarySearch = require('binary-search-bounds');


let p = [
    {fd: 3, ds:3333},
    {fd: 4, ds: 4444},
    {fd: 5, ds: 5555}, 
    {fd: 6, ds: 6666}
];

let eee = binarySearch.eq(p, {fd: 5, ds: 5555});

console.log(eee);