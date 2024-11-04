import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  ArcElement
} from 'chart.js';

import { Bar } from 'react-chartjs-2';
import React, { useState, useEffect } from 'react';

ChartJS.register(
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  ArcElement
);

const WeeklyScheduleChart = ({ entries, scheduleName }) => {
  //                                          S  M  T  W  Th F  Sa
  const [eventData, setEventData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const token = localStorage.getItem("jwtToken");

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await fetch(`api/schedules/get/count/events-per-day?scheduleName=${encodeURIComponent(scheduleName)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setEventData(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchEventData();
  }, [scheduleName, token]); // Dependency array

  const chartData = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        label: 'Events per Day',
        data: eventData,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1.
        },
      },
    },
  };

  return <Bar key={entries.map(entry => entry.id).join('-')} data={chartData} options={options} />;
};

export default WeeklyScheduleChart;
