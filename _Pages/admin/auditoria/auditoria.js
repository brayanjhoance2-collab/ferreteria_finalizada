"use client"

import { useState, useEffect } from 'react'
import styles from './auditoria.module.css'
import { obtenerAuditorias, obtenerTablas, obtenerUsuarios, exportarAuditorias } from './servidor'

export default function Auditoria() {
  const [auditorias, setAuditorias] = useState([])
  const [tablas, setTablas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({
    tabla: '',
    accion: '',
    usuario_id: '',
    fecha_desde: '',
    fecha_hasta: '',
    buscar: ''
  })
  const [paginacion, setPaginacion] = useState({
    pagina: 1,
    limite: 50,
    total: 0,
    totalPaginas: 0
  })
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null)
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    cargarAuditorias()
  }, [filtros, paginacion.pagina])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [dataTablas, dataUsuarios] = await Promise.all([
        obtenerTablas(),
        obtenerUsuarios()
      ])
      setTablas(dataTablas)
      setUsuarios(dataUsuarios)
    } catch (error) {
      console.error('Error cargando datos:', error)
      mostrarMensaje('Error al cargar datos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const cargarAuditorias = async () => {
    try {
      setProcesando(true)
      const data = await obtenerAuditorias({
        ...filtros,
        pagina: paginacion.pagina,
        limite: paginacion.limite
      })
      setAuditorias(data.registros)
      setPaginacion({
        ...paginacion,
        total: data.total,
        totalPaginas: data.totalPaginas
      })
    } catch (error) {
      console.error('Error cargando auditorias:', error)
      mostrarMensaje('Error al cargar auditorías', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const handleFiltroChange = (campo, valor) => {
    setFiltros({...filtros, [campo]: valor})
    setPaginacion({...paginacion, pagina: 1})
  }

  const limpiarFiltros = () => {
    setFiltros({
      tabla: '',
      accion: '',
      usuario_id: '',
      fecha_desde: '',
      fecha_hasta: '',
      buscar: ''
    })
    setPaginacion({...paginacion, pagina: 1})
  }

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= paginacion.totalPaginas) {
      setPaginacion({...paginacion, pagina: nuevaPagina})
    }
  }

  const verDetalle = (registro) => {
    setRegistroSeleccionado(registro)
    setModalDetalleAbierto(true)
  }

  const cerrarModal = () => {
    setModalDetalleAbierto(false)
    setRegistroSeleccionado(null)
  }

  const handleExportar = async () => {
    try {
      setProcesando(true)
      mostrarMensaje('Preparando exportación...', 'info')
      const resultado = await exportarAuditorias(filtros)
      
      const binaryString = atob(resultado.excel)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      
      const blob = new Blob([bytes], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `auditoria_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      mostrarMensaje('Auditoría exportada correctamente', 'success')
    } catch (error) {
      console.error('Error exportando:', error)
      mostrarMensaje(error.message || 'Error al exportar auditoría', 'error')
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
    const date = new Date(fecha)
    return new Intl.DateTimeFormat('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  const getColorAccion = (accion) => {
    const colores = {
      'INSERT': styles.accionCrear,
      'UPDATE': styles.accionActualizar,
      'DELETE': styles.accionEliminar
    }
    return colores[accion] || ''
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <ion-icon name="hourglass-outline"></ion-icon>
          <span>Cargando auditoría...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Auditoría del Sistema</h1>
          <p className={styles.subtitle}>Registro completo de todas las operaciones realizadas en el sistema</p>
        </div>
        <button 
          className={styles.btnExportar}
          onClick={handleExportar}
          disabled={procesando || auditorias.length === 0}
        >
          <ion-icon name="download-outline"></ion-icon>
          Exportar Excel
        </button>
      </div>

      {mensaje && (
        <div className={`${styles.mensaje} ${styles[mensaje.tipo]}`}>
          <ion-icon name={mensaje.tipo === 'success' ? 'checkmark-circle-outline' : mensaje.tipo === 'error' ? 'alert-circle-outline' : 'information-circle-outline'}></ion-icon>
          <span>{mensaje.texto}</span>
          <button onClick={() => setMensaje(null)}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
      )}

      <div className={styles.filtrosContainer}>
        <div className={styles.filtrosGrid}>
          <div className={styles.filtroGrupo}>
            <label>Tabla</label>
            <select
              value={filtros.tabla}
              onChange={(e) => handleFiltroChange('tabla', e.target.value)}
              className={styles.select}
            >
              <option value="">Todas las tablas</option>
              {tablas.map((tabla) => (
                <option key={tabla} value={tabla}>{tabla}</option>
              ))}
            </select>
          </div>

          <div className={styles.filtroGrupo}>
            <label>Acción</label>
            <select
              value={filtros.accion}
              onChange={(e) => handleFiltroChange('accion', e.target.value)}
              className={styles.select}
            >
              <option value="">Todas las acciones</option>
              <option value="INSERT">Crear</option>
              <option value="UPDATE">Actualizar</option>
              <option value="DELETE">Eliminar</option>
            </select>
          </div>

          <div className={styles.filtroGrupo}>
            <label>Usuario</label>
            <select
              value={filtros.usuario_id}
              onChange={(e) => handleFiltroChange('usuario_id', e.target.value)}
              className={styles.select}
            >
              <option value="">Todos los usuarios</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre_completo}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filtroGrupo}>
            <label>Desde</label>
            <input
              type="date"
              value={filtros.fecha_desde}
              onChange={(e) => handleFiltroChange('fecha_desde', e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.filtroGrupo}>
            <label>Hasta</label>
            <input
              type="date"
              value={filtros.fecha_hasta}
              onChange={(e) => handleFiltroChange('fecha_hasta', e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.filtroGrupo}>
            <label>Buscar ID</label>
            <input
              type="text"
              value={filtros.buscar}
              onChange={(e) => handleFiltroChange('buscar', e.target.value)}
              placeholder="ID de registro"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.filtrosAcciones}>
          <button 
            className={styles.btnLimpiar}
            onClick={limpiarFiltros}
          >
            <ion-icon name="close-circle-outline"></ion-icon>
            Limpiar Filtros
          </button>
        </div>
      </div>

      <div className={styles.estadisticas}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <ion-icon name="document-text-outline"></ion-icon>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Registros</span>
            <span className={styles.statValue}>{paginacion.total.toLocaleString()}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <ion-icon name="add-circle-outline"></ion-icon>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Creaciones</span>
            <span className={styles.statValue}>
              {auditorias.filter(a => a.accion === 'INSERT').length}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <ion-icon name="create-outline"></ion-icon>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Actualizaciones</span>
            <span className={styles.statValue}>
              {auditorias.filter(a => a.accion === 'UPDATE').length}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <ion-icon name="trash-outline"></ion-icon>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Eliminaciones</span>
            <span className={styles.statValue}>
              {auditorias.filter(a => a.accion === 'DELETE').length}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha y Hora</th>
              <th>Tabla</th>
              <th>Acción</th>
              <th>Registro ID</th>
              <th>Usuario</th>
              <th>IP</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {auditorias.length === 0 ? (
              <tr>
                <td colSpan="8" className={styles.emptyRow}>
                  <ion-icon name="document-outline"></ion-icon>
                  <p>No se encontraron registros de auditoría</p>
                </td>
              </tr>
            ) : (
              auditorias.map((registro) => (
                <tr key={registro.id}>
                  <td>{registro.id}</td>
                  <td className={styles.fecha}>{formatearFecha(registro.fecha)}</td>
                  <td>
                    <span className={styles.tablaBadge}>{registro.tabla}</span>
                  </td>
                  <td>
                    <span className={`${styles.accionBadge} ${getColorAccion(registro.accion)}`}>
                      {registro.accion === 'INSERT' && 'Crear'}
                      {registro.accion === 'UPDATE' && 'Actualizar'}
                      {registro.accion === 'DELETE' && 'Eliminar'}
                    </span>
                  </td>
                  <td className={styles.registroId}>{registro.registro_id}</td>
                  <td className={styles.usuario}>
                    {registro.usuario_nombre || 'Sistema'}
                  </td>
                  <td className={styles.ip}>{registro.ip_address || '-'}</td>
                  <td>
                    <button
                      className={styles.btnDetalle}
                      onClick={() => verDetalle(registro)}
                    >
                      <ion-icon name="eye-outline"></ion-icon>
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {paginacion.totalPaginas > 1 && (
        <div className={styles.paginacion}>
          <button
            className={styles.btnPaginacion}
            onClick={() => cambiarPagina(1)}
            disabled={paginacion.pagina === 1 || procesando}
          >
            <ion-icon name="play-back-outline"></ion-icon>
          </button>
          <button
            className={styles.btnPaginacion}
            onClick={() => cambiarPagina(paginacion.pagina - 1)}
            disabled={paginacion.pagina === 1 || procesando}
          >
            <ion-icon name="chevron-back-outline"></ion-icon>
          </button>
          
          <span className={styles.paginacionInfo}>
            Página {paginacion.pagina} de {paginacion.totalPaginas}
          </span>
          
          <button
            className={styles.btnPaginacion}
            onClick={() => cambiarPagina(paginacion.pagina + 1)}
            disabled={paginacion.pagina === paginacion.totalPaginas || procesando}
          >
            <ion-icon name="chevron-forward-outline"></ion-icon>
          </button>
          <button
            className={styles.btnPaginacion}
            onClick={() => cambiarPagina(paginacion.totalPaginas)}
            disabled={paginacion.pagina === paginacion.totalPaginas || procesando}
          >
            <ion-icon name="play-forward-outline"></ion-icon>
          </button>
        </div>
      )}

      {modalDetalleAbierto && registroSeleccionado && (
        <div className={styles.modal}>
          <div className={styles.modalOverlay} onClick={cerrarModal}></div>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Detalle de Auditoría</h2>
              <button className={styles.btnClose} onClick={cerrarModal}>
                <ion-icon name="close-outline"></ion-icon>
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detalleGrid}>
                <div className={styles.detalleItem}>
                  <label>ID de Auditoría</label>
                  <span>{registroSeleccionado.id}</span>
                </div>
                <div className={styles.detalleItem}>
                  <label>Fecha y Hora</label>
                  <span>{formatearFecha(registroSeleccionado.fecha)}</span>
                </div>
                <div className={styles.detalleItem}>
                  <label>Tabla</label>
                  <span className={styles.tablaBadge}>{registroSeleccionado.tabla}</span>
                </div>
                <div className={styles.detalleItem}>
                  <label>Acción</label>
                  <span className={`${styles.accionBadge} ${getColorAccion(registroSeleccionado.accion)}`}>
                    {registroSeleccionado.accion === 'INSERT' && 'Crear'}
                    {registroSeleccionado.accion === 'UPDATE' && 'Actualizar'}
                    {registroSeleccionado.accion === 'DELETE' && 'Eliminar'}
                  </span>
                </div>
                <div className={styles.detalleItem}>
                  <label>ID de Registro</label>
                  <span>{registroSeleccionado.registro_id}</span>
                </div>
                <div className={styles.detalleItem}>
                  <label>Usuario</label>
                  <span>{registroSeleccionado.usuario_nombre || 'Sistema'}</span>
                </div>
                <div className={styles.detalleItem}>
                  <label>Dirección IP</label>
                  <span>{registroSeleccionado.ip_address || '-'}</span>
                </div>
              </div>

              {registroSeleccionado.datos_anteriores && (
                <div className={styles.datosSection}>
                  <h3>
                    <ion-icon name="document-outline"></ion-icon>
                    Datos Anteriores
                  </h3>
                  <pre className={styles.jsonViewer}>
                    {JSON.stringify(registroSeleccionado.datos_anteriores, null, 2)}
                  </pre>
                </div>
              )}

              {registroSeleccionado.datos_nuevos && (
                <div className={styles.datosSection}>
                  <h3>
                    <ion-icon name="document-text-outline"></ion-icon>
                    Datos Nuevos
                  </h3>
                  <pre className={styles.jsonViewer}>
                    {JSON.stringify(registroSeleccionado.datos_nuevos, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnSecondary}
                onClick={cerrarModal}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}