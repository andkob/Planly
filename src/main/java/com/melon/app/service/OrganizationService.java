package com.melon.app.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.melon.app.entity.Organization;
import com.melon.app.entity.OrganizationMembership;
import com.melon.app.entity.Role;
import com.melon.app.entity.UpcomingEvent;
import com.melon.app.entity.User;
import com.melon.app.exception.CannotJoinOwnedOrgException;
import com.melon.app.exception.CannotRemoveOwnerException;
import com.melon.app.exception.InvalidIdException;
import com.melon.app.exception.OrganizationDoesNotExistException;
import com.melon.app.exception.OrganizationException;
import com.melon.app.exception.UserNotInOrganizationException;
import com.melon.app.repository.OrganizationRepository;
import com.melon.app.repository.UpcomingEventRepository;
import com.melon.app.repository.UserRepository;

@Service
public class OrganizationService {
    
    @Autowired
    private OrganizationRepository orgRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private UpcomingEventRepository eventRepo;

    public String removeMember(Long orgId, Long userId) {
        Organization org = orgRepo.findById(orgId)
            .orElseThrow(() -> new OrganizationDoesNotExistException("Organization not found"));
        
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new UserNotInOrganizationException("User not found"));

        String username = user.getUsername();
        
        // Find the membership
        Optional<OrganizationMembership> membershipOpt = org.getMemberships().stream()
            .filter(m -> m.getUser().getId().equals(userId))
            .findFirst();

        if (membershipOpt.isEmpty()) {
            throw new UserNotInOrganizationException("User is not a member of this organization");
        }
        
        // Check if trying to remove an owner
        OrganizationMembership membership = membershipOpt.get();
        if (membership.getRole() == Role.OWNER) {
            throw new CannotRemoveOwnerException("Cannot remove the owner of the organization");
        }

        org.removeUser(user);
        orgRepo.save(org);
        userRepo.save(user);

        return username;
    }

    @Transactional // keeps the Hibernate session open throughout the method execution
    public boolean joinOrganization(User user, String orgId) {
        if (!orgId.matches("\\d+")) {
            throw new InvalidIdException("Invalid ID format: " + orgId);
        }

        Long oId = Long.parseLong(orgId);
        
        // Fetch fresh instances from the database
        User freshUser = userRepo.findById(user.getId())
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        Organization org = orgRepo.findById(oId)
            .orElseThrow(() -> new OrganizationDoesNotExistException("No org with the ID " + oId + " to join"));

        // Check if user owns the organization
        if (org.getOwner() != null && org.getOwner().getId().equals(freshUser.getId())) {
            throw new CannotJoinOwnedOrgException("You own this organization");
        }

        // Check if membership already exists
        boolean membershipExists = org.getMemberships().stream()
            .anyMatch(membership -> membership.getUser().getId().equals(freshUser.getId()));

        if (membershipExists) {
            throw new OrganizationException("You are already associated with " + org.getName());
        }

        // Create new membership
        OrganizationMembership membership = new OrganizationMembership(freshUser, org, Role.MEMBER);
        org.getMemberships().add(membership);
        freshUser.getOrganizationMemberships().add(membership);

        // Save both entities
        orgRepo.save(org);
        userRepo.save(freshUser);

        return true;
    }

    public Organization createNewOrganization(String orgName) {
        Organization newOrg = new Organization(orgName);
        return orgRepo.save(newOrg);
    }

    @Transactional
    public Organization createNewOwnedOrganization(String orgName, User owner) {
        owner = userRepo.findById(owner.getId()).get();
        Organization newOrg = new Organization(orgName, owner);
        newOrg.addUser(owner, Role.OWNER); // add creator as the org owner
        return orgRepo.save(newOrg);
    }

    public List<Organization> findOrganizationsByOwner(User owner) {
        List<Organization> ownedOrgs = orgRepo.findByOwner(owner);
        return ownedOrgs;
    }

    public Organization findOrgById(Long id) {
        Optional<Organization> matchingOrg = orgRepo.findById(id);
        if (!matchingOrg.isPresent()) {
            throw new OrganizationDoesNotExistException("No organization with that ID exists");
        }
        return matchingOrg.get();
    }

    public List<Organization> findOrgsByName(String orgName) {
        List<Organization> foundOrganizations = orgRepo.findByOrganizationName(orgName);
        return foundOrganizations;
    }

    public void addEventToOrganization(Long orgId, UpcomingEvent event) {
        Organization org = orgRepo.findById(orgId)
            .orElseThrow(() -> new OrganizationDoesNotExistException("Organization not found"));
        
        org.addEvent(event);
        orgRepo.save(org);
    }

    public List<UpcomingEvent> getUpcomingEvents(Long orgId) {
        return eventRepo.findByOrganizationIdOrderByDateAscStartTimeAsc(orgId);
    }

    public List<User> getUsers(Long orgId) {
        return userRepo.findUsersByOrganizationId(orgId);
    }

    public List<OrganizationMembership> getMembers(Long orgId) {
        return orgRepo.findMembershipsByOrganizationId(orgId);
    }
}
