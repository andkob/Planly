package com.melon.app.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.melon.app.entity.Schedule;
import com.melon.app.service.GoogleSheetsService;
import com.melon.app.service.objects.FormUpdateResponse;

@RestController
@RequestMapping("/api")
public class ScheduleController {

    private final GoogleSheetsService googleSheetsService;

    @Autowired
    public ScheduleController(GoogleSheetsService googleSheetsService) {
        this.googleSheetsService = googleSheetsService;
    }

    @GetMapping("/schedule/fetch")
    public List<List<Object>> getScheduleData(@RequestParam(value = "sheetID") String spreadsheetID) throws IOException {
        System.out.println("getSchedule endpoint reached");
        return googleSheetsService.getDataFromSheet(spreadsheetID, "A1:Z");
    }

    @GetMapping("/schedule/fetch-store")
    public Schedule fetchAndStoreScheduleData(@RequestParam(value = "sheetID") String spreadsheetID) throws IOException {
        System.out.println("Store schedule endpoint reached");
        Schedule schedule = new Schedule(); // initialize with empty schedule to avoid possible related errors
        try {
            schedule = googleSheetsService.convertToSchedule(googleSheetsService.getDataFromSheet(spreadsheetID, "A1:Z"), "testSchedule", spreadsheetID);
            System.out.println("Success");
        } catch (IOException e) {
            System.out.println("FAIL");
            throw new IOException("Error fetching/storing schedule data");
        }
        return schedule;
    }

    @GetMapping("/schedule/count")
    public long getScheduleCount() {
        return googleSheetsService.countSchedules();
    }

    @GetMapping("/schedule/recent-entries")
    public int getRecentScheduleEntries() {
        return googleSheetsService.countRecentEntries();
    }

    @GetMapping("/poll-updates")
    public ResponseEntity<FormUpdateResponse> pollForUpdates(@RequestParam(value = "sheetID") String spreadsheetID,
                                                            @RequestParam(value = "lastKnownCount", defaultValue = "0") int lastKnownCount
                                                            ) throws IOException {
        return googleSheetsService.pollForUpdates(spreadsheetID, lastKnownCount);
    }

    @GetMapping("/testResponse")
    public String testResponse() {
        return "/testResponse endpoint reached";
    }
}