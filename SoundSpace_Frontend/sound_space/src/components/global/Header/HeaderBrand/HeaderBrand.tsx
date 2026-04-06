import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './HeaderBrand.css';

interface HeaderBrandProps {
    href: string;
    logoSrc: string;
    logoAlt: string;
    titleText: string;
}

const HeaderBrand = ({ href, logoSrc, logoAlt, titleText }: HeaderBrandProps) => {
    return (
        <Link href={href} className="main-header__left">
            <Image
                src={logoSrc}
                alt={logoAlt}
                width={36}
                height={36}
                className="main-header__logo"
            />
            <span className="main-header__title">{titleText}</span>
        </Link>
    );
};

export default HeaderBrand;
