package com.melon.app.controller.DTO;

import com.melon.app.entity.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrganizationMemberDTO {
    private Long userId;
    private String username;
    private String email;
    private Role role;
    private String createdAt;
}
