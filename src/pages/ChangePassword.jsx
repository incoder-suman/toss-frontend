import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Lock, ShieldCheck } from "lucide-react";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword)
      return toast.error("Please fill all fields!");

    if (newPassword !== confirmPassword)
      return toast.error("New passwords do not match!");

    setLoading(true);
    try {
      const res = await api.put("/auth/change-password", {
        oldPassword,
        newPassword,
      });
      toast.success(res.data.message || "Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gradient-to-br from-cyan-100 via-white to-cyan-200">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/70 backdrop-blur-xl border border-cyan-200 shadow-xl rounded-2xl w-full max-w-md p-8"
      >
        <div className="flex items-center justify-center mb-5">
          <div className="bg-cyan-600 p-3 rounded-full text-white shadow-md">
            <Lock size={28} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-cyan-700 mb-2">
          Change Password
        </h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          Keep your account secure by updating your password regularly.
        </p>

        <form onSubmit={handleChange} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Old Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
              className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-md transition-all font-semibold disabled:opacity-50 shadow-md"
          >
            <ShieldCheck size={18} />
            {loading ? "Updating..." : "Update Password"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
