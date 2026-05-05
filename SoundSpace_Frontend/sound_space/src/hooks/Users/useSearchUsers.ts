import { useQuery } from '@tanstack/react-query';
import { searchUsers } from '@/services/user/userService';
import { UserSearchResultDto } from '@/types/user';

export function useSearchUsers(searchQuery: string) {
    return useQuery<UserSearchResultDto[]>({
        queryKey: ['users', 'search', searchQuery],
        queryFn: () => searchUsers(searchQuery),
        enabled: searchQuery.trim().length >= 2,
        staleTime: 15_000,
    });
}
