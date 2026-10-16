package com.foodydeliverytest.ordertracker.services;

import com.foodydeliverytest.ordertracker.dto.requests.LoginRequestDTO;
import com.foodydeliverytest.ordertracker.dto.requests.RegisterRequestDTO;
import com.foodydeliverytest.ordertracker.dto.responses.AuthResponseDTO;
import com.foodydeliverytest.ordertracker.entity.UserEntity;
import com.foodydeliverytest.ordertracker.exception.BusinessException;
import com.foodydeliverytest.ordertracker.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, TokenService tokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("Já existe um usuário cadastrado com este e-mail.", HttpStatus.CONFLICT);
        }

        String encodedPassword = passwordEncoder.encode(request.password());
        UserEntity newUser = new UserEntity(request.name(), request.email(), encodedPassword, "USER");
        UserEntity savedUser = userRepository.save(newUser);
        String token = tokenService.generateToken(savedUser);

        return AuthResponseDTO.toResponse(savedUser, token);
    }

    @Transactional
    public AuthResponseDTO login(LoginRequestDTO request) {
        UserEntity user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException("E-mail ou senha inválidos.", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BusinessException("E-mail ou senha inválidos.", HttpStatus.UNAUTHORIZED);
        }

        String token = tokenService.generateToken(user);
        return AuthResponseDTO.toResponse(user, token);
    }
}
