import { useEffect, useState } from "react";

export default function ScheduleEntryList({ entries, onEntryChange }) {
  // Local state to keep track of modified entries
  const [editedEntries, setEditedEntries] = useState(entries);

  useEffect(() => {
    setEditedEntries(entries);
  }, [entries]);

  const handleEntryChange = (index, field, value) => {
    const updatedEntries = [...editedEntries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value,
    };
    setEditedEntries(updatedEntries);
    onEntryChange(updatedEntries); // Propagate changes to parent
  };

  return (
    <div>
      {editedEntries.map((entry, index) => (
        <div key={entry.id} className="mb-4 p-2 border rounded">
          <label className="block text-sm font-medium">Day:</label>
          <input
            type="text"
            value={entry.eventDay}
            onChange={(e) => handleEntryChange(index, "day", e.target.value)}
            className="w-full px-2 py-1 mb-2 border rounded"
          />

          <label className="block text-sm font-medium">Start Time:</label>
          <input
            type="time"
            value={entry.eventStartTime}
            onChange={(e) =>
              handleEntryChange(index, "startTime", e.target.value)
            }
            className="w-full px-2 py-1 mb-2 border rounded"
          />

          <label className="block text-sm font-medium">End Time:</label>
          <input
            type="time"
            value={entry.eventEndTime}
            onChange={(e) => handleEntryChange(index, "endTime", e.target.value)}
            className="w-full px-2 py-1 mb-2 border rounded"
          />

          <label className="block text-sm font-medium">Name (Optional):</label>
          <input
            type="text"
            value={entry.eventName || ""}
            onChange={(e) => handleEntryChange(index, "name", e.target.value)}
            className="w-full px-2 py-1 mb-2 border rounded"
          />
        </div>
      ))}
    </div>
  );
}
