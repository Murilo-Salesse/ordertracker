package com.foodydeliverytest.ordertracker.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ProblemDetail handleBusinessException(BusinessException ex) {

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(ex.getStatus(), ex.getMessage());
        problemDetail.setTitle("Violação de Regra de Negócio");
        problemDetail.setType(URI.create("https://foodtracker.com/errors/business-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        return problemDetail;
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleResourceNotFoundException(ResourceNotFoundException ex) {

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problemDetail.setTitle("Recurso Não Encontrado");
        problemDetail.setType(URI.create("https://foodtracker.com/errors/not-found"));
        problemDetail.setProperty("timestamp", Instant.now());
        return problemDetail;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidationExceptions(MethodArgumentNotValidException ex) {

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                "Um ou mais campos estão inválidos"
        );
        problemDetail.setTitle("Erro de Validação de Dados");
        problemDetail.setType(URI.create("https://foodtracker.com/errors/validation-error"));
        problemDetail.setProperty("timestamp", Instant.now());

        Map<String, String> invalidFields = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            invalidFields.put(error.getField(), error.getDefaultMessage());
        }
        problemDetail.setProperty("invalidFields", invalidFields);

        return problemDetail;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGeneralException(Exception ex) {

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Ocorreu um erro interno inesperado no servidor."
        );
        problemDetail.setTitle("Erro Interno do Servidor");
        problemDetail.setType(URI.create("https://foodtracker.com/errors/internal-server-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        return problemDetail;
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ProblemDetail handleHttpMessageNotReadable(org.springframework.http.converter.HttpMessageNotReadableException ex) {

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                "Corpo da requisição inválido ou valor de status não reconhecido. Valores aceitos: RECEBIDO, EM_PREPARO, SAIU_PARA_ENTREGA, ENTREGUE, CANCELADO."
        );

        problemDetail.setTitle("Erro de Leitura da Requisição");
        problemDetail.setType(URI.create("https://foodtracker.com/errors/bad-request"));
        problemDetail.setProperty("timestamp", Instant.now());
        return problemDetail;
    }
}