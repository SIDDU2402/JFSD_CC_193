import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Alert,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  RestaurantMenu as RestaurantMenuIcon,
  Timer as TimerIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const difficultyLevels = ['Easy', 'Medium', 'Hard'];
const categories = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Appetizer',
  'Dessert',
  'Snack',
  'Soup',
  'Salad',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Other',
];

const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [recipe, setRecipe] = useState({
    title: '',
    description: '',
    ingredients: [{ name: '', quantity: '', unit: '' }],
    instructions: [''],
    cookingTime: '',
    prepTime: '',
    servings: '',
    difficulty: 'Medium',
    category: 'Other',
    image: '',
  });

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/recipes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Check if the recipe belongs to the current user
        if (response.data.author._id !== user.id) {
          setError('You are not authorized to edit this recipe');
          return;
        }
        
        // Format the recipe data for the form
        const recipeData = response.data;
        setRecipe({
          title: recipeData.title,
          description: recipeData.description,
          ingredients: recipeData.ingredients.length > 0 
            ? recipeData.ingredients.map(ing => ({
                name: ing.name || '',
                quantity: ing.quantity || '',
                unit: ing.unit || ''
              }))
            : [{ name: '', quantity: '', unit: '' }],
          instructions: recipeData.instructions.length > 0 
            ? recipeData.instructions.map(inst => inst.text || inst)
            : [''],
          cookingTime: recipeData.cookingTime || '',
          prepTime: recipeData.prepTime || '',
          servings: recipeData.servings || '',
          difficulty: recipeData.difficulty || 'Medium',
          category: recipeData.category || 'Other',
          image: recipeData.image || '',
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recipe:', error);
        setError('Error loading recipe. Please try again.');
        setLoading(false);
      }
    };

    if (user) {
      fetchRecipe();
    }
  }, [id, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe({ ...recipe, [name]: value });
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients[index][field] = value;
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setRecipe({
      ...recipe,
      ingredients: [...recipe.ingredients, { name: '', quantity: '', unit: '' }],
    });
  };

  const removeIngredient = (index) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients.splice(index, 1);
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...recipe.instructions];
    newInstructions[index] = value;
    setRecipe({ ...recipe, instructions: newInstructions });
  };

  const addInstruction = () => {
    setRecipe({
      ...recipe,
      instructions: [...recipe.instructions, ''],
    });
  };

  const removeInstruction = (index) => {
    const newInstructions = [...recipe.instructions];
    newInstructions.splice(index, 1);
    setRecipe({ ...recipe, instructions: newInstructions });
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/recipes/${id}`,
        recipe,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess(true);
      setTimeout(() => navigate(`/recipe/${id}`), 2000);
    } catch (error) {
      console.error('Error updating recipe:', error);
      setError(error.response?.data?.message || 'Error updating recipe');
    }
  };

  const steps = ['Basic Info', 'Ingredients', 'Instructions', 'Review'];

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Recipe Title"
                  name="title"
                  value={recipe.title}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={recipe.description}
                  onChange={handleChange}
                  required
                  multiline
                  rows={4}
                  variant="outlined"
                  helperText="Minimum 10 characters"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Cooking Time (minutes)"
                  name="cookingTime"
                  type="number"
                  value={recipe.cookingTime}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Prep Time (minutes)"
                  name="prepTime"
                  type="number"
                  value={recipe.prepTime}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Servings"
                  name="servings"
                  type="number"
                  value={recipe.servings}
                  onChange={handleChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Difficulty"
                  name="difficulty"
                  value={recipe.difficulty}
                  onChange={handleChange}
                  variant="outlined"
                >
                  {difficultyLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Category"
                  name="category"
                  value={recipe.category}
                  onChange={handleChange}
                  variant="outlined"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image URL"
                  name="image"
                  value={recipe.image}
                  onChange={handleChange}
                  variant="outlined"
                  helperText="Enter a URL for your recipe image"
                />
              </Grid>
            </Grid>
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Ingredients
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                List all ingredients needed for your recipe. Be specific with quantities and units.
              </Typography>
            </Box>
            {recipe.ingredients.map((ingredient, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    label="Ingredient"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    value={ingredient.quantity}
                    onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Unit"
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    variant="outlined"
                    placeholder="e.g., cup, tbsp"
                  />
                </Grid>
                <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    color="error"
                    onClick={() => removeIngredient(index)}
                    disabled={recipe.ingredients.length <= 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={addIngredient}
              variant="outlined"
              sx={{ mt: 2 }}
            >
              Add Ingredient
            </Button>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Instructions
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Provide clear step-by-step instructions for preparing your recipe.
              </Typography>
            </Box>
            {recipe.instructions.map((instruction, index) => (
              <Box key={index} sx={{ mb: 3, display: 'flex', alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    minWidth: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    mt: 1,
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
                  required
                  variant="outlined"
                  sx={{ flexGrow: 1 }}
                />
                <IconButton
                  color="error"
                  onClick={() => removeInstruction(index)}
                  disabled={recipe.instructions.length <= 1}
                  sx={{ ml: 1, mt: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={addInstruction}
              variant="outlined"
              sx={{ mt: 2 }}
            >
              Add Step
            </Button>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Typography variant="h5" gutterBottom>
              Review Your Recipe
            </Typography>
            <Card sx={{ mb: 4, overflow: 'hidden' }}>
              {recipe.image && (
                <Box
                  sx={{
                    height: 200,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <Box
                    component="img"
                    src={recipe.image}
                    alt={recipe.title}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              )}
              <CardContent>
                <Typography variant="h4" component="h1" gutterBottom>
                  {recipe.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<RestaurantMenuIcon />}
                    label={recipe.category}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    icon={<TimerIcon />}
                    label={`${recipe.cookingTime} mins`}
                    color="secondary"
                    variant="outlined"
                  />
                  <Chip
                    icon={<PeopleIcon />}
                    label={`${recipe.servings} servings`}
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body1" paragraph>
                  {recipe.description}
                </Typography>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Ingredients
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List dense>
                  {recipe.ingredients.map((ingredient, index) => (
                    <ListItem key={index}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>
                        {ingredient.quantity} {ingredient.unit} {ingredient.name}
                      </ListItemText>
                    </ListItem>
                  ))}
                </List>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Instructions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {recipe.instructions.map((instruction, index) => (
                    <ListItem key={index} alignItems="flex-start" sx={{ py: 1 }}>
                      <ListItemIcon>
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                          }}
                        >
                          {index + 1}
                        </Box>
                      </ListItemIcon>
                      <ListItemText primary={instruction} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        );
      default:
        return 'Unknown step';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography>Loading recipe...</Typography>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button
            variant="contained"
            onClick={() => navigate(-1)}
            sx={{ mt: 2 }}
          >
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Alert severity="success" sx={{ mb: 2 }}>
              Recipe updated successfully! Redirecting...
            </Alert>
          </motion.div>
        ) : (
          <>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Edit Recipe
            </Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4, pt: 2 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mt: 4, mb: 4 }}>
              <AnimatePresence mode="wait">
                {getStepContent(activeStep)}
              </AnimatePresence>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<ArrowBackIcon />}
              >
                Back
              </Button>
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    color="primary"
                  >
                    Update Recipe
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForwardIcon />}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default EditRecipe;
