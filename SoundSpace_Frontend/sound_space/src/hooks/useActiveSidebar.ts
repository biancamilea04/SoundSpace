import { usePathname } from 'next/navigation';

interface UseActiveSidebarReturn {
    isActive: (path: string) => boolean;
}

export const useActiveSidebar = (): UseActiveSidebarReturn => {
    const pathname = usePathname();

    const isActive = (path: string): boolean => {
        if (path === '/' && pathname === '/') {
            return true;
        }

        if (path !== '/' && pathname.startsWith(path)) {
            return true;
        }

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