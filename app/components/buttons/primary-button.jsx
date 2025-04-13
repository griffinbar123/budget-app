// app/components/buttons/primary-button.jsx
'use client';

import React from 'react';

function PrimaryButton({ children, onClick, className, ...props }) {
    const combinedClassName = `bg-accent-primary hover:bg-accent-primary/90 text-text-primary font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${className || ''}`;

    return (
        <button
            onClick={onClick}
            className={combinedClassName}
            {...props} // Pass through other props (e.g., type, disabled)
        >
            {children}
        </button>
    );
}

export default PrimaryButton;