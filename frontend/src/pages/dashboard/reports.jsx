import React, { useState, useMemo } from "react";
import { ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";

// Dummy AMC Data
const AMC_DATA = [
    { id: 1, customer_name: "Amiah Pruitt", customer_phone: "9988776655", technician_name: "John", visit_date: "2025-11-12", visit_time: "9:59 AM" },
    { id: 2, customer_name: "Lawson Bass", customer_phone: "8877665544", technician_name: "Daniel", visit_date: "2025-11-14", visit_time: "10:15 AM" },
    { id: 3, customer_name: "Ariana Lang", customer_phone: "7766554433", technician_name: "Michael", visit_date: "2025-11-13", visit_time: "9:59 AM" },
    { id: 4, customer_name: "Selina Boyer", customer_phone: "6655443322", technician_name: "Ravi", visit_date: "2025-11-15", visit_time: "1:30 PM" },
    { id: 5, customer_name: "Angelique Morse", customer_phone: "5544332211", technician_name: "Sameer", visit_date: "2025-11-16", visit_time: "11:20 AM" },
];

// Dummy Observation Data
const OBSERVATION_DATA = [
    { id: 3, customer_name: "Ariana Lang", customer_phone: "7766554433", technician_name: "Michael", visit_date: "2025-11-13", visit_time: "9:59 AM" },
    { id: 4, customer_name: "Selina Boyer", customer_phone: "6655443322", technician_name: "Ravi", visit_date: "2025-11-15", visit_time: "1:30 PM" },
    { id: 5, customer_name: "Angelique Morse", customer_phone: "5544332211", technician_name: "Sameer", visit_date: "2025-11-16", visit_time: "11:20 AM" },
];

// Dummy Site Data
const SITE_DATA = [
    { id: 5, customer_name: "Angelique Morse", customer_phone: "5544332211", technician_name: "Sameer", visit_date: "2025-11-16", visit_time: "11:20 AM" },
    { id: 6, customer_name: "Harsh Patel", customer_phone: "9988001122", technician_name: "Rina", visit_date: "2025-11-18", visit_time: "3:35 PM" },
];

export default function ReportTable() {
    const [selectedReport, setSelectedReport] = useState("AMC Report");
    const [searchQuery, setSearchQuery] = useState("");

    // Sorting State
    const [sortColumn, setSortColumn] = useState(null);
    const [sortOrder, setSortOrder] = useState("asc");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Choose dataset
    const selectedData =
        selectedReport === "AMC Report"
            ? AMC_DATA
            : selectedReport === "Observation Report"
                ? OBSERVATION_DATA
                : SITE_DATA;

    // Search
    const filteredUsers = selectedData.filter((user) =>
        user.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sorting Logic
    const sortedUsers = useMemo(() => {
        if (!sortColumn) return filteredUsers;

        return [...filteredUsers].sort((a, b) => {
            const valA = a[sortColumn].toString().toLowerCase();
            const valB = b[sortColumn].toString().toLowerCase();

            if (sortOrder === "asc") return valA > valB ? 1 : -1;
            return valA < valB ? 1 : -1;
        });
    }, [filteredUsers, sortColumn, sortOrder]);

    // Pagination Logic
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = sortedUsers.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(sortedUsers.length / rowsPerPage);

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortOrder("asc");
        }
    };

    const SortIcon = ({ column }) => {
        if (sortColumn !== column) return <ArrowUpDown className="inline w-4 h-4 ml-1" />;
        return sortOrder === "asc" ? (
            <ChevronUp className="inline w-4 h-4 ml-1" />
        ) : (
            <ChevronDown className="inline w-4 h-4 ml-1" />
        );
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
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
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
                            onChange={(e) => {
                                setSelectedReport(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm shadow-sm focus:ring-2 focus:ring-blue-400 mt-6"
                        >
                            <option value="AMC Report">AMC Report</option>
                            <option value="Observation Report">Observation Report</option>
                            <option value="Site Reports">Site Reports</option>
                        </select>

                        {/* Start Date */}
                        <div>
                            <label className="text-xs text-gray-500">Start Date</label>
                            <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-1" />
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="text-xs text-gray-500">End Date</label>
                            <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-1" />
                        </div>

                        <div className="flex items-end">
                            <button className="btn-primary">Submit</button>
                        </div>

                    </div>
                </div>

                {/* TABLE */}
                <div className="p-6">


                    {currentRows.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No users found</div>
                    ) : (
                        <>

                            {/* DESKTOP TABLE */}
                            <div className="overflow-x-auto hidden lg:block">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b">

                                            <th className="w-[15%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer" onClick={() => handleSort("customer_name")}>
                                                Customer Name <SortIcon column="customer_name" />
                                            </th>

                                            <th className="w-[15%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer" onClick={() => handleSort("customer_phone")}>
                                                Phone <SortIcon column="customer_phone" />
                                            </th>

                                            <th className="w-[15%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer" onClick={() => handleSort("technician_name")}>
                                                Technician <SortIcon column="technician_name" />
                                            </th>

                                            <th className="w-[15%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer" onClick={() => handleSort("visit_date")}>
                                                Visit Date <SortIcon column="visit_date" />
                                            </th>

                                            <th className="w-[15%] py-4 px-4 font-medium text-gray-700 text-left cursor-pointer" onClick={() => handleSort("visit_time")}>
                                                Visit Time <SortIcon column="visit_time" />
                                            </th>

                                        </tr>
                                    </thead>

                                    <tbody>
                                        {currentRows.map((user) => (
                                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                                <td className="py-4 px-4">{user.customer_name}</td>
                                                <td className="py-4 px-4">{user.customer_phone}</td>
                                                <td className="py-4 px-4">{user.technician_name}</td>
                                                <td className="py-4 px-4">{user.visit_date}</td>
                                                <td className="py-4 px-4">{user.visit_time}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* MOBILE CARDS */}
                            <div className="block lg:hidden space-y-4">
                                {currentRows.map((user) => (
                                    <div key={user.id} className="p-4 border rounded-xl shadow bg-white">
                                        <h2 className="text-lg font-semibold">{user.customer_name}</h2>
                                        <p className="text-gray-600">{user.customer_phone}</p>
                                        <div className="mt-3 text-sm">
                                            <p><strong>Technician:</strong> {user.technician_name}</p>
                                            <p><strong>Date:</strong> {user.visit_date}</p>
                                            <p><strong>Time:</strong> {user.visit_time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                           
                            {/* PAGINATION*/}
                            <div className="flex flex-col lg:flex-row justify-between items-center mt-6 gap-4">

                                {/* Rows Per Page (LEFT aligned under first column) */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Rows per page:</span>
                                    <select
                                        value={rowsPerPage}
                                        onChange={(e) => {
                                            setRowsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="border p-2 rounded"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>

                                {/* Pagination (CENTER / RIGHT depending on screen) */}
                                <div className="flex justify-center items-center gap-3">

                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                        className="px-3 py-1 border rounded disabled:opacity-50"
                                    >
                                        Prev
                                    </button>

                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : ""
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                        className="px-3 py-1 border rounded disabled:opacity-50"
                                    >
                                        Next
                                    </button>

                                </div>
                            </div>

                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
