-- Ejecutar sobre bases ya existentes (ddl-auto=none).
ALTER TABLE movimientos_ahorro ADD COLUMN IF NOT EXISTS categoria_id INTEGER REFERENCES categorias(id);
ALTER TABLE movimientos_ahorro ADD COLUMN IF NOT EXISTS deuda_id INTEGER REFERENCES deudas(id);
CREATE INDEX IF NOT EXISTS idx_movimientos_ahorro_categoria ON movimientos_ahorro (categoria_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_ahorro_deuda ON movimientos_ahorro (deuda_id);

ALTER TABLE pagos_deuda ADD COLUMN IF NOT EXISTS movimiento_ahorro_id INTEGER REFERENCES movimientos_ahorro(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_pagos_deuda_movimiento_ahorro ON pagos_deuda (movimiento_ahorro_id);
