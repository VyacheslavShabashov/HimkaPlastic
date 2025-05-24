"use strict";
// Utility functions for authentication and toast notifications
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = exports.Route = exports.Routes = exports.Button = exports.Link = exports.useEffect = exports.useState = exports.useLocation = exports.useNavigate = exports.useQueryClient = exports.useToast = exports.useAuth = void 0;
/**
 * Simple authentication hook
 */
const useAuth = () => ({
    status: "unauthenticated",
    signIn: () => { },
});
exports.useAuth = useAuth;
const useToast = () => ({
    toast: ({ title, description }) => {
        console.log(`${title}: ${description}`);
    },
});
exports.useToast = useToast;
/**
 * Query client utilities
 */
const useQueryClient = () => {
    return {
        invalidateQueries: (queryKey) => {
            console.log(`Invalidating queries: ${queryKey.join(', ')}`);
        },
    };
};
exports.useQueryClient = useQueryClient;
/**
 * Navigation utility
 */
const useNavigate = () => {
    return (path) => {
        console.log(`Navigating to: ${path}`);
    };
};
exports.useNavigate = useNavigate;
/**
 * Location utility
 */
const useLocation = () => {
    return {
        pathname: "/",
    };
};
exports.useLocation = useLocation;
// Mock React hooks and components for development
const useState = (initialState) => {
    return [initialState, (newState) => console.log("State updated", newState)];
};
exports.useState = useState;
const useEffect = (callback, deps) => {
    callback();
};
exports.useEffect = useEffect;
const Link = (props) => props;
exports.Link = Link;
const Button = (props) => props;
exports.Button = Button;
const Routes = (props) => props;
exports.Routes = Routes;
const Route = (props) => props;
exports.Route = Route;
const Router = (props) => props;
exports.Router = Router;
