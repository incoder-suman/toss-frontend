import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserLayout from "./layout/UserLayout";
import Home from "./pages/Home";
import Bets from "./pages/Bets";
import TossHistory from "./pages/TossHistory";
import Wallet from "./pages/Wallet";
import Rules from "./pages/Rules";
import Login from "./pages/Login";
import { CurrencyProvider } from "./context/CurrencyContext";

export default function App() {
  return (
    <CurrencyProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<UserLayout />}>
            <Route index element={<Home />} />
            <Route path="bets" element={<Bets />} />
            <Route path="history" element={<TossHistory />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="rules" element={<Rules />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CurrencyProvider>
  );
}
