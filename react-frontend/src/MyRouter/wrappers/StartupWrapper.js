import { useEffect } from 'react';
import { connect } from 'react-redux';

const StartupWrapper = (props) => {

    useEffect(() => {
        // Check if there's a stored token before attempting re-authentication
        const hasStoredToken = localStorage.getItem('feathers-jwt') || 
                              localStorage.getItem('user') ||
                              sessionStorage.getItem('feathers-jwt');
        
        if (hasStoredToken) {
            // Only attempt re-authentication if we have a stored token
            props.reAuth().catch((error) => {
                console.log('Re-authentication failed:', error);
                // Don't clear tokens here - let the reAuth function handle it
                // The reAuth function will clear tokens if needed
            });
        } else {
            console.log('No stored authentication token found, skipping re-authentication');
        }
    }, []);

    return null;
};

const mapState = (state) => {
    const { isLoggedIn, user } = state.auth;
    return { isLoggedIn, user };
};
const mapDispatch = (dispatch) => ({
    reAuth: () => dispatch.auth.reAuth()
});

export default connect(mapState, mapDispatch)(StartupWrapper);
