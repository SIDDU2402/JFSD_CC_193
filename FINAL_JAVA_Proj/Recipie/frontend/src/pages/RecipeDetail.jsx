import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Rating,
  Avatar,
  IconButton,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Timer as TimerIcon,
  People as PeopleIcon,
  LocalFireDepartment as FireIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  ArrowBack as ArrowBackIcon,
  Restaurant as RestaurantIcon,
  AccessTime as AccessTimeIcon,
  Print as PrintIcon,
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

const RecipeDetail = () => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get(`http://localhost:5000/api/recipes/${id}`);
        console.log('Recipe data:', response.data); // Debug log
        setRecipe(response.data);
      } catch (error) {
        console.error('Error fetching recipe:', error);
        setError('Failed to load recipe. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/recipes/${id}/rate`,
        { rating: 5 }, // Default to 5 stars for a like
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRecipe(response.data);
    } catch (error) {
      console.error('Error liking recipe:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          variant="outlined"
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (!recipe) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Recipe not found
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          variant="outlined"
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      {/* Hero Image Section */}
      <Box
        sx={{
          position: 'relative',
          height: '500px',
          backgroundImage: `url(${recipe.image || 'https://source.unsplash.com/random/1600x900/?food'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%)',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pb: 6 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mb: 2, color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white' } }}
            variant="outlined"
          >
            Back to Recipes
          </Button>
          <motion.div variants={fadeIn}>
            <Typography variant="h2" component="h1" sx={{ color: 'white', mb: 2, fontWeight: 700, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              {recipe.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<TimerIcon />}
                label={`${recipe.cookingTime} mins`}
                sx={{ bgcolor: 'rgba(255,255,255,0.9)', fontWeight: 500 }}
              />
              <Chip
                icon={<PeopleIcon />}
                label={`${recipe.servings} servings`}
                sx={{ bgcolor: 'rgba(255,255,255,0.9)', fontWeight: 500 }}
              />
              <Chip
                icon={<FireIcon />}
                label={recipe.difficulty}
                sx={{ bgcolor: 'rgba(255,255,255,0.9)', fontWeight: 500 }}
              />
              <Chip
                icon={<RestaurantIcon />}
                label={recipe.category}
                sx={{ bgcolor: 'rgba(255,255,255,0.9)', fontWeight: 500 }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating value={recipe.rating} readOnly precision={0.5} sx={{ color: 'white' }} />
              <Typography variant="body2" sx={{ ml: 1, color: 'white', fontWeight: 500 }}>
                ({recipe.rating.toFixed(1)})
              </Typography>
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -6, mb: 8, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <motion.div variants={staggerContainer}>
              <Paper sx={{ p: 4, mb: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <motion.div variants={fadeIn}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                    Description
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    {recipe.description}
                  </Typography>
                </motion.div>
              </Paper>

              <Paper sx={{ p: 4, mb: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <motion.div variants={fadeIn}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                    Ingredients
                  </Typography>
                  <List sx={{ '& .MuiListItem-root': { py: 1.5 } }}>
                    {Array.isArray(recipe.ingredients) ? (
                      recipe.ingredients.map((ingredient, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <ListItem sx={{ borderBottom: '1px dashed rgba(0,0,0,0.1)' }}>
                            <ListItemText 
                              primary={
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {ingredient}
                                </Typography>
                              } 
                            />
                          </ListItem>
                        </motion.div>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText primary="No ingredients available" />
                      </ListItem>
                    )}
                  </List>
                </motion.div>
              </Paper>

              <Paper sx={{ p: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <motion.div variants={fadeIn}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                    Instructions
                  </Typography>
                  <List>
                    {Array.isArray(recipe.instructions) ? (
                      recipe.instructions.map((instruction, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ListItem alignItems="flex-start" sx={{ mb: 3 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                mr: 2,
                              }}
                            >
                              <Avatar
                                sx={{
                                  bgcolor: theme.palette.primary.main,
                                  color: 'white',
                                  width: 36,
                                  height: 36,
                                  fontWeight: 'bold',
                                  fontSize: '1rem',
                                }}
                              >
                                {index + 1}
                              </Avatar>
                            </Box>
                            <ListItemText
                              primary={`Step ${index + 1}`}
                              secondary={
                                <Typography 
                                  component="div" 
                                  variant="body1" 
                                  color="text.primary"
                                  sx={{ mt: 1, lineHeight: 1.7 }}
                                >
                                  {instruction}
                                </Typography>
                              }
                              primaryTypographyProps={{ 
                                fontWeight: 600, 
                                color: theme.palette.primary.main,
                                variant: 'h6' 
                              }}
                            />
                          </ListItem>
                          {index < recipe.instructions.length - 1 && (
                            <Divider variant="inset" component="li" sx={{ ml: 7 }} />
                          )}
                        </motion.div>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText primary="No instructions available" />
                      </ListItem>
                    )}
                  </List>
                </motion.div>
              </Paper>
            </motion.div>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <motion.div variants={staggerContainer}>
              <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <motion.div variants={fadeIn}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <RestaurantIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, m: 0 }}>
                      Recipe Info
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Category:</Typography>
                    <Chip label={recipe.category || 'Other'} size="small" color="primary" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Difficulty:</Typography>
                    <Chip label={recipe.difficulty} size="small" color="secondary" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Prep Time:</Typography>
                    <Typography variant="body2">{recipe.prepTime || 'Not specified'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Cook Time:</Typography>
                    <Typography variant="body2">{recipe.cookingTime} mins</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Total Time:</Typography>
                    <Typography variant="body2">{parseInt(recipe.prepTime || 0) + parseInt(recipe.cookingTime)} mins</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Servings:</Typography>
                    <Typography variant="body2">{recipe.servings}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Rating:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating value={recipe.rating} readOnly precision={0.5} size="small" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({recipe.rating.toFixed(1)})
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              </Paper>

              <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <motion.div variants={fadeIn}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, m: 0 }}>
                      Created
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>
                      {recipe.author?.username ? recipe.author.username.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {recipe.author?.username || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(recipe.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <motion.div variants={fadeIn}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ShareIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, m: 0 }}>
                      Actions
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        startIcon={<FavoriteIcon />}
                        onClick={handleLike}
                        variant="contained"
                        color="error"
                        sx={{ borderRadius: 2 }}
                      >
                        Like
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button 
                        fullWidth 
                        startIcon={<BookmarkIcon />} 
                        variant="contained"
                        color="secondary"
                        sx={{ borderRadius: 2 }}
                      >
                        Save
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Button 
                        fullWidth 
                        startIcon={<PrintIcon />} 
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                        onClick={() => window.print()}
                      >
                        Print Recipe
                      </Button>
                    </Grid>
                  </Grid>
                </motion.div>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </motion.div>
  );
};

export default RecipeDetail;