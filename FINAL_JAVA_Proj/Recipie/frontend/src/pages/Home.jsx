import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Divider,
  useTheme,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Timer as TimerIcon,
  People as PeopleIcon,
  Favorite as FavoriteIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Hero section background images
const heroImages = [
  'https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1476&q=80',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
];

// Featured recipe categories with images
const categories = [
  { name: 'Breakfast', image: 'https://th.bing.com/th/id/R.446335c39ad856d8b0d6852d824cdcd7?rik=Xmdp%2fDKnR5aAoQ&riu=http%3a%2f%2fwww.brightonescrow.com%2fwp-content%2fuploads%2f2015%2f01%2fFotolia_70053652_Subscription_Monthly_M.jpg&ehk=oTawSsmnK%2bo%2fCvREinDq9Ze0aKfyQYcHavMVB%2fZrKnY%3d&risl=&pid=ImgRaw&r=0' },
  { name: 'Lunch', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80' },
  { name: 'Dinner', image: 'https://images.unsplash.com/photo-1576402187878-974f70c890a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1333&q=80' },
  { name: 'Dessert', image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80' },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  }
};

const RecipeCard = ({ recipe }) => {
  const theme = useTheme();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={itemVariants}
    >
      <Card 
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
          },
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <CardMedia
          component="img"
          height="200"
          image={recipe.image || `https://source.unsplash.com/random/300x200/?food,${recipe.title.replace(' ', ',')}`}
          alt={recipe.title}
        />
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Box sx={{ mb: 1 }}>
            <Chip 
              label={recipe.category} 
              size="small" 
              sx={{ 
                bgcolor: theme.palette.primary.light, 
                color: 'white',
                fontWeight: 500,
                fontSize: '0.7rem',
              }} 
            />
          </Box>
          <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            {recipe.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ 
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {recipe.description}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TimerIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                {recipe.cookingTime} mins
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                {recipe.servings} servings
              </Typography>
            </Box>
          </Box>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
          <Button 
            component={RouterLink} 
            to={`/recipe/${recipe._id}`}
            size="small" 
            endIcon={<ArrowForwardIcon />}
            sx={{ fontWeight: 500 }}
          >
            View Recipe
          </Button>
          <IconButton size="small" color="error">
            <FavoriteIcon fontSize="small" />
          </IconButton>
        </CardActions>
      </Card>
    </motion.div>
  );
};

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const theme = useTheme();
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  // Change hero image every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        let url = 'http://localhost:5000/api/recipes';
        const params = {};
        
        if (category && category !== 'all') {
          params.category = category;
        }
        
        if (searchTerm) {
          params.search = searchTerm;
        }
        
        const response = await axios.get(url, { params });
        setRecipes(response.data);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [category, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already handled by the useEffect dependency
  };

  return (
    <Box>
      {/* Hero Section with Animated Background */}
      <Box
        sx={{
          position: 'relative',
          height: '70vh',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {heroImages.map((img, index) => (
          <Box
            key={index}
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: index === heroImageIndex ? 1 : 0,
              transition: { duration: 1.5 }
            }}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: index === heroImageIndex ? 1 : 0,
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              },
            }}
          />
        ))}
        <Container 
          maxWidth="lg" 
          sx={{ 
            position: 'relative', 
            zIndex: 2, 
            color: 'white',
            textAlign: 'center' 
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              Discover Delicious Recipes
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 4, 
                maxWidth: '800px', 
                mx: 'auto',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
              }}
            >
              Find and share the best recipes from around the world
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Paper
              component="form"
              onSubmit={handleSearch}
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                width: { xs: '100%', md: '600px' },
                mx: 'auto',
                borderRadius: 50,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
            >
              <IconButton sx={{ p: '10px' }} aria-label="search">
                <SearchIcon />
              </IconButton>
              <TextField
                fullWidth
                placeholder="Search for recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                }}
                sx={{ ml: 1, flex: 1 }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                sx={{ 
                  borderRadius: 50, 
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 'none'
                }}
              >
                Search
              </Button>
            </Paper>
          </motion.div>
        </Container>
      </Box>

      {/* Categories Section */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 6 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
            Explore Categories
          </Typography>
        </motion.div>
        
        <Grid container spacing={3}>
          {categories.map((category, index) => (
            <Grid item xs={6} md={3} key={category.name}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card 
                  sx={{
                    position: 'relative',
                    height: 180,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    borderRadius: 2,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.03)',
                      '& .MuiCardMedia-root': {
                        transform: 'scale(1.1)',
                      },
                    },
                  }}
                  onClick={() => setCategory(category.name)}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={category.image}
                    alt={category.name}
                    sx={{
                      transition: 'transform 0.5s ease',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      bgcolor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      p: 2,
                    }}
                  >
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                      {category.name}
                    </Typography>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Recipes Section */}
      <Box sx={{ bgcolor: 'background.default', py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                {category === 'all' ? 'Latest Recipes' : `${category} Recipes`}
              </Typography>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="Breakfast">Breakfast</MenuItem>
                  <MenuItem value="Lunch">Lunch</MenuItem>
                  <MenuItem value="Dinner">Dinner</MenuItem>
                  <MenuItem value="Dessert">Dessert</MenuItem>
                  <MenuItem value="Snack">Snack</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </motion.div>
          </Box>

          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item}>
                  <Card>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton variant="text" width="30%" height={30} />
                      <Skeleton variant="text" width="80%" height={30} />
                      <Skeleton variant="text" width="100%" height={60} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Skeleton variant="text" width="40%" />
                        <Skeleton variant="text" width="40%" />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : recipes.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Grid container spacing={3}>
                {recipes.map((recipe) => (
                  <Grid item xs={12} sm={6} md={4} key={recipe._id}>
                    <RecipeCard recipe={recipe} />
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No recipes found
              </Typography>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/create-recipe"
                sx={{ mt: 2 }}
              >
                Create Recipe
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box 
        sx={{ 
          bgcolor: theme.palette.primary.main, 
          color: 'white', 
          py: 8, 
          textAlign: 'center' 
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              Ready to share your culinary masterpiece?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, fontWeight: 400 }}>
              Join our community and showcase your favorite recipes
            </Typography>
            <Button 
              variant="contained" 
              component={RouterLink} 
              to="/create-recipe"
              size="large"
              sx={{ 
                bgcolor: 'white', 
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                },
                px: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: '1rem'
              }}
            >
              Create Recipe
            </Button>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;