import {LucideIcon} from "lucide-react";

interface SidebarItemProps {
    icon: LucideIcon;
    label: string;
    path: string;
    badge?: string | number;
}

export default SidebarItemProps;