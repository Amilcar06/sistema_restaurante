"""
API de Reportes en Español
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from datetime import datetime, timedelta, date
from typing import Optional, List
from fastapi.responses import JSONResponse, Response

from app.core.database import get_db
from app.models.venta import Venta, ItemVenta
from app.models.receta import Receta
from app.models.item_inventario import ItemInventario
from app.schemas.venta import VentaResponse

router = APIRouter()

@router.get("/monthly")
async def obtener_reporte_mensual(
    months: int = 6,
    db: Session = Depends(get_db)
):
    """
    Obtener reporte mensual de ventas, costos y ganancias
    """
    end_date = datetime.now()
    start_date = end_date - timedelta(days=months * 30)
    
    # Obtener ventas agrupadas por mes
    ventas_mensuales = db.query(
        extract('year', Venta.fecha_creacion).label('year'),
        extract('month', Venta.fecha_creacion).label('month'),
        func.sum(Venta.total).label('ventas'),
        func.count(Venta.id).label('count')
    ).filter(
        Venta.fecha_creacion >= start_date
    ).group_by(
        extract('year', Venta.fecha_creacion),
        extract('month', Venta.fecha_creacion)
    ).order_by(
        extract('year', Venta.fecha_creacion),
        extract('month', Venta.fecha_creacion)
    ).all()
    
    result = []
    nombres_meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    
    for row in ventas_mensuales:
        # Calcular rango de fechas para el mes
        inicio_mes = datetime(int(row.year), int(row.month), 1)
        if row.month == 12:
            fin_mes = datetime(int(row.year) + 1, 1, 1)
        else:
            fin_mes = datetime(int(row.year), int(row.month) + 1, 1)
        
        # Obtener ventas del mes para calcular costos
        ventas_mes = db.query(Venta).filter(
            and_(
                Venta.fecha_creacion >= inicio_mes,
                Venta.fecha_creacion < fin_mes
            )
        ).all()
        
        costo_total = 0
        for venta in ventas_mes:
            for item in venta.items:
                if item.receta_id:
                    receta = db.query(Receta).filter(Receta.id == item.receta_id).first()
                    if receta:
                        costo_unitario = receta.costo / receta.porciones if receta.porciones > 0 else receta.costo
                        costo_total += costo_unitario * item.cantidad
        
        ventas = float(row.ventas) if row.ventas else 0
        costos = costo_total
        ganancia = ventas - costos
        
        result.append({
            "mes": nombres_meses[int(row.month) - 1],
            "ventas": round(ventas, 2),
            "costos": round(costos, 2),
            "ganancia": round(ganancia, 2)
        })
    
    return result

@router.get("/categories")
async def obtener_rendimiento_categorias(
    days: int = 30,
    db: Session = Depends(get_db)
):
    """
    Obtener rendimiento por categoría
    """
    start_date = datetime.now() - timedelta(days=days)
    
    items = db.query(
        Receta.categoria,
        func.sum(ItemVenta.cantidad).label('ventas'),
        func.sum(ItemVenta.total).label('ingresos')
    ).join(
        ItemVenta, ItemVenta.receta_id == Receta.id
    ).join(
        Venta, Venta.id == ItemVenta.venta_id
    ).filter(
        Venta.fecha_creacion >= start_date
    ).group_by(
        Receta.categoria
    ).all()
    
    result = []
    for row in items:
        result.append({
            "categoria": row.categoria,
            "cantidad_vendida": int(row.ventas) if row.ventas else 0,
            "ingresos": float(row.ingresos) if row.ingresos else 0
        })
    
    return result

@router.get("/margins")
async def obtener_margenes_ganancia(
    db: Session = Depends(get_db)
):
    """
    Obtener márgenes de ganancia por receta
    """
    recetas = db.query(Receta).all()
    
    result = []
    for receta in recetas:
        result.append({
            "nombre": receta.nombre,
            "precio_venta": receta.precio,
            "costo": receta.costo,
            "margen": round(receta.margen, 1)
        })
    
    # Ordenar por margen descendente
    result.sort(key=lambda x: x["margen"], reverse=True)
    
    return result[:10]

@router.get("/payment-methods")
async def obtener_metodos_pago(
    days: int = 30,
    db: Session = Depends(get_db)
):
    """
    Obtener distribución por método de pago
    """
    start_date = datetime.now() - timedelta(days=days)
    
    ventas = db.query(
        Venta.metodo_pago,
        func.count(Venta.id).label('count'),
        func.sum(Venta.total).label('total')
    ).filter(
        and_(
            Venta.fecha_creacion >= start_date,
            Venta.metodo_pago.isnot(None)
        )
    ).group_by(
        Venta.metodo_pago
    ).all()
    
    total_count = sum(row.count for row in ventas)
    
    result = []
    for row in ventas:
        count = int(row.count)
        amount = float(row.total) if row.total else 0
        percentage = (count / total_count * 100) if total_count > 0 else 0
        
        result.append({
            "metodo": row.metodo_pago,
            "porcentaje": round(percentage, 1),
            "cantidad": count,
            "total": round(amount, 2)
        })
    
    return result

@router.get("/summary")
async def obtener_resumen_reporte(
    days: int = 30,
    db: Session = Depends(get_db)
):
    """
    Obtener resumen con métricas clave
    """
    start_date = datetime.now() - timedelta(days=days)
    
    # Ventas totales
    ventas = db.query(Venta).filter(Venta.fecha_creacion >= start_date).all()
    total_sales = sum(venta.total for venta in ventas)
    
    # Costos totales
    total_cost = 0
    for venta in ventas:
        for item in venta.items:
            if item.receta_id:
                receta = db.query(Receta).filter(Receta.id == item.receta_id).first()
                if receta:
                    costo_unitario = receta.costo / receta.porciones if receta.porciones > 0 else receta.costo
                    total_cost += costo_unitario * item.cantidad
    
    net_profit = total_sales - total_cost
    
    # Margen promedio
    recetas = db.query(Receta).all()
    avg_margin = sum(r.margen for r in recetas) / len(recetas) if recetas else 0
    
    # Crecimiento
    prev_start = start_date - timedelta(days=days)
    prev_sales = db.query(Venta).filter(
        and_(
            Venta.fecha_creacion >= prev_start,
            Venta.fecha_creacion < start_date
        )
    ).all()
    prev_total = sum(venta.total for venta in prev_sales)
    growth = ((total_sales - prev_total) / prev_total * 100) if prev_total > 0 else 0
    
    return {
        "ventas_totales": round(total_sales, 2),
        "costo_total": round(total_cost, 2),
        "ganancia_neta": round(net_profit, 2),
        "margen_promedio": round(avg_margin, 1),
        "crecimiento": round(growth, 1),
        "dias_periodo": days
    }

@router.get("/export")
async def exportar_reporte(
    format: str = "json",
    days: int = 30,
    db: Session = Depends(get_db)
):
    """
    Exportar reporte completo
    """
    if format not in ["json", "csv"]:
        raise HTTPException(status_code=400, detail="Formato debe ser 'json' o 'csv'")
    
    monthly = await obtener_reporte_mensual(months=6, db=db)
    category_perf = await obtener_rendimiento_categorias(days=days, db=db)
    profit_margins = await obtener_margenes_ganancia(db=db)
    payment_methods = await obtener_metodos_pago(days=days, db=db)
    summary = await obtener_resumen_reporte(days=days, db=db)
    
    report_data = {
        "summary": summary,
        "monthly_trend": monthly,
        "category_performance": category_perf,
        "profit_margins": profit_margins,
        "payment_methods": payment_methods,
        "exported_at": datetime.now().isoformat()
    }
    
    if format == "csv":
        import csv
        import io
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow(["Reporte GastroSmart AI"])
        writer.writerow(["Generado:", datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
        writer.writerow([])
        writer.writerow(["RESUMEN"])
        writer.writerow(["Ventas Totales", f"Bs. {summary['total_sales']}"])
        writer.writerow(["Costos Totales", f"Bs. {summary['total_cost']}"])
        writer.writerow(["Ganancia Neta", f"Bs. {summary['net_profit']}"])
        writer.writerow(["Margen Promedio", f"{summary['average_margin']}%"])
        writer.writerow(["Crecimiento", f"{summary['growth']}%"])
        writer.writerow([])
        
        writer.writerow(["TENDENCIA MENSUAL"])
        writer.writerow(["Mes", "Ventas", "Costos", "Ganancia"])
        for month in monthly:
            writer.writerow([month["month"], month["ventas"], month["costos"], month["ganancia"]])
        writer.writerow([])
        
        writer.writerow(["RENDIMIENTO POR CATEGORÍA"])
        writer.writerow(["Categoría", "Ventas", "Ingresos"])
        for cat in category_perf:
            writer.writerow([cat["category"], cat["ventas"], cat["ingresos"]])
        writer.writerow([])
        
        writer.writerow(["MÁRGENES DE GANANCIA"])
        writer.writerow(["Plato", "Margen (%)"])
        for margin in profit_margins:
            writer.writerow([margin["name"], margin["margen"]])
        writer.writerow([])
        
        writer.writerow(["MÉTODOS DE PAGO"])
        writer.writerow(["Método", "Porcentaje", "Cantidad", "Monto"])
        for pm in payment_methods:
            writer.writerow([pm["name"], f"{pm['value']}%", pm["count"], pm["amount"]])
        
        csv_content = output.getvalue()
        output.close()
        
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=reporte_gastrosmart_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
        )
    
    return report_data
