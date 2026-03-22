import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './Header.css';

interface HeaderProps {
    title: string;
}

const Header = ({ title }: HeaderProps) => {
    return (
        <header className="main-header">
            <Link href="/" className="main-header__left">
                <Image
                    src="/icons/SoundSpaceIcon.png"
                    alt="SoundSpace Logo"
                    width={36}
                    height={36}
                    className="main-header__logo"
                />
                <span className="main-header__title">SoundSpace</span>
            </Link> 
            
            <div className="main-header__center">
                <div className="main-header__search">
                    <svg className="main-header__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" x2="16.65" y1="21" y2="16.65"></line>
                    </svg>
                    <input 
                        type="text" 
                        className="main-header__search-input" 
                        placeholder="Search for songs, artists, posts..." 
                    />
                </div>
            </div>

            <div className="main-header__right">
                {/* Placeholder for header actions */}
            </div>
        </header>
    );
};

export default Header;
