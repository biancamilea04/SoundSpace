import { usePathname } from 'next/navigation';

interface UseActiveSidebarReturn {
    isActive: (path: string) => boolean;
}

export const useActiveSidebar = (): UseActiveSidebarReturn => {
    const pathname = usePathname();

    const isActive = (path: string): boolean => {
        // Handle exact matches for root path
        if (path === '/' && pathname === '/') {
            return true;
        }

        // For non-root paths, check if current path starts with the menu item path
        // This handles nested routes like /discovery/profile, /messages/chat/123, etc.
        if (path !== '/' && pathname.startsWith(path)) {
            return true;
        }

        // Handle special cases where the root path should match certain pages
        // For example, if you have a home page at '/' that should be active for landing
        if (path === '/' && (pathname === '/home' || pathname === '/dashboard')) {
            return true;
        }

        return false;
    };

    return {
        isActive
    };
};

export default useActiveSidebar;