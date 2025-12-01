import React, { useEffect, useState } from "react";
import { Typography } from "@material-tailwind/react";
import { StatisticsCard } from "@/widgets/cards";
import { statisticsCardsData as defaultCardData } from "@/data";

export function Home() {
  const user = JSON.parse(localStorage.getItem("user"));

  // Separate card structure for Admin & Technician
  const adminCards = [...defaultCardData]; // All 4 cards
  const technicianCards = defaultCardData.filter((c, i) => i !== 1); // Remove AMC (index 1)

  // Decide which cards to show
  const initialCards =
    user?.user_code?.startsWith("TC") ? technicianCards : adminCards;

  const [cardData, setCardData] = useState(initialCards);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}api/dashboard.php?user_code=${user.user_code}&id=${user.id}`
        );

        const data = await res.json();
        console.log("Dashboard data:", data);

        if (data.status === "success") {
          const stats = data.data[0];

          const updatedCards = [...initialCards];

          // 🟩 CARD 0 — Today Scheduled Visits
          if (updatedCards[0]) {
            updatedCards[0].value = stats.today_scheduled;
            updatedCards[0].footer.techList = data.visit_assign_data;
          }

          let cardIndex = 1;

          // 🛑 ONLY ADMIN HAS AMC CARD
          if (!user.user_code.startsWith("TC")) {
            if (updatedCards[1]) {
              updatedCards[1].value = stats.active_amc;
              updatedCards[1].footer.value = stats.renew_amc_7_days;
              updatedCards[1].footer.value1 = stats.expired_amc;
            }
            cardIndex = 2; // Next index for admin
          }

          // 🟦 Active Customers
          if (updatedCards[cardIndex]) {
            updatedCards[cardIndex].value = stats.active_customers;
          }

          // 🟪 Monthly Visits
          if (updatedCards[cardIndex + 1]) {
            updatedCards[cardIndex + 1].value = stats.monthly_visits;
          }

          setCardData(updatedCards);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="mt-12">
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">

        {cardData.map((card, index) => (
          <StatisticsCard
            key={card.title}
            {...card}
            title={card.title}
            icon={React.createElement(card.icon, {
              className: "w-6 h-6 text-white",
            })}
            footer={
              <Typography className="font-normal text-blue-gray-600">

                {/* Show Technician Visit List for Card 0 */}
                {index === 0 && card.footer.techList &&
                  card.footer.techList.map((tech, i) => (
                    <p key={i}>
                      <a href={`${import.meta.env.VITE_PAGE_URL}sitevisits/viewschedulevisit`}>
                        <strong className="text-green-500">{tech.technician_name}</strong>
                        {" has "}
                        <span className="text-green-500">{tech.total_visits}</span>
                        {" visits today"}
                      </a>
                    </p>
                  ))}

                {/* Show default footer for other cards */}
                {index !== 0 && (
                  <>
                    {card.footer.value && (
                      <p>
                        <strong className="text-green-500">{card.footer.value}</strong>{" "}
                        {card.footer.label}
                      </p>
                    )}

                    {card.footer.value1 && (
                      <p>
                        <strong className="text-green-500">{card.footer.value1}</strong>{" "}
                        {card.footer.label1}
                      </p>
                    )}
                  </>
                )}
              </Typography>
            }
          />
        ))}

      </div>
    </div>
  );
}

export default Home;
