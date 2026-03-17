| Topic                         | Problems |
| ----------------------------- | -------- |
| Arrays + Sorting              | 20–35    |
| Binary Search                 | 25–40    |
| Two Pointers / Sliding Window | 25–40    |
| Recursion + HashMap / DFS     | 25–40    |
| Stack                         | 15–20    |
| Linked List                   | 15–20    |
| Trees                         | 25–30    |

const mongoose = require("mongoose");
const Schemas = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    createby:{
        type:true
    }
})


const mongoosemodel = new mongoose.model("users", Schemas)
module.exports = mongoosemodel
