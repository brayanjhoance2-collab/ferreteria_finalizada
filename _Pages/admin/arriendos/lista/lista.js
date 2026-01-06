"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './lista.module.css'
import { obtenerArriendos, cambiarEstado, eliminarArriendo, obtenerEstadisticas } from './servidor'

export default function ListaArriendos() {
  const [arriendos, setArriendos] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: '',
    fecha_inicio: '',
    fecha_fin: ''
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [dataArriendos, dataEstadisticas] = await Promise.all([
        obtenerArriendos(),
        obtenerEstadisticas()
      ])
      setArriendos(dataArriendos)
      setEstadisticas(dataEstadisticas)
    } catch (error) {
      console.error('Error cargando datos:', error)
      mostrarMensaje('Error al cargar los datos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      setProcesando(true)
      await cambiarEstado(id, nuevoEstado)
      mostrarMensaje('Estado actualizado correctamente', 'success')
      await cargarDatos()
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      mostrarMensaje(error.message || 'Error al cambiar estado', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Está seguro de eliminar este arriendo?')) return

    try {
      setProcesando(true)
      await eliminarArriendo(id)
      mostrarMensaje('Arriendo eliminado correctamente', 'success')
      await cargarDatos()
    } catch (error) {
      console.error('Error al eliminar:', error)
      mostrarMensaje(error.message || 'Error al eliminar arriendo', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3000)
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return '-'
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const calcularDiasRestantes = (fechaFin) => {
    if (!fechaFin) return null
    const hoy = new Date()
    const fin = new Date(fechaFin)
    const diff = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24))
    return diff
  }

  const arriendosFiltrados = arriendos.filter(arriendo => {
    const cumpleBusqueda = !filtros.busqueda || 
      arriendo.numero_contrato.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      arriendo.cliente_nombre.toLowerCase().includes(filtros.busqueda.toLowerCase())

    const cumpleEstado = !filtros.estado || arriendo.estado === filtros.estado

    const cumpleFechaInicio = !filtros.fecha_inicio || 
      new Date(arriendo.fecha_inicio) >= new Date(filtros.fecha_inicio)

    const cumpleFechaFin = !filtros.fecha_fin || 
      new Date(arriendo.fecha_inicio) <= new Date(filtros.fecha_fin)

    return cumpleBusqueda && cumpleEstado && cumpleFechaInicio && cumpleFechaFin
  })

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <ion-icon name="hourglass-outline"></ion-icon>
          <span>Cargando arriendos...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Arriendos</h1>
          <p className={styles.subtitle}>Gestiona todos los contratos de arriendo</p>
        </div>
        <Link href="/admin/arriendos/nuevo" className={styles.btnPrimary}>
          <ion-icon name="add-circle-outline"></ion-icon>
          Nuevo Arriendo
        </Link>
      </div>

      {mensaje && (
        <div className={`${styles.mensaje} ${styles[mensaje.tipo]}`}>
          <ion-icon name={mensaje.tipo === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'}></ion-icon>
          <span>{mensaje.texto}</span>
          <button onClick={() => setMensaje(null)}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
      )}

      {estadisticas && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)'}}>
              <ion-icon name="checkmark-circle-outline"></ion-icon>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Activos</span>
              <span className={styles.statValue}>{estadisticas.activos}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{background: 'linear-gradient(135deg, #ff9800 0%, #ffa726 100%)'}}>
              <ion-icon name="time-outline"></ion-icon>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Pendientes</span>
              <span className={styles.statValue}>{estadisticas.pendientes}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)'}}>
              <ion-icon name="document-text-outline"></ion-icon>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Finalizados</span>
              <span className={styles.statValue}>{estadisticas.finalizados}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{background: 'linear-gradient(135deg, #ff5722 0%, #e57373 100%)'}}>
              <ion-icon name="cash-outline"></ion-icon>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Ingresos Mes</span>
              <span className={styles.statValue}>S/ {estadisticas.ingresos_mes?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <ion-icon name="search-outline"></ion-icon>
            <input
              type="text"
              placeholder="Buscar por contrato o cliente..."
              value={filtros.busqueda}
              onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
            />
          </div>

          <select
            value={filtros.estado}
            onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
            className={styles.select}
          >
            <option value="">Todos los estados</option>
            <option value="borrador">Borrador</option>
            <option value="cotizacion">Cotización</option>
            <option value="aprobado">Aprobado</option>
            <option value="activo">Activo</option>
            <option value="finalizado">Finalizado</option>
            <option value="cancelado">Cancelado</option>
          </select>

          <input
            type="date"
            value={filtros.fecha_inicio}
            onChange={(e) => setFiltros({...filtros, fecha_inicio: e.target.value})}
            className={styles.dateInput}
            placeholder="Desde"
          />

          <input
            type="date"
            value={filtros.fecha_fin}
            onChange={(e) => setFiltros({...filtros, fecha_fin: e.target.value})}
            className={styles.dateInput}
            placeholder="Hasta"
          />

          {(filtros.busqueda || filtros.estado || filtros.fecha_inicio || filtros.fecha_fin) && (
            <button
              className={styles.btnClear}
              onClick={() => setFiltros({busqueda: '', estado: '', fecha_inicio: '', fecha_fin: ''})}
            >
              <ion-icon name="close-circle-outline"></ion-icon>
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className={styles.results}>
        <span>{arriendosFiltrados.length} arriendos encontrados</span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Contrato</th>
              <th>Cliente</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Días</th>
              <th>Estado</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {arriendosFiltrados.map((arriendo) => {
              const diasRestantes = calcularDiasRestantes(arriendo.fecha_fin_estimada)
              return (
                <tr key={arriendo.id}>
                  <td className={styles.tdContrato}>
                    <div className={styles.contratoInfo}>
                      <span className={styles.numeroContrato}>{arriendo.numero_contrato}</span>
                      <span className={styles.tipoArriendo}>{arriendo.tipo_arriendo}</span>
                    </div>
                  </td>
                  <td className={styles.tdCliente}>
                    <div className={styles.clienteInfo}>
                      <span className={styles.clienteNombre}>{arriendo.cliente_nombre}</span>
                      <span className={styles.clienteRut}>{arriendo.cliente_rut}</span>
                    </div>
                  </td>
                  <td>{formatearFecha(arriendo.fecha_inicio)}</td>
                  <td>
                    <div className={styles.fechaFin}>
                      {formatearFecha(arriendo.fecha_fin_estimada)}
                      {arriendo.estado === 'activo' && diasRestantes !== null && (
                        <span className={`${styles.diasRestantes} ${diasRestantes <= 3 ? styles.urgente : ''}`}>
                          {diasRestantes > 0 ? `${diasRestantes}d restantes` : 'Vencido'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={styles.tdCentrado}>{arriendo.dias_totales}</td>
                  <td>
                    <select
                      className={`${styles.estadoSelect} ${styles[`estado${arriendo.estado.charAt(0).toUpperCase() + arriendo.estado.slice(1)}`]}`}
                      value={arriendo.estado}
                      onChange={(e) => handleCambiarEstado(arriendo.id, e.target.value)}
                      disabled={procesando}
                    >
                      <option value="borrador">Borrador</option>
                      <option value="cotizacion">Cotización</option>
                      <option value="aprobado">Aprobado</option>
                      <option value="activo">Activo</option>
                      <option value="finalizado">Finalizado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </td>
                  <td className={styles.tdTotal}>S/ {arriendo.total?.toLocaleString()}</td>
                  <td className={styles.tdAcciones}>
                    <div className={styles.acciones}>
                      <Link 
                        href={`/admin/arriendos/ver/${arriendo.id}`}
                        className={styles.btnVer}
                        title="Ver detalles"
                      >
                        <ion-icon name="eye-outline"></ion-icon>
                      </Link>
                      <Link 
                        href={`/admin/arriendos/editar/${arriendo.id}`}
                        className={styles.btnEditar}
                        title="Editar"
                      >
                        <ion-icon name="create-outline"></ion-icon>
                      </Link>
                      <button
                        className={styles.btnEliminar}
                        onClick={() => handleEliminar(arriendo.id)}
                        disabled={procesando}
                        title="Eliminar"
                      >
                        <ion-icon name="trash-outline"></ion-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {arriendosFiltrados.length === 0 && (
          <div className={styles.empty}>
            <ion-icon name="document-text-outline"></ion-icon>
            <h3>No se encontraron arriendos</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}