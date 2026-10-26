package com.edc.api.repository;

import com.edc.api.model.PagoDeuda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PagoDeudaRepository extends JpaRepository<PagoDeuda, Long> {

    boolean existsByDeudaIdAndFechaPagoBetween(Long deudaId, LocalDate inicio, LocalDate fin);

    List<PagoDeuda> findByDeudaId(Long deudaId);

    List<PagoDeuda> findByFechaPagoBetween(LocalDate inicio, LocalDate fin);

    Optional<PagoDeuda> findByRegistroBotId(Long registroBotId);

    Optional<PagoDeuda> findByMovimientoId(Long movimientoId);

    Optional<PagoDeuda> findByMovimientoAhorroId(Long movimientoAhorroId);

    void deleteByRegistroBotIdAndOrigen(Long registroBotId, String origen);
}
