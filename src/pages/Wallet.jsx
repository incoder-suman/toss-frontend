export default function Wallet() {
  const handleWhatsAppClick = () => {
    const phoneNumber = "918449060585"; // ✅ WhatsApp ke liye +91 hata ke number
    const message = "Hello! I want to know more about deposit/withdrawal.";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank"); // ✅ naya tab me open karega
  };

  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold mb-2">Deposit / Withdraw</h1>
      <p className="mb-4">Wallet balance aur transactions yaha honge.</p>
      <button
        onClick={handleWhatsAppClick}
        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold"
      >
        Chat on WhatsApp
      </button>
    </div>
  );
}
