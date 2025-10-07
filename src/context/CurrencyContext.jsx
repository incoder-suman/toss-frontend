import { createContext, useContext, useState } from "react";

const CurrencyContext = createContext();
export const useCurrency = () => useContext(CurrencyContext);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState("INR");

  const toggleCurrency = () => {
    setCurrency(currency === "INR" ? "USD" : "INR");
  };

  const convert = (amount) => {
    if (currency === "INR") return `₹${amount.toFixed(2)}`;
    return `$${(amount * 0.012).toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
}
