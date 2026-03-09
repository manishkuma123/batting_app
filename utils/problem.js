"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

var number = 40;
console.log(number);



function reverseWordsDSA(str) {
    
    let arr = [];
    for (let i = 0; i < str.length; i++) {
        arr.push(str[i]);
    }

    function reverse(arr, start, end) {
        while (start < end) {
            let temp = arr[start];
            arr[start] = arr[end];
            arr[end] = temp;
            start++;
            end--;
        }
    }

    // Step 1: Reverse the entire array
    reverse(arr, 0, arr.length - 1);


    let start = 0;
    for (let i = 0; i <= arr.length; i++) {
        if (i === arr.length || arr[i] === ' ') {
            reverse(arr, start, i - 1);
            start = i + 1;
        }
    }

    // Convert array back to string
    let result = "";
    for (let i = 0; i < arr.length; i++) {
        result += arr[i];
    }

    return result;
}


console.log(reverseWordsDSA("robin kumar")); 


function getFullName(person: {
    firstName: string;
    lastName: string
}) {
    return `${person.firstName} ${person.lastName}`;
}

let person = {
    firstName: 'John',
    lastName: 'Doe'
};

console.log(getFullName(person));
