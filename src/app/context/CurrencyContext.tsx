"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Currency = "KES" | "USD";

interface CurrencyContextType {
    currency: Currency;
    toggleCurrency: () => void;
    formatPrice: (priceInput: string | number) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
    currency: "USD",
    toggleCurrency: () => { },
    formatPrice: (price) => `$${price}`,
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
    const [currency, setCurrency] = useState<Currency>("USD");
    const EXCHANGE_RATE = 135; // Example: 1 USD = 135 KES

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
        const usdPrice = typeof priceInput === "string" ? parseFloat(priceInput.replace(/[^0-9.]/g, '')) : priceInput;
        if (isNaN(usdPrice)) return typeof priceInput === "string" ? priceInput : "";
        if (currency === "USD") {
            return `$${usdPrice.toLocaleString()}`;
        } else {
            return `KES ${(usdPrice * EXCHANGE_RATE).toLocaleString()}`;
        }
    };

    return (
        <CurrencyContext.Provider value={{ currency, toggleCurrency, formatPrice }}>
            {children}
        </CurrencyContext.Provider>
    );
};
