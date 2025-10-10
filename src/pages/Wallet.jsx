{/* ✅ WhatsApp Redirect Instead of Wallet Route */}
<li
  onClick={() =>
    (window.location.href = "https://wa.me/918449060585?text=" + encodeURIComponent("Hello! I want to know more about deposit/withdrawal."))
  }
  className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-green-100 text-green-700 font-semibold`}
>
  <Wallet className="w-5 h-5" />
  <span>Wallet</span>
</li>
