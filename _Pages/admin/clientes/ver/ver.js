"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import styles from './ver.module.css'
import { obtenerCliente, obtenerArriendosCliente } from './servidor'

export default function VerCliente() {
  const router = useRouter()
  const params = useParams()
  const [cliente, setCliente] = useState(null)
  const [arriendos, setArriendos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [dataCliente, dataArriendos] = await Promise.all([
        obtenerCliente(params.id),
        obtenerArriendosCliente(params.id)
      ])
      setCliente(dataCliente)
      setArriendos(dataArriendos)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return '-'
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <ion-icon name="hourglass-outline"></ion-icon>
          <span>Cargando cliente...</span>
        </div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <ion-icon name="alert-circle-outline"></ion-icon>
          <h3>Cliente no encontrado</h3>
          <button onClick={() => router.back()} className={styles.btnPrimary}>
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <div className={styles.avatarLarge}>
              <ion-icon name={cliente.tipo_cliente === 'empresa' ? 'business' : 'person'}></ion-icon>
            </div>
            <div className={styles.headerInfo}>
              <h1 className={styles.title}>{cliente.nombre}</h1>
              <div className={styles.headerMeta}>
                <span className={`${styles.tipoBadge} ${styles[`tipo${cliente.tipo_cliente.charAt(0).toUpperCase() + cliente.tipo_cliente.slice(1)}`]}`}>
                  {cliente.tipo_cliente}
                </span>
                <span className={styles.rut}>{cliente.rut}</span>
                {cliente.credito_aprobado && (
                  <span className={styles.creditoBadge}>
                    <ion-icon name="card"></ion-icon>
                    Crédito Aprobado
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Link href={`/admin/clientes/editar/${cliente.id}`} className={styles.btnEdit}>
            <ion-icon name="create-outline"></ion-icon>
            Editar
          </Link>
          <button onClick={() => router.back()} className={styles.btnSecondary}>
            <ion-icon name="arrow-back-outline"></ion-icon>
            Volver
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainColumn}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <ion-icon name="information-circle-outline"></ion-icon>
              Información General
            </h2>
            <div className={styles.cardBody}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>RUT</span>
                  <span className={styles.infoValue}>{cliente.rut}</span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Tipo de Cliente</span>
                  <span className={styles.infoValue}>{cliente.tipo_cliente === 'empresa' ? 'Empresa' : 'Persona Natural'}</span>
                </div>

                {cliente.tipo_cliente === 'empresa' && (
                  <>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Razón Social</span>
                      <span className={styles.infoValue}>{cliente.razon_social || '-'}</span>
                    </div>

                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Giro</span>
                      <span className={styles.infoValue}>{cliente.giro || '-'}</span>
                    </div>
                  </>
                )}

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Email</span>
                  <span className={styles.infoValue}>
                    <a href={`mailto:${cliente.email}`}>{cliente.email}</a>
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Teléfono</span>
                  <span className={styles.infoValue}>
                    {cliente.telefono ? <a href={`tel:${cliente.telefono}`}>{cliente.telefono}</a> : '-'}
                  </span>
                </div>

                {cliente.telefono_alternativo && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Teléfono Alternativo</span>
                    <span className={styles.infoValue}>
                      <a href={`tel:${cliente.telefono_alternativo}`}>{cliente.telefono_alternativo}</a>
                    </span>
                  </div>
                )}

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Fecha de Registro</span>
                  <span className={styles.infoValue}>{formatearFecha(cliente.fecha_registro)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <ion-icon name="location-outline"></ion-icon>
              Dirección
            </h2>
            <div className={styles.cardBody}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Dirección</span>
                  <span className={styles.infoValue}>{cliente.direccion || '-'}</span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Ciudad</span>
                  <span className={styles.infoValue}>{cliente.ciudad || '-'}</span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Región/Departamento</span>
                  <span className={styles.infoValue}>{cliente.region || '-'}</span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>País</span>
                  <span className={styles.infoValue}>{cliente.pais || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {cliente.tipo_cliente === 'empresa' && (cliente.contacto_nombre || cliente.contacto_email || cliente.contacto_telefono) && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <ion-icon name="person-outline"></ion-icon>
                Persona de Contacto
              </h2>
              <div className={styles.cardBody}>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Nombre</span>
                    <span className={styles.infoValue}>{cliente.contacto_nombre || '-'}</span>
                  </div>

                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Cargo</span>
                    <span className={styles.infoValue}>{cliente.contacto_cargo || '-'}</span>
                  </div>

                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email</span>
                    <span className={styles.infoValue}>
                      {cliente.contacto_email ? <a href={`mailto:${cliente.contacto_email}`}>{cliente.contacto_email}</a> : '-'}
                    </span>
                  </div>

                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Teléfono</span>
                    <span className={styles.infoValue}>
                      {cliente.contacto_telefono ? <a href={`tel:${cliente.contacto_telefono}`}>{cliente.contacto_telefono}</a> : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {cliente.notas && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <ion-icon name="reader-outline"></ion-icon>
                Notas
              </h2>
              <div className={styles.cardBody}>
                <p className={styles.notas}>{cliente.notas}</p>
              </div>
            </div>
          )}

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <ion-icon name="document-text-outline"></ion-icon>
              Historial de Arriendos
            </h2>
            <div className={styles.cardBody}>
              {arriendos.length > 0 ? (
                <div className={styles.arriendosList}>
                  {arriendos.map((arriendo) => (
                    <Link 
                      key={arriendo.id} 
                      href={`/admin/arriendos/ver/${arriendo.id}`}
                      className={styles.arriendoItem}
                    >
                      <div className={styles.arriendoInfo}>
                        <span className={styles.arriendoNumero}>{arriendo.numero_contrato}</span>
                        <span className={styles.arriendoFecha}>{formatearFecha(arriendo.fecha_inicio)}</span>
                      </div>
                      <div className={styles.arriendoEstado}>
                        <span className={`${styles.estadoBadge} ${styles[`estado${arriendo.estado.charAt(0).toUpperCase() + arriendo.estado.slice(1)}`]}`}>
                          {arriendo.estado}
                        </span>
                        <span className={styles.arriendoTotal}>S/ {arriendo.total?.toLocaleString()}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyArriendos}>
                  <ion-icon name="document-outline"></ion-icon>
                  <p>No hay arriendos registrados</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.sideColumn}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <ion-icon name="card-outline"></ion-icon>
              Condiciones Comerciales
            </h2>
            <div className={styles.cardBody}>
              <div className={styles.statBox}>
                <div className={styles.statIcon} style={{background: cliente.credito_aprobado ? '#4caf50' : '#9e9e9e'}}>
                  <ion-icon name="card-outline"></ion-icon>
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>Crédito</span>
                  <span className={styles.statValue}>{cliente.credito_aprobado ? 'Aprobado' : 'No Aprobado'}</span>
                </div>
              </div>

              {cliente.credito_aprobado && (
                <div className={styles.statBox}>
                  <div className={styles.statIcon} style={{background: '#2196f3'}}>
                    <ion-icon name="cash-outline"></ion-icon>
                  </div>
                  <div className={styles.statContent}>
                    <span className={styles.statLabel}>Límite de Crédito</span>
                    <span className={styles.statValue}>S/ {cliente.limite_credito?.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {cliente.descuento_porcentaje > 0 && (
                <div className={styles.statBox}>
                  <div className={styles.statIcon} style={{background: '#ff9800'}}>
                    <ion-icon name="pricetag-outline"></ion-icon>
                  </div>
                  <div className={styles.statContent}>
                    <span className={styles.statLabel}>Descuento</span>
                    <span className={styles.statValue}>{cliente.descuento_porcentaje}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <ion-icon name="stats-chart-outline"></ion-icon>
              Estadísticas
            </h2>
            <div className={styles.cardBody}>
              <div className={styles.statBox}>
                <div className={styles.statIcon} style={{background: '#9c27b0'}}>
                  <ion-icon name="document-text-outline"></ion-icon>
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>Total Arriendos</span>
                  <span className={styles.statValue}>{arriendos.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}