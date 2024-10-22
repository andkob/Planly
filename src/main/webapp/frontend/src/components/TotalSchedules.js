import React, { useEffect, useState } from 'react';

function TotalSchedules() {
    const [scheduleCount, setScheduleCount] = useState(0); // State to hold the count
    const [recentEntries, setRecentEntries] = useState(0);
    const [loading, setLoading] = useState(true); // State for loading status
    const [error, setError] = useState(null); // State to hold any error messages

    useEffect(() => {
        // Function to fetch the schedule count
        const fetchScheduleCount = async () => {
            try {
                const response = await fetch("/api/schedule/count");
                if (!response.ok) {
                    throw new Error('fetch schedule count response not ok');
                }
                const count = await response.json();
                console.log('schedule count: ', count);
                setScheduleCount(count); // Update the state with the fetched count
            } catch (error) {
                console.error('Error fetching schedule count:', error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        const countRecentEntries = async (timeframe=7) => {
            try {
                const response = await fetch("/api/schedule/recent-entries");
                if (!response.ok) {
                    throw new Error('fetch recent entries response not ok');
                }
                const count = await response.json();
                setRecentEntries(count);
            } catch (error) {
                console.error('Error fetching recent entry count:', error);
            }
        }

        fetchScheduleCount(); // Call the function to fetch data
        countRecentEntries();
    }, []); // Empty dependency array means this effect runs once when the component mounts

    if (loading) {
        return <div className="text-2xl font-bold">...</div>; // Show loading indicator while fetching
    }

    if (error) {
        return <div className="text-2xl font-bold">-999</div>; // Indicate an error
    }

    return (
        <div>
            <div className="text-2xl font-bold">{scheduleCount}</div>
            <p className="text-xs text-gray-500">+{recentEntries} from last week</p>
        </div>
    );
}

export default TotalSchedules;
