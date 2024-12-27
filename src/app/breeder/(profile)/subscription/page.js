"use client";

import { useState } from "react";
import Image from "next/image";
import BreederProfileLeft from "../../../../components/BreederProfileLeft";
import BreederProtectedRoute from "@/src/app/context/BreederProtectedRoute";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import BASE_URL from "@/src/app/utils/constant";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE);

const Subscription = () => {
  const [activePlan, setActivePlan] = useState("free");

  const handleSubmit = async (plan) => {
    const user_id = localStorage.getItem("breeder_user_id");

    const payload = {
      user_id: user_id,
      sub_id: plan.sub_id,
      price: parseInt(plan.price),
      sub_plan: plan.sub_plan,
      name: plan.name,
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/payment`, payload);

      if (response.data.url) {
        console.log(response.data.message);
        window.location.href = response.data.url;
      } else {
        console.error("No URL in the response for redirection.");
      }
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
    }
  };

  const handleCardClick = (planName) => {
    setActivePlan(planName);
  };

  const breederData = {
    page: "subscription",
  };

  const plans = [
    {
      name: "free",
      price: "0",
      description: "First 6 posts are free",
      description_1: "It was popularised in the 1960s with the release of Letraset sheets.",
      description_2: "Lorem Ipsum passages, and more recently with desktop.",
      sub_id: 1,
      sub_plan: 1,
    },
    {
      name: "silver",
      price: "20",
      description: "Pay $20 per post",
      description_1: "It was popularised in the 1960s with the release of Letraset sheets.",
      description_2: "Lorem Ipsum passages, and more recently with desktop.",
      sub_id: 2,
      sub_plan: 2,
    },
    {
      name: "gold",
      price: "150",
      description: "$150/year for 12 posts, One-time annual fee",
      description_1: "It was popularised in the 1960s with the release of Letraset sheets.",
      description_2: "Lorem Ipsum passages, and more recently with desktop.",
      sub_id: 3,
      sub_plan: 3,
    },
    {
      name: "platinum",
      price: "480",
      description: "Unlimited posting $40/month, Minimum 1-year",
      description_1: "It was popularised in the 1960s with the release of Letraset sheets.",
      description_2: "Lorem Ipsum passages, and more recently with desktop.",
      sub_id: 4,
      sub_plan: 4,
    },
  ];

  const selectedPlan = plans.find((plan) => plan.name === activePlan);

  return (
    <BreederProtectedRoute>
      <div className="breedeerdasboard-profile-wrap">
        <div className="container">
          <div className="col-lg-12">
            <div className="breedeerdasboard-profile-inner">
              <BreederProfileLeft data={breederData} />
              <div className="breedeerdasboard-subscription-right">
                <h1>Available Subscription Plans</h1>
                <div className="subscription-payment-wrap">
                  {plans.map((plan, index) => (
                    <div
                      key={index} style={{cursor: 'pointer'}}
                      className={`subscription-payment-box ${
                        activePlan === plan.name ? "active" : ""
                      }`}
                      onClick={() => handleCardClick(plan.name)}
                    >
                      <div className="header-subscription">
                        <span>
                          {plan.name.charAt(0).toUpperCase() + plan.name.slice(1)}
                        </span>
                        <h2>${plan.price}</h2>
                        <span>Month</span>
                        {plan.name === "free" && (
                          <div className="active-band">
                            <Image
                              src="/images/Nextpet-imgs/dashboard-imgs/active.png"
                              alt="Active Plan"
                              width={75}
                              height={75}
                            />
                          </div>
                        )}
                      </div>
                      <div className="content-subscription">
                        {[plan.description, plan.description_1, plan.description_2].map((desc, idx) => (
                          <div className="inner-subscription" key={idx}>
                            <Image
                              src="/images/Nextpet-imgs/dashboard-imgs/check.png"
                              alt="Check"
                              width={15}
                              height={15}
                            />
                            <p>{desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="subscription-btn-wrap">
                  {selectedPlan && activePlan !== "free" && (
                    <button
                      type="button"
                      onClick={() => handleSubmit(selectedPlan)}
                    >
                      Upgrade Plan
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Elements stripe={stripePromise}/>
    </BreederProtectedRoute>
  );
};

export default Subscription;
