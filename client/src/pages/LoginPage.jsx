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
    <div className="min-h-screen flex justify-center items-center gap-8 backdrop-blur-2xl max-sm:flex-col">

      <img src={assets.logo} className="w-[min(30vw,250px)]" />

      <form
        onSubmit={handleSubmit}
        className="border-2 bg-white/10 p-6 rounded-lg text-white w-[320px] flex flex-col gap-6"
      >
        <h2 className="text-2xl font-medium">{state}</h2>

        {!step2 && state === "Sign up" && (
          <input
            className="p-2 rounded bg-gray-900 border"
            placeholder="Full Name"
            required
            autoComplete="full name"
            onChange={(e) => setFullName(e.target.value)}
          />
        )}

        {!step2 && (
          <>
            <input
              className="p-2 rounded bg-gray-900 border"
              placeholder="Email"
              type="email"
              required
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="p-2 rounded bg-gray-900 border"
              placeholder="Password"
              type="password"
              required
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </>
        )}

        {state === "Sign up" && step2 && (
          <textarea
            className="p-2 rounded bg-gray-900 border"
            rows="4"
            placeholder="Enter bio..."
            required
            onChange={(e) => setBio(e.target.value)}
          ></textarea>
        )}

        <button className="bg-gradient-to-r from-purple-400 to-violet-600 p-2 rounded">
          {state === "Sign up" ? "Create Account" : "Login"}
        </button>

        <p className="text-sm text-gray-300">
          {state === "Sign up" ? (
            <>
              Already have account?
              <span
                className="text-violet-400 cursor-pointer"
                onClick={() => {
                  setState("login");
                  setStep2(false);
                }}
              >
                {" "}
                Login
              </span>
            </>
          ) : (
            <>
              Create new account?
              <span
                className="text-violet-400 cursor-pointer"
                onClick={() => {
                  setState("Sign up");
                  setStep2(false);
                }}
              >
                {" "}
                Signup
              </span>
            </>
          )}
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
