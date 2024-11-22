package com.melon.app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.melon.app.entity.Organization;
import com.melon.app.entity.User;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    List<Organization> findByOrganizationName(String organizationName);
    List<Organization> findByOwner(User owner);
    long countByOwner(User owner);
}
