package com.edc.api.dto;

import java.time.LocalDateTime;

public record ErrorResponseDTO(
        String message,
        LocalDateTime timestamp
)
{
}
