package com.melon.app.controller.DTO;

import com.melon.app.entity.Organization;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrganizationDTO {
    private Long id;
    private String name;
    
    public OrganizationDTO(Organization org) {
        this.id = org.getId();
        this.name = org.getOrganizationName();
    }
}
