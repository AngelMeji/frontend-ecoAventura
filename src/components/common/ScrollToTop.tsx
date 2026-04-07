import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * 
 * This component automatically scrolls the window to the top (0, 0) 
 * whenever the route (pathname) changes. This is essential for 
 * Single Page Applications (SPAs) where React Router might preserve 
 * the scroll position from the previous view.
 */
const ScrollToTop: React.FC = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Enforce scroll to top on path change
        window.scrollTo(0, 0);
        
        // Ensure browser scrollRestoration doesn't interfere
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
    }, [pathname]);

    return null;
};

export default ScrollToTop;
