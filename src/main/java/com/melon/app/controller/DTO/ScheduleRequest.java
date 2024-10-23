package com.melon.app.controller.DTO;

import java.util.List;

/**
 * The {@code ScheduleRequest} class contains a list of {@code DaySchedule} objects,
 * which will hold the day, start time, end time, and event name for each entry.
 * Spring Boot will automatically map the incoming JSON data to this structure
 * based on the field names.
 */
public class ScheduleRequest {
    private String name;
    private List<DaySchedule> days;

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public List<DaySchedule> getDays() {
        return days;
    }
    public void setDays(List<DaySchedule> days) {
        this.days = days;
    }

    public static class DaySchedule {
        private String day;
        private String startTime;
        private String endTime;
        private String eventName;

        public String getDay() {
            return day;
        }
        public void setDay(String day) {
            this.day = day;
        }
        public String getStartTime() {
            return startTime;
        }
        public void setStartTime(String startTime) {
            this.startTime = startTime;
        }
        public String getEndTime() {
            return endTime;
        }
        public void setEndTime(String endTime) {
            this.endTime = endTime;
        }
        public String getEventName() {
            return eventName;
        }
        public void setEventName(String eventName) {
            this.eventName = eventName;
        }
    }
}