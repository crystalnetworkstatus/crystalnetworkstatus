import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

// Main App component
const App = () => {
  const TARGET_URL = 'http://crystaltierlist.kozow.com/';
  const SERVICE_ID = 'crystaltierlist-website';
  const SERVICE_NAME = 'Crystal Tierlist Website';

  // Define initial service state
  const initialService = {
    id: SERVICE_ID,
    name: SERVICE_NAME,
    status: 'checking', // Initial status while checking
    message: 'Checking status...',
  };

  const [service, setService] = useState(() => {
    const savedService = localStorage.getItem('statusPageService');
    return savedService ? JSON.parse(savedService) : initialService;
  });

  const [lastChecked, setLastChecked] = useState(() => {
    const savedTimestamp = localStorage.getItem('statusPageLastChecked');
    return savedTimestamp || 'Never';
  });

  // Function to perform the automatic website status check
  const checkWebsiteStatus = useCallback(async () => {
    console.log(`Attempting to check status for: ${TARGET_URL}`);
    setService(prev => ({
      ...prev,
      status: 'checking',
      message: 'Checking status...',
    }));
    setLastChecked(new Date().toLocaleString());

    try {
      // Use 'no-cors' mode to prevent browser from blocking the request entirely
      // However, 'no-cors' means we cannot read the response status or body.
      // We can only infer success/failure based on whether the fetch promise resolves or rejects.
      const response = await fetch(TARGET_URL, { mode: 'no-cors' });

      // In 'no-cors' mode, response.ok will always be false and status will be 0.
      // We primarily rely on the fetch promise resolving (no network error)
      // to indicate that the site is reachable.
      // If it reaches here, it means a network connection was established.
      setService(prev => ({
        ...prev,
        status: 'operational',
        message: 'Website is reachable.',
      }));
      console.log('Website check: Operational (reachable)');

    } catch (error) {
      // This catch block handles network errors (e.g., DNS error, connection refused)
      // or other fundamental fetch failures.
      console.error('Website check failed:', error);
      setService(prev => ({
        ...prev,
        status: 'major_outage',
        message: `This site can't be reached or a network error occurred. (${error.message || 'Unknown error'})`,
      }));
      console.log('Website check: Major Outage (unreachable)');
    }
  }, [TARGET_URL]);

  // Load service and timestamp from localStorage on initial render
  useEffect(() => {
    const savedService = localStorage.getItem('statusPageService');
    const savedTimestamp = localStorage.getItem('statusPageLastChecked');
    if (savedService) {
      setService(JSON.parse(savedService));
    }
    if (savedTimestamp) {
      setLastChecked(savedTimestamp);
    }

    // Initial check on load
    checkWebsiteStatus();

    // Set up interval for periodic checks (e.g., every 5 minutes)
    const intervalId = setInterval(checkWebsiteStatus, 5 * 60 * 1000); // 5 minutes

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [checkWebsiteStatus]); // Re-run effect if checkWebsiteStatus changes

  // Save service and timestamp to localStorage whenever service state changes
  useEffect(() => {
    localStorage.setItem('statusPageService', JSON.stringify(service));
    localStorage.setItem('statusPageLastChecked', lastChecked);
  }, [service, lastChecked]);

  // Determine overall status (only one service here, so it's the service's status)
  const getOverallStatus = () => {
    switch (service.status) {
      case 'operational':
        return { text: 'All Systems Operational', color: 'bg-green-500' };
      case 'degraded':
        return { text: 'Degraded Performance', color: 'bg-yellow-500' };
      case 'partial_outage':
        return { text: 'Partial Outage', color: 'bg-orange-500' };
      case 'major_outage':
        return { text: 'Major Outage', color: 'bg-red-500' };
      case 'checking':
        return { text: 'Checking Status...', color: 'bg-blue-500' };
      default:
        return { text: 'Unknown Status', color: 'bg-gray-500' };
    }
  };

  const overallStatus = getOverallStatus();

  // Get status icon and color based on status string
  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="text-yellow-500" />;
      case 'partial_outage':
        return <XCircle className="text-orange-500" />;
      case 'major_outage':
        return <XCircle className="text-red-500" />;
      case 'checking':
        return <RefreshCw className="text-blue-500 animate-spin" />;
      default:
        return <CheckCircle className="text-gray-500" />;
    }
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'operational':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'partial_outage':
        return 'text-orange-600';
      case 'major_outage':
        return 'text-red-600';
      case 'checking':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-inter antialiased flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="w-full max-w-4xl bg-white shadow-lg rounded-xl p-6 mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          System Status
        </h1>
        <p className="text-gray-600 text-lg">
          Status of {TARGET_URL}
        </p>
      </header>

      {/* Overall Status Indicator */}
      <div className={`w-full max-w-4xl ${overallStatus.color} text-white py-4 px-6 rounded-xl shadow-md mb-8 text-center`}>
        <h2 className="text-2xl font-bold">{overallStatus.text}</h2>
      </div>

      {/* Service Details */}
      <main className="w-full max-w-4xl bg-white shadow-lg rounded-xl p-6 mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">
          Service Component
        </h3>
        <div className="space-y-6">
          <div className="flex items-start p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex-shrink-0 mt-1 mr-4">
              {getStatusIcon(service.status)}
            </div>
            <div className="flex-grow">
              <h4 className="text-xl font-semibold text-gray-900 mb-1">{service.name}</h4>
              <p className={`text-lg font-medium ${getStatusColorClass(service.status)} mb-2`}>
                {service.status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
              </p>
              <p className="text-gray-700 text-base">{service.message}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer and Re-check Button */}
      <footer className="w-full max-w-4xl flex flex-col sm:flex-row justify-between items-center bg-white shadow-lg rounded-xl p-6">
        <p className="text-gray-500 text-sm mb-4 sm:mb-0">
          Last Checked: {lastChecked}
        </p>
        <div className="flex space-x-4">
            <button
                onClick={checkWebsiteStatus}
                className="flex items-center px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition duration-300 ease-in-out"
            >
                <RefreshCw className="w-5 h-5 mr-2" />
                Re-check Now
            </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
