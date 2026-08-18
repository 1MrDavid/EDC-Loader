package com.edc.api.client;

import com.edc.api.dto.external.DolarActualApiDTO;
import com.edc.api.dto.external.DolarHistoricoApiDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "dolarApi", url = "https://ve.dolarapi.com/v1")
public interface DolarApiClient {

    @GetMapping("/dolares/oficial")
    DolarActualApiDTO obtenerDolarActual();

    @GetMapping("/historicos/dolares/oficial")
    List<DolarHistoricoApiDTO> obtenerHistoricoDolares();
}