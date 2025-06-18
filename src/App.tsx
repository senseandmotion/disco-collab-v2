import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppProvider } from './context/AppContext';
import { CollaborativeDiscoveryProvider } from './context/CollaborativeDiscoveryContext';
import { theme } from './theme';
import { Layout } from './components/common/Layout';
import { LandingPage } from './pages/LandingPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <CollaborativeDiscoveryProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<LandingPage />} />
                <Route path="create-session" element={<div>Create Session - Coming Soon</div>} />
                <Route path="join-session" element={<div>Join Session - Coming Soon</div>} />
                <Route path="session/:sessionId" element={<div>Session Dashboard - Coming Soon</div>} />
              </Route>
            </Routes>
          </Router>
        </CollaborativeDiscoveryProvider>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
