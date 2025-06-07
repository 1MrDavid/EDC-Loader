package com.edc.api.model;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "finanzas")
public class Finanzas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int diaadd;
    private int mesadd;
    private int anoadd;

    private LocalTime horaadd;

    private String fechavalor;
    private String fechaefec;
    private String referencia;
    private String descripcion;

    private Double egreso;
    private Double ingreso;
    private Double saldo;

    private Double ingresodolar;
    private Double egresodolar;
    private Double saldodolar;
    private Double tasadolar;

    private String categoria;

    // Getters y Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getDiaadd() { return diaadd; }
    public void setDiaadd(int diaadd) { this.diaadd = diaadd; }

    public int getMesadd() { return mesadd; }
    public void setMesadd(int mesadd) { this.mesadd = mesadd; }

    public int getAnoadd() { return anoadd; }
    public void setAnoadd(int anoadd) { this.anoadd = anoadd; }

    public LocalTime getHoraadd() { return horaadd; }
    public void setHoraadd(LocalTime horaadd) { this.horaadd = horaadd; }

    public String getFechavalor() { return fechavalor; }
    public void setFechavalor(String fechavalor) { this.fechavalor = fechavalor; }

    public String getFechaefec() { return fechaefec; }
    public void setFechaefec(String fechaefec) { this.fechaefec = fechaefec; }

    public String getReferencia() { return referencia; }
    public void setReferencia(String referencia) { this.referencia = referencia; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Double getEgreso() { return egreso; }
    public void setEgreso(Double egreso) { this.egreso = egreso; }

    public Double getIngreso() { return ingreso; }
    public void setIngreso(Double ingreso) { this.ingreso = ingreso; }

    public Double getSaldo() { return saldo; }
    public void setSaldo(Double saldo) { this.saldo = saldo; }

    public Double getegresodolar() { return egresodolar; }
    public void setegresodolar(Double egresodolar) { this.egresodolar = egresodolar; }

    public Double getingresodolar() { return ingresodolar; }
    public void setingresodolar(Double ingresodolar) { this.ingresodolar = ingresodolar; }

    public Double getsaldodolar() { return saldodolar; }
    public void setsaldodolar(Double saldodolar) { this.saldodolar = saldodolar; }

    public Double gettasadolar() { return tasadolar; }
    public void settasadolar(Double tasadolar) { this.tasadolar = tasadolar; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

}
