const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Item = require('../models/Item');
const User = require('../models/User');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper: upload a buffer to Cloudinary using upload_stream and return a Promise
const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret_key_for_development_only';
    const decoded = jwt.verify(token, secret);
    req.user = await User.findById(decoded.userId);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// @route   GET /api/items
// @desc    Get all items with pagination and filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const { category, minPrice, maxPrice, search, sortBy } = req.query;
    
    // Build filter object
    let filter = { isAvailable: true, isSold: false };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Build sort object
    let sort = { createdAt: -1 }; // Default sort by newest
    if (sortBy === 'price-low') sort = { price: 1 };
    if (sortBy === 'price-high') sort = { price: -1 };
    if (sortBy === 'oldest') sort = { createdAt: 1 };
    
    const items = await Item.find(filter)
      .populate('seller', 'name email year branch rating')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Item.countDocuments(filter);
    
    res.json({
      items,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/items/:id
// @desc    Get single item by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('seller', 'name email phone whatsapp year branch rating')
      .populate('soldTo', 'name email');
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Increment view count
    item.views += 1;
    await item.save();
    
    res.json(item);
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/items
// @desc    Create new item
// @access  Private
router.post('/', auth, (req, res, next) => {
  console.log('Before multer - Content-Type:', req.headers['content-type']);
  next();
}, upload.array('images', 5), (req, res, next) => {
  console.log('After multer - Files received:', req.files ? req.files.length : 0);
  if (req.files) {
    req.files.forEach((file, index) => {
      console.log(`File ${index}:`, file.originalname, file.mimetype, file.size);
    });
  }
  next();
}, [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  body('price').isNumeric().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isIn(['Books', 'Electronics', 'Clothing', 'Sports', 'Furniture', 'Stationery', 'Accessories', 'Other']).withMessage('Invalid category'),
  body('condition').isIn(['New', 'Like New', 'Good', 'Fair', 'Poor']).withMessage('Invalid condition')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const { title, description, price, category, condition, tags } = req.body;
    
    // Upload images to Cloudinary (or use placeholder for development)
    const imageUrls = [];
    console.log('Cloudinary API Key exists:', !!process.env.CLOUDINARY_API_KEY);
    console.log('Cloudinary Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('Number of files to upload:', req.files.length);
    
    if (process.env.CLOUDINARY_API_KEY) {
      try {
        for (const file of req.files) {
          console.log('Uploading file:', file.originalname, 'Size:', file.size);
          const result = await uploadBufferToCloudinary(file.buffer);
          console.log('Upload successful, URL:', result.secure_url);
          imageUrls.push(result.secure_url);
        }
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        // Fallback to placeholder on error
        imageUrls.push('https://via.placeholder.com/400x300?text=Upload+Failed');
      }
    } else {
      // Development fallback - use placeholder images
      console.log('Cloudinary not configured, using placeholder images');
      imageUrls.push('https://via.placeholder.com/400x300?text=Item+Image');
    }

    // Create new item
    const item = new Item({
      title,
      description,
      price: parseFloat(price),
      category,
      condition,
      images: imageUrls,
      seller: req.user._id,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    await item.save();
    console.log('Item saved to database with images:', item.images);
    await item.populate('seller', 'name email year branch rating');

    res.status(201).json({
      message: 'Item created successfully',
      item
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/items/:id
// @desc    Update item
// @access  Private
router.put('/:id', auth, upload.array('images', 5), [
  body('title').optional().trim().isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }),
  body('price').optional().isNumeric().isFloat({ min: 0 }),
  body('category').optional().isIn(['Books', 'Electronics', 'Clothing', 'Sports', 'Furniture', 'Stationery', 'Accessories', 'Other']),
  body('condition').optional().isIn(['New', 'Like New', 'Good', 'Fair', 'Poor'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user owns the item
    if (item.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    const { title, description, price, category, condition, tags } = req.body;
    
    // Update fields
    if (title) item.title = title;
    if (description) item.description = description;
    if (price) item.price = parseFloat(price);
    if (category) item.category = category;
    if (condition) item.condition = condition;
    if (tags) item.tags = tags.split(',').map(tag => tag.trim());

    // Handle new images if provided
    if (req.files && req.files.length > 0) {
      const imageUrls = [];
      console.log('Adding new images, count:', req.files.length);
      if (process.env.CLOUDINARY_API_KEY) {
        try {
          for (const file of req.files) {
            console.log('Uploading new file:', file.originalname, 'Size:', file.size);
            const result = await uploadBufferToCloudinary(file.buffer);
            console.log('New image upload successful, URL:', result.secure_url);
            imageUrls.push(result.secure_url);
          }
        } catch (error) {
          console.error('New image upload error:', error);
          imageUrls.push('https://via.placeholder.com/400x300?text=Upload+Failed');
        }
      } else {
        // Development fallback
        console.log('Cloudinary not configured for new images');
        imageUrls.push('https://via.placeholder.com/400x300?text=New+Image');
      }
      item.images = [...item.images, ...imageUrls];
    }

    await item.save();
    await item.populate('seller', 'name email year branch rating');

    res.json({
      message: 'Item updated successfully',
      item
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/items/:id
// @desc    Delete item
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user owns the item
    if (item.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/items/:id/favorite
// @desc    Toggle favorite status
// @access  Private
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const isFavorited = item.favorites.includes(req.user._id);
    
    if (isFavorited) {
      item.favorites = item.favorites.filter(fav => fav.toString() !== req.user._id.toString());
    } else {
      item.favorites.push(req.user._id);
    }

    await item.save();
    res.json({ 
      message: isFavorited ? 'Removed from favorites' : 'Added to favorites',
      isFavorited: !isFavorited
    });
  } catch (error) {
    console.error('Favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/items/:id/sold
// @desc    Mark item as sold
// @access  Private
router.post('/:id/sold', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user owns the item
    if (item.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to mark this item as sold' });
    }

    item.isSold = true;
    item.isAvailable = false;
    item.soldAt = new Date();
    
    if (req.body.buyerId) {
      item.soldTo = req.body.buyerId;
    }

    await item.save();
    res.json({ message: 'Item marked as sold successfully' });
  } catch (error) {
    console.error('Mark sold error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
