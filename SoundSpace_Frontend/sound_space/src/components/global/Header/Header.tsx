"use client";

import React from 'react';
import './Header.css';
import HeaderBrand from './HeaderBrand/HeaderBrand';
import HeaderSearch from '@/components/global/Header/HeaderSearch/HeaderSearch';

interface HeaderProps {
    title: string;
}

const Header = ({ title }: HeaderProps) => {
    return (
        <header className="main-header" aria-label={title}>
            <HeaderBrand
                href="/"
                logoSrc="/icons/SoundSpaceIcon.png"
                logoAlt="SoundSpace Logo"
                titleText="SoundSpace"
            />

            <HeaderSearch placeholder="Search" />
        </header>
    );
};

export default Header;
