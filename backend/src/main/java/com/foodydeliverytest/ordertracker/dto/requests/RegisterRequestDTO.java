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
                                 @Size(max = 150, message = "O e-mail deve ter no máximo 150 caracteres")
                                 String email,

                                 @NotBlank(message = "A senha é obrigatória")
                                 @Size(min = 6, max = 72, message = "A senha deve ter entre 6 e 72 caracteres")
                                 String password) {

    public UserEntity toEntity(String encodedPassword) {
        return new UserEntity(this.name.trim(), this.email.trim().toLowerCase(), encodedPassword, "USER");
    }
}
