"use client";

import React from 'react';

interface ParksideLogoProps {
    className?: string;
}

const ParksideLogo: React.FC<ParksideLogoProps> = ({ className }) => {
    return (
        <svg
            viewBox="0 0 450 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={{ width: '100%', height: 'auto', display: 'block' }}
        >
            {/* 1. THE ICON (Left Side) */}
            <g transform="translate(10, 10)">
                {/* Gold 'V' Element (Left Stroke) */}
                <path
                    d="M10 10C15 10 25 35 25 80H35L20 10H10Z"
                    fill="#D4AF37"
                />

                {/* Forest Green 'K' Element (Stem and Arms) */}
                <path
                    d="M25 25V80H35V50L55 80H70L45 45L65 15H52L35 40V25H25Z"
                    fill="#144B36"
                />

                {/* Elegant Gold Swoosh */}
                <path
                    d="M5 75C-5 45 30 5 65 5C90 5 110 30 105 60"
                    stroke="#D4AF37"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                />
            </g>

            {/* 2. THE BRAND TEXT (Right Side) */}
            <g transform="translate(110, 15)" style={{ fontFamily: 'Arial Black, sans-serif', fontWeight: '900' }}>
                <text
                    x="0"
                    y="35"
                    fill="#D4AF37"
                    fontSize="42"
                    letterSpacing="0.01em"
                >
                    PARKSIDE
                </text>
                <text
                    x="0"
                    y="78"
                    fill="#144B36"
                    fontSize="42"
                    letterSpacing="0.01em"
                >
                    VILLA KITUI
                </text>
            </g>
        </svg>
    );
};

export default ParksideLogo;
