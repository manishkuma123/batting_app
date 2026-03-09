let name = "manish, kumar,robin"
let array = ["manish", "kumar","robin"]
let fullname = name.split(",")
let fulldata = array.join(" $ ")
console.log(name.length);
console.log(name.slice(0,));
console.log(name.charAt(1));
console.log(name.slice(-10));

console.log(name.substring(0,15));
console.log(fullname);
console.log(fulldata);
let forloop = "loopingmanish";

for (let i = 0; i < forloop.length; i++) {
 console.log(forloop[i]);
 
}


for (const acc of forloop) {
    console.log("data",acc);   
}

let lastvar = forloop.replace("h" ,"H")
console.log(lastvar);
let result = "   manish kumar mern stack developer   "
let resultdata = result.trim().toUpperCase().slice(0,6)
console.log(resultdata);

// let str = "ha"

// console.log(str.repeat(2));
function  reversdata(str){
    let  words =  str.split(" ");
    let rever = words.reverse();
    return rever.join(" ")
}
console.log(reversdata("robin kumar"));



function datashouldbereverse(str) {
    // let words = [];
  let word= ""
 let words = []
    for (let i = 0; i < str.length; i++) {
        if (str[i] !== " ") {
            word += str[i]; 
        } else {
            words.push(word); // store the word
            word = ""; // reset for next word
        }
    }
    // push the last word
    words.push(word);

    // Manually reverse the words array
    let reversed = [];
    for (let i = words.length - 1; i >= 0; i--) {
        reversed.push(words[i]);
    }

    // Manually join the words into a string
    let result = "";
    for (let i = 0; i < reversed.length; i++) {
        result += reversed[i];
        if (i !== reversed.length - 1) {
            result += " "; // add space between words
        } 
    }

    return result;
}

// console.log(reverseData("robin kumar"))



