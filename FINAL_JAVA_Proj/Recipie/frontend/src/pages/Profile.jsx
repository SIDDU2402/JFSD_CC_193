import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Box,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Skeleton,
  Tooltip,
  Divider,
  Badge,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Fab,
} from '@mui/material';
import {
  Edit as EditIcon,
  Favorite as FavoriteIcon,
  Restaurant as RestaurantIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [userProfile, setUserProfile] = useState(null);
  const [userRecipes, setUserRecipes] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: '',
    bio: '',
    profilePicture: '',
  });
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchUserData = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      
      if (!token || !user) {
        navigate('/login');
        return;
      }

      setUserProfile({
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio || '',
        profilePicture: user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}&background=FF6B6B&color=fff`,
      });

      // Fetch user's recipes
      const recipesResponse = await axios.get(
        `http://localhost:5000/api/recipes/user/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserRecipes(recipesResponse.data);

      // Fetch favorite recipes
      const favoritesResponse = await axios.get(
        `http://localhost:5000/api/recipes/favorites`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFavoriteRecipes(favoritesResponse.data);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
      setRefreshing(false);
      setSnackbar({
        open: true,
        message: 'Error loading data. Please try again.',
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [navigate, user]);

  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        username: userProfile.username,
        bio: userProfile.bio || '',
        profilePicture: userProfile.profilePicture || '',
      });
    }
  }, [userProfile]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditProfileOpen = () => {
    setEditProfileOpen(true);
  };

  const handleEditProfileClose = () => {
    setEditProfileOpen(false);
  };

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value,
    });
  };

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/users/profile',
        profileForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUserProfile({
        ...userProfile,
        ...profileForm,
      });

      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success',
      });

      handleEditProfileClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Error updating profile',
        severity: 'error',
      });
    }
  };

  const handleRecipeMenuOpen = (event, recipe) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedRecipe(recipe);
  };

  const handleRecipeMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleEditRecipe = () => {
    navigate(`/edit-recipe/${selectedRecipe._id}`);
    handleRecipeMenuClose();
  };

  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
    handleRecipeMenuClose();
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteRecipe = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/recipes/${selectedRecipe._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUserRecipes(userRecipes.filter(recipe => recipe._id !== selectedRecipe._id));
      
      setSnackbar({
        open: true,
        message: 'Recipe deleted successfully',
        severity: 'success',
      });

      handleDeleteDialogClose();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting recipe',
        severity: 'error',
      });
    }
  };

  const handleRefresh = () => {
    fetchUserData();
  };

  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const getRecipeRating = (recipe) => {
    return recipe.rating ? recipe.rating.toFixed(1) : '0.0';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
              <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', mb: 2 }} />
              <Skeleton variant="text" width="60%" height={40} sx={{ mx: 'auto', mb: 1 }} />
              <Skeleton variant="text" width="80%" height={20} sx={{ mx: 'auto', mb: 2 }} />
              <Skeleton variant="rectangular" width="60%" height={36} sx={{ mx: 'auto', mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Skeleton variant="rectangular" width={60} height={40} />
                <Skeleton variant="rectangular" width={60} height={40} />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Skeleton variant="rectangular" width="100%" height={48} sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                {[1, 2, 3, 4].map((item) => (
                  <Grid item xs={12} sm={6} key={item}>
                    <Skeleton variant="rectangular" width="100%" height={200} />
                    <Skeleton variant="text" width="80%" height={30} sx={{ mt: 1 }} />
                    <Skeleton variant="text" width="60%" height={20} />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (!userProfile) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ position: 'relative', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            My Profile
          </Typography>
          <Box sx={{ position: 'absolute', right: 0, top: 0 }}>
            <Tooltip title="Refresh data">
              <IconButton onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  borderRadius: 2,
                  background: `linear-gradient(to bottom, ${theme.palette.primary.light}15, ${theme.palette.background.paper})`,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <IconButton 
                        size="small" 
                        sx={{ 
                          bgcolor: 'background.paper',
                          boxShadow: 2,
                          '&:hover': { bgcolor: 'background.paper' } 
                        }}
                        onClick={handleEditProfileOpen}
                      >
                        <EditIcon fontSize="small" color="primary" />
                      </IconButton>
                    }
                  >
                    <Avatar
                      src={userProfile.profilePicture}
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        mx: 'auto', 
                        mb: 2, 
                        boxShadow: 3,
                        border: `4px solid ${theme.palette.background.paper}` 
                      }}
                    />
                  </Badge>
                </motion.div>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  {userProfile.username}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph sx={{ fontStyle: userProfile.bio ? 'normal' : 'italic' }}>
                  {userProfile.bio || 'No bio yet'}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        bgcolor: theme.palette.primary.light + '20',
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                        {userRecipes.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Recipes
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        bgcolor: theme.palette.secondary.light + '20',
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="h5" color="secondary" sx={{ fontWeight: 'bold' }}>
                        {favoriteRecipes.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Favorites
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
                
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/create-recipe')}
                  sx={{ 
                    mt: 2,
                    borderRadius: 8,
                    py: 1,
                    boxShadow: 2,
                  }}
                >
                  Create New Recipe
                </Button>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                sx={{ 
                  borderBottom: 1, 
                  borderColor: 'divider', 
                  mb: 3,
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: 1.5,
                  }
                }}
                variant="fullWidth"
              >
                <Tab
                  icon={<RestaurantIcon />}
                  label="My Recipes"
                  iconPosition="start"
                />
                <Tab
                  icon={<FavoriteIcon />}
                  label="Favorites"
                  iconPosition="start"
                />
              </Tabs>

              <AnimatePresence mode="wait">
                <motion.div
                  key={tabValue}
                  initial={{ opacity: 0, x: tabValue === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: tabValue === 0 ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Grid container spacing={3}>
                    {(tabValue === 0 ? userRecipes : favoriteRecipes).length === 0 ? (
                      <Grid item xs={12}>
                        <Box sx={{ 
                          textAlign: 'center', 
                          py: 6,
                          px: 2,
                          bgcolor: theme.palette.background.default,
                          borderRadius: 2,
                        }}>
                          <Box sx={{ mb: 2 }}>
                            {tabValue === 0 ? 
                              <RestaurantIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} /> : 
                              <FavoriteIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />}
                          </Box>
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            {tabValue === 0 ? 'You haven\'t created any recipes yet' : 'You don\'t have any favorite recipes yet'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                            {tabValue === 0 
                              ? 'Start sharing your culinary creations with the community!'
                              : 'Explore recipes and mark your favorites to find them here.'}
                          </Typography>
                          {tabValue === 0 ? (
                            <Button
                              variant="contained"
                              onClick={() => navigate('/create-recipe')}
                              startIcon={<AddIcon />}
                              sx={{ borderRadius: 8 }}
                            >
                              Create Your First Recipe
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              onClick={() => navigate('/')}
                              color="secondary"
                              sx={{ borderRadius: 8 }}
                            >
                              Explore Recipes
                            </Button>
                          )}
                        </Box>
                      </Grid>
                    ) : (
                      (tabValue === 0 ? userRecipes : favoriteRecipes).map((recipe) => (
                        <Grid item xs={12} sm={6} key={recipe._id}>
                          <motion.div
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card
                              sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                overflow: 'visible',
                                borderRadius: 3,
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                              }}
                            >
                              {tabValue === 0 && (
                                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                                  <Tooltip title="Recipe options">
                                    <IconButton
                                      onClick={(e) => handleRecipeMenuOpen(e, recipe)}
                                      sx={{ 
                                        bgcolor: 'rgba(255,255,255,0.9)', 
                                        boxShadow: 2,
                                        '&:hover': { bgcolor: 'rgba(255,255,255,1)' } 
                                      }}
                                      size="small"
                                    >
                                      <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              )}
                              <CardActionArea onClick={() => navigate(`/recipe/${recipe._id}`)}>
                                <CardMedia
                                  component="img"
                                  height="180"
                                  image={recipe.image || `https://source.unsplash.com/random/400x300/?food,${recipe.title}`}
                                  alt={recipe.title}
                                  sx={{
                                    objectFit: 'cover',
                                  }}
                                />
                                <Box 
                                  sx={{ 
                                    position: 'absolute', 
                                    bottom: 70, 
                                    right: 12,
                                    bgcolor: 'rgba(255,255,255,0.9)',
                                    borderRadius: 8,
                                    px: 1,
                                    py: 0.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    boxShadow: 2,
                                  }}
                                >
                                  <StarIcon fontSize="small" sx={{ color: theme.palette.warning.main, mr: 0.5 }} />
                                  <Typography variant="body2" fontWeight="bold">
                                    {getRecipeRating(recipe)}
                                  </Typography>
                                </Box>
                                <CardContent>
                                  <Typography gutterBottom variant="h6" component="h2" noWrap fontWeight="medium">
                                    {recipe.title}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                    <Chip
                                      label={recipe.category}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                    />
                                    <Chip
                                      icon={<AccessTimeIcon fontSize="small" />}
                                      label={`${recipe.cookingTime} mins`}
                                      size="small"
                                      color="secondary"
                                      variant="outlined"
                                    />
                                  </Box>
                                  <Typography variant="body2" color="text.secondary" sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                  }}>
                                    {recipe.description}
                                  </Typography>
                                </CardContent>
                              </CardActionArea>
                            </Card>
                          </motion.div>
                        </Grid>
                      ))
                    )}
                  </Grid>
                </motion.div>
              </AnimatePresence>
            </Paper>
          </Grid>
        </Grid>
      </motion.div>

      {/* Floating action button for mobile */}
      {isMobile && (
        <Fab 
          color="primary" 
          aria-label="add recipe"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => navigate('/create-recipe')}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onClose={handleEditProfileClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Username"
              name="username"
              value={profileForm.username}
              onChange={handleProfileFormChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Bio"
              name="bio"
              value={profileForm.bio}
              onChange={handleProfileFormChange}
              multiline
              rows={3}
              placeholder="Tell us about yourself"
            />
            <TextField
              fullWidth
              margin="normal"
              label="Profile Picture URL"
              name="profilePicture"
              value={profileForm.profilePicture}
              onChange={handleProfileFormChange}
              placeholder="https://example.com/your-image.jpg"
              helperText="Leave empty to use default avatar"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditProfileClose}>Cancel</Button>
          <Button onClick={handleProfileUpdate} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Recipe Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleRecipeMenuClose}
      >
        <MenuItem onClick={handleEditRecipe}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit Recipe
        </MenuItem>
        <MenuItem onClick={handleDeleteDialogOpen} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete Recipe
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Recipe</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete "{selectedRecipe?.title}"? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteRecipe} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;