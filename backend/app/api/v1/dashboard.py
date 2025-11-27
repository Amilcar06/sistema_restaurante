"""
API de Dashboard en Español
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from datetime import datetime, timedelta, date
from typing import List

from app.schemas.dashboard import DashboardResponse, EstadisticasDashboard, PlatoTop, Alerta
from app.core.database import get_db
from app.models.venta import Venta, ItemVenta
from app.models.item_inventario import ItemInventario
from app.models.receta import Receta

router = APIRouter()

@router.get("/stats", response_model=DashboardResponse)
async def obtener_estadisticas_dashboard(db: Session = Depends(get_db)):
    """
    Obtener estadísticas del dashboard
    """
    hoy = date.today()
    inicio_dia = datetime.combine(hoy, datetime.min.time())
    fin_dia = datetime.combine(hoy, datetime.max.time())
    hace_una_semana = inicio_dia - timedelta(days=7)
    ayer_inicio = datetime.combine(hoy - timedelta(days=1), datetime.min.time())
    ayer_fin = datetime.combine(hoy - timedelta(days=1), datetime.max.time())
    
    # Ventas de hoy
    ventas_hoy = db.query(Venta).filter(
        and_(Venta.fecha_creacion >= inicio_dia, Venta.fecha_creacion <= fin_dia)
    ).all()
    total_ventas_hoy = sum(venta.total for venta in ventas_hoy)
    
    # Ventas de ayer para comparación
    ventas_ayer = db.query(Venta).filter(
        and_(Venta.fecha_creacion >= ayer_inicio, Venta.fecha_creacion <= ayer_fin)
    ).all()
    total_ventas_ayer = sum(venta.total for venta in ventas_ayer)
    cambio_ventas = ((total_ventas_hoy - total_ventas_ayer) / total_ventas_ayer * 100) if total_ventas_ayer > 0 else 0
    
    # Platos vendidos hoy
    items_hoy = db.query(ItemVenta).join(Venta).filter(
        and_(Venta.fecha_creacion >= inicio_dia, Venta.fecha_creacion <= fin_dia)
    ).all()
    platos_vendidos_hoy = sum(item.cantidad for item in items_hoy)
    
    items_ayer = db.query(ItemVenta).join(Venta).filter(
        and_(Venta.fecha_creacion >= ayer_inicio, Venta.fecha_creacion <= ayer_fin)
    ).all()
    platos_vendidos_ayer = sum(item.cantidad for item in items_ayer)
    cambio_platos = ((platos_vendidos_hoy - platos_vendidos_ayer) / platos_vendidos_ayer * 100) if platos_vendidos_ayer > 0 else 0
    
    # Items críticos de inventario
    # Asumimos que stock_minimo es el umbral
    items_criticos = db.query(ItemInventario).filter(ItemInventario.cantidad <= ItemInventario.stock_minimo).all()
    count_criticos = len(items_criticos)
    
    # Margen promedio de recetas
    recetas = db.query(Receta).all()
    margen_promedio = sum(receta.margen for receta in recetas) / len(recetas) if recetas else 0
    
    # Cambio margen (simplificado, comparado con semana anterior)
    recetas_semana = db.query(Receta).filter(Receta.created_at >= hace_una_semana).all()
    margen_promedio_semana = sum(r.margen for r in recetas_semana) / len(recetas_semana) if recetas_semana else margen_promedio
    cambio_margen = margen_promedio - margen_promedio_semana if margen_promedio_semana > 0 else 0
    
    estadisticas = EstadisticasDashboard(
        ventas_totales_hoy=total_ventas_hoy,
        items_criticos_count=count_criticos,
        platos_vendidos_hoy=int(platos_vendidos_hoy),
        margen_promedio=round(margen_promedio, 1),
        cambio_ventas_porcentaje=round(cambio_ventas, 1),
        cambio_platos_porcentaje=round(cambio_platos, 1),
        cambio_margen_porcentaje=round(cambio_margen, 1)
    )
    
    # Platos más vendidos (últimos 7 días)
    top_platos_query = db.query(
        ItemVenta.nombre_item,
        func.sum(ItemVenta.cantidad).label('cantidad_vendida'),
        func.sum(ItemVenta.total).label('ingresos')
    ).join(Venta).filter(
        Venta.fecha_creacion >= hace_una_semana
    ).group_by(ItemVenta.nombre_item).order_by(desc('cantidad_vendida')).limit(5).all()
    
    platos_top = [
        PlatoTop(nombre=row.nombre_item, cantidad_vendida=int(row.cantidad_vendida), ingresos=float(row.ingresos))
        for row in top_platos_query
    ]
    
    # Alertas
    alertas = []
    for item in items_criticos[:4]:
        alertas.append(Alerta(
            tipo="warning",
            mensaje=f"{item.nombre} está por debajo del stock mínimo ({item.cantidad} {item.unidad} restantes, mínimo {item.stock_minimo} {item.unidad})"
        ))
    
    recetas_alto_margen = db.query(Receta).filter(Receta.margen >= 70).limit(2).all()
    for receta in recetas_alto_margen:
        alertas.append(Alerta(
            tipo="info",
            mensaje=f"{receta.nombre} tiene un margen del {receta.margen:.1f}% - excelente rentabilidad"
        ))
    
    # Ventas por día
    ventas_por_dia = []
    dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
    for i in range(6, -1, -1):
        fecha = hoy - timedelta(days=i)
        inicio = datetime.combine(fecha, datetime.min.time())
        fin = datetime.combine(fecha, datetime.max.time())
        
        ventas_dia = db.query(Venta).filter(
            and_(Venta.fecha_creacion >= inicio, Venta.fecha_creacion <= fin)
        ).all()
        total_dia = sum(venta.total for venta in ventas_dia)
        
        ventas_por_dia.append({
            "dia": dias[fecha.weekday()],
            "ventas": round(total_dia, 2)
        })
    
    # Distribución por categoría
    conteo_categorias = {}
    for receta in recetas:
        conteo_categorias[receta.categoria] = conteo_categorias.get(receta.categoria, 0) + 1
    
    total_recetas = len(recetas)
    distribucion_categorias = [
        {"nombre": cat, "valor": round((count / total_recetas * 100) if total_recetas > 0 else 0)}
        for cat, count in conteo_categorias.items()
    ]
    
    if not distribucion_categorias:
        distribucion_categorias = [
            {"nombre": "Platos Principales", "valor": 45},
            {"nombre": "Bebidas", "valor": 25},
            {"nombre": "Entradas", "valor": 20},
            {"nombre": "Postres", "valor": 10},
        ]
    
    return DashboardResponse(
        estadisticas=estadisticas,
        platos_top=platos_top,
        alertas=alertas,
        ventas_por_dia=ventas_por_dia,
        distribucion_categorias=distribucion_categorias
    )
