import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Fade,
  Slide,
  useMediaQuery,
  useTheme,
  Stack,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Link as LinkIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  AutoAwesome as AutoAwesomeIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

import storage from '../utils/storage';
import urlUtils from '../utils/urlUtils';
import logger from '../utils/logger';

const URLShortener = () => {
  const [urls, setUrls] = useState([
    { originalUrl: '', validity: 30, customShortCode: '', useCustom: false }
  ]);
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Clean up expired URLs on component mount
  useEffect(() => {
    try {
      storage.cleanupExpiredUrls();
      logger.info('URL Shortener component mounted');
    } catch (error) {
      console.error('Error in URLShortener useEffect:', error);
    }
  }, []);

  const addUrlField = () => {
    if (urls.length < 5) {
      setUrls([...urls, { originalUrl: '', validity: 30, customShortCode: '', useCustom: false }]);
      logger.debug('Added new URL field', { totalFields: urls.length + 1 });
    }
  };

  const removeUrlField = (index) => {
    if (urls.length > 1) {
      const newUrls = urls.filter((_, i) => i !== index);
      setUrls(newUrls);
      logger.debug('Removed URL field', { remainingFields: newUrls.length });
    }
  };

  const updateUrl = (index, field, value) => {
    const newUrls = [...urls];
    newUrls[index] = { ...newUrls[index], [field]: value };
    setUrls(newUrls);
    
    // Clear error for this field
    if (errors[index]) {
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  const validateInputs = () => {
    const newErrors = {};
    const existingUrls = storage.getShortenedUrls();

    urls.forEach((url, index) => {
      if (!url.originalUrl.trim()) {
        newErrors[index] = 'URL is required';
        return;
      }

      const normalizedUrl = urlUtils.normalizeURL(url.originalUrl.trim());
      if (!urlUtils.isValidURL(normalizedUrl)) {
        newErrors[index] = 'Please enter a valid URL';
        return;
      }

      if (url.useCustom && url.customShortCode) {
        if (!urlUtils.isValidShortCode(url.customShortCode)) {
          newErrors[index] = 'Shortcode must be 3-20 alphanumeric characters';
          return;
        }

        if (!urlUtils.isShortCodeUnique(url.customShortCode, existingUrls)) {
          newErrors[index] = 'This shortcode is already in use';
          return;
        }
      }

      if (!urlUtils.isValidValidityDuration(url.validity)) {
        newErrors[index] = 'Validity must be between 1 minute and 24 hours';
        return;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const shortenUrls = async () => {
    if (!validateInputs()) {
      logger.warn('URL shortening failed due to validation errors', { errors });
      return;
    }

    setIsLoading(true);
    const newResults = [];

    try {
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const normalizedUrl = urlUtils.normalizeURL(url.originalUrl.trim());
        
        let shortCode;
        if (url.useCustom && url.customShortCode) {
          shortCode = url.customShortCode;
        } else {
          // Generate unique shortcode
          const existingUrls = storage.getShortenedUrls();
          do {
            shortCode = urlUtils.generateShortCode();
          } while (!urlUtils.isShortCodeUnique(shortCode, existingUrls));
        }

        const urlData = {
          id: Date.now() + i,
          originalUrl: normalizedUrl,
          shortCode,
          createdAt: Date.now(),
          expiresAt: urlUtils.calculateExpiryTime(url.validity),
          validity: url.validity,
          isCustom: url.useCustom && !!url.customShortCode
        };

        // Save to storage
        storage.saveShortenedUrl(urlData);
        
        newResults.push({
          ...urlData,
          shortUrl: `${window.location.origin}/${shortCode}`,
          timeRemaining: urlUtils.getTimeRemaining(urlData.expiresAt)
        });

        logger.info('URL shortened successfully', { 
          shortCode, 
          originalUrl: normalizedUrl,
          expiresAt: urlData.expiresAt 
        });
      }

      setResults(newResults);
      setShowSuccess(true);
      
      // Reset form
      setUrls([{ originalUrl: '', validity: 30, customShortCode: '', useCustom: false }]);
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      logger.error('Error shortening URLs', { error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      logger.info('URL copied to clipboard', { url: text });
    }).catch((error) => {
      logger.error('Failed to copy to clipboard', { error: error.message });
    });
  };

  return (
    <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
      {/* Hero Section */}
      <Fade in timeout={800}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 3,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
            }}
          >
            <LinkIcon sx={{ fontSize: 40 }} />
          </Avatar>
          
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            URL Shortener
          </Typography>
          
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              maxWidth: 600, 
              mx: 'auto',
              mb: 4,
              lineHeight: 1.6
            }}
          >
            Create secure, trackable shortened URLs with custom validity periods and optional custom shortcodes
          </Typography>

          {/* Feature Cards */}
          <Grid container spacing={2} sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <SpeedIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Fast & Secure
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Client-side processing
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <ScheduleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Custom Validity
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Set expiration times
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                <SecurityIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Analytics
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Track clicks & stats
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Fade>

      {/* Success Message */}
      <Slide direction="down" in={showSuccess} mountOnEnter unmountOnExit>
        <Alert 
          severity="success" 
          icon={<CheckCircleIcon />}
          sx={{ mb: 3, borderRadius: 3 }}
        >
          URLs shortened successfully! Check the results below.
        </Alert>
      </Slide>

      {/* Main Form Card */}
      <Slide direction="up" in timeout={1000}>
        <Card 
          sx={{ 
            mb: 4, 
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AutoAwesomeIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5" fontWeight={600}>
                Create Short URLs
              </Typography>
            </Box>
            
            {urls.map((url, index) => (
              <Fade in timeout={500 + index * 100} key={index}>
                <Paper 
                  sx={{ 
                    p: { xs: 2, md: 3 }, 
                    mb: 2, 
                    borderRadius: 3,
                    border: '1px solid rgba(25, 118, 210, 0.1)',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Original URL"
                        value={url.originalUrl}
                        onChange={(e) => updateUrl(index, 'originalUrl', e.target.value)}
                        error={!!errors[index]}
                        helperText={errors[index]}
                        placeholder="https://example.com"
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Validity (minutes)"
                        type="number"
                        value={url.validity}
                        onChange={(e) => updateUrl(index, 'validity', parseInt(e.target.value) || 30)}
                        inputProps={{ min: 1, max: 1440 }}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={url.useCustom}
                            onChange={(e) => updateUrl(index, 'useCustom', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Custom Shortcode"
                        sx={{ mb: url.useCustom ? 1 : 0 }}
                      />
                      {url.useCustom && (
                        <TextField
                          fullWidth
                          label="Custom Shortcode"
                          value={url.customShortCode}
                          onChange={(e) => updateUrl(index, 'customShortCode', e.target.value)}
                          placeholder="mycode"
                          variant="outlined"
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                        />
                      )}
                    </Grid>
                    
                    <Grid item xs={12} md={1}>
                      {urls.length > 1 && (
                        <Tooltip title="Remove URL">
                          <IconButton 
                            onClick={() => removeUrlField(index)}
                            color="error"
                            sx={{
                              '&:hover': {
                                backgroundColor: 'error.50',
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Fade>
            ))}
            
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              mt: 3,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' }
            }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addUrlField}
                disabled={urls.length >= 5}
                sx={{ 
                  borderRadius: 2,
                  minWidth: { xs: '100%', sm: 'auto' }
                }}
              >
                Add URL ({urls.length}/5)
              </Button>
              
              <Button
                variant="contained"
                onClick={shortenUrls}
                disabled={isLoading || urls.some(url => !url.originalUrl.trim())}
                sx={{ 
                  ml: { xs: 0, sm: 'auto' },
                  borderRadius: 2,
                  minWidth: { xs: '100%', sm: 'auto' },
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                  }
                }}
                size="large"
              >
                {isLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress size={20} sx={{ width: 20, height: 20, borderRadius: '50%' }} />
                    Shortening...
                  </Box>
                ) : (
                  'Shorten URLs'
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Slide>

      {/* Results Section */}
      {results.length > 0 && (
        <Fade in timeout={800}>
          <Card 
            sx={{ 
              borderRadius: 4,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h5" fontWeight={600}>
                  Shortened URLs
                </Typography>
              </Box>
              
              {isMobile ? (
                // Mobile Card Layout
                <Stack spacing={2}>
                  {results.map((result) => (
                    <Card key={result.id} sx={{ p: 2, borderRadius: 3 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Original URL
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            wordBreak: 'break-all',
                            mb: 1
                          }}
                        >
                          {result.originalUrl}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Short URL
                        </Typography>
                        <Typography variant="body2" color="primary" sx={{ wordBreak: 'break-all' }}>
                          {result.shortUrl}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Chip 
                          label={result.shortCode} 
                          color={result.isCustom ? 'secondary' : 'primary'}
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {result.timeRemaining}
                        </Typography>
                      </Box>
                      
                      <Button
                        variant="outlined"
                        startIcon={<CopyIcon />}
                        onClick={() => copyToClipboard(result.shortUrl)}
                        fullWidth
                        size="small"
                        sx={{ borderRadius: 2 }}
                      >
                        Copy URL
                      </Button>
                    </Card>
                  ))}
                </Stack>
              ) : (
                // Desktop Table Layout
                <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'grey.50' }}>
                        <TableCell fontWeight={600}>Original URL</TableCell>
                        <TableCell fontWeight={600}>Short URL</TableCell>
                        <TableCell fontWeight={600}>Shortcode</TableCell>
                        <TableCell fontWeight={600}>Expires</TableCell>
                        <TableCell fontWeight={600}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {results.map((result) => (
                        <TableRow 
                          key={result.id}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'primary.50',
                            }
                          }}
                        >
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                maxWidth: 200, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {result.originalUrl}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                              {result.shortUrl}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={result.shortCode} 
                              color={result.isCustom ? 'secondary' : 'primary'}
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {result.timeRemaining}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {urlUtils.formatTimestamp(result.expiresAt)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Copy URL">
                              <IconButton 
                                size="small"
                                onClick={() => copyToClipboard(result.shortUrl)}
                                sx={{
                                  '&:hover': {
                                    backgroundColor: 'primary.100',
                                  }
                                }}
                              >
                                <CopyIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Fade>
      )}
    </Box>
  );
};

export default URLShortener;