"""
Schemas Pydantic para Dashboard en Español
"""
from pydantic import BaseModel
from typing import List, Optional

class EstadisticasDashboard(BaseModel):
    ventas_totales_hoy: float
    items_criticos_count: int
    platos_vendidos_hoy: int
    margen_promedio: float
    cambio_ventas_porcentaje: float
    cambio_platos_porcentaje: float
    cambio_margen_porcentaje: float

class PlatoTop(BaseModel):
    nombre: str
    cantidad_vendida: int
    ingresos: float

class Alerta(BaseModel):
    tipo: str  # warning, info, success
    mensaje: str

class DashboardResponse(BaseModel):
    estadisticas: EstadisticasDashboard
    platos_top: List[PlatoTop]
    alertas: List[Alerta]
    ventas_por_dia: List[dict]  # [{dia: str, ventas: float}]
    distribucion_categorias: List[dict]  # [{nombre: str, valor: float}]
