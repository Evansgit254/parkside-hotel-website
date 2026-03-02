"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Currency = "KES" | "USD";

interface CurrencyContextType {
    currency: Currency;
    toggleCurrency: () => void;
    formatPrice: (priceInput: string | number) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
    currency: "KES",
    toggleCurrency: () => { },
    formatPrice: (price) => `KES ${price}`,
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
    const [currency, setCurrency] = useState<Currency>("KES");
    const EXCHANGE_RATE = 128; // Updated for current KES/USD parity

    // Hydrate from localStorage if available
    useEffect(() => {
        const saved = localStorage.getItem("preferredCurrency") as Currency;
        if (saved && (saved === "KES" || saved === "USD")) {
            setCurrency(saved);
        }
    }, []);

    const toggleCurrency = () => {
        const newCurrency = currency === "USD" ? "KES" : "USD";
        setCurrency(newCurrency);
        localStorage.setItem("preferredCurrency", newCurrency);
    };

    const formatPrice = (priceInput: string | number) => {
        const kesPrice = typeof priceInput === "string" ? parseFloat(priceInput.replace(/[^0-9.]/g, '')) : priceInput;
        if (isNaN(kesPrice)) return typeof priceInput === "string" ? priceInput : "";

        if (currency === "KES") {
            return `KES ${kesPrice.toLocaleString()}`;
        } else {
            return `$${(kesPrice / EXCHANGE_RATE).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
        }
    };

    return (
        <CurrencyContext.Provider value={{ currency, toggleCurrency, formatPrice }}>
            {children}
        </CurrencyContext.Provider>
    );
};
