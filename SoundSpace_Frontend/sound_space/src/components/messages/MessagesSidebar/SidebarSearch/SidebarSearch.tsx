import React from "react";
import { Search } from "lucide-react";
import "./SidebarSearch.css";

interface SidebarSearchProps {
    value: string;
    onChange: (value: string) => void;
}

const SidebarSearch = ({ value, onChange }: SidebarSearchProps) => {
    return (
        <div className="sidebar-search">
            <Search size={16} className="sidebar-search__icon" />
            <input
                type="text"
                placeholder="Search conversations..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="sidebar-search__input"
            />
        </div>
    );
};

export default SidebarSearch;
