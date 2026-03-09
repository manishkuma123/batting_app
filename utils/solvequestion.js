const { valid } = require("joi");
const { formatDiagnosticsWithColorAndContext } = require("typescript");

function findsomeofallnum(arr){
let sum =0
for (let i = 0; i < arr.length; i++) {
   sum = sum + arr[i]
    
}
return sum
}
console.log(findsomeofallnum([1,2,3,4,5,6]));


function findmaxmin(arr) {
    let max = -Infinity
    let min = Infinity
    for (let i = 0; i < arr.length; i++) {
        if (arr[i]> max) {
            max = arr[i]
        }
        if (arr[i]<min) {
            min = arr[i]
        }
        
    }

    return[ min ,max]
}
let findnum = [2,4,5,6,7,8,1]
console.log(findmaxmin(findnum));



function reversearray (arr) {
    let left =0
    let right = arr.length-1
    while (left<right) {
        [arr[left],arr[right]]= [arr[right],arr[left]]
        left++
        right--
    }
    return arr--
   

}
let reverarr= [2,3,4,5,6,7,8]
console.log(reversearray(reverarr));


function sortarray(arr) {
  
    for (let i = 0; i < arr.length; i++) {
       if (arr[i]> arr[i+1]) {
        return false 
       }
        
    }
    return true
}
let sortarry =[1,3,4,5,6,7,8,12,4]
console.log(sortarray(sortarry));


function removeduplicate (arr) {
    let result =[]
    
    
    for (let i = 0; i < arr.length; i++) {
        // if (arr[i]== arr) {
        //     result.push(arr[i])
        // }
        if (!result.includes(arr[i])) {
              result.push(arr[i])
        }

    }
    return result
}
let arrremove = [2,3,4,5,2,6,7,8,2,20]
console.log(removeduplicate(arrremove));


function removeduplicatedata(arr){
    let result =[]
    let seen ={}
    for (let i = 0; i < arr.length; i++) {
       if (!seen[arr[i]]) {
        result.push(arr[i])
        seen[arr[i]]=true
       }
        
    }
    return result
}

let arr1 = [3,4,5,6,7,8,9,10,9]
console.log(removeduplicatedata(arr1));



function findsecondnum(arr) {
    let max = -Infinity
    let second =-Infinity
    for (let i = 0; i < arr.length; i++) {
       if (arr[i]> max) {
        second= max
        max= arr[i]
       }else if (second> arr[i]&& arr[i]< max) {
        second = arr[i]
       }
    }
    return second
}

let arrsecond=[1,2,3,4,5,6,7,8,7,9]
console.log(findsecondnum(arrsecond));


function accessnumber(arr) {
    let n = arr.length
    let result =[]
    for (let i = 0; i < arr.length; i++) {
       
        if (arr[i]%2===0) {
            result.push(arr[i])
        }

    }
return result
}
let accessarra=[1,2,3,4,5,6,7,8,9,10,12,14,14]
console.log(accessnumber(accessarra));


function accesscount(arr) {
    let n = arr.length
    let result =[]
    let even =0
    let odd =0
    for (let i = 0; i <n; i++) {
       
        if (arr[i]%2===0) {
            // result.push(arr[i])
            even++
        }
        else {
 odd++
        }
       
        
    }
return [even,odd]
}

console.log(accesscount(accessarra));


function countfreqvency(arr) {
    let freq={}
    for (let i = 0; i < arr.length; i++) {
      if (freq[arr[i]]) {
       freq[arr[i]]++
      }else{
        freq[arr[i]]=1
      }
    }
    return freq
}
console.log(countfreqvency(accessarra));
function movezerolast(arr) {
    

    let zero =0
    for (let i = 0; i < arr.length; i++) {
        if (arr[i]!==0) {

            let temp = arr[zero]
            arr[zero]= arr[i]
            arr[i]= temp
            zero++
        }
        
    }
    return arr

}
let movezeroarr =[2,0,3,0,4,5,6,0,7,8,9]
console.log(movezerolast(movezeroarr));



function findMissingNumber(arr) {
    let n = arr.length + 1;
    let total = (n * (n + 1)) / 2;
    let sum = 0;
    for (let num of arr) {
        sum += num;
    }
    return total - sum;
}

let arr = [1, 2, 3, 5, 6];
console.log(findMissingNumber(arr));



function mergertwoarr(arr,arr2) {
    let result =[]
    let i=0
    let j =0;
    while (i<arr.length&&j<arr2.length) {
        if (arr[i]<arr2[j]) {
           result.push(arr[i]) 
           i++
        }else{
               result.push(arr2[j])
               j++
        }
    }
    while (i<arr.length) {
        result.push(arr[i])
        i++
    }
    while (j< arr2.length) {
        result.push(arr2[j])
        j++
    }
  return result
}

let arr10=[1,3,5,7,9]
let arr9 =[2,4,6,8,10]
console.log(mergertwoarr(arr10,arr9));




function findspecific(arr,target) {
    let specific =[]
    for (let i = 0; i < arr.length; i++) {
        if (arr[i]=== target) {
           specific.push(i) 
        }
        
    }

    return specific
}
let arrspecific =[2,3,4,6,7,8]
// console.log(findspecific(arrspecific,4));

function samearray(arr,target){
    let result =[]
    let specific =0;
    let seen ={}
for (let i = 0; i < arr.length; i++) {
//  if (arr[i]=== target) {
//     result.push(arr[i])
//  }
 if (!seen[arr[i]]) {
    result.push(arr[i])
 arr[i]
seen[arr[i]] = true
 }

}


return result
}

let arr3 = [2,3,4,5,6,7,9,10,4]
console.log(samearray(arr3));


function thirdlarger(arr) {
    
    let max = -Infinity
    let second = -Infinity
    let third = -Infinity
    for (let i = 0; i < arr.length; i++) {
      
        if (arr[i]> max) {
            third = second
            second = max
            max = arr[i]
        }
        else if (arr[i]> second&& arr[i]< max){
            third = second
            second = arr[i]
        }else if(arr[i]>third&&arr[i]<second){
            third = arr[i]
        }
    }
    return [third,max,second]
}

let num = [2,3,4,5,6,7,8,0,12,14,7,6]
console.log(thirdlarger(num));



function  accessdata(arr) {   
   let seen = new Set()
   let repeate =[]
   for (let i = 0; i < arr.length; i++) {
    if (seen.has(arr[i])) {
        // return arr[i]
         repeate.push(arr[i])
    }else{
seen.add(arr[i])
    }
    
   }
   return  repeate
}
console.log(accessdata(num));





function findtwosum (arr,target) {
    arr.sort((a,b)=>  a-b)
    let i =0 ,j = arr.length-1;
    let pairs =[]
    while (i<j) {
        let sum = arr[i]+ arr[j]
        if (sum===target) {
            pairs.push([arr[i] ,arr[j]])
            i++
            j--
        }else if(sum < target) {
            i++;
        }
        else{
            j--
        }
    }
return pairs;
}

let arr5= [2,3,4,5,6,7,8]
console.log( findtwosum(arr5,8));


function findtwoarr(arr,target) {
    arr.sort((a,b)=>  a-b)
    let i =0 ,j = arr.length-1;
    let pairs =[]
    let maps={}
    let result =[]
    while (i<j) {
        let sum = arr[i]+ arr[j]
        if (sum===target) {
            pairs.push([arr[i] ,arr[j]])
            i++
            j--
        }else if(sum < target) {
            i++;
        }
        else{
            j--
        }
    }
return pairs;
}

let arr6= [2,3,4,5,6,7,8]
console.log( findtwoarr(arr6,8));



function mergetwoarr(arr1,arr2){
    let i = 0
    let j = 0
    let result = []
   while (i<arr1.length && j< arr2.length) {
    if (arr1[i]<arr2[j]) {
        result.push(arr[i])
        i++
    }
    else {
        result.push(arr2[j])
        j++
    }

   }


   while (i< arr1.length) {
    result.push(arr[i])
    i++
   }

   while (j<arr2.length) {
    result.push(arr[j])
    j++
   }
   return result
}

let mergedata =[3,4,5,6,7,8,9,10,2,1]
let mergedata1= [11,13,14,15,16,17,18,19,20]
console.log(mergertwoarr(mergedata,mergedata1));


function findduplicate(arr) {
    
    let seen = new Set();

    let result =[]
    for (let i = 0; i < arr.length; i++) {
     if (seen.has(arr[i])) {
        result.push(arr[i])
     }
     else{
        seen.add(arr[i])
     }
        
    }
    return seen
}
let mergedata2= [11,13,14,15,16,17,18,19,20,11]
console.log(findduplicate(mergedata2));




function majoritydata(arr) {
    
    let seen = new Set()
    let result = []
    for (let i = 0; i < arr.length; i++) {
        if (seen.has(arr[i])) {
            result.push(arr[i])
        }
        seen.add(arr[i])
        
    }
    return result
    
}
let major = [1,2,3,4,5,6,7,8,2,3]
console.log(majoritydata(major));


function findSumPairs(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) { 
            if (arr[i] + arr[j] === target) {
                return [arr[i], arr[j]];
            }
        }
    }
    return null; // no pair found
}

let sumPair = [2,3,4,5,6,7,8,9,10];
console.log(findSumPairs(sumPair, 7)); // Output: [2,8]



function removeallzerolast(arr) {
    let result =0
    for (let i = 0; i < arr.length; i++) {
        if (!arr[i]==0) {
           arr[result]= arr[i]
           result++
        }
        
    }
    for (let j = result; j < arr.length; j++) {
        
        arr[j]=0
    }
    return arr
}
let sumPair2 = [0,2,3,4,5,0,6,7,0,0,8,9,10];
console.log(removeallzerolast(sumPair2));



function kadane(arr) {
    if (arr.length === 0) return 0;

    let currentMax = arr[0];
    let globalMax = arr[0];

    for (let i = 1; i < arr.length; i++) {
        // currentMax = Math.max(arr[i], currentMax + arr[i]);

        // globalMax = Math.max(globalMax, currentMax);
        currentMax = Math.max(arr[i],currentMax+arr[i])
        
        
        globalMax= Math.max(globalMax,currentMax)
    }

    return globalMax;
}


let nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
console.log(kadane(nums)); // Output: 6





function leftRotate(arr, k) {
    let n = arr.length; 
    k = k % n; // handle k > n  
    for (let i = 0; i < k; i++) {
        let first = arr[0];
        for (let j = 0; j < n - 1; j++) {
            arr[j] = arr[j + 1];
        }
        arr[n - 1] = first;
    }
    return arr;
}

console.log(leftRotate([1,2,3,4,5,6,7,8], 2));


// function leftsrotate(arr) {
//     let n = arr.length
//     for (let i = 0; i <n; i++) {
//         return n
//     }
//     return arr
// }
 
// let leftdata = [1,2,3,4,5,6,7,8]

// console.log(leftsrotate(leftdata));


function findMajorityElement(nums) {
    let candidate = null;
    let count = 0;

    for (let num of nums) {
        if (count === 0) {
            candidate = num;
            count = 1;
        } else if (num === candidate) {
            count++;
        } else {
            count--;
        }
    }

    // Step 2: Verify the candidate
    count = 0;
    for (let num of nums) {
        if (num === candidate) count++;
    }

    return count > Math.floor(nums.length / 2) ? candidate : null;
}



function arraysdata(arr1,arr2){

let i = 0
let j=0;
let result =[]
let intersection = []
while (i<arr1.length  && j<arr2.length) {
    let value;
    if (arr1[i]<arr2[j]) {
        // result.push(arr1[i])
        value =arr1[i]
        i++
    }else if (arr1[i]> arr2[j]) {
        // result.push(arr2[j])
         value =arr2[j]
        j++
    }else{
        // result.push(arr1[i])
        if (result[result.length-1]!== arr[i]) {
            intersection.push(arr1[i])
        }
         value =arr1[i]
        i++
        j++
    }
    if (result[result.length-1]!==value) {
        result.push(value)
    }
}
   
while (i<arr1.length) {
    if (result[result.length-1] !==arr[i]) {
        result.push(arr1[i])
    }
    
    i++
}
while (j<arr2.length) {
    if (result[result.length-1]!==arr[j]) {
      result.push(arr2[j])  
    }
    
    j++
}
return{result,intersection}
}
let arrys =[2,2,3,4,5,6,7,8,9,10,11,12,14]
let arrys2 =[9,10,11,12,13,14]
console.log(arraysdata(arrys,arrys2));


function arrayinterface(arr1,arr2){

let i = 0
let j=0;
let result =[]

while (i<arr1.length  && j<arr2.length) {
    // let value;
    if (arr1[i]<arr2[j]) {
     i++ 
    }else if(arr1[i]>arr2[j]){
        j++
    }else{
        if (result[result.length-1]!==arr1[i]) {
            result.push(arr1[i])
        }
        
 i++
    j++
    }

}
   

return result
}

console.log( arrayinterface(arrys,arrys2));





function missingnum(arr) {
    
    for (let i = 0; i < arr.length; i++) {
     
        if (arr[i]-arr[i-1]>1) {
            return arr[i-1]+1
        }
    }
    return null
}
let arr2 = [1,2,3,4,5,7,8,9,10]
console.log(missingnum(arr2));


function findallmissingnumber(arr) {
    let result =[]
    for (let i = 1; i < arr.length; i++) {
        while (arr[i]-arr[i-1]>1) {
            result.push(arr[i-1]+1)
            arr[i-1]++
        }
        
      
    }
    return result
}
let arrmissing = [1,2,3,4,5,7,8,10]
console.log(findallmissingnumber(arrmissing));



function repeatdatatotal(arr){
    let feq ={}
    
    let result =[]
    for (let i = 0; i < arr.length; i++) {
       
      if (feq[arr[i]]) {

        if (!result.includes(arr[i])) {
            result.push(arr[i])
        }
        
      }else {
        feq[arr[i]]=1
      }
        
    }
return result
}
let repetdat1 = [1,2,4,5,4,6,3,2]

console.log(repeatdatatotal(repetdat1));

function subsetdata(a,b){
return a.every(ele => b.includes(ele))
}
let a = [1,2,3,4,10,8]
let b= [1,2,3,4,5,6]
console.log(subsetdata(a,b));

function checkinclude(a,b) {
    
    for (let i = 0; i < a.length; i++) {
            
        if (!b.includes(arr[i])) {
            return false
        }
    }
    return true 
}
console.log(checkinclude(a,b));


function rearrangenumber(arr) {
    let mid = 0
    let low = 0
    while (mid < arr.length) {
        if (arr[mid]<0) {
            [arr[low], arr[mid]]= [arr[mid],arr[low]]
            low++
        }
        mid++
    }
 return  arr
}

let arrsdata = [1, -2, 3, -4, 5 ,-9,9,-7];
console.log(rearrangenumber(arrsdata));


// 2. First non-repeating       (naya)
// 3. Contains specific element (complete karo)
// 4. All pairs with given sum  (fix karo)
// 5. Left rotate by 1          (simple hai)
// 6. Average of array          (bahut easy)









function prefixdata (arr){
let n = arr.length
let prefix = new Array(n)
prefix[0]=  arr[0]
for (let i = 1; i < n; i++) {
  prefix[i]= prefix[i-1]+arr[i]
}
return prefix
}

let prefixddata =[1,2,3,4,5,6,7,8,9,10]
console.log(prefixdata(prefixddata));




function bubbleSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
               
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}

let bubble = [2,4,5,1,3,4,6,8]
console.log(bubbleSort(bubble));




function binarysearch(arr,target) {
    let left =0
    let right = arr.length-1
    while (left<= right) {
        const mid = Math.floor((left+right)/2)
        if (arr[mid]=== target) {
            return mid
        }else if(arr[mid]<target){
            left = mid+1
        }else{
            right= mid-1
        }
    }
    return -1
}
let binarydata = [2,3,4,5,1,2,5,6,7,8]
console.log(binarysearch(binarydata,4));


function bubblesortfun(arr) {
   
    for (let index = 0; index < arr.length-1; index++) {
        
       for (let j = 0; j < arr.length-index-1; j++) {
       if (arr[j]>arr[j+1]) {
        let swap = arr[j]
        arr[j]= arr[j+1]
        arr[j+1] = swap
       }
        
       }
    }
    return arr
}

let buddledata =[19,1,2,13,4,5,8,7,8]
console.log(bubblesortfun(buddledata));




function selectionsort(arr) {
    
    for (let i = 0; i < arr.length-1; i++) {
       let index =i
        for (let j = i+1; j < arr.length; j++) {
          if (arr[j]< arr[index]) {
            index=j
          }
            
        }
        if (index!==i) {
         [arr[i] ,arr[index]]  = [arr[index], arr[i]]
        }
        
    }
    return arr
}
let selectiondata =[9,7,5,2,3,4,5,6,7,8,9]
console.log(selectionsort(selectiondata));


function solveproblem(arr,target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i]===target) {
            return i
        }
        
    }
    return -1
    
}
let solve =[2,3,4,5,6,7,8]
console.log(solveproblem(solve,8));


function binarysearch(arr,target) {
    let left =0
    let right= arr.length-1
    while (left<=right) {
        let mid = Math.floor((left+right)/2)
        if (arr[mid]===target) {
            return mid
        }else if(arr[mid]<target){
            left= mid +1
        }
        else{
            right = mid-1
        }
    }
    return -1
}
let solve2 =[2,3,4,5,6,7,8,9]
console.log(solveproblem(solve2,8));




function reversedata(arr) {
    
    let reverse =[]
    let left =0
    let right = arr.length-1
    while (left<right) {
        let temp = arr[left]
        arr[left]= arr[right]
        arr[right]= temp;
        right--
        left++
    }
 

    
    return arr
}
let reversedat= [2,3,4,5,6,7,8,1]
console.log(reversedata(reversedat));



function reverdata(arr) {
    let reverse=[]
    let right= arr.length-1
    while (right >= 0) {
        
        reverse.push(arr[right])
        right--
    }
    return reverse
}
let reversedat2= [2,3,4,5,6,7,8,1]
console.log(reverdata(reversedat2));




function reverstring(arr) {
    let reverse=''
    let right= arr.length-1
    while (right >= 0) {
        reverse+= arr[right]
        right--
    }
    return reverse
}
let reversestring= 'manish'
console.log(reverstring(reversestring));



function reverstring2(str) {
    let reverse=''
  const arr=  str.split("")
    let right= arr.length-1
    let left =0
   
    while (left<right) {
        let temp = arr[left]
        arr[left]= arr[right]
        arr[right]= temp
        left++
        right--
    }
     return arr.join("")
    
    
}
let reversestrings= 'nitin'
console.log(reverstring2(reversestrings));





function palindromedata(arr) {
    let left = 0
    let right = arr.length-1
    while (left<right) {
        if (arr[left]!==arr[right]) {
            return false
        }
        right--
        left++
    }
    return true
}
let palidromedata = "nitin"
console.log(palindromedata(palidromedata));




function checkstring(str) {
    let vowels ="aeiouAEIOU"
    for (let i = 0; i < arr.length; i++) {
        if (vowels.includes(str[i])) {
            return true
        }
        
    }
    return false
}
let strdata ='manish'
console.log(checkstring(strdata));


function checkhavestring(str) {
    let vowels = new Set(['a','e','i','o','u','A','E','I','O','U'])
    for (const data of str) {
        if (vowels.has(data)) {
            return true
        }
    }

    return false 
}
console.log(checkhavestring('manishkumar'));


function countnumber(str,target) {
    let count=0
    for (let i = 0; i < str.length; i++) {
 
        if (str[i]===target) {
            count++
        }

        
    }
    return count
}
console.log(countnumber('manisha','a'));


function removestring(str) {
    let result =''
    for (let i = 0; i < str.length; i++) {
        if (str[i]===" ") {
            result+= str[i]
        }
        
    }
    return result
}
console.log(removestring("mani sh"));




function frequencystring(str) {
 let feq={}   
 for (const data of str) {
    if (feq[data]) {
        // feq[data]++
        feq[data] = (feq[data] || 0) + 1;
    }else{
        feq[data]=1
    }
 }
 return feq
}

console.log(frequencystring('applebanana'));







function comparetwostring(str1,str2) {
    
    if (str1.length!==str2.length) {
        return false
    }
    for (let i = 0; i < str1.length; i++) {
     
        if (str1[i]!==str2[i]) {
            return false
        }
    }
    return true
}

console.log(comparetwostring('amnish','amnish'));




function lengthdata(arr) {
    let count=0

  while (arr[count]!==undefined) {
    count++
  }
    return count
}


console.log(lengthdata('hello'));


function concatcount(str1,str2) {
    
    let resultdata =""

 for (let i = 0; i < str1.length; i++) {
    resultdata+=str1[i]
    
 }
 for (let i = 0; i < str2.length; i++) {
    resultdata+= str2[i]
 }
 return resultdata
}
console.log(concatcount('manish','kumar'));


function concatdata(str1,str2) {
    
    let resultarr=[]
    for (const char of str1) {
        resultarr.push(char)
    }
    for (const char of str2) {
        resultarr.push(char)
    }
    return resultarr.join("")
}
console.log(concatdata('mani','kumar'));


let str1= 'manish'
let str2= 'kumar'
let str3= str1.concat(str2)
console.log(str3);


function mostfrequency(str) {
    let freq={}

    for (let i = 0; i < str.length; i++) {
        let char = str[i]
        if (freq[char]) {
            freq[char]++
                   
        }else{
            freq[char]=1
        }
        
    }

    let maxchar = ""
    let maxcount = 0
    for (const char in freq) {
        if (freq[char]>maxcount) {
            maxcount = freq[char]
            maxchar= char
        }
    }
    return [maxchar,maxcount]
}
console.log(mostfrequency('manisha'));



function removeduplicate(str) {
    let seen = new Set()
    let result = ""
    for (let i = 0; i < str.length; i++) {
        if (!seen.has(str[i])) {
            seen.add(str[i])
            result+=str[i]
        }
    }
    return result
}
console.log(removeduplicate('manish kumar'));

    function uniquedataarray(arr){
      let seen = new Set()
      let result =[]
      for (let i = 0; i < arr.length; i++) {
        if (!seen.has(arr[i])) {
          seen.add(arr[i])
          result.push(arr[i])
        }
        
      }
      return result
    }
    console.log(uniquedataarray([1,2,3,4,1,4,1,4,5,9,5]));
    


    function substringdata (arr, str,end){
        let result ="";
        if (str<0) str=0
        if (end> str.length) {
            end = str.length
        }
        if (str>= end) {
            return ""
        }


        for (let i = str; i < end; i++) {
           result+= arr[i]
            
        }
        return result
    }



    console.log(substringdata('manish kumar',0,6));
    
    


    function firstnonrepiting(str) {
        
        let freq={}
        for (let i = 0; i < str.length; i++) {
            let char = str[i]
            freq[char]= (freq[char]||0)+1

        }

        for (let i = 0; i < str.length; i++) {
           if (freq[str[i]]>1) {
             return str[i]
           }
            
        }
        return null
    }
    
    console.log(firstnonrepiting('manishkumar'));
    
    


    function firstrepetingdata(str) {
        let seen = new Set();

        for (let i = 0; i < str.length; i++) {
           if (seen.has(str[i])) {
            return str[i]
           }
           seen.add(str[i])
            
        }
        return null
    }

    console.log(firstnonrepiting('manishakumar'));




    function removeduplicate(arr) {
        let seen = new Set()
        let result =[]
        for (let i = 0; i < arr.length; i++) {
            

            if (!seen.has(arr[i])) {
                seen.add(arr[i])
            result.push(arr[i])
            }
            

            
        }
        return result
    }
    console.log(removeduplicate([2,3,4,5,6,8,6]));
    
    
    

    let stack =[]
    stack.push(10)
    stack.push(30)
    stack.push(20)
    stack.pop()
    // console.log(stack);
    
   const top= stack[stack.length-1]

//    console.log(top);
   


   class Stacks {
    constructor() {
        this.items = [];
    }

   
    push(element) {
        this.items.push(element);
    }

   push(element){
    this.items.push(element)
   }
    pop() {
        if (this.isEmpty()) return "Stack is empty";
        return this.items.pop();
    }


    peek() {
        if (this.isEmpty()) return "Stack is empty";
        return this.items[this.items.length - 1];
    }

  
    isEmpty() {
        return this.items.length === 0;
    }


    printStack() {
        console.log(this.items.toString());
    }
}


const stacks = new Stacks();

stacks.push(10);
stacks.push(20);
stacks.push(30);
console.log(stacks.peek());
// stacks.pop();
stacks.printStack(); 


class StackData {
    constructor() {
        this.items = [];
    }

    // Push data
    push(data) {
        this.items.push(data);
    }

    // Pop data
    pop() {
        if (this.isEmpty()) {
            return "Stack is empty";
        }
        return this.items.pop();
    }

    // Access top data
    peek() {
        if (this.isEmpty()) {
            return "Stack is empty";
        }
        return this.items[this.items.length - 1];
    }

    // Check if empty
    isEmpty() {
        return this.items.length === 0;
    }
}


const myStack = new StackData();

myStack.push(10);
myStack.push(20);

console.log(myStack.peek());  // 20
console.log(myStack.pop());   // 20
console.log(myStack.peek());  // 10


class stackfulldata {
    constructor() {
        this.items=[]
    }
    push(data){
        this.items.push(data)
    }
    pop(){
        if (this.isEmpty()) {
            return "stacks is empty"
        }
      return  this.items.pop()
    }
    peek(){
        if (this.isEmpty()) {
            return "stacks is empty"
        }
        return this.items[this.items.length-1]
    }
    isEmpty(){
       return this.items.length===0
    }
}


const accessstack = new stackfulldata()


function reverseString(str) {
    // const stack = new stackfulldata();
    const stack = new stackfulldata()
    
    for (const char of str) {
        stack.push(char)
    }
    // for (let char of str) {
    //     stack.push(char);
    // }

    // 2️⃣ Pop characters from stack to build reversed string
    let reversed = "";
    while (!stack.isEmpty()) {
        reversed += stack.pop()
    }

    return reversed;
}

// Example
const input = "hello";
const output = reverseString(input);
console.log(output); // "olleh"
// accessstack.push(10)

// accessstack.push(20)
// accessstack.push(30)
// console.log("last",accessstack.peek());
// console.log("first",accessstack.pop());
// console.log("end", accessstack.peek());


function nextGreaterElement(arr) {
    const stack = [];
    const result = new Array(arr.length).fill(-1);

    for (let i = 0; i < arr.length; i++) {
        // Pop smaller elements
        while (stack.length > 0 && arr[i] > stack[stack.length - 1].value) {
            const obj = stack.pop();
            result[obj.index] = arr[i];
        }
        // Push current element with index
        stack.push({ value: arr[i], index: i });
    }

    return result;
}

// Example
const input3 = [4, 5, 2, 25];
console.log(nextGreaterElement(input3)); // [5, 25, 25, -1]



let filledata = [2,3,4,5,6,8]
let neearry = new Array(filledata.length).fill(-1)
filledata.fill(-1)
console.log(filledata);
console.log(neearry);


function nextgreaterdata(arr) {
    let stack =[]
    const result = new Array(arr.length).fill(-1)

    for (let i = 0; i < arr.length; i++) {
        // while (stack.length>&&arr[i]>stack[stack.length-1]-value) {
            
        // }
        stack.push(arr[i])
    }
    return stack;
}
let inputs =[2,3,4,5,6]
console.log(nextgreaterdata(inputs));




function twopointer(arr) {
    let left =0
    let right= arr.length-1

    while (left<right) {
        let temp = arr[left]
        arr[left]= arr[right]
        arr[right]= temp
        left++
        right--
    }
    return arr

}
console.log(twopointer([2,3,4,5,6,7]));

function twopointerdata(str) {
    
    let left =0
    let right= str.length-1
    while (left<right) {
        if (str[left]!==str[right]) {
            return false
           
        }
         left++
            right--
    }
    return true
}

console.log(twopointerdata('manish'));







function duplicatemanish(arr) {
    let map = new Set()
    let result=[]
    for (let i = 0; i < arr.length; i++) {
        if (!map.has(arr[i])) {
            map.add(arr[i])
            result.push(arr[i])
        }
        
    }
    return  result
}
console.log(duplicatemanish([1,2,3,4,8,5,6,7,8,9,10]));







function twonummanish(str,target) {
    let left =0
    let right = str.length-1
    while (left<right) {
        let sum = str[left]+str[right]
        if (sum=== target) {
            return [str[left],str[right]]
        }else if(sum<target){
            left++
        }
        else{
            right--
        }
        
        // let temp = arr[left]
        // arr[left]= arr[right]
        // arr[right]= temp
        // left++
        // right--
    }
    return [-1,-1]
}

let sumdata = [2,3,4,5,6,7,8]

console.log(twonummanish(sumdata,10));




function zerolast(arr) {
 let result =[]
 let zero =0
    for (let i = 0; i < arr.length; i++) {
        if (arr[i]!==0) {
            result.push(arr[i])
        }else{
            zero++
        }
        
    }

    for (let i = 0; i < zero; i++) {
        result.push(0)
        
    }
    return result
}

console.log(zerolast([1,2,0,3,0,4,9,0,8,6,0]));
