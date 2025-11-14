import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import DevLogin from './pages/DevLogin';
import Dashboard from './pages/Dashboard';
import Proposals from './pages/Proposals';
import FundCycles from './pages/FundCycles';
import Items from './pages/Items';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import AuthCallback from './pages/AuthCallback';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/common/ProtectedRoute';
import Users from './pages/Users';
// import DepartmentReports from './pages/DepartmentReports';

function App() {
  const { user, isLoading } = useAuth();
  const isDevelopment = import.meta.env.MODE === 'development';

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className='App'>
      <Routes>
        {/* Public routes */}
        <Route
          path='/login'
          element={
            user ? (
              <Navigate to='/' />
            ) : isDevelopment ? (
              <DevLogin />
            ) : (
              <Login />
            )
          }
        />
        <Route path='/auth/callback' element={<AuthCallback />} />

        {/* Protected routes */}
        <Route
          path='/'
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path='proposals' element={<Proposals />} />
          <Route
            path='cycles'
            element={
              <ProtectedRoute roles={['coordinator', 'admin']}>
                <FundCycles />
              </ProtectedRoute>
            }
          />
          <Route
            path='items'
            element={
              <ProtectedRoute roles={['coordinator', 'admin']}>
                <Items />
              </ProtectedRoute>
            }
          />
          <Route
            path='reports'
            element={
              <ProtectedRoute roles={['coordinator', 'admin']}>
                <Reports />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path='department-reports'
            element={
              <ProtectedRoute roles={['coordinator', 'admin']}>
                <DepartmentReports />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path='users'
            element={
              <ProtectedRoute roles={['admin']}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route path='profile' element={<Profile />} />
        </Route>

        {/* Catch all */}
        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </div>
  );
}

export default App;
