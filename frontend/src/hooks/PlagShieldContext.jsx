import React, { createContext, useContext } from 'react';
import { usePlagShieldDashboard } from './usePlagShieldDashboard';

const PlagShieldContext = createContext(null);

export const PlagShieldProvider = ({ children }) => {
  const dashboardState = usePlagShieldDashboard();

  return (
    <PlagShieldContext.Provider value={dashboardState}>
      {children}
    </PlagShieldContext.Provider>
  );
};

export const usePlagShield = () => {
  const context = useContext(PlagShieldContext);
  if (!context) {
    throw new Error('usePlagShield must be used within a PlagShieldProvider');
  }
  return context;
};
