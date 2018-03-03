export default function(array:any[], target:number|string, key:string) {
    let min:number = 0,
        max:number = array.length - 1,
        temp:number|string, mid:number;
    while (min <= max) {
        mid = Math.round(min + (max - min) / 2);
        temp = array[mid] ? array[mid][key] : undefined;
        if (temp === target) {
            return array[mid];
        } else if (temp < target) {
            min = mid + 1;
        } else {
            max = mid - 1;
        }
    }
}