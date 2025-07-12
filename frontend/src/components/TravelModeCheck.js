import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TravelModeCheck = ({ children }) => {
  const [travelModeActive, setTravelModeActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTravelMode = async () => {
      try {
        // Try to access the health endpoint to check if travel mode is active
        await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/health`);
        setTravelModeActive(false);
      } catch (error) {
        if (error.response?.status === 404) {
          setTravelModeActive(true);
        } else {
          setTravelModeActive(false);
        }
      } finally {
        setLoading(false);
      }
    };

    checkTravelMode();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (travelModeActive) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">Page not found</p>
          <p className="text-gray-500">The page you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default TravelModeCheck;