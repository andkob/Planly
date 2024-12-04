import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function ScheduleEntryList({ entries, onEntryChange }) {
  const [editedEntries, setEditedEntries] = useState(entries || []);

  useEffect(() => {
    setEditedEntries(entries || []);
  }, [entries]);

  const handleEntryChange = (index, field, value) => {
    const updatedEntries = [...editedEntries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value,
    };
    setEditedEntries(updatedEntries);
    onEntryChange(updatedEntries);
  };

  const addNewEntry = () => {
    const newEntry = {
      id: Date.now(), // Temporary ID for new entries
      eventDay: "",
      eventStartTime: "",
      eventEndTime: "",
      eventName: ""
    };
    const updatedEntries = [...editedEntries, newEntry];
    setEditedEntries(updatedEntries);
    onEntryChange(updatedEntries);
  };

  const deleteEntry = (index) => {
    const updatedEntries = editedEntries.filter((_, i) => i !== index);
    setEditedEntries(updatedEntries);
    onEntryChange(updatedEntries);
  };

  return (
    <div className="space-y-4">
      {(!editedEntries || editedEntries.length === 0) ? (
        <div className="p-4 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
          No schedule entries found. Click "Add Entry" to create one.
        </div>
      ) : (
        editedEntries.map((entry, index) => (
          <div 
            key={entry.id || index} 
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex justify-end mb-2">
              <button
                onClick={() => deleteEntry(index)}
                className="text-red-600 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                aria-label="Delete entry"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day
                </label>
                <input
                  type="text"
                  value={entry.eventDay || ""}
                  onChange={(e) => handleEntryChange(index, "eventDay", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter day"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={entry.eventStartTime || ""}
                  onChange={(e) => handleEntryChange(index, "eventStartTime", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={entry.eventEndTime || ""}
                  onChange={(e) => handleEntryChange(index, "eventEndTime", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={entry.eventName || ""}
                  onChange={(e) => handleEntryChange(index, "eventName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter event name"
                />
              </div>
            </div>
          </div>
        ))
      )}
      <div className="flex mb-4">
        <button
          onClick={addNewEntry}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </button>
      </div>
    </div>
  );
}