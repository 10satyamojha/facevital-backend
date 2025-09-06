const multer = require('multer');
const path = require('path');

// Set up storage engine for Multer
const storage = multer.diskStorage({
  destination: './uploads/', // Folder to store the videos
  filename: function (req, file, cb) {
    // Create a unique filename to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Initialize upload variable
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // Limit file size to 10MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('video'); // 'video' should match the field name in the FormData

// Check file type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /webm|mp4|mov/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Videos Only!');
  }
}

module.exports = upload;
