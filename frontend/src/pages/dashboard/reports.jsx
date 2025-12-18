import React, { useState, useEffect } from "react";

export default function ReportTable() {
    const [selectedReport, setSelectedReport] = useState("Client Performance");
    const [searchQuery, setSearchQuery] = useState("");
    const user = JSON.parse(localStorage.getItem("user"));
    const user_id = user?.id;
    const [formData, setFormData] = useState({

    });
    // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    const [startDate, setStartDate] = useState(getTodayDate());
    const [endDate, setEndDate] = useState(getTodayDate());

    const handleSubmit = async () => {
        try {
            const params = new URLSearchParams({
            user_id: user_id,
            report_type: selectedReport,
            start_date: startDate,
            end_date: endDate,
            });

            const response = await fetch(
            `${import.meta.env.VITE_API_URL}api/reports.php?${params.toString()}`
            );

            const result = await response.json();
            console.log("API Response:", result);
        } catch (error) {
            console.error("Error fetching report:", error);
        }
    };



    return (
        <div className="w-full min-h-screen bg-gray-100 mt-10">
            <div className="mx-auto bg-white rounded-2xl shadow-xl p-6">

                {/* HEADER */}
                <div className="px-6 py-5 border-b">

                    {/* Title + Search */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 w-full">

                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800">Manage Reports</h2>
                            <p className="text-gray-600 text-sm">Select & view report data</p>
                        </div>

                        <div className="relative w-full sm:w-64 mt-4 sm:mt-0">
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg text-gray-700 text-sm shadow-sm focus:ring-2 focus:ring-blue-400"
                            />

                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                        <select
                            value={selectedReport}
                            onChange={(e) => setSelectedReport(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm shadow-sm focus:ring-2 focus:ring-blue-400 mt-6"
                        >
                            <option value="Client Performance">Client Performance</option>
                            <option value="RAW Material">RAW Material</option>
                        </select>

                        {/* Start Date */}
                        <div>
                            <label className="text-xs text-gray-500">Start Date</label>
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-1" 
                            />
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="text-xs text-gray-500">End Date</label>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-1" 
                            />
                        </div>

                        <div className="flex items-end">
                            <button 
                                onClick={handleSubmit}
                                className="btn-primary "
                            >
                                Submit
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}