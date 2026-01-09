CREATE TABLE cuenta (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(20) NOT NULL UNIQUE,
    banco TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cuenta_numero ON cuenta (numero);

INSERT INTO cuenta (numero, banco) VALUES ('01510100803000885044', 'BFC');

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
    categoria TEXT,
	
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

    CONSTRAINT fk_balance_cuenta
        FOREIGN KEY (cuenta_id) REFERENCES cuenta(id),
    CONSTRAINT uq_balance_periodo
        UNIQUE (cuenta_id, periodo)
);

CREATE INDEX IF NOT EXISTS idx_balance_cuenta_periodo ON balance_mensual (cuenta_id, periodo);
