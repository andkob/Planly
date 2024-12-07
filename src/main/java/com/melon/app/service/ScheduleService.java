package com.melon.app.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.Iterator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.melon.app.controller.DTO.ScheduleRequest;
import com.melon.app.controller.DTO.ScheduleRequest.DaySchedule;
import com.melon.app.controller.DTO.ScheduleResponseDTO;
import com.melon.app.controller.DTO.EntryDTO;
import com.melon.app.entity.Schedule;
import com.melon.app.entity.ScheduleEntry;
import com.melon.app.entity.User;
import com.melon.app.exception.ConflictingSchedulesException;
import com.melon.app.repository.ScheduleRepository;
import com.melon.app.repository.UserRepository;

@Service
public class ScheduleService {
    
    @Autowired
    private ScheduleRepository scheduleRepo;

    @Autowired
    private UserRepository userRepo;

    private List<ScheduleEntry> mapEntries(Schedule parentSchedule, List<DaySchedule> events) {
        List<ScheduleEntry> entries = new ArrayList<>();
        for (DaySchedule event : events) {
            ScheduleEntry entry = new ScheduleEntry();
            entry.setEventDay(event.getDay());
            entry.setEventStartTime(event.getStartTime());
            entry.setEventEndTime(event.getEndTime());
            entry.setEventName(event.getEventName());
            entry.setSchedule(parentSchedule);
            entries.add(entry);
        }
        return entries;
    }

    private void mapEntriesFromEntryDTO(Schedule parentSchedule, List<EntryDTO> newEntries) {
        List<ScheduleEntry> oldEntries = parentSchedule.getEntries();
        Iterator<ScheduleEntry> iter = oldEntries.iterator();
        for (EntryDTO newEntry : newEntries) {
            ScheduleEntry oldEntry = iter.next();
            oldEntry.setEventName(newEntry.getEventName());
            oldEntry.setEventDay(newEntry.getEventDay());
            oldEntry.setEventStartTime(newEntry.getEventStartTime());
            oldEntry.setEventEndTime(newEntry.getEventEndTime());
        }
        // TODO - support deletion
    }

    public Schedule createSchedule(User user, ScheduleRequest scheduleRequest) throws ConflictingSchedulesException {
        // see if a schedule with that name exists
        if (scheduleRepo.findByUserAndScheduleName(user, scheduleRequest.getName()) == null) {
            throw new ConflictingSchedulesException("Schedule with that name already exists.");
        }
        user = userRepo.findById(user.getId()).get(); // load user entity
        Schedule schedule = new Schedule(scheduleRequest.getName(), user);

        List<DaySchedule> events = scheduleRequest.getDays();
        schedule.setEntries(mapEntries(schedule, events));

        return scheduleRepo.save(schedule);
    }

    public Schedule updateScheduleEntries(Long scheduleId, List<EntryDTO> updatedEntries) {
        Optional<Schedule> scheduleToUpdate = scheduleRepo.findById(scheduleId);
        if (scheduleToUpdate.isEmpty()) {
            // idk
            System.out.println("FUCK THERES NO SCHEDULE WTFF");
        }
        Schedule schedule = scheduleToUpdate.get();
        mapEntriesFromEntryDTO(schedule, updatedEntries);

        return scheduleRepo.save(schedule);
    }

    public List<Schedule> getUserSchedules(User user) {
        return scheduleRepo.findByUser(user);
    }

    public List<ScheduleResponseDTO> getUserScheduleEntries(User user) {
        List<Schedule> schedules = scheduleRepo.findByUser(user);

        return schedules.stream()
            .map(schedule -> new ScheduleResponseDTO(
                schedule.getId(),
                schedule.getName(),
                schedule.getEntries().stream()
                    .map(entry -> new EntryDTO(
                        entry.getId(),
                        entry.getEventDay(),
                        entry.getEventStartTime(),
                        entry.getEventEndTime(),
                        entry.getEventName()
                    ))
                    .collect(Collectors.toList())
            ))
            .collect(Collectors.toList());
    }

    public void saveSchedule(ScheduleRequest scheduleRequest) {
        System.out.println("Saving schedule: " + scheduleRequest.getName());
        scheduleRequest.getDays().forEach(day -> {
            System.out.println("Day: " + day.getDay() + ", Start: " + day.getStartTime() + ", End: " + day.getEndTime() + ", Event: " + day.getEventName());
        });
    }

    public int[] getScheduleEntryCountByUser(User user, String scheduleName) throws ConflictingSchedulesException {
        List<Schedule> s = scheduleRepo.findByUserAndScheduleName(user, scheduleName);
        if (s.size() > 1) {
            throw new ConflictingSchedulesException("This case has not been thought about yet");
        } else if (s.size() == 0) {
            throw new ConflictingSchedulesException("Wrong exeption name here but there aint no schedule with that schedule name dawg: " + scheduleName);
        }
        //                       S  M  T  W  Th F  Sa
        int[] entryCountByDay = {0, 0, 0, 0, 0, 0, 0};

        Schedule schedule = s.get(0);
        List<ScheduleEntry> entries = schedule.getEntries();
        for (ScheduleEntry e : entries) {
            String day = e.getEventDay();
            switch (day) {
                case "Sunday":
                    entryCountByDay[0]++;
                    break;
                case "Monday":
                    entryCountByDay[1]++;
                    break;
                case "Tuesday":
                    entryCountByDay[2]++;
                    break;
                case "Wednesday":
                    entryCountByDay[3]++;
                    break;
                case "Thursday":
                    entryCountByDay[4]++;
                    break;
                case "Friday":
                    entryCountByDay[5]++;
                    break;
                case "Saturday":
                    entryCountByDay[6]++;
                    break;
            }
        }
        
        return entryCountByDay;
    }
}
