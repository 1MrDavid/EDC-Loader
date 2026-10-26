CREATE TABLE cuenta (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(20) NOT NULL UNIQUE,
    banco TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cuenta_numero ON cuenta (numero);

CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    color VARCHAR(20) DEFAULT '#64748b',
    icono VARCHAR(10) DEFAULT '🏷️',
    activa BOOLEAN DEFAULT TRUE
);

CREATE TABLE reglas_categorizacion (
    id SERIAL PRIMARY KEY,
    patron VARCHAR(100) NOT NULL,
    tipo_patron VARCHAR(20) NOT NULL, 
    categoria_id INTEGER REFERENCES categorias(id),
    activa BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS movimientos (
    id SERIAL PRIMARY KEY,
	cuenta_id INTEGER NOT NULL,
	fechaadd DATE,
    fechavalor DATE,
    fechaefec DATE,
    referencia TEXT,
    descripcion TEXT,
    egreso NUMERIC,
    ingreso NUMERIC,
    saldo NUMERIC,
    ingresoDolar NUMERIC,
    egresoDolar NUMERIC,
    saldoDolar NUMERIC,
    tasaDolar NUMERIC,
    categoria_id INTEGER REFERENCES categorias(id),
	
	CONSTRAINT fk_movimientos_cuenta
        FOREIGN KEY (cuenta_id)
        REFERENCES cuenta(id)
);

CREATE INDEX IF NOT EXISTS idx_movimientos_referencia ON movimientos (referencia);
CREATE INDEX IF NOT EXISTS idx_movimientos_egreso ON movimientos (egreso);
CREATE INDEX IF NOT EXISTS idx_movimientos_ingreso ON movimientos (ingreso);
CREATE INDEX IF NOT EXISTS idx_movimientos_categoria ON movimientos (categoria);
CREATE INDEX IF NOT EXISTS idx_movimientos_fechaadd ON movimientos (fechaadd);
CREATE INDEX IF NOT EXISTS idx_movimientos_cuenta_fecha ON movimientos (cuenta_id, fechaefec);

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
CREATE UNIQUE INDEX IF NOT EXISTS uq_valor_dolar_ano_mes_dia ON valor_dolar (ano, mes, dia);

CREATE TABLE balance_mensual (
    id SERIAL PRIMARY KEY,
    cuenta_id INTEGER NOT NULL,
    periodo DATE NOT NULL,
	
    monto_inicio NUMERIC(18,2) NOT NULL,
	monto_final NUMERIC(18,2) NOT NULL,
	ingresos_total NUMERIC(18,2) NOT NULL,
	egresos_total NUMERIC(18,2) NOT NULL,
    numero_ingresos INTEGER NOT NULL,
    numero_egresos INTEGER NOT NULL,
	
	saldo_variacion NUMERIC NOT NULL,        -- monto_final - monto_inicio
	flujo_neto NUMERIC NOT NULL,              -- ingresos_total - egresos_total
	promedio_ingreso NUMERIC,
	promedio_egreso NUMERIC,
    
    ingresos_total_dolar NUMERIC(18,2),
    egresos_total_dolar NUMERIC(18,2),

    CONSTRAINT fk_balance_cuenta
        FOREIGN KEY (cuenta_id) REFERENCES cuenta(id),
    CONSTRAINT uq_balance_periodo
        UNIQUE (cuenta_id, periodo)
);

CREATE INDEX IF NOT EXISTS idx_balance_cuenta_periodo ON balance_mensual (cuenta_id, periodo);

-- ============================================================
-- REGISTROS BOT (Telegram)
-- ============================================================
CREATE TABLE IF NOT EXISTS registros_bot (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50),
    monto DOUBLE PRECISION,
    monto_dolar DOUBLE PRECISION,
    es_ingreso BOOLEAN DEFAULT FALSE,
    referencia TEXT,
    fecha DATE,
    banco_origen VARCHAR(20),
    banco_destino VARCHAR(20),
    beneficiario TEXT,
    telefono VARCHAR(30),
    identificacion VARCHAR(30),
    concepto TEXT,
    procesado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    categoria_id INTEGER REFERENCES categorias(id)
);

CREATE INDEX IF NOT EXISTS idx_registros_bot_procesado ON registros_bot (procesado);
CREATE INDEX IF NOT EXISTS idx_registros_bot_categoria ON registros_bot (categoria_id);
CREATE INDEX IF NOT EXISTS idx_registros_bot_fecha ON registros_bot (fecha);

-- ============================================================
-- DEUDAS Y PAGOS
-- ============================================================
CREATE TABLE IF NOT EXISTS deudas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo_deuda VARCHAR(20) NOT NULL,
    frecuencia VARCHAR(20) NOT NULL,
    monto_bs DOUBLE PRECISION,
    monto_usd DOUBLE PRECISION,
    monto_eur DOUBLE PRECISION,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    activa BOOLEAN DEFAULT TRUE,
    color VARCHAR(20) DEFAULT '#64748b',
    icono VARCHAR(10) DEFAULT '💳',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cuotas_totales INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_deudas_categoria_activa
    ON deudas (categoria_id) WHERE activa = TRUE;

CREATE TABLE IF NOT EXISTS pagos_deuda (
    id SERIAL PRIMARY KEY,
    deuda_id INTEGER NOT NULL REFERENCES deudas(id),
    monto_pagado_bs DOUBLE PRECISION,
    monto_pagado_usd DOUBLE PRECISION,
    fecha_pago DATE NOT NULL,
    movimiento_id INTEGER REFERENCES movimientos(id),
    registro_bot_id INTEGER REFERENCES registros_bot(id),
    origen VARCHAR(10) NOT NULL DEFAULT 'AUTO'
);

CREATE INDEX IF NOT EXISTS idx_pagos_deuda_deuda ON pagos_deuda (deuda_id);
CREATE INDEX IF NOT EXISTS idx_pagos_deuda_fecha ON pagos_deuda (fecha_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_deuda_registro_bot ON pagos_deuda (registro_bot_id);
CREATE INDEX IF NOT EXISTS idx_pagos_deuda_movimiento ON pagos_deuda (movimiento_id);

-- ============================================================
-- AHORRO
-- ============================================================
CREATE TABLE IF NOT EXISTS cuentas_ahorro (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo_moneda VARCHAR(10) NOT NULL,
    saldo_actual DOUBLE PRECISION DEFAULT 0,
    color VARCHAR(20) DEFAULT '#64748b',
    icono VARCHAR(10) DEFAULT '💰',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movimientos_ahorro (
    id SERIAL PRIMARY KEY,
    cuenta_ahorro_id INTEGER NOT NULL REFERENCES cuentas_ahorro(id),
    tipo_operacion VARCHAR(20) NOT NULL,
    monto DOUBLE PRECISION NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL,
    movimiento_id INTEGER REFERENCES movimientos(id),
    registro_bot_id INTEGER REFERENCES registros_bot(id),
    categoria_id INTEGER REFERENCES categorias(id),
    deuda_id INTEGER REFERENCES deudas(id)
);

CREATE INDEX IF NOT EXISTS idx_movimientos_ahorro_cuenta ON movimientos_ahorro (cuenta_ahorro_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_ahorro_fecha ON movimientos_ahorro (fecha);
CREATE INDEX IF NOT EXISTS idx_movimientos_ahorro_categoria ON movimientos_ahorro (categoria_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_ahorro_deuda ON movimientos_ahorro (deuda_id);

ALTER TABLE movimientos_ahorro ADD COLUMN IF NOT EXISTS categoria_id INTEGER REFERENCES categorias(id);
ALTER TABLE movimientos_ahorro ADD COLUMN IF NOT EXISTS deuda_id INTEGER REFERENCES deudas(id);

ALTER TABLE pagos_deuda ADD COLUMN IF NOT EXISTS movimiento_ahorro_id INTEGER REFERENCES movimientos_ahorro(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_pagos_deuda_movimiento_ahorro ON pagos_deuda (movimiento_ahorro_id);

-- ==========================================
-- MÓDULO DE METAS DE AHORRO
-- ==========================================
CREATE TABLE metas_ahorro (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cuenta_ahorro_id INT8 REFERENCES cuentas_ahorro(id) ON DELETE CASCADE,
    
    monto_objetivo_usd NUMERIC(15, 2) NOT NULL,
    fecha_limite DATE, -- Opcional, por si quieres ponerte presión de tiempo
    
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- MÓDULO DE LÍMITES DE GASTO (PRESUPUESTOS)
-- ==========================================
CREATE TABLE limites_categoria (
    id SERIAL PRIMARY KEY,
    categoria_id INT8 REFERENCES categorias(id) ON DELETE CASCADE,
    
    monto_usd NUMERIC(15, 2) NOT NULL, -- Se fija en USD para protegerlo de la devaluación
    
    -- Dualidad: Si mes y ano son NULL, es un límite GLOBAL. 
    -- Si tienen valor, es una excepción para ese mes específico.
    mes INT DEFAULT NULL, 
    ano INT DEFAULT NULL,
    
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Evita que por error crees dos límites para la misma categoría en el mismo mes
    CONSTRAINT unique_limite_categoria UNIQUE (categoria_id, mes, ano)
);