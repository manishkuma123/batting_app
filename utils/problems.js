let array = [1,2,3,4,5,6,7,8,9,10]
// console.log(array);
array.pop()
array.push(50)
array.shift()
array.unshift(8)


let mapdataaccess =array.map(item=>{
    return item
})
console.log(mapdataaccess);

let foreachdata = array.forEach(item=>{
    return item *2
})





// Sum all elements in an array

// Find max & min

// Reverse an array

// Print all elements

// Remove duplicates

// Merge two arrays

// Count even/odd numbers

// Check if array contains a value

// Convert array to string

// Copy array without mutation

let sum =0
for (let index = 0; index < array.length; index++) {
  sum += array[index]
}
console.log(sum);

for (let index = 1; index <= array.length; index++) {
   console.log(index);  
}
for (let index = array.length; index > 0; index--) {
   console.log(index);
   
}
function evenodd(array) {
   for (let index = 0; index < array.length; index++) {
 if (array[index]%2===0) {
    console.log(array[index]);
    
 }else{
    console.log("odd",array[index]);
 }
}
}
evenodd(array)



for (const item of array) {
   console.log(item +40);
}
let object ={
   name:"manish",
   age:24,
   city:"churu rajasthan", 
}
function evenoddcount(array) {
let counteven=0
let countodd=0
for (let index = 0; index < array.length; index++) {
if (array[index]%2===0) {
 counteven++
}else{
countodd++
}    
} 
console.log(counteven);
console.log(countodd);
}
evenoddcount(array)






array= [1,2,3,4,5,6,7,8,9,10]
function maxminfun(array) {
   
   let max = array[0]
   let min = array[0]

   for (let index = 0; index < array.length; index++) {
      if (array[index]>max) {
         max= array[index]
      } 
      if (array[index]<min){
         min= array[index]
      }
      
   }
   console.log("min",min);
   console.log("max",max);
   
   
}
maxminfun(array)

// Count even & odd numbers  done

// Find max & min    done 

// Remove duplicates

// Reverse array  done

// Check palindrome 

// Sum of array  done

// Second largest element

// Frequency count


let unique = [1,2,3,4,4,5,6]
let mapaccess = [...new Set (unique)]
console.log(mapaccess);
let newarry=[]
for (const accessdata of unique) {
   if (!newarry.includes(accessdata)) {
      newarry.push(accessdata)
   }
}

console.log(newarry);

let numbers = [1, 2, 2, 3];
let uniquedata = [];

for (let i = 1; i <= numbers.length; i++) {
   console.log(i);
}
// Sample array with duplicates
const data = [1, 2, 3, 2, 4, 5, 1, 6, 3];


function findDuplicates(arr) {
  const seen = new Set();
  const duplicates = new Set();

  for (const item of arr) {
    if (seen.has(item)) {
      duplicates.add(item);
    } else {
      seen.add(item);
    }
  }

  return Array.from(duplicates);
}

console.log(findDuplicates(data));
const arr = [10, 5, 8, 20, 15];
//  js moves declreation to the top of the scope during compilation 
function secondLargest(array) {
  if (array.length < 2) return null;
  const sorted = [...array].sort((a, b) => b - a);

  const uniqueSorted = [...new Set(sorted)];

  return uniqueSorted[1] || null;
}

secondLargest(arr)// Output: 15



function findatanum(array) {
   if (array.length<2) {
      return null
   }
   for (let index = 0; index < array.length; index++) {
      
      
   }

}

console.log(findatanum());
