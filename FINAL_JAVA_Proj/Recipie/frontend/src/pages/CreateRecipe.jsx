import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardMedia,
  useTheme,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  Image as ImageIcon,
  Info as InfoIcon,
  Restaurant as RestaurantIcon,
  Timer as TimerIcon,
  People as PeopleIcon,
  LocalFireDepartment as FireIcon,
  Upload as UploadIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const CreateRecipe = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cookingTime: '',
    servings: '',
    difficulty: 'Medium',
    category: 'Other',
    ingredients: [{ name: '', amount: '', unit: '' }],
    instructions: [''],
    image: '',
  });

  // Steps for the stepper
  const steps = ['Basic Info', 'Ingredients', 'Instructions', 'Review'];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/create-recipe', message: 'Please log in to create a recipe' } });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData({
      ...formData,
      ingredients: newIngredients,
    });
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData({
      ...formData,
      instructions: newInstructions,
    });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: '', amount: '', unit: '' }],
    });
  };

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      ingredients: newIngredients,
    });
  };

  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, ''],
    });
  };

  const removeInstruction = (index) => {
    const newInstructions = formData.instructions.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      instructions: newInstructions,
    });
  };

  const handleNext = () => {
    // Validate current step
    if (activeStep === 0) {
      if (!formData.title || !formData.description || !formData.cookingTime || !formData.servings) {
        setError('Please fill in all required fields');
        return;
      }
      if (formData.description.length < 10) {
        setError('Description must be at least 10 characters long');
        return;
      }
    } else if (activeStep === 1) {
      const validIngredients = formData.ingredients.filter(ing => 
        ing.name.trim() !== '' || ing.amount.trim() !== ''
      );
      if (validIngredients.length === 0) {
        setError('Please add at least one ingredient');
        return;
      }
    } else if (activeStep === 2) {
      const validInstructions = formData.instructions.filter(inst => inst.trim() !== '');
      if (validInstructions.length === 0) {
        setError('Please add at least one instruction');
        return;
      }
    }

    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    
    try {
      // Format the data to match backend expectations
      const formattedData = {
        ...formData,
        cookingTime: Number(formData.cookingTime),
        servings: Number(formData.servings),
        // Convert complex ingredient objects to simple strings as expected by backend
        ingredients: formData.ingredients.map(ing => 
          `${ing.amount} ${ing.unit} ${ing.name}`.trim()
        ).filter(ing => ing.trim() !== ''),
        // Filter out empty instructions
        instructions: formData.instructions.filter(inst => inst.trim() !== '')
      };

      // Check if we have at least one ingredient and instruction
      if (formattedData.ingredients.length === 0) {
        setError('Please add at least one ingredient');
        return;
      }
      
      if (formattedData.instructions.length === 0) {
        setError('Please add at least one instruction');
        return;
      }

      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to create a recipe');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/recipes',
        formattedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      navigate(`/recipe/${response.data._id}`);
    } catch (error) {
      console.error('Error creating recipe:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('token'); // Clear invalid token
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(error.response?.data?.message || 'Error creating recipe. Please try again.');
      }
    }
  };

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  // Get formatted ingredients for preview
  const getFormattedIngredients = () => {
    return formData.ingredients
      .map(ing => `${ing.amount} ${ing.unit} ${ing.name}`.trim())
      .filter(ing => ing.trim() !== '');
  };

  // Get formatted instructions for preview
  const getFormattedInstructions = () => {
    return formData.instructions.filter(inst => inst.trim() !== '');
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Basic Info
        return (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <motion.div variants={fadeIn}>
                  <TextField
                    required
                    fullWidth
                    label="Recipe Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <RestaurantIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12}>
                <motion.div variants={fadeIn}>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    variant="outlined"
                    helperText="Minimum 10 characters. Describe your recipe and what makes it special."
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <motion.div variants={fadeIn}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Cooking Time (minutes)"
                    name="cookingTime"
                    value={formData.cookingTime}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TimerIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: <InputAdornment position="end">mins</InputAdornment>,
                    }}
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <motion.div variants={fadeIn}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Servings"
                    name="servings"
                    value={formData.servings}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PeopleIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <motion.div variants={fadeIn}>
                  <FormControl fullWidth required variant="outlined">
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleChange}
                      label="Difficulty"
                      startAdornment={
                        <InputAdornment position="start">
                          <FireIcon color="primary" />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="Easy">Easy</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="Hard">Hard</MenuItem>
                    </Select>
                  </FormControl>
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <motion.div variants={fadeIn}>
                  <FormControl fullWidth required variant="outlined">
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      label="Category"
                      startAdornment={
                        <InputAdornment position="start">
                          <RestaurantIcon color="primary" />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="Breakfast">Breakfast</MenuItem>
                      <MenuItem value="Lunch">Lunch</MenuItem>
                      <MenuItem value="Dinner">Dinner</MenuItem>
                      <MenuItem value="Dessert">Dessert</MenuItem>
                      <MenuItem value="Snack">Snack</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </motion.div>
              </Grid>
              <Grid item xs={12}>
                <motion.div variants={fadeIn}>
                  <TextField
                    fullWidth
                    label="Image URL"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    variant="outlined"
                    placeholder="https://example.com/image.jpg"
                    helperText="Add an image URL to showcase your recipe"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ImageIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </motion.div>
              </Grid>
              {formData.image && (
                <Grid item xs={12}>
                  <motion.div variants={fadeIn}>
                    <Card sx={{ maxHeight: 300, overflow: 'hidden', borderRadius: 2 }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={formData.image}
                        alt="Recipe preview"
                        sx={{ objectFit: 'cover' }}
                      />
                    </Card>
                  </motion.div>
                </Grid>
              )}
            </Grid>
          </motion.div>
        );
      case 1: // Ingredients
        return (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <Box sx={{ mb: 3 }}>
              <motion.div variants={fadeIn}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  Ingredients
                  <Tooltip title="Add all ingredients needed for your recipe. Be specific with amounts and measurements.">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </motion.div>
              
              {formData.ingredients.map((ingredient, index) => (
                <motion.div 
                  key={index} 
                  variants={fadeIn}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Box sx={{ display: 'flex', mb: 2, gap: 1, alignItems: 'center' }}>
                    <TextField
                      label="Amount"
                      value={ingredient.amount}
                      onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                      sx={{ width: '20%' }}
                      variant="outlined"
                    />
                    <TextField
                      label="Unit"
                      value={ingredient.unit}
                      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                      sx={{ width: '20%' }}
                      variant="outlined"
                    />
                    <TextField
                      label="Ingredient"
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                      sx={{ flexGrow: 1 }}
                      variant="outlined"
                    />
                    <IconButton
                      color="error"
                      onClick={() => removeIngredient(index)}
                      disabled={formData.ingredients.length <= 1}
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </motion.div>
              ))}
              
              <motion.div variants={fadeIn}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addIngredient}
                  variant="outlined"
                  sx={{ mt: 1 }}
                  color="primary"
                >
                  Add Ingredient
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        );
      case 2: // Instructions
        return (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <Box sx={{ mb: 3 }}>
              <motion.div variants={fadeIn}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  Instructions
                  <Tooltip title="Provide clear step-by-step instructions for preparing your recipe.">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </motion.div>
              
              {formData.instructions.map((instruction, index) => (
                <motion.div 
                  key={index} 
                  variants={fadeIn}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Box sx={{ display: 'flex', mb: 3, gap: 1, alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        fontWeight: 'bold',
                        mt: 1,
                        mr: 1,
                      }}
                    >
                      {index + 1}
                    </Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label={`Step ${index + 1}`}
                      value={instruction}
                      onChange={(e) => handleInstructionChange(index, e.target.value)}
                      variant="outlined"
                    />
                    <IconButton
                      color="error"
                      onClick={() => removeInstruction(index)}
                      disabled={formData.instructions.length <= 1}
                      sx={{ mt: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </motion.div>
              ))}
              
              <motion.div variants={fadeIn}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addInstruction}
                  variant="outlined"
                  sx={{ mt: 1 }}
                  color="primary"
                >
                  Add Step
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        );
      case 3: // Review
        return (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <Box sx={{ mb: 4 }}>
              <motion.div variants={fadeIn}>
                <Typography variant="h5" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                  Review Your Recipe
                </Typography>
                <Typography variant="body2" paragraph color="text.secondary">
                  Please review your recipe details before submitting. Make sure everything looks correct.
                </Typography>
              </motion.div>
              
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <motion.div variants={fadeIn}>
                    <Card sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={formData.image || 'https://source.unsplash.com/random/800x600/?food'}
                        alt={formData.title}
                      />
                      <Box sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                          {formData.title || 'Recipe Title'}
                        </Typography>
                        <Typography variant="body2" paragraph color="text.secondary" sx={{ mb: 2 }}>
                          {formData.description || 'Recipe description will appear here.'}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          <Chip icon={<TimerIcon />} label={`${formData.cookingTime} mins`} size="small" />
                          <Chip icon={<PeopleIcon />} label={`${formData.servings} servings`} size="small" />
                          <Chip icon={<FireIcon />} label={formData.difficulty} size="small" />
                          <Chip icon={<RestaurantIcon />} label={formData.category} size="small" />
                        </Box>
                      </Box>
                    </Card>
                  </motion.div>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <motion.div variants={fadeIn}>
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        Ingredients
                      </Typography>
                      {getFormattedIngredients().length > 0 ? (
                        <ul style={{ paddingLeft: '20px' }}>
                          {getFormattedIngredients().map((ingredient, index) => (
                            <li key={index}>
                              <Typography variant="body2">{ingredient}</Typography>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No ingredients added yet.
                        </Typography>
                      )}
                    </Paper>
                  </motion.div>
                  
                  <motion.div variants={fadeIn}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        Instructions
                      </Typography>
                      {getFormattedInstructions().length > 0 ? (
                        <ol style={{ paddingLeft: '20px' }}>
                          {getFormattedInstructions().map((instruction, index) => (
                            <li key={index}>
                              <Typography variant="body2" paragraph>{instruction}</Typography>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No instructions added yet.
                        </Typography>
                      )}
                    </Paper>
                  </motion.div>
                </Grid>
              </Grid>
            </Box>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 3 }}>
            Create New Recipe
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </motion.div>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          </motion.div>
        )}
        
        <Box component="form" onSubmit={(e) => e.preventDefault()}>
          {renderStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<BackIcon />}
              variant="outlined"
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                endIcon={<SaveIcon />}
                size="large"
              >
                Create Recipe
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                endIcon={<NextIcon />}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateRecipe;