const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters long'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters long']
    },
    ingredients: [{
        type: String,
        required: [true, 'At least one ingredient is required'],
        trim: true
    }],
    instructions: [{
        type: String,
        required: [true, 'At least one instruction is required'],
        trim: true
    }],
    cookingTime: {
        type: Number,
        required: [true, 'Cooking time is required'],
        min: [1, 'Cooking time must be at least 1 minute'],
        max: [1440, 'Cooking time cannot exceed 24 hours']
    },
    prepTime: {
        type: String,
        default: '30 mins',
        trim: true
    },
    servings: {
        type: Number,
        required: [true, 'Number of servings is required'],
        min: [1, 'Servings must be at least 1'],
        max: [50, 'Servings cannot exceed 50']
    },
    difficulty: {
        type: String,
        enum: {
            values: ['Easy', 'Medium', 'Hard'],
            message: '{VALUE} is not a valid difficulty level'
        },
        default: 'Medium'
    },
    category: {
        type: String,
        enum: {
            values: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Other'],
            message: '{VALUE} is not a valid category'
        },
        default: 'Other'
    },
    image: {
        type: String,
        default: '',
        trim: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author is required']
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    ratings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
            required: [true, 'Comment text is required'],
            trim: true,
            minlength: [1, 'Comment cannot be empty'],
            maxlength: [500, 'Comment cannot exceed 500 characters']
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    tags: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add index for search functionality
recipeSchema.index({ title: 'text', description: 'text' });

// Add method to calculate average rating
recipeSchema.methods.calculateAverageRating = function() {
    if (this.ratings.length === 0) return 0;
    const sum = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / this.ratings.length).toFixed(1);
};

// Pre-save middleware to update average rating
recipeSchema.pre('save', function(next) {
    this.rating = this.calculateAverageRating();
    next();
});

module.exports = mongoose.model('Recipe', recipeSchema); 