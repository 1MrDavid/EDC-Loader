CREATE TABLE IF NOT EXISTS finanzas (
    id SERIAL PRIMARY KEY,
    diaadd INTEGER NOT NULL,
    mesadd INTEGER NOT NULL,
    anoadd INTEGER NOT NULL,
    horaadd TIME NOT NULL,
    fechavalor TEXT,
    fechaefec TEXT,
    referencia TEXT,
    descripcion TEXT,
    egreso NUMERIC,
    ingreso NUMERIC,
    saldo NUMERIC,
    ingresoDolar NUMERIC,
    egresoDolar NUMERIC,
    saldoDolar NUMERIC,
    tasaDolar NUMERIC,
    categoria TEXT 
);

CREATE INDEX IF NOT EXISTS idx_finanzas_fecha ON finanzas (anoadd, mesadd, diaadd);
CREATE INDEX IF NOT EXISTS idx_finanzas_referencia ON finanzas (referencia);
CREATE INDEX IF NOT EXISTS idx_finanzas_egreso ON finanzas (egreso);
CREATE INDEX IF NOT EXISTS idx_finanzas_ingreso ON finanzas (ingreso);
CREATE INDEX IF NOT EXISTS idx_finanzas_categoria ON finanzas (categoria);

CREATE TABLE IF NOT EXISTS archivos_cargados (
    nombre_archivo TEXT PRIMARY KEY,
    fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS valor_dolar (
    fecha INTEGER PRIMARY KEY,
    dia INTEGER NOT NULL,
    mes INTEGER NOT NULL,
    ano INTEGER NOT NULL,
    precio DECIMAL NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_valor_dolar_fecha ON valor_dolar (fecha);
CREATE INDEX IF NOT EXISTS idx_valor_dolar_dia_mes_ano ON valor_dolar (dia, mes, ano);
