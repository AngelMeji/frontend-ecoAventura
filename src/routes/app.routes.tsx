import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '../components/layout/AuthLayout';
import MainLayout from '../components/layout/MainLayout';

// Views - Auth
import Login from '../views/auth/Login.view';
import Register from '../views/auth/Register.view';
import ForgotPassword from '../views/auth/ForgotPassword.view';
import ResetPassword from '../views/auth/ResetPassword.view';

// Views - Main
import Profile from '../views/Profile.view';
import Home from '../views/home/Home.view';
import PlaceDetail from '../views/places/PlaceDetail.view';
import PlaceForm from '../views/places/PlaceForm.view';
import Dashboard from '../views/Dashboard.view';
import PartnerRequestsView from '../views/admin/PartnerRequests.view';
import PartnerRequest from '../views/partner/PartnerRequest.view';

// Views - Legal
import AboutUs from '../views/legal/AboutUs.view';
import Terms from '../views/legal/Terms.view';
import Privacy from '../views/legal/Privacy.view';
import Cookies from '../views/legal/Cookies.view';

export const appRoutes: RouteObject[] = [
    {
        path: '/',
        element: <Navigate to="/home" replace />
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
            },
            {
                path: '/dashboard',
                element: <Dashboard />
            },
            {
                path: '/admin/partner-requests',
                element: <PartnerRequestsView />
            },
            {
                path: '/places/new',
                element: <PlaceForm />
            },
            {
                path: '/places/:id/edit',
                element: <PlaceForm />
            },
            {
                path: '/admin/places/new',
                element: <Navigate to="/places/new" replace />
            },
            {
                path: '/admin/places/:id/edit',
                element: <Navigate to="/places/:id/edit" replace />
            },
            {
                path: '/about-us',
                element: <AboutUs />
            },
            {
                path: '/terms',
                element: <Terms />
            },
            {
                path: '/privacy',
                element: <Privacy />
            },
            {
                path: '/cookies',
                element: <Cookies />
            },
            {
                path: '/partner-request',
                element: <PartnerRequest />
            }
        ]
    }
];
