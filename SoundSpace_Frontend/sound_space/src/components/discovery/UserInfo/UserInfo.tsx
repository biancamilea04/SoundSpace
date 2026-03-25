import React from 'react';
import type { UserInfoProps } from '@/types/discovery';
import './UserInfo.css';

export const UserInfo = ({ name, handle, tagline }: UserInfoProps) => {
    return (
        <div className="user-info">
            <div className="user-info__name-row">
                <h2 className="user-info__name">{name}</h2>
                <span className="user-info__handle">@{handle}</span>
            </div>
            <p className="user-info__tagline">{tagline}</p>
        </div>
    );
};

export default UserInfo;