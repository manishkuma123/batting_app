const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const Category = require("../modules/category");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

cloudinary.config({
  cloud_name: "di1bf8n5p",
  api_key: "756854938742942",
  api_secret: "uzBfUbHaIJ_7MVosR-N695UajT0"
});


router.post("/api/categories", upload.single("icon"), async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Name and icon are required" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "categories"
    });

    fs.unlinkSync(req.file.path);

    const category = await Category.create({
      name,
      icon: result.secure_url
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put("/api/category/:id", async(req,res)=>{
  try { 
    const { userid } = req.params;
    const categories = await Category.findOneAndUpdate(userid,req.body);
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})
router.delete("/api/category/:id", async(req,res)=>{
  try {
     
    const { userid } = req.params;
    const categories = await Category.deleteOne(userid);
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})
router.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
