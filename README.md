# Affordmed URL Shortener

A secure, client-side URL Shortener application built with React and Material UI for the Affordmed internship project.

## Features

### Core Functionality
- **URL Shortening**: Create shortened URLs with up to 5 URLs at once
- **Custom Shortcodes**: Optional custom shortcodes (3-20 alphanumeric characters)
- **Validity Management**: Default 30-minute validity with custom duration (1 minute to 24 hours)
- **Client-side Redirection**: All short URLs resolve via React Router
- **Data Persistence**: Uses localStorage for data persistence between sessions

### Analytics & Tracking
- **Click Analytics**: Track click count, timestamps, and referrer information
- **Location Tracking**: Coarse location data via browser geolocation API
- **Statistics Dashboard**: Comprehensive view of all shortened URLs and their performance
- **Real-time Updates**: Live statistics and analytics

### User Experience
- **Material UI Design**: Modern, responsive interface using Material UI components
- **Error Handling**: Comprehensive client-side validation with user-friendly error messages
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Accessibility**: Built with accessibility best practices

## Technology Stack

- **React 19.1.1**: Modern React with hooks
- **Material UI**: Complete UI component library
- **React Router**: Client-side routing and navigation
- **localStorage**: Data persistence
- **Custom Logging**: Replaces console.log usage as per requirements

## Project Structure

```
src/
├── components/
│   ├── URLShortener.jsx      # Main URL shortening interface
│   ├── Statistics.jsx        # Analytics and statistics dashboard
│   └── RedirectHandler.jsx   # Handles short URL redirections
├── utils/
│   ├── logger.js            # Custom logging middleware
│   ├── storage.js           # Data persistence layer
│   └── urlUtils.js          # URL validation and utility functions
├── App.jsx                  # Main application component with routing
└── main.jsx                 # Application entry point
```

## Key Features Implementation

### Custom Logging Middleware
- Replaces all `console.log` usage as required
- Stores logs in localStorage for persistence
- Supports different log levels (INFO, WARN, ERROR, DEBUG)
- Automatic log rotation to prevent memory overflow

### Data Models
- **URL Data**: Original URL, shortcode, creation/expiry timestamps, validity period
- **Analytics Data**: Click timestamps, referrer info, location data, user agent
- **Storage Keys**: Organized storage with cleanup functionality

### Security & Validation
- URL format validation with protocol checking
- Shortcode uniqueness validation
- Validity duration limits (1 minute to 24 hours)
- Expired URL cleanup and handling

### Error Handling
- Input validation with real-time feedback
- Collision detection for custom shortcodes
- Expired URL handling with user-friendly messages
- Graceful fallbacks for geolocation and storage errors

## Usage

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Access Application**:
   - Open browser to `http://localhost:5173`
   - Use the URL Shortener page to create shortened URLs
   - View statistics and analytics on the Statistics page

## Compliance

This application follows all Affordmed confidentiality and usage requirements:
- No unauthorized data sharing or tampering
- Exclusive use for project implementation and evaluation
- Compliance with Hyderabad/Secunderabad jurisdiction requirements
- Secure client-side implementation without backend dependencies

## Browser Compatibility

- Modern browsers with ES6+ support
- localStorage support required
- Optional geolocation API for enhanced analytics
- React Router for client-side navigation

## Performance Features

- Automatic cleanup of expired URLs
- Efficient data storage with size limits
- Optimized re-rendering with React hooks
- Responsive design for all screen sizes