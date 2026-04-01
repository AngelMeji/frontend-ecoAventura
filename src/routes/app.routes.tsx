import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '../components/layout/AuthLayout';
import MainLayout from '../components/layout/MainLayout';

// Views
import Login from '../views/auth/Login.view';
import Register from '../views/auth/Register.view';
import ForgotPassword from '../views/auth/ForgotPassword.view';
import ResetPassword from '../views/auth/ResetPassword.view';
import Profile from '../views/Profile.view';
import Home from '../views/home/Home.view';
import PlaceDetail from '../views/places/PlaceDetail.view';

export const appRoutes: RouteObject[] = [
    {
        path: '/',
        element: <Navigate to="/home" replace /> // Redirect to Home in this branch
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
        path: '/reset-password',
        element: (
            <AuthLayout>
                <ResetPassword />
            </AuthLayout>
        )
    },
    {
        element: <MainLayout />,
        children: [
            {
                path: '/home',
                element: <Home />
            },
            {
                path: '/place/:id',
                element: <PlaceDetail />
            },
            {
                path: '/profile',
                element: <Profile />
            }
        ]
    }
];
