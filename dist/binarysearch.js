"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(array, target, key) {
    let min = 0, max = array.length - 1, temp, mid;
    while (min <= max) {
        mid = Math.round(min + (max - min) / 2);
        temp = array[mid] ? array[mid][key] : undefined;
        if (temp === target) {
            return array[mid];
        }
        else if (temp < target) {
            min = mid + 1;
        }
        else {
            max = mid - 1;
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=binarysearch.js.map