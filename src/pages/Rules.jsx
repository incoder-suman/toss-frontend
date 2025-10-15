import { CircleDollarSign, Clock, Coins, Info, ShieldCheck, Zap } from "lucide-react";

export default function Rules() {
  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-6 sm:p-8 mt-6 border border-gray-200">
      <h1 className="text-3xl font-extrabold text-center text-blue-600 mb-6">
        ⚖️ Game Rules
      </h1>

      <ul className="space-y-6">
        {/* 1️⃣ First Option */}
        <li className="flex items-start gap-3">
          <Coins className="text-yellow-500 w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h2 className="font-semibold text-lg text-gray-800">Betting Limits & Rate</h2>
            <p className="text-gray-600 mt-1">
              Minimum Bet: <span className="font-semibold text-gray-900">₹50</span> <br />
              Maximum Bet: <span className="font-semibold text-gray-900">Unlimited</span> <br />
              Toss Rate: <span className="font-semibold text-green-600">1.98×</span>
            </p>
          </div>
        </li>

        {/* 2️⃣ Second Option */}
        <li className="flex items-start gap-3">
          <CircleDollarSign className="text-green-500 w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h2 className="font-semibold text-lg text-gray-800">Deposit Rule</h2>
            <p className="text-gray-600 mt-1">
              You need to <span className="font-semibold">deposit first</span>.  
              Please contact admin or ask for <span className="font-semibold text-blue-600">payment details</span> before placing bets.
            </p>
          </div>
        </li>

        {/* 3️⃣ Third Option */}
        <li className="flex items-start gap-3">
          <Zap className="text-orange-500 w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h2 className="font-semibold text-lg text-gray-800">Live Toss Condition</h2>
            <p className="text-gray-600 mt-1">
              Once the <span className="font-semibold">toss is open</span> and the toss is done,  
              all bets placed after that moment are <span className="text-red-600 font-semibold">invalid</span>.
            </p>
          </div>
        </li>

        {/* 4️⃣ Fourth Option */}
        <li className="flex items-start gap-3">
          <Clock className="text-indigo-500 w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h2 className="font-semibold text-lg text-gray-800">Settlement Time</h2>
            <p className="text-gray-600 mt-1">
              All match settlements will be completed within 
              <span className="font-semibold text-gray-900"> 10 minutes</span> after toss result.
            </p>
          </div>
        </li>

        {/* 5️⃣ Fifth Option */}
        <li className="flex items-start gap-3">
          <ShieldCheck className="text-purple-500 w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h2 className="font-semibold text-lg text-gray-800">Withdrawal Policy</h2>
            <p className="text-gray-600 mt-1">
              Withdrawals are allowed <span className="font-semibold text-gray-900">once per day</span> at any time.  
              Please ensure wallet verification before requesting withdrawal.
            </p>
          </div>
        </li>
      </ul>

      <p className="text-xs text-gray-400 text-center mt-8">
        © {new Date().getFullYear()} TossBook — Play Responsibly.  
      </p>
    </div>
  );
}
