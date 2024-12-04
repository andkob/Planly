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
import com.melon.app.controller.DTO.ScheduleDTO;
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

    public void updateScheduleEntries(ScheduleDTO newSchedule) {
        Schedule schedule = scheduleRepo.findById(newSchedule.getId())
            .orElseThrow(() -> new RuntimeException("Schedule not found"));
        
        schedule.getEntries().clear();
        
        List<ScheduleEntry> entries = newSchedule.getEntries().stream()
            .map(dto -> {
                ScheduleEntry entry = new ScheduleEntry();
                entry.setEventName(dto.getEventName());
                entry.setEventDay(dto.getEventDay());
                entry.setEventStartTime(dto.getEventStartTime());
                entry.setEventEndTime(dto.getEventEndTime());
                entry.setSchedule(schedule);
                return entry;
            })
            .collect(Collectors.toList());
        
        schedule.getEntries().addAll(entries);
        scheduleRepo.save(schedule);
    }

    public List<Schedule> getUserSchedules(User user) {
        return scheduleRepo.findByUser(user);
    }

    public List<ScheduleDTO> getUserScheduleEntries(User user) {
        List<Schedule> schedules = scheduleRepo.findByUser(user);

        return schedules.stream()
            .map(schedule -> new ScheduleDTO(
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
}
