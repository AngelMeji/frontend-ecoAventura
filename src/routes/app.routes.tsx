import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '../components/layout/AuthLayout';
import MainLayout from '../components/layout/MainLayout';

// Vistas requeridas por HU001
import Login from '../views/auth/Login.view';
import Register from '../views/auth/Register.view';
import ForgotPassword from '../views/auth/ForgotPassword.view';
// Importamos también el perfil (HU001)
import Profile from '../views/Profile.view';

export const appRoutes: RouteObject[] = [
    {
        path: '/',
        element: <Navigate to="/login" replace />
    },
    {
        path: '/login',
        element: (
            <AuthLayout>
                <Login />
            </AuthLayout>
        )
    },
    {
        path: '/register',
        element: (
            <AuthLayout>
                <Register />
            </AuthLayout>
        )
    },
    {
        path: '/forgot-password',
        element: (
            <AuthLayout>
                <ForgotPassword />
            </AuthLayout>
        )
    },
    {
        element: <MainLayout />,
        children: [
            {
                path: '/profile',
                element: <Profile />
            }
        ]
    }
];
