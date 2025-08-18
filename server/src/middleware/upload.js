const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
const productsDir = path.join(uploadsDir, 'products');
const avatarsDir = path.join(uploadsDir, 'avatars');

[uploadsDir, productsDir, avatarsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine destination based on field name or route
    if (file.fieldname === 'avatar') {
      cb(null, avatarsDir);
    } else {
      cb(null, productsDir);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ];
  
  const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB default
  
  // Check file type
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    error.code = 'INVALID_FILE_TYPE';
    return cb(error, false);
  }
  
  // Check file size
  if (file.size > maxFileSize) {
    const error = new Error(`File size ${file.size} bytes exceeds the limit of ${maxFileSize} bytes`);
    error.code = 'FILE_TOO_LARGE';
    return cb(error, false);
  }
  
  cb(null, true);
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    files: 10, // Maximum 10 files
  },
});

// Process uploaded images
const processImages = async (files, options = {}) => {
  const {
    width = 800,
    height = 800,
    quality = 80,
    format = 'webp',
    createThumbnail = true,
    thumbnailSize = 200,
  } = options;

  const processedFiles = [];

  for (const file of files) {
    try {
      const filePath = file.path;
      const fileName = path.basename(filePath, path.extname(filePath));
      const fileDir = path.dirname(filePath);

      // Process main image
      const processedImagePath = path.join(fileDir, `${fileName}-processed.${format}`);
      
      await sharp(filePath)
        .resize(width, height, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality })
        .toFile(processedImagePath);

      // Create thumbnail if requested
      let thumbnailPath = null;
      if (createThumbnail) {
        thumbnailPath = path.join(fileDir, `${fileName}-thumb.${format}`);
        
        await sharp(filePath)
          .resize(thumbnailSize, thumbnailSize, { fit: 'cover' })
          .webp({ quality: 70 })
          .toFile(thumbnailPath);
      }

      // Remove original file
      fs.unlinkSync(filePath);

      // Update file object
      file.path = processedImagePath;
      file.filename = path.basename(processedImagePath);
      file.thumbnailPath = thumbnailPath;
      file.thumbnailFilename = thumbnailPath ? path.basename(thumbnailPath) : null;

      processedFiles.push(file);
      
      logger.info(`Image processed successfully: ${file.originalname}`);
    } catch (error) {
      logger.error(`Failed to process image ${file.originalname}:`, error);
      
      // Remove original file if processing failed
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      throw new Error(`Failed to process image: ${file.originalname}`);
    }
  }

  return processedFiles;
};

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large',
        error: `File size exceeds the limit of ${process.env.MAX_FILE_SIZE || '5MB'}`,
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files',
        error: 'Maximum 10 files allowed',
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field',
        error: 'Invalid file field name',
      });
    }
  }
  
  if (error.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type',
      error: error.message,
    });
  }
  
  if (error.code === 'FILE_TOO_LARGE') {
    return res.status(400).json({
      success: false,
      message: 'File too large',
      error: error.message,
    });
  }

  logger.error('File upload error:', error);
  return res.status(500).json({
    success: false,
    message: 'File upload failed',
  });
};

// Clean up uploaded files on error
const cleanupOnError = (req, res, next) => {
  const cleanup = () => {
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        if (file.thumbnailPath && fs.existsSync(file.thumbnailPath)) {
          fs.unlinkSync(file.thumbnailPath);
        }
      });
    }
  };

  // Clean up on response finish
  res.on('finish', cleanup);
  res.on('close', cleanup);
  
  next();
};

module.exports = {
  upload,
  processImages,
  handleUploadError,
  cleanupOnError,
};