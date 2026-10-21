import React, { useEffect, useState } from 'react';

export function PoliticianAttendanceCard({ politicianId }) {
    const [voteData, setVoteData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAttendance() {
            try {
                const res = await fetch(`/api/politicians/${politicianId}/roll-call-votes`);
                const data = await res.json();
                setVoteData(data);
            } catch (err) {
                console.error("Failed to load roll call votes:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchAttendance();
    }, [politicianId]);

    if (loading) return <div className="animate-pulse h-16 bg-gray-100 rounded-lg"></div>;
    if (!voteData) return null;

    const isHighAbsence = voteData.missedPercentage > 8.0;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">119th Congress Floor Attendance</span>
                <span className={`font-semibold ${isHighAbsence ? 'text-amber-600' : 'text-emerald-600'}`}>
          {voteData.attendancePercentage.toFixed(1)}%
        </span>
            </div>

            <div className="mt-2 text-xs text-gray-500 flex justify-between">
                <span>Voted: {voteData.votesCast} / {voteData.totalVotes}</span>
                <span>Missed: {voteData.missedVotes} ({voteData.missedPercentage.toFixed(1)}%)</span>
            </div>
        </div>
    );
}