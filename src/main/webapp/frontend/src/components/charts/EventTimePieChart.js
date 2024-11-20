import { Pie } from 'react-chartjs-2';

const EventTimePieChart = ({ entries }) => {
  const groupedEvents = entries.reduce((acc, entry) => {
    acc[entry.eventName] = (acc[entry.eventName] || 0) + (new Date(entry.eventEndTime) - new Date(entry.eventStartTime)) / 3600000;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(groupedEvents),
    datasets: [
      {
        data: Object.values(groupedEvents),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  return <Pie data={chartData} />;
};

export default EventTimePieChart;