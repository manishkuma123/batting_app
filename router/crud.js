
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