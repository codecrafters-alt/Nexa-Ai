import React, { useEffect, useState } from "react";
import { dummyPlans } from "../assets/assets";
import Loading from "./Loading";

const Credits = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    setPlans(dummyPlans);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="w-full h-full min-h-screen overflow-y-auto bg-gradient-to-br from-[#f3eaff]/60 via-[#e9e3f7]/70 to-[#e6e6fa]/80 dark:from-[#1a1026]/70 dark:via-[#2d1a3a]/80 dark:to-[#1a1026]/90 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-4xl font-bold text-center mb-12 tracking-tight text-gray-900 dark:text-white drop-shadow-lg">
        Credit Plans
      </h2>

      <div className="flex flex-wrap justify-center items-center gap-10 w-full mx-auto">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className={`relative  rounded-2xl shadow-xl hover:shadow-2xl transition-shadow p-8 min-w-[300px] max-w-xs flex flex-col backdrop-blur-xl bg-gradient-to-br from-white/10 via-transparent to-transparent dark:bg-[#2d1a3a]/60 glassmorphism-card ${plan._id === "pro" ? " border-2  border-purple-400/60 dark:border-white/30 scale-105 z-10" : "border border-white/30 dark:border-purple-700/40"}`}
            style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)" }}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-tr from-purple-400/80 to-purple-600/80 flex items-center justify-center shadow-lg border-4 border-white/60 dark:border-purple-900/60">
              <span className="text-white text-xl font-bold uppercase tracking-wide drop-shadow-lg">
                {plan.name[0]}
              </span>
            </div>
            <div className="flex-1 mt-8">
              <h3 className="text-2xl font-semibold text-center text-gray-900 dark:text-white mb-2 tracking-tight">
                {plan.name}
              </h3>
              <p className="text-3xl font-extrabold text-center text-purple-700 dark:text-purple-300 mb-4">
                ${plan.price}
                <span className="text-base font-medium text-gray-600 dark:text-purple-200 ml-1">
                  / {plan.credits} credits
                </span>
              </p>
              <ul className="list-none text-sm text-gray-700 dark:text-purple-200 space-y-2 mb-4 px-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-purple-400 rounded-full"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <button className="mt-6 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-2 rounded-xl shadow-lg transition-all duration-200 backdrop-blur-xl">
              Buy Now
            </button>
            {plan._id === "pro" && (
              <span className="absolute top-3 right-3 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-xl">
                Most Popular
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Credits;
