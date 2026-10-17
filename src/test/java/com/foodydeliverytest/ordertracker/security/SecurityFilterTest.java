package com.foodydeliverytest.ordertracker.security;

import com.foodydeliverytest.ordertracker.entity.UserEntity;
import com.foodydeliverytest.ordertracker.repository.UserRepository;
import com.foodydeliverytest.ordertracker.services.TokenService;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SecurityFilterTest {

    @Mock
    private TokenService tokenService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private SecurityFilter securityFilter;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Deve autenticar usuário no SecurityContext quando header Bearer token for válido")
    void shouldAuthenticateWhenBearerTokenIsValid() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer valid-jwt-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        UserEntity user = new UserEntity("Murilo", "murilo@email.com", "hash", "USER");
        when(tokenService.validateTokenAndGetSubject("valid-jwt-token")).thenReturn("murilo@email.com");
        when(userRepository.findByEmail("murilo@email.com")).thenReturn(Optional.of(user));

        securityFilter.doFilterInternal(request, response, filterChain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals(user, SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        verify(filterChain, times(1)).doFilter(request, response);
    }

    @Test
    @DisplayName("Deve seguir a cadeia de filtros sem autenticar quando não houver header Authorization")
    void shouldContinueFilterChainWithoutAuthWhenHeaderIsMissing() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        securityFilter.doFilterInternal(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain, times(1)).doFilter(request, response);
    }
}
