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
  const [expiredAmcData, setExpiredAmcData] = useState([]);
  const [renewalAmcData, setRenewalAmcData] = useState([]);
  const [showExpiredAmcModal, setShowExpiredAmcModal] = useState(false);
  const [showRenewalAmcModal, setShowRenewalAmcModal] = useState(false);

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
          
          // Store expired AMC data
          if (data.expired_amc_data) {
            setExpiredAmcData(data.expired_amc_data);
          } 
          
          // Store renewal AMC data (expiring in 7 days)
          if (data.expired_amc_in_30_days) {
            setRenewalAmcData(data.expired_amc_in_30_days);
          }

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
              updatedCards[1].footer.value = stats.renew_amc_30_days;
              updatedCards[1].footer.label = "renewals in 30 days";
              updatedCards[1].footer.value1 = stats.expired_amc;
              updatedCards[1].footer.label1 = "expired AMC";
              
              // Add click handlers
              updatedCards[1].footer.onRenewalClick = () => setShowRenewalAmcModal(true);
              updatedCards[1].footer.onExpiredClick = () => setShowExpiredAmcModal(true);
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

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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
                    {card.footer.value !== undefined && (
                      <p>
                        <span 
                          className="text-green-500 font-bold cursor-pointer hover:text-blue-600"
                          onClick={card.footer.onRenewalClick}
                        >
                          {card.footer.value}
                        </span>{" "}
                        <span 
                          className="cursor-pointer hover:text-blue-600"
                          onClick={card.footer.onRenewalClick}
                        >
                          {card.footer.label}
                        </span>
                      </p>
                    )}

                    {card.footer.value1 !== undefined && (
                      <p>
                        <span 
                          className="text-green-500 font-bold cursor-pointer hover:text-blue-600"
                          onClick={card.footer.onExpiredClick}
                        >
                          {card.footer.value1}
                        </span>{" "}
                        <span 
                          className="cursor-pointer hover:text-blue-600"
                          onClick={card.footer.onExpiredClick}
                        >
                          {card.footer.label1}
                        </span>
                      </p>
                    )}
                  </>
                )}
              </Typography>
            }
          />
        ))}

      </div>

      {/* Expired AMC Modal */}
      {showExpiredAmcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50">
          <div className="relative bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] overflow-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="text-xl font-semibold text-gray-900">
                Expired AMC Details ({expiredAmcData.length})
              </h3>
              <button
                onClick={() => setShowExpiredAmcModal(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-[73px]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sr. No.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      AMC ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valid Upto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visits/Month
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expiredAmcData.length > 0 ? (
                    expiredAmcData.map((item, index) => (
                      <tr key={item.amc_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.customer_name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {item.amc_id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.validity_upto)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {item.visits_per_month || 'N/A'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          <a
                            href={`${import.meta.env.VITE_PAGE_URL}amc/addamc?customer_id=${encodeURIComponent(item.customer_id)}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            Renew
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-6 text-center text-sm text-gray-500">
                        No expired AMC records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-4 border-t sticky bottom-0 bg-white">
              <button
                onClick={() => setShowExpiredAmcModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renewal AMC Modal (Expiring in 7 days) */}
      {showRenewalAmcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50">
          <div className="relative bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] overflow-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="text-xl font-semibold text-gray-900">
                AMC Renewals in Next 30 Days ({renewalAmcData.length})
              </h3>
              <button
                onClick={() => setShowRenewalAmcModal(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-[73px]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sr. No.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      AMC ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valid Upto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visits/Month
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {renewalAmcData.length > 0 ? (
                    renewalAmcData.map((item, index) => (
                      <tr key={item.amc_id} className="hover:bg-yellow-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.customer_name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {item.amc_id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.validity_upto)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {item.visits_per_month || 'N/A'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          <a
                            href={`${import.meta.env.VITE_PAGE_URL}amc/addamc?customer_id=${encodeURIComponent(item.customer_id)}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            Renew
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-6 text-center text-sm text-gray-500">
                        No AMC renewals in the next 7 days
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-4 border-t sticky bottom-0 bg-white">
              <button
                onClick={() => setShowRenewalAmcModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;