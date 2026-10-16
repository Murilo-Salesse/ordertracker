package com.foodydeliverytest.ordertracker.dto.responses;

import com.foodydeliverytest.ordertracker.entity.UserEntity;

public record AuthResponseDTO(String token,
                              String name,
                              String email) {

    public static AuthResponseDTO toResponse(UserEntity user, String token) {
        return new AuthResponseDTO(token, user.getName(), user.getEmail());
    }

}
