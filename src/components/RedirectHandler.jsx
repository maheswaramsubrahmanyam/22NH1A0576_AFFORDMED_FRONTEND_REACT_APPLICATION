import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Button,
  Avatar,
  Fade
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  Link as LinkIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Home as HomeIcon
} from '@mui/icons-material';

import storage from '../utils/storage';
import urlUtils from '../utils/urlUtils';
import logger from '../utils/logger';

const RedirectHandler = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, redirecting, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        logger.info('Redirect attempt initiated', { shortCode });

        // Get all shortened URLs
        const urls = storage.getShortenedUrls();
        const urlData = urls.find(url => url.shortCode === shortCode);

        if (!urlData) {
          setStatus('error');
          setErrorMessage('Short URL not found');
          logger.warn('Short URL not found', { shortCode });
          return;
        }

        // Check if URL is expired
        if (urlUtils.isExpired(urlData.expiresAt)) {
          setStatus('error');
          setErrorMessage('This short URL has expired');
          logger.warn('Short URL expired', { 
            shortCode, 
            expiresAt: urlData.expiresAt,
            now: Date.now()
          });
          return;
        }

        // Track the click
        const clickData = {
          timestamp: Date.now(),
          referrer: urlUtils.getReferrerInfo(),
          location: await urlUtils.getBrowserLocation(),
          userAgent: navigator.userAgent
        };

        storage.saveAnalytics(shortCode, clickData);
        
        logger.info('Redirect successful', { 
          shortCode, 
          originalUrl: urlData.originalUrl,
          clickData 
        });

        // Set redirecting status
        setStatus('redirecting');

        // Redirect after a short delay to show the redirect message
        setTimeout(() => {
          window.location.href = urlData.originalUrl;
        }, 2000);

      } catch (error) {
        logger.error('Redirect error', { shortCode, error: error.message });
        setStatus('error');
        setErrorMessage('An error occurred while processing the redirect');
      }
    };

    if (shortCode) {
      handleRedirect();
    }
  }, [shortCode]);

  if (status === 'loading') {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="70vh"
        sx={{ px: 2 }}
      >
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center' }}>
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
            
            <CircularProgress 
              size={60} 
              sx={{ 
                mb: 3,
                color: 'primary.main'
              }} 
            />
            
            <Typography 
              variant="h5" 
              fontWeight={600}
              sx={{ 
                mb: 2,
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Processing redirect...
            </Typography>
            
            <Typography variant="body1" color="text.secondary">
              Please wait while we verify your short URL
            </Typography>
          </Box>
        </Fade>
      </Box>
    );
  }

  if (status === 'redirecting') {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="70vh"
        sx={{ px: 2 }}
      >
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
                background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 40 }} />
            </Avatar>
            
            <CircularProgress 
              size={60} 
              sx={{ 
                mb: 3,
                color: 'success.main'
              }} 
            />
            
            <Typography 
              variant="h5" 
              fontWeight={600}
              sx={{ 
                mb: 2,
                background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Redirecting you to the destination...
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You will be redirected automatically in a few seconds.
            </Typography>
          </Box>
        </Fade>
      </Box>
    );
  }

  if (status === 'error') {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="70vh"
        sx={{ px: 2 }}
      >
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', maxWidth: 500, width: '100%' }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
                background: 'linear-gradient(135deg, #f44336 0%, #ff5722 100%)',
                boxShadow: '0 8px 32px rgba(244, 67, 54, 0.3)',
              }}
            >
              <ErrorIcon sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Card 
              sx={{ 
                borderRadius: 4,
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 3,
                    '& .MuiAlert-message': {
                      fontSize: '1.1rem'
                    }
                  }}
                >
                  {errorMessage}
                </Alert>
                
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  Short URL: /{shortCode}
                </Typography>
                
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 4,
                    lineHeight: 1.6
                  }}
                >
                  This short URL is either invalid or has expired. 
                  Please check the URL or create a new one.
                </Typography>
                
                <Button 
                  variant="contained" 
                  component={RouterLink} 
                  to="/"
                  fullWidth
                  size="large"
                  startIcon={<HomeIcon />}
                  sx={{ 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                    }
                  }}
                >
                  Create New Short URL
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Fade>
      </Box>
    );
  }

  return null;
};

export default RedirectHandler;