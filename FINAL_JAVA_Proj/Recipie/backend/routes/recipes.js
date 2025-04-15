const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(401).json({ message: 'Please authenticate' });
    }
};

// Get all recipes with optional filtering
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = {};

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const recipes = await Recipe.find(query)
            .populate('author', 'username')
            .sort({ createdAt: -1 });
        res.json(recipes);
    } catch (error) {
        console.error('Get all recipes error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get recipes by user ID
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const recipes = await Recipe.find({ author: req.params.userId })
            .populate('author', 'username')
            .sort({ createdAt: -1 });
        res.json(recipes);
    } catch (error) {
        console.error('Get user recipes error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get favorite recipes
router.get('/favorites', auth, async (req, res) => {
    try {
        const recipes = await Recipe.find({ 'ratings.user': req.userId })
            .populate('author', 'username')
            .sort({ createdAt: -1 });
        res.json(recipes);
    } catch (error) {
        console.error('Get favorite recipes error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single recipe
router.get('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id)
            .populate('author', 'username')
            .populate('comments.user', 'username');
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json(recipe);
    } catch (error) {
        console.error('Get recipe error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create recipe
router.post('/', auth, async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = ['title', 'description', 'ingredients', 'instructions', 'cookingTime', 'servings'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ message: `${field} is required` });
            }
        }

        // Validate ingredients and instructions are arrays
        if (!Array.isArray(req.body.ingredients) || !Array.isArray(req.body.instructions)) {
            return res.status(400).json({ message: 'Ingredients and instructions must be arrays' });
        }

        // Validate numeric fields
        if (isNaN(req.body.cookingTime) || isNaN(req.body.servings)) {
            return res.status(400).json({ message: 'Cooking time and servings must be numbers' });
        }

        // Create recipe with validated data
        const recipe = new Recipe({
            title: req.body.title,
            description: req.body.description,
            ingredients: req.body.ingredients,
            instructions: req.body.instructions,
            cookingTime: Number(req.body.cookingTime),
            prepTime: req.body.prepTime || '30 mins',
            servings: Number(req.body.servings),
            difficulty: req.body.difficulty || 'Medium',
            category: req.body.category || 'Other',
            image: req.body.image || '',
            author: req.userId,
            rating: 0,
            ratings: [],
            comments: []
        });

        await recipe.save();
        res.status(201).json(recipe);
    } catch (error) {
        console.error('Recipe creation error:', error);
        res.status(400).json({ 
            message: 'Error creating recipe',
            error: error.message 
        });
    }
});

// Update recipe
router.put('/:id', auth, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        if (recipe.author.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        Object.assign(recipe, req.body);
        await recipe.save();
        res.json(recipe);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete recipe
router.delete('/:id', auth, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        if (recipe.author.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await Recipe.deleteOne({ _id: req.params.id });
        res.json({ message: 'Recipe deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add comment
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        recipe.comments.push({
            text: req.body.text,
            user: req.userId
        });
        await recipe.save();
        res.status(201).json(recipe);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Rate recipe
router.post('/:id/rate', auth, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        const rating = Math.min(Math.max(req.body.rating, 1), 5);
        recipe.rating = ((recipe.rating * recipe.ratings.length) + rating) / (recipe.ratings.length + 1);
        recipe.ratings.push({ user: req.userId, rating });
        await recipe.save();
        res.json(recipe);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;