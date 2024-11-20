package com.melon.app.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.melon.app.entity.UpcomingEvent;

@Repository
public interface UpcomingEventRepository extends JpaRepository<UpcomingEvent, Long> {
    List<UpcomingEvent> findByOrganizationIdOrderByDateAscStartTimeAsc(Long organizationId);
    List<UpcomingEvent> findByDateGreaterThanEqualOrderByDateAscStartTimeAsc(LocalDate date);
    Optional<UpcomingEvent> findByIdAndOrganizationId(Long id, Long organizationId);
}