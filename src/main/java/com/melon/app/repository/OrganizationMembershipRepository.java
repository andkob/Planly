package com.melon.app.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.melon.app.entity.OrganizationMembership;
import com.melon.app.entity.OrganizationMembershipId;

@Repository
public interface OrganizationMembershipRepository extends JpaRepository<OrganizationMembership, OrganizationMembershipId> {
    Optional<OrganizationMembership> findByOrganizationIdAndUserId(Long orgId, Long userId);
    void deleteByOrganizationIdAndUserId(Long orgId, Long userId);
}
