function Linearfunction(arr,str){    
    for (let index = 0; index < arr.length; index++) {
        if (arr[index]===str) {
            return index
        }
        
    }
    return -1
}
console.log(Linearfunction([1,2,3,4],4));



let arr2 = [3,4,5,6,7,8];
let index= Linearfunction(arr2,7)

if (index!== -1) {
    console.log("7 exits at index", index );
    
}
else{
  console.log("10 does not exist");
}



function countallnumber (array ,sum) {
    let count =0;
    for (let index = 0; index < array.length; index++) {
      if (array[index]==sum) {
     count++

      }
        
    }
    return count ;
}
let arr3 = [2,4,5,6,7,9,9,3,5,8,9]
console.log(countallnumber(arr3,9));


let arr4 =[1,3,4,5,7,8,-1,-4,-6];
function negetivedatafirst(array,num) {
    for (let index = 0; index < array.length; index++) {
     if(array[index]<0)  {
     return   array[index]
     }
    }
    return null
}

console.log(negetivedatafirst(arr4));



let arr5=["manish","jaydip","harshil","ana","aayat"];
let indexdata = Linearfunction(arr5,"manish")
if (arr5!== "manish") {
    console.log("manish is index", indexdata);
    
}
else{
        console.log("manish is  not exit");
}
for (let index = 0; index < arr5.length; index++) {
console.log(arr5[index]);

}


function findmaxminnumber( array ){
let min  = array[0]
let maxx = array[0]
for (let index = 0; index < array.length; index++) {
   if (array[index]<min) {
    min = array[index]
   }if (array[index]>maxx) {
    maxx = array[index]
    
   }
    
   
}
return[min,maxx]
}
console.log(findmaxminnumber([10,4,5,6,9,3,2,0]));




function binarySearch(arr, target) {
    let low = 0;
    let high = arr.length - 1;
    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return -1;
}
let sortedarry = [3,4,5,6,7,8,9,10]
console.log(binarySearch(sortedarry,8));


let fruits= ["mango","banana","grapes","orange","apple"]
let firstfruit = fruits[fruits.length-3]
console.log(fruits);
console.log(firstfruit);


let arr6 = [10,20,30,40,50,60]
let result =[]
for (let index = 0; index < arr6.length; index+=3) {
   result.push(arr6[index])
}
console.log(result);
function findintegerdata(array,num) {
    for (let index = 0; index < array.length; index++) {
       if(array[index]==num)
        return index
    }
    return -1
}
let arr7 = findintegerdata(arr6,40)
if (arr7== -1) {
  
    console.log("element is not present");
} else{
    
      console.log("element is present index" ,arr7);
}
function maxminnumber (array){
let min = array[0]
let max = array[0];
for (let index = 0; index < array.length; index++) {
  if (array[index]>max) {
    max = array[index]
  }if (array[index]<min) {
    min= array[index]
  }
}
return[min,max]
}



console.log(maxminnumber(arr6));




// JavaScript program to find second largest element in an array
// using Sorting

// function to find the second largest element
function getsecondlarge(array) {
    array.sort((a,b)=> a-b);
    // let result =[]
    let largest = array[array.length-1]
    for (let index = array.length-2; index>=0; index--) {
    //    return array[index]
    if (array[index]< largest) {
        return array[index]
    }
    //    result.push(array[index])
    }
//   return result
}

let arr8 = [20,40,50,40,80,90,400,400]
console.log(getsecondlarge(arr8));


function duplicatearraynumber (array){
let result =[];
if (array.length===0) {
    return []
}
for (let index = 0; index < array.length; index++) {
 let isduplicate = false ;
for (let j = 0; j < result.length; j++) {
    if (array[index]=== result[j]) {
      isduplicate = true
       break
    }
 
    
}
if (!isduplicate) {
    result.push(array[index])
}
}
return result
}
let arr9 = [30,50,60,3,6,7,4,3,5,7]
console.log(duplicatearraynumber(arr9));

function reverseArray(arr) {
    let n = arr.length;
    
   
    let temp = new Array(n);
  
    // Copy elements from original array
    // to temp in reverse order
    for (let i = 0; i < n; i++)
        temp[i] = arr[n - i - 1];
  
    // Copy elements back to original array
    for (let i = 0; i < n; i++)
        arr[i] = temp[i];
}

// Driver Code 
const arr = [1, 4, 3, 2, 6, 5];

reverseArray(arr);
console.log(arr.join(" "));
let arr10=[1,2,3,4,5,6,7,8,9,10]
function newfunctiondata(arr10,num) {
    
   for (let index = arr10.length-1; index >= 0; index--) {
   
console.log(arr10[index]);

   }
}
newfunctiondata(arr10)



function evenoddnumber(num) {

    for (let index = 0; index < num.length; index++) {
       if (num[index]%2===0) {
        console.log("this is even number",num[index]);
        
    }else{
console.log('this is odd number',num[index]);

    }
    }
  
}
let arr11=[1,2,3,4,5,6,7,8,9,10]
evenoddnumber(arr11)



function multiplicationTable(num) {
    for (let i = 1; i <= 10; i++) {
        
        console.log(`${num}  ${i} = ${num +i}`);
        
    }
}


multiplicationTable(5);


function sumofnaturalnumber(n) {
    let sum =0
    for (let i = 0; i <= n; i++) {
        sum +=i  *i     
    }
    return sum
}
console.log(sumofnaturalnumber(5));


let a =10
let b =8;
[a,b]=[b,a]
console.log(a,b);
function findnearnumber(n,m) {
    
}
let arr12 =[2,3,4,5,6,7,8,9,10]



function oppositeFaceOfDice(n) {
    let ans;
    if(n === 1) {
        ans = 6;
    } else if(n === 2) {
        ans = 5;
    } else if(n === 3) {
        ans = 4;
    } else if(n === 4) {
        ans = 3;
    } else if(n === 5) {
        ans = 2;
    } else {
        ans = 1;
    }
    return ans;
}

let n = 2;
console.log(oppositeFaceOfDice(n));
// [1,2,3]

// [1],[2],[3]
// [1,2],[2,3],[1,3]
// [1,2,3]
let arr13 =[1,2,3];
let results=[]

for (let start = 0; start < arr13.length; start++) {
for (let end = start;end < arr13.length;end++) {
    // console.log( arr13.slice(start,end+1));
 

    let subarray= arr13.slice(start,end+1)
    results.push(subarray)
}
}
console.log(results);

// results.forEach(item=> console.log(item))
let numarr =[1,2,-3,4,-5,-6,7,8,9,-1,0]
function evvenoddfun(num) {
    let result=[]
    let evenresult =0
    for (let i = 0; i < numarr.length; i++) {
        if (numarr[i]%2===0 && numarr[i]<0) {
            
            result.push(numarr[i])
            evenresult++

        } 
        
    }
    return  [result,evenresult]
}


console.log(evvenoddfun(numarr));



function findsecondlargenumber(array) {
    if (array.length<2) {
        console.log("array should have at least two element ");
        
    }
   let largest= array[0]
   let secondlarge = -Infinity
   let thirdlarge =-Infinity
    for (let i = 0; i < array.length; i++) {
    if (array[i]> largest) {
         thirdlarge = secondlarge
        secondlarge = largest
       
        largest= array[i]
    }else if (array[i]>secondlarge && array[i]!==largest){
        thirdlarge= secondlarge
        secondlarge = array[i]

    }else if (array[i]>thirdlarge && array[i]!==largest && array[i] !== secondlarge){
        thirdlarge = array[i]
    }
    }
    console.log(largest,secondlarge,thirdlarge);
    
}
findsecondlargenumber([2,-4,-5,-10,-15,-20,-30,-35])

let arra15 = [10,2,30,4,5,6,7,8,9,10]



for (let i = 0; i < arra15.length; i++) {
   for (let j = 0; j < arra15.length; j++) {   
if (arra15[j]>arra15[j+1]) {
    let temp = arra15[j];
    arra15[j]= arra15[j+1]
    arra15[j+1]= temp
}
    
   }
    
}

console.log(arra15);

let arr16 = [30,40,50,10,60,70,4,6,2,10]
let count10 = 0;
for (let i = 0; i < arr16.length; i++) {
    if (arr16[i] === 10) count10++;
}
console.log(count10);


let arr17 = [1, 2, 3, 4, 5,9,10,11,12,14,19,20,10,11];
let newarray = [...new Set(arr17)]
console.log(newarray);

function uniquenumber(arr17) {
    let result =[];
    arr17.sort((a,b)=> a-b)
    for (let i = 0; i < arr17.length; i++) {
        // if(!result.includes(arr17[i])){
        //     result.push(arr17[i])
        // }
        if (arr17[i]!==arr17[i-1]) {
             result.push(arr17[i])
        }
        
    }
    return result
}
console.log(uniquenumber(arr17));
 
let targets = 9;

for (let i = 0; i < arr17.length; i++) {
    for (let j = i +1; j < arr17.length; j++) {
       
        if (arr17[i] + arr17[j]===targets ) {
            console.log([arr17[i], arr17[j]]); 
        }
    }
}



let indexarr = [3,2,1,5,4]
let prefix = [0]

for (let i = 1; i < indexarr.length; i++) {
    // console.log(indexarr[i]);
    // prefix[i+1]= prefix[i]+indexarr[i]
    indexarr[i]= indexarr[i]+indexarr[i-1]
} 
console.log(indexarr);


let arr18 = [3, 2, 5, 1];

// Step 1: Build prefix sum array
let prefixs = [0]; // prefix[0] = 0
for (let i = 0; i < arr18.length; i++) {
    prefixs.push(prefixs[i] + arr18[i]);
}
console.log(prefixs);


function rangefunction(arr,l,r){
    let sum =0;
    for (let i = l; i <= r ; i++) {
sum += arr[i]
    }
    return sum 
}
let arr19 =[9,4,5,6,3,5,2,1]
console.log(rangefunction(arr19,1,2));


function primenumber(num){

}
console.log(primenumber);


//      1️⃣ Count Frequency of Numbers in an Array

// Problem: Count how many times each number appears.

// let arr30 = [1, 2, 2, 3, 3, 3];
// let freqMap = new Map();

// for (let num of arr30) {
//     freqMap.set(num, (freqMap.get(num) || 0) + 1);
// }

// console.log(freqMap); // Map(3) { 1 => 1, 2 => 2, 3 => 3 }

// 2️⃣ First Non-Repeating Character in a String

// Problem: Find the first character that occurs only once.

// let str = "aabbcde";
// let charMap = new Map();

// for (let ch of str) charMap.set(ch, (charMap.get(ch) || 0) + 1);

// for (let ch of str) {
//     if (charMap.get(ch) === 1) {
//         console.log(ch); // 'c'
//         break;
//     }
// }

// 3️⃣ Check if Two Arrays Have Common Elements
let arr71 = [1, 2, 3];
let arr72 = [4, 5, 3];
let map = new Map();

for (let num of arr71) map.set(num, true);

let hasCommon = arr72.some(num => map.has(num));
console.log(hasCommon);

// 4️⃣ Find the Most Frequent Element
// let arr = [1,2,2,3,3,3,4];
// let map = new Map();
// for(let num of arr) map.set(num, (map.get(num) || 0) + 1);

// let maxFreq = 0, element;
// for(let [key,value] of map) {
//     if(value > maxFreq) {
//         maxFreq = value;
//         element = key;
//     }
// }
// console.log(element); // 3

// 5️⃣ Two Sum Problem

// Problem: Find indices of two numbers that add up to target.

// let nums = [2, 7, 11, 15], target = 9;
// let map = new Map();
// for (let i = 0; i < nums.length; i++) {
//     let complement = target - nums[i];
//     if (map.has(complement)) {
//         console.log([map.get(complement), i]); // [0, 1]
//         break;
//     }
//     map.set(nums[i], i);
// }

// 6️⃣ Group Anagrams
// let words = ["bat", "tab", "tap", "pat"];
// let map = new Map();

// for (let word of words) {
//     let sorted = word.split("").sort().join("");
//     if(!map.has(sorted)) map.set(sorted, []);
//     map.get(sorted).push(word);
// }

// console.log(map); 
// // Map(2) { 'abt' => [ 'bat', 'tab' ], 'apt' => [ 'tap', 'pat' ] }

// 7️⃣ Subarray Sum Equals K

// Problem: Count subarrays with sum equal to k.

// let arr = [1,2,3,0,3], k=3;
// let map = new Map();
// map.set(0,1); // sum 0 occurs once
// let sum=0, count=0;

// for(let num of arr) {
//     sum += num;
//     if(map.has(sum-k)) count += map.get(sum-k);
//     map.set(sum, (map.get(sum) || 0)+1);
// }

// console.log(count); // 4

// 8️⃣ Intersection of Two Arrays (Unique)
// let arr1=[1,2,2,1], arr2=[2,2];
// let map = new Map(), result = [];

// for(let num of arr1) map.set(num,true);
// for(let num of arr2){
//     if(map.has(num) && !result.includes(num)) result.push(num);
// }

// console.log(result); // [2]

// 9️⃣ Longest Consecutive Sequence
// let arr = [100,4,200,1,3,2];
// let set = new Set(arr);
// let maxLen = 0;

// for(let num of arr){
//     if(!set.has(num-1)){
//         let current = num, length = 1;
//         while(set.has(current+1)){
//             current++;
//             length++;
//         }
//         maxLen = Math.max(maxLen,length);
//     }
// }

// console.log(maxLen); // 4 (sequence 1,2,3,4)

// 🔟 Check if Array Can Form Pair with Sum K
// let arr = [1,2,3,4], k=5;
// let map = new Map();
// let canPair = false;

// for(let num of arr){
//     if(map.has(k-num)){
//         canPair = true;
//         break;
//     }
//     map.set(num,true);
// }

// console.log(canPair); // true


function checkthisfunction(arr){
    for (let i = 0; i < arr.length-1; i++) {
   
    for (let j = i; j < arr.length-1; j++) {
      if (arr[j]>arr[j+1]) {
        let temp=arr[j]
        arr[j]= arr[j+1]
        arr[j+1]= temp;
      }
    }
    }
    return arr
}
let arr20=[2,3,4,5,9,5]

console.log(checkthisfunction(arr20));
let array = [3,4,5,6,7,8,9,10]
console.log(array)