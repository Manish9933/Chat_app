import React, { useState, useContext } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";

const LoginPage = () => {
  const { login } = useContext(AuthContext);

  const [state, setState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [step2, setStep2] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (state === "Sign up" && !step2) {
      setStep2(true);
      return;
    }

    login(state === "Sign up" ? "signup" : "login", {
      fullName,
      email,
      password,
      bio,
    });
  };

  return (
    <div className="h-full flex items-center justify-center sm:p-6 md:p-10">
      <div className="w-full h-full sm:h-auto max-w-5xl grid lg:grid-cols-2 bg-white/5 backdrop-blur-2xl sm:rounded-[3rem] sm:border border-white/10 overflow-hidden shadow-2xl shadow-black/50 animate-pop">
        
        {/* Left Side: Branding & Info */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-r border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <img src={assets.logo} className="w-48 object-contain" alt="QuickChat Logo" />
            </div>
            
            <h2 className="text-5xl font-extrabold text-white leading-tight mb-6">
              Connect with the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                Future of Chat.
              </span>
            </h2>
            <p className="text-lg text-white/60 max-w-md leading-relaxed">
              Experience lightning-fast communication with our premium real-time messaging platform. Secure, sleek, and built for you.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xl">✓</div>
              <div>
                <p className="text-white font-medium">Real-time Video Calls</p>
                <p className="text-white/40 text-sm">Crystal clear audio and video sync.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xl">🔒</div>
              <div>
                <p className="text-white font-medium">End-to-End Privacy</p>
                <p className="text-white/40 text-sm">Your conversations are always secure.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-6 md:p-8 lg:p-16 flex flex-col justify-center">
          {/* Logo for Mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src={assets.logo} className="w-44 object-contain" alt="Logo" />
          </div>

          <div className="mb-6 lg:mb-10 text-center lg:text-left">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {state === "Sign up" ? "Create Account" : "Welcome Back"}
            </h3>
            <p className="text-white/70 text-sm md:text-base">
              {state === "Sign up" 
                ? "Join our community and start chatting today." 
                : "Please enter your details to sign in."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {state === "Sign up" && !step2 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 ml-1">Full Name</label>
                <input
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                  placeholder="John Doe"
                  required
                  autoComplete="name"
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            {!step2 && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70 ml-1">Email Address</label>
                  <input
                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                    placeholder="name@example.com"
                    type="email"
                    required
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70 ml-1">Password</label>
                  <input
                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                    placeholder="••••••••"
                    type="password"
                    required
                    autoComplete="current-password"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </>
            )}

            {state === "Sign up" && step2 && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-sm font-medium text-white/70 ml-1">About You</label>
                <textarea
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all placeholder:text-white/20 resize-none"
                  rows="5"
                  placeholder="Tell us a little about yourself..."
                  required
                  onChange={(e) => setBio(e.target.value)}
                ></textarea>
              </div>
            )}

            <button className="w-full py-4.5 mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-violet-900/40 transform active:scale-[0.98] transition-all text-lg">
              {state === "Sign up" 
                ? (step2 ? "Complete Registration" : "Next Step") 
                : "Sign In"}
            </button>



            <p className="text-center text-white/50 text-sm mt-8">
              {state === "Sign up" ? "Already have an account?" : "Don't have an account yet?"}
              <button
                type="button"
                className="ml-2 text-violet-400 font-bold hover:text-violet-300 transition-colors underline-offset-4 hover:underline"
                onClick={() => {
                  setState(state === "Sign up" ? "login" : "Sign up");
                  setStep2(false);
                }}
              >
                {state === "Sign up" ? "Log in" : "Create one"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
