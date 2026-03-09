// Easy Problems
// Sum of Digits
// Reverse Digits
// Prime Testing
// Check Power
// Distance between Two Points
// Valid Triangle
// Overlapping Rectangles
// Factorial of a Number
// Pair Cube Count
// GCD or HCF
// LCM of Two Numbers
// Perfect Number
// Add Two Fraction
// Day of the Week
// Nth Fibonacci Number
// Decimal to Binary
// N-th term of 1, 3, 6, 10, 15, 21…
// Armstrong Number
// Palindrome Number
// Digit Root

function sumdata(arr){

   
    let sum =0


for (let i = 0; i <arr.length; i++) {

    
 sum+= arr[i]

}
// return sum 
if(sum %2===0){
    return 0
}
else{
    return sum
}


}
let arr = [1,2,3,4,5,6,8,8,9,2]
console.log(sumdata(arr))



function reversedigit(arr){
    let result =[]
for (let i = arr.length-1; i >= 0; i--) {
result.push(arr[i])
}





// for (let j = 0; j < arr.length; j++) {
//   for (let s = j; s < arr.length; s++) {
    
//     let temp = arr[s];
//     arr[s]= arr[s+1]
//     arr[s+1]= temp
    
//   }
// if(temp%2 ===0){
//     return 0
// }else{
//     temp
// }
//   return temp
// }
return result
}
let arr1 = [1,2,3,4,5,6,8,8,9,2]
console.log(reversedigit(arr1));


function secondreverse(arr) {
    let left =0;
    let right = arr.length-1
    while (left<right) {
        let temp = arr[left]
        arr[left]= arr[right]
        arr[right]= temp;
        left++
        right--
    }
    return arr
}


console.log(secondreverse([1,2,3,4,5,6]));


function factorial(n) {
    let ans =1
    for (let index = 2; index <=n; index++) {
      ans=ans*index
    }

   return ans
}

console.log(factorial(6));



// function twoSum(arr, target) {
//     let left = 0;
//     let right = arr.length - 1;

//     while (left < right) {
//         let sum = arr[left] + arr[right];

//         if (sum === target) {
//             return [arr[left], arr[right]];
//         } else if (sum < target) {
//             left++;
//         } else {
//             right--;
//         }
//     }

//     return [];
// }

// // Example
// console.log(twoSum([1,2,3,4,6], 6)); // [2,4]


function addtwonum(arr,target) {
    let left  = 0
    let right = arr.length-1;
    while (left<right) {
        let sum = arr[left]+ arr[right]
        if (sum === target) {
            return [arr[left],arr[right]]
        }else if(sum<target){
 left++;
        }else{
right--;
        }

       
        
    }
    return []
}
console.log(addtwonum([1,2,3,4,5,6,8],10));
function addtwonumber (arr, target){
    let arr1 = arr.length-1;
    let arr2 = 0;
   while (arr1<arr2) {
    let temp = arr[arr1];
    arr[arr1]= arr[arr2];
    arr[arr2]= temp;
   }
   return arr
}
console.log(addtwonum([1,3,4,5,6,7,8],10));
