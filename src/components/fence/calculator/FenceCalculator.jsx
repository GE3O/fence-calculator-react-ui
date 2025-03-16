import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container,
  Typography,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { api } from '../../../services/woocommerce.api';

// Fence Calculator Component
const FenceCalculator = () => {
  // Step definitions
  const steps = ['Select Fence Type', 'Configure Sections', 'Review Quote'];
  
  // State variables
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fenceTypes, setFenceTypes] = useState([]);
  const [selectedFenceType, setSelectedFenceType] = useState('');
  const [fenceSections, setFenceSections] = useState([]);
  const [quoteDetails, setQuoteDetails] = useState(null);

  // Load fence types on component mount
  useEffect(() => {
    const loadFenceTypes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch fence categories
        const categories = await api.get('products/categories', {
          parent: 0,
          per_page: 20
        });
        
        // Filter to main fence types
        const mainFenceTypes = categories.filter(cat => 
          cat.name.includes('Fence') && !cat.name.includes('Post') && !cat.name.includes('Panel') && !cat.name.includes('Gate')
        );
        
        setFenceTypes(mainFenceTypes);
      } catch (err) {
        console.error('Error loading fence types:', err);
        setError('Failed to load fence types. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadFenceTypes();
  }, []);

  // Handle fence type selection
  const handleFenceTypeChange = (event) => {
    setSelectedFenceType(event.target.value);
  };

  // Handle next step
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Handle reset
  const handleReset = () => {
    setActiveStep(0);
    setSelectedFenceType('');
    setFenceSections([]);
    setQuoteDetails(null);
  };

  // Render step content based on active step
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Select Fence Type
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="fence-type-select-label">Fence Type</InputLabel>
              <Select
                labelId="fence-type-select-label"
                id="fence-type-select"
                value={selectedFenceType}
                label="Fence Type"
                onChange={handleFenceTypeChange}
                disabled={loading}
              >
                {fenceTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Configure Fence Sections
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This feature will be implemented soon. For now, you can proceed to the next step.
            </Typography>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Quote Summary
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Quote details will be shown here. This feature is coming soon.
            </Typography>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Fence Calculator
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mt: 4, mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {getStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={activeStep === steps.length - 1 ? handleReset : handleNext}
                disabled={activeStep === 0 && !selectedFenceType}
              >
                {activeStep === steps.length - 1 ? 'Start Over' : 'Next'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default FenceCalculator;