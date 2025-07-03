import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { CollaborativeDiscoveryProvider } from './context/CollaborativeDiscoveryContext';
import { theme } from './theme';
import { Layout } from './components/common/Layout';
import { LandingPage } from './pages/LandingPage';
import { MobileRedirect } from './pages/MobileRedirect';
import { CreateSession } from './pages/CreateSession';
import { MagicLinkVerify } from './pages/MagicLinkVerify';
import { JoinSession } from './pages/JoinSession';
import { SessionDashboard } from './pages/SessionDashboard';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppProvider>
          <CollaborativeDiscoveryProvider>
            <Router>
              <Routes>
                <Route path="/mobile-redirect" element={<MobileRedirect />} />
                <Route path="/auth/verify" element={<MagicLinkVerify />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<LandingPage />} />
                  <Route path="create-session" element={<CreateSession />} />
                  <Route path="join" element={<JoinSession />} />
                  <Route path="session/:sessionSlug" element={<SessionDashboard />} />
                </Route>
              </Routes>
            </Router>
          </CollaborativeDiscoveryProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
