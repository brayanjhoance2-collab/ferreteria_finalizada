"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './dashboard.module.css'
import { obtenerEstadisticas, obtenerActividadReciente } from './servidor'

export default function Dashboard() {
  const [estadisticas, setEstadisticas] = useState(null)
  const [actividad, setActividad] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [dataEstadisticas, dataActividad] = await Promise.all([
        obtenerEstadisticas(),
        obtenerActividadReciente()
      ])
      setEstadisticas(dataEstadisticas)
      setActividad(dataActividad || [])
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.container}>
          <div className={styles.loading}>Cargando dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)'}}>
              <ion-icon name="cart-outline"></ion-icon>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Arriendos Activos</span>
              <span className={styles.statValue}>{estadisticas?.arriendos_activos || 0}</span>
              <span className={styles.statChange}>
                <ion-icon name="trending-up-outline"></ion-icon>
                +{estadisticas?.arriendos_nuevos_mes || 0} este mes
              </span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)'}}>
              <ion-icon name="construct-outline"></ion-icon>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Equipos Disponibles</span>
              <span className={styles.statValue}>{estadisticas?.equipos_disponibles || 0}</span>
              <span className={styles.statChange}>
                De {estadisticas?.equipos_totales || 0} totales
              </span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{background: 'linear-gradient(135deg, #ff9800 0%, #ffa726 100%)'}}>
              <ion-icon name="people-outline"></ion-icon>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Clientes Activos</span>
              <span className={styles.statValue}>{estadisticas?.clientes_activos || 0}</span>
              <span className={styles.statChange}>
                <ion-icon name="trending-up-outline"></ion-icon>
                +{estadisticas?.clientes_nuevos_mes || 0} este mes
              </span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{background: 'linear-gradient(135deg, #ff5722 0%, #e64a19 100%)'}}>
              <ion-icon name="cash-outline"></ion-icon>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Ingresos del Mes</span>
              <span className={styles.statValue}>S/ {(estadisticas?.ingresos_mes || 0).toLocaleString()}</span>
              <span className={styles.statChange}>
                {estadisticas?.porcentaje_cambio >= 0 ? (
                  <>
                    <ion-icon name="trending-up-outline"></ion-icon>
                    +{estadisticas?.porcentaje_cambio}%
                  </>
                ) : (
                  <>
                    <ion-icon name="trending-down-outline"></ion-icon>
                    {estadisticas?.porcentaje_cambio}%
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.mainContent}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <ion-icon name="time-outline"></ion-icon>
                  Actividad Reciente
                </h2>
                <Link href="/admin/auditoria" className={styles.cardLink}>
                  Ver todo
                  <ion-icon name="arrow-forward"></ion-icon>
                </Link>
              </div>
              <div className={styles.cardBody}>
                {actividad.length > 0 ? (
                  <div className={styles.activityList}>
                    {actividad.map((item, index) => (
                      <div key={index} className={styles.activityItem}>
                        <div className={styles.activityIcon}>
                          <ion-icon name={getActivityIcon(item.accion)}></ion-icon>
                        </div>
                        <div className={styles.activityContent}>
                          <p className={styles.activityText}>{item.descripcion}</p>
                          <span className={styles.activityTime}>
                            {formatearFecha(item.fecha)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <ion-icon name="document-outline"></ion-icon>
                    <p>No hay actividad reciente</p>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <ion-icon name="alert-circle-outline"></ion-icon>
                  Alertas y Notificaciones
                </h2>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.alertsList}>
                  {estadisticas?.equipos_mantenimiento > 0 && (
                    <div className={styles.alertItem} style={{borderLeftColor: '#ff9800'}}>
                      <ion-icon name="construct-outline"></ion-icon>
                      <div>
                        <p className={styles.alertText}>
                          {estadisticas.equipos_mantenimiento} equipos requieren mantenimiento
                        </p>
                        <Link href="/admin/servicios/mantenimiento" className={styles.alertLink}>
                          Ver detalles
                        </Link>
                      </div>
                    </div>
                  )}
                  
                  {estadisticas?.pagos_pendientes > 0 && (
                    <div className={styles.alertItem} style={{borderLeftColor: '#f44336'}}>
                      <ion-icon name="card-outline"></ion-icon>
                      <div>
                        <p className={styles.alertText}>
                          {estadisticas.pagos_pendientes} pagos pendientes por confirmar
                        </p>
                        <Link href="/admin/arriendos/pagos" className={styles.alertLink}>
                          Ver pagos
                        </Link>
                      </div>
                    </div>
                  )}

                  {estadisticas?.arriendos_por_vencer > 0 && (
                    <div className={styles.alertItem} style={{borderLeftColor: '#2196f3'}}>
                      <ion-icon name="calendar-outline"></ion-icon>
                      <div>
                        <p className={styles.alertText}>
                          {estadisticas.arriendos_por_vencer} arriendos próximos a vencer
                        </p>
                        <Link href="/admin/arriendos/lista" className={styles.alertLink}>
                          Ver arriendos
                        </Link>
                      </div>
                    </div>
                  )}

                  {(!estadisticas?.equipos_mantenimiento && !estadisticas?.pagos_pendientes && !estadisticas?.arriendos_por_vencer) && (
                    <div className={styles.emptyState}>
                      <ion-icon name="checkmark-circle-outline"></ion-icon>
                      <p>No hay alertas pendientes</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <ion-icon name="flash-outline"></ion-icon>
                  Accesos Rápidos
                </h2>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.quickLinks}>
                  <Link href="/admin/arriendos/nuevo" className={styles.quickLink}>
                    <ion-icon name="add-circle-outline"></ion-icon>
                    <span>Nuevo Arriendo</span>
                  </Link>
                  <Link href="/admin/clientes/agregar" className={styles.quickLink}>
                    <ion-icon name="person-add-outline"></ion-icon>
                    <span>Agregar Cliente</span>
                  </Link>
                  <Link href="/admin/equipos/agregar" className={styles.quickLink}>
                    <ion-icon name="construct-outline"></ion-icon>
                    <span>Agregar Equipo</span>
                  </Link>
                  <Link href="/admin/servicios/nueva-orden" className={styles.quickLink}>
                    <ion-icon name="clipboard-outline"></ion-icon>
                    <span>Nueva Orden Servicio</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <ion-icon name="bar-chart-outline"></ion-icon>
                  Estado de Equipos
                </h2>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.equiposStatus}>
                  <div className={styles.statusItem}>
                    <div className={styles.statusBar}>
                      <div 
                        className={styles.statusFill}
                        style={{
                          width: `${(estadisticas?.equipos_disponibles / estadisticas?.equipos_totales * 100) || 0}%`,
                          background: '#4caf50'
                        }}
                      ></div>
                    </div>
                    <div className={styles.statusInfo}>
                      <span className={styles.statusLabel}>Disponibles</span>
                      <span className={styles.statusValue}>{estadisticas?.equipos_disponibles || 0}</span>
                    </div>
                  </div>

                  <div className={styles.statusItem}>
                    <div className={styles.statusBar}>
                      <div 
                        className={styles.statusFill}
                        style={{
                          width: `${(estadisticas?.equipos_arrendados / estadisticas?.equipos_totales * 100) || 0}%`,
                          background: '#ff9800'
                        }}
                      ></div>
                    </div>
                    <div className={styles.statusInfo}>
                      <span className={styles.statusLabel}>Arrendados</span>
                      <span className={styles.statusValue}>{estadisticas?.equipos_arrendados || 0}</span>
                    </div>
                  </div>

                  <div className={styles.statusItem}>
                    <div className={styles.statusBar}>
                      <div 
                        className={styles.statusFill}
                        style={{
                          width: `${(estadisticas?.equipos_mantenimiento / estadisticas?.equipos_totales * 100) || 0}%`,
                          background: '#f44336'
                        }}
                      ></div>
                    </div>
                    <div className={styles.statusInfo}>
                      <span className={styles.statusLabel}>Mantenimiento</span>
                      <span className={styles.statusValue}>{estadisticas?.equipos_mantenimiento || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getActivityIcon(accion) {
  const icons = {
    'INSERT': 'add-circle-outline',
    'UPDATE': 'create-outline',
    'DELETE': 'trash-outline',
    'LOGIN': 'log-in-outline',
    'LOGOUT': 'log-out-outline'
  }
  return icons[accion] || 'ellipse-outline'
}

function formatearFecha(fecha) {
  const ahora = new Date()
  const fechaItem = new Date(fecha)
  const diff = Math.floor((ahora - fechaItem) / 1000)

  if (diff < 60) return 'Hace un momento'
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`
  if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} días`
  
  return fechaItem.toLocaleDateString('es-PE', { 
    day: 'numeric', 
    month: 'short',
    year: 'numeric'
  })
}