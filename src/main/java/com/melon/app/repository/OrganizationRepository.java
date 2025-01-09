package com.melon.app.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.melon.app.entity.Organization;
import com.melon.app.entity.OrganizationMembership;
import com.melon.app.entity.User;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    List<Organization> findByOrganizationName(String organizationName);
    List<Organization> findByOwner(User owner);
    long countByOwner(User owner);

    @Query("SELECT m FROM OrganizationMembership m WHERE m.organization.id = :orgId")
    List<OrganizationMembership> findMembershipsByOrganizationId(@Param("orgId") Long orgId);

    // Load memberships along with the organization
    @Query("SELECT o FROM Organization o LEFT JOIN FETCH o.memberships m LEFT JOIN FETCH m.user WHERE o.id = :orgId")
    Optional<Organization> findByIdWithMemberships(@Param("orgId") Long orgId);
}
