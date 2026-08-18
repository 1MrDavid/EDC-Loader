package com.edc.api.service;

import com.edc.api.client.DolarApiClient;
import com.edc.api.dto.external.DolarActualApiDTO;
import com.edc.api.dto.external.DolarHistoricoApiDTO;
import com.edc.api.model.ValorDolar;
import com.edc.api.repository.ValorDolarRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class ValorDolarSyncService {

    private final DolarApiClient dolarApiClient;
    private final ValorDolarRepository valorDolarRepository;

    /**
     * TAREA 1: Se ejecuta automáticamente al arrancar la aplicación.
     * Busca los datos históricos y rellena todos los días (incluyendo fines de semana)
     * usando el valor del siguiente día hábil.
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void sincronizarHistoricoAlArrancar() {
        log.info("Iniciando sincronización histórica del valor del dólar BCV...");
        try {
            List<DolarHistoricoApiDTO> historico = dolarApiClient.obtenerHistoricoDolares();
            TreeMap<LocalDate, Double> mapaTasas = new TreeMap<>();

            // 1. Cargar todas las tasas de la API a partir de 2025 en un mapa ordenado
            for (DolarHistoricoApiDTO dto : historico) {
                LocalDate fecha = LocalDate.parse(dto.fecha());
                if (fecha.getYear() >= 2025) {
                    mapaTasas.put(fecha, dto.promedio());
                }
            }

            if (mapaTasas.isEmpty()) return;

            int registrosNuevos = 0;
            LocalDate fechaActual = LocalDate.of(2025, 1, 1);
            LocalDate hoy = LocalDate.now();

            // 2. Recorrer día por día sin dejar un solo hueco
            while (!fechaActual.isAfter(hoy)) {
                // ceilingEntry busca la fecha. Si no existe, avanza hasta encontrar el siguiente día hábil
                Map.Entry<LocalDate, Double> entradaSiguiente = mapaTasas.ceilingEntry(fechaActual);
                
                Double precio = null;
                if (entradaSiguiente != null) {
                    precio = entradaSiguiente.getValue();
                } else {
                    // Si llegamos al límite y no hay día siguiente, tomamos el último valor conocido (floor)
                    Map.Entry<LocalDate, Double> entradaAnterior = mapaTasas.floorEntry(fechaActual);
                    if (entradaAnterior != null) {
                        precio = entradaAnterior.getValue();
                    }
                }

                if (precio != null) {
                    boolean guardado = procesarYGuardar(fechaActual, precio);
                    if (guardado) registrosNuevos++;
                }
                
                fechaActual = fechaActual.plusDays(1);
            }
            
            log.info("Sincronización histórica completada. Se añadieron {} registros nuevos.", registrosNuevos);
        } catch (Exception e) {
            log.error("Error al sincronizar el histórico del dólar: {}", e.getMessage());
        }
    }

    /**
     * TAREA 2: Tarea programada (Cron).
     * Se ejecuta todos los días a las 09:00, 13:00 y 17:30.
     */
    @Scheduled(cron = "0 0/30 9,13,17 * * *")
    @Transactional
    public void sincronizarDolarActual() {
        log.info("Consultando valor actual del dólar BCV...");
        try {
            DolarActualApiDTO actual = dolarApiClient.obtenerDolarActual();
            
            // Ignoramos la fecha interna de la API para garantizar que tu sistema 
            // no deje huecos si se enciende un sábado o domingo.
            LocalDate hoy = LocalDate.now();

            if (hoy.getYear() >= 2025) {
                boolean guardado = procesarYGuardar(hoy, actual.promedio());
                if (guardado) {
                    log.info("Nuevo valor del dólar registrado para hoy: Bs. {}", actual.promedio());
                }
            }
        } catch (Exception e) {
            log.error("Error consultando el dólar actual: {}", e.getMessage());
        }
    }

    /**
     * Método auxiliar para evitar duplicidad de código.
     * Retorna true si se insertó, false si ya existía.
     */
    private boolean procesarYGuardar(LocalDate date, Double precio) {
        if (precio == null) return false;

        Integer fechaInt = date.getYear() * 10000 + date.getMonthValue() * 100 + date.getDayOfMonth();

        if (valorDolarRepository.existsByFecha(fechaInt)) {
            return false;
        }

        ValorDolar nuevoRegistro = new ValorDolar();
        nuevoRegistro.setFecha(fechaInt);
        nuevoRegistro.setAno(date.getYear());
        nuevoRegistro.setMes(date.getMonthValue());
        nuevoRegistro.setDia(date.getDayOfMonth());
        nuevoRegistro.setPrecio(precio);

        valorDolarRepository.save(nuevoRegistro);
        return true;
    }
}