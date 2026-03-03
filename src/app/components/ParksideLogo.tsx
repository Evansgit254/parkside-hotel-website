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
                {/* Purple 'V' Element (Left Stroke) */}
                <path
                    d="M10 10C15 10 25 35 25 80H35L20 10H10Z"
                    fill="#6C2479"
                />

                {/* Green 'K' Element (Stem and Arms) */}
                <path
                    d="M25 25V80H35V50L55 80H70L45 45L65 15H52L35 40V25H25Z"
                    fill="#00713D"
                />

                {/* Elegant Purple Swoosh */}
                <path
                    d="M5 75C-5 45 30 5 65 5C90 5 110 30 105 60"
                    stroke="#6C2479"
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
                    fill="#6C2479"
                    fontSize="42"
                    letterSpacing="0.01em"
                >
                    PARKSIDE
                </text>
                <text
                    x="0"
                    y="78"
                    fill="#00713D"
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
