"use client";

import { useEffect, useState } from "react";
import {
  Camera,
  User,
  Loader2,
  Mail,
  MapPin,
  Calendar,
  Lock,
  Globe,
  ArrowRight,
} from "lucide-react";
import { auth, googleProvider } from "@/lib/firebase/firebaseClient";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Bihar",
  "Gujarat",
  "Haryana",
  "Karnataka",
  "Kerala",
  "Maharashtra",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
];

export default function SignupPage() {
  const router = useRouter();

  // 🟢 NEW: State to toggle between Signup and Login
  const [isLoginView, setIsLoginView] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverOtp, setServerOtp] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // OTP STATES
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [pendingPayload, setPendingPayload] = useState<any>(null);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    age: "",
    state: "",
    photo: null as string | null,
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (isSuccess) {
      window.location.reload();
    }
  }, [isSuccess]);

  // --- GOOGLE SIGNUP (Works for both Login & Signup) ---
  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setIsSubmitting(true);
      const user = result.user;
      const token = await user.getIdToken();

      const payload = {
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        firebaseUid: user.uid,
        token,
        age: profile.age || null,
        state: profile.state || "",
        phone: profile.phone || "",
      };

      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) setIsSuccess(true);
      else throw new Error(data.error);
    } catch (error) {
      showToast("Google login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- SIGNUP FLOW (UNCHANGED) ---
  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.photo) {
      showToast("Please upload a profile photo.");
      return;
    }
    setIsSubmitting(true);
    try {
      const otpRes = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email }),
      });
      const otpData = await otpRes.json();
      if (!otpRes.ok) throw new Error("OTP failed");
      setServerOtp(otpData.otp);
      setPendingPayload(profile);
      setShowOtpModal(true);
    } catch (err) {
      showToast("Failed to send OTP. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtpAndSignup = async () => {
    if (!otp) {
      showToast("Please enter OTP.");
      return;
    }
    if (otp !== serverOtp) {
      showToast("Invalid OTP.");
      return;
    }

    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        pendingPayload.email,
        pendingPayload.password,
      );
      const token = await userCredential.user.getIdToken();
      const finalPayload = {
        ...pendingPayload,
        firebaseUid: userCredential.user.uid,
        token,
      };
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      });
      if (!response.ok) throw new Error("Signup failed");
      setShowOtpModal(false);
      setIsSuccess(true);
    } catch (err) {
      showToast("OTP verification failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🟢 NEW: LOGIN FLOW (Placeholder as requested)
  // 🟢 REAL LOGIN LOGIC
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Authenticate with Firebase Client SDK
      const userCredential = await signInWithEmailAndPassword(
        auth,
        profile.email,
        profile.password,
      );

      // 2. Get the Token
      const token = await userCredential.user.getIdToken();

      // 3. Send Token to your new Login API
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // 4. Success!
      setIsSuccess(true);
      // The useEffect will catch 'isSuccess' and reload the page
    } catch (err: any) {
      console.error(err);
      // Firebase throws specific error codes, we can make them readable
      if (err.code === "auth/invalid-credential") {
        showToast("Invalid email or password.");
      } else if (err.code === "auth/user-not-found") {
        showToast("No account found with this email.");
      } else {
        showToast(err.message || "Login failed. Try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses =
    "w-full h-12 px-11 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-400";
  const iconClasses =
    "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-pink-50 via-slate-50 to-violet-50 py-10 px-4 flex flex-col items-center">
      <div className="max-w-md w-full">
        {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs animate-bounce">
            <div className="bg-white border-l-4 border-red-500 shadow-2xl rounded-lg px-4 py-3 flex items-center gap-3">
              <div className="bg-red-100 p-1 rounded-full text-red-600">!</div>
              <p className="text-sm font-bold text-gray-800">{toast}</p>
            </div>
          </div>
        )}

        <form
          // 🟢 Switch submit handler based on View
          onSubmit={isLoginView ? handleLoginSubmit : handleInitialSubmit}
          className="space-y-5 bg-white/80 backdrop-blur-xl p-8 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50"
        >
          <div className="text-center mb-2">
            <h1 className="text-2xl font-black bg-gradient-to-r from-pink-600 to-violet-600 bg-clip-text text-transparent">
              {isLoginView ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {isLoginView
                ? "Enter details to login"
                : "Join our community today"}
            </p>
          </div>

          {/* 🟢 HIDE PHOTO UPLOAD IN LOGIN VIEW */}
          {!isLoginView && (
            <div className="flex justify-center mb-6">
              <label className="relative group cursor-pointer">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center transition-transform group-hover:scale-105">
                  {profile.photo ? (
                    <img
                      src={profile.photo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-300" />
                  )}
                </div>
                <div className="absolute bottom-1 right-1 bg-pink-500 p-2 rounded-full text-white shadow-md group-hover:bg-pink-600 transition-colors">
                  <Camera className="w-4 h-4" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.size <= 2 * 1024 * 1024) {
                      const reader = new FileReader();
                      reader.onload = (ev) =>
                        setProfile({
                          ...profile,
                          photo: ev.target?.result as string,
                        });
                      reader.readAsDataURL(file);
                    } else if (file) {
                      showToast("Image must be under 2MB.");
                    }
                  }}
                />
              </label>
            </div>
          )}

          <div className="space-y-3">
            {/* 🟢 HIDE NAME IN LOGIN VIEW */}
            {!isLoginView && (
              <div className="relative">
                <User className={iconClasses} />
                <input
                  required
                  placeholder="Full Name"
                  className={inputClasses}
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                />
              </div>
            )}

            {/* EMAIL (ALWAYS VISIBLE) */}
            <div className="relative">
              <Mail className={iconClasses} />
              <input
                required
                type="email"
                placeholder="Email Address"
                className={inputClasses}
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
              />
            </div>

            {/* PASSWORD (ALWAYS VISIBLE) */}
            <div className="relative">
              <Lock className={iconClasses} />
              <input
                required
                type="password"
                placeholder="Password"
                className={inputClasses}
                value={profile.password}
                onChange={(e) =>
                  setProfile({ ...profile, password: e.target.value })
                }
              />
            </div>

            {/* 🟢 HIDE AGE & STATE IN LOGIN VIEW */}
            {!isLoginView && (
              <div className="flex gap-3">
                <div className="relative w-1/3">
                  <Calendar className={iconClasses} />
                  <input
                    required
                    type="number"
                    placeholder="Age"
                    className={`${inputClasses} px-11`}
                    value={profile.age}
                    onChange={(e) =>
                      setProfile({ ...profile, age: e.target.value })
                    }
                  />
                </div>

                <div className="relative w-2/3">
                  <Globe className={iconClasses} />
                  <select
                    required
                    className={`${inputClasses} appearance-none`}
                    value={profile.state}
                    onChange={(e) =>
                      setProfile({ ...profile, state: e.target.value })
                    }
                  >
                    <option value="">State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <button
            disabled={isSubmitting}
            type="submit"
            className="group relative w-full h-14 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold shadow-[0_10px_20px_rgba(236,72,153,0.3)] hover:shadow-[0_15px_25px_rgba(236,72,153,0.4)] hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:translate-y-0 flex items-center justify-center overflow-hidden"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin w-6 h-6" />
            ) : (
              <span className="relative z-10 flex items-center gap-2">
                {isLoginView ? "Log In" : "Sign Up with Email"}
              </span>
            )}
            <div className="absolute inset-0 bg-white/10 group-hover:translate-x-full duration-500 transition-transform -skew-x-12 -translate-x-full"></div>
          </button>

          {/* 🟢 TOGGLE BUTTON: SWITCH BETWEEN LOGIN AND SIGNUP */}
          <div className="text-center mt-2">
            <p className="text-sm text-gray-500">
              {isLoginView
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsLoginView(!isLoginView)}
                className="font-bold text-pink-600 hover:text-pink-700 hover:underline transition-all"
              >
                {isLoginView ? "Sign Up" : "Log In"}
              </button>
            </p>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="h-[1px] bg-gray-100 flex-1"></div>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              or continue with
            </span>
            <div className="h-[1px] bg-gray-100 flex-1"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full h-12 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center gap-3 font-bold text-gray-700 transition-all active:scale-95 shadow-sm"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              className="w-5 h-5"
            />
            Google Account
          </button>
        </form>
      </div>

      {/* OTP MODAL (Only shows during signup flow) */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300">
            {/* ... (OTP Modal content remains exactly the same as your previous code) ... */}
            <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Mail className="w-8 h-8 text-pink-500" />
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">
                Verify Email
              </h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                We've sent a 4-digit code to <br />
                <span className="font-semibold text-gray-900">
                  {profile.email}
                </span>
              </p>
            </div>

            <div className="space-y-4">
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 4-digit OTP"
                className={`${inputClasses} px-4 text-center text-xl tracking-[0.5em] font-mono h-14`}
                maxLength={4}
              />

              <button
                onClick={handleVerifyOtpAndSignup}
                disabled={isSubmitting}
                className="w-full h-14 rounded-2xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  "Verify & Continue"
                )}
              </button>

              <button
                onClick={() => setShowOtpModal(false)}
                className="w-full text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
