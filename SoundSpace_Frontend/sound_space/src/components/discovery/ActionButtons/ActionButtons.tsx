import React from 'react';
import { Heart, X } from 'lucide-react';
import type { ActionButtonsProps } from '@/types/discovery';
import './ActionButtons.css';

export const ActionButtons = ({ onConnect, onSkip }: ActionButtonsProps) => {
    return (
        <div className="action-buttons">
            <button
                type="button"
                className="action-buttons__btn action-buttons__btn--skip"
                onClick={onSkip}
                aria-label="Skip profile"
            >
                <X size={24} />
            </button>
            <button
                type="button"
                className="action-buttons__btn action-buttons__btn--connect"
                onClick={onConnect}
                aria-label="Connect with user"
            >
                <Heart size={24} />
            </button>
        </div>
    );
};

export default ActionButtons;