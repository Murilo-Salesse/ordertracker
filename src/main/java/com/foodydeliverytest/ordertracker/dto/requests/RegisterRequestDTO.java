package com.foodydeliverytest.ordertracker.dto.requests;

import com.foodydeliverytest.ordertracker.entity.UserEntity;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequestDTO(@NotBlank(message = "O nome é obrigatório")
                                 @Size(min = 2, max = 100, message = "O nome deve ter entre 2 e 100 caracteres")
                                 String name,

                                 @NotBlank(message = "O e-mail é obrigatório")
                                 @Email(message = "E-mail inválido")
                                 String email,

                                 @NotBlank(message = "A senha é obrigatória")
                                 @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
                                 String password) {

    public UserEntity toEntity(String encodedPassword) {
        return new UserEntity(this.name, this.email, encodedPassword, "USER");
    }
}
