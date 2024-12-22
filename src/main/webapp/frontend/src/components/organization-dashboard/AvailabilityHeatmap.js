import React, { useState, useEffect } from 'react';
import { fetchOrganizationMemberScheduleEntries } from '../../util/EndpointManager';

export default function AvailabilityHeatmap({ orgId }) {
  const [scheduleData, setScheduleData] = useState([]);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

  useEffect(() => {
    fetchOrganizationMemberScheduleEntries(orgId, setScheduleData);
  }, [orgId]);

  const getOverlapCount = (day, hour) => {
    if (!scheduleData || !Array.isArray(scheduleData)) {
      return 0;
    }
  
    return scheduleData.reduce((count, schedule) => {
      if (!schedule.entries || !Array.isArray(schedule.entries)) {
        return count;
      }
  
      const hasOverlap = schedule.entries.some(entry => {
        if (!entry || !entry.eventStartTime || !entry.eventEndTime || !entry.eventDay) {
          return false;
        }
  
        const startHour = parseInt(entry.eventStartTime.split(':')[0]);
        const endHour = parseInt(entry.eventEndTime.split(':')[0]);
  
        if (isNaN(startHour) || isNaN(endHour)) {
          return false;
        }
  
        return entry.eventDay === day &&
               hour >= startHour &&
               hour < endHour;
      });
  
      return count + (hasOverlap ? 1 : 0);
    }, 0);
  };

  const getOpacity = (count) => {
    const maxMembers = Math.max(scheduleData.length, 1);
    return Math.min((count / maxMembers) * 0.9 + 0.1, 1);
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Member Availability</h2>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Time labels */}
          <div className="flex">
            <div className="w-24" /> {/* Spacer for day labels */}
            {hours.map(hour => (
              <div key={hour} className="w-16 text-center text-sm text-gray-600">
                {hour % 12 || 12}{hour >= 12 ? 'PM' : 'AM'}
              </div>
            ))}
          </div>

          {/* Grid */}
          {days.map(day => (
            <div key={day} className="flex">
              <div className="w-24 py-2 text-sm font-medium text-gray-600 flex items-center">
                {day}
              </div>
              {hours.map(hour => {
                const count = getOverlapCount(day, hour);
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="w-16 h-12 border-t border-l first:border-l-0 relative"
                    style={{
                      backgroundColor: `rgba(79, 70, 229, ${getOpacity(count)})`,
                    }}
                  >
                    {count > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                        {count}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-4">
        <span className="text-sm text-gray-600">Available</span>
        <div className="flex gap-1">
          {[0.1, 0.3, 0.5, 0.7, 0.9].map((opacity) => (
            <div
              key={opacity}
              className="w-8 h-4 rounded"
              style={{ backgroundColor: `rgba(79, 70, 229, ${opacity})` }}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">Not Available</span>
      </div>
    </div>
  );
};
