import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Grid,
  Button,
  useMediaQuery,
  useTheme,
  Avatar,
  Fade
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

import storage from '../utils/storage';
import urlUtils from '../utils/urlUtils';
import logger from '../utils/logger';

const Statistics = () => {
  const [urls, setUrls] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    loadData();
    logger.info('Statistics page loaded');
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const urlData = storage.getShortenedUrls();
      const analyticsData = storage.getAnalytics();
      
      // Sort URLs by creation date (newest first)
      const sortedUrls = urlData.sort((a, b) => b.createdAt - a.createdAt);
      
      setUrls(sortedUrls);
      setAnalytics(analyticsData);
      
      logger.debug('Statistics data loaded', { 
        urlCount: sortedUrls.length,
        analyticsCount: Object.keys(analyticsData).length 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (urls.length === 0) {
    return (
      <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                mx: 'auto',
                mb: 3,
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
              }}
            >
              <AnalyticsIcon sx={{ fontSize: 50 }} />
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
              Analytics Dashboard
            </Typography>
            
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                maxWidth: 500, 
                mx: 'auto',
                mb: 4,
                lineHeight: 1.6
              }}
            >
              Track performance and insights for your shortened URLs
            </Typography>
            
            <Alert 
              severity="info" 
              sx={{ 
                maxWidth: 600, 
                mx: 'auto',
                borderRadius: 3,
                '& .MuiAlert-message': {
                  fontSize: '1.1rem'
                }
              }}
            >
              No shortened URLs found. Create some URLs to view their statistics and analytics.
            </Alert>
          </Box>
        </Fade>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
      {/* Header Section */}
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  mr: 2,
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Box>
                <Typography 
                  variant="h4" 
                  component="h1"
                  sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Analytics Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Track and analyze your shortened URLs
                </Typography>
              </Box>
            </Box>
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadData}
              disabled={isLoading}
              sx={{ 
                borderRadius: 2,
                minWidth: 120
              }}
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </Box>
        </Box>
      </Fade>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h4" fontWeight={700}>
                {urls.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total URLs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h4" fontWeight={700}>
                {urls.filter(url => !urlUtils.isExpired(url.expiresAt)).length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Active URLs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(255, 152, 0, 0.3)',
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h4" fontWeight={700}>
                {Object.values(analytics).reduce((sum, clicks) => sum + clicks.length, 0)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Clicks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(156, 39, 176, 0.3)',
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h4" fontWeight={700}>
                {urls.filter(url => url.isCustom).length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Custom Codes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Simple URLs List */}
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
          <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
            Your Shortened URLs
          </Typography>
          
          {urls.map((url) => (
            <Card key={url.id} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Typography variant="body1" color="primary" sx={{ fontWeight: 500, mb: 1 }}>
                {window.location.origin}/{url.shortCode}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {url.originalUrl}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Created: {urlUtils.formatTimestamp(url.createdAt)} | 
                Expires: {urlUtils.formatTimestamp(url.expiresAt)} | 
                Clicks: {analytics[url.shortCode] ? analytics[url.shortCode].length : 0}
              </Typography>
            </Card>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Statistics;