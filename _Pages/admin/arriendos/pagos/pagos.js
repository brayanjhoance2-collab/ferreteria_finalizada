"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './pagos.module.css'
import { obtenerPagos, registrarPago, actualizarPago, eliminarPago, obtenerArriendos, obtenerEstadisticas } from './servidor'

export default function Pagos() {
  const [pagos, setPagos] = useState([])
  const [arriendos, setArriendos] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [formData, setFormData] = useState({
    arriendo_id: '',
    tipo_pago: 'parcial',
    monto: '',
    metodo_pago: 'efectivo',
    fecha_programada: '',
    fecha_pago: '',
    numero_documento: '',
    banco: '',
    observaciones: ''
  })
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: '',
    tipo_pago: '',
    metodo_pago: ''
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [dataPagos, dataArriendos, dataEstadisticas] = await Promise.all([
        obtenerPagos(),
        obtenerArriendos(),
        obtenerEstadisticas()
      ])
      setPagos(dataPagos)
      setArriendos(dataArriendos)
      setEstadisticas(dataEstadisticas)
    } catch (error) {
      console.error('Error cargando datos:', error)
      mostrarMensaje('Error al cargar los datos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.arriendo_id) {
      mostrarMensaje('Selecciona un arriendo', 'error')
      return
    }

    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      mostrarMensaje('El monto debe ser mayor a 0', 'error')
      return
    }

    try {
      setProcesando(true)

      if (editando) {
        await actualizarPago(editando, formData)
        mostrarMensaje('Pago actualizado correctamente', 'success')
      } else {
        await registrarPago(formData)
        mostrarMensaje('Pago registrado correctamente', 'success')
      }

      await cargarDatos()
      cerrarModal()
    } catch (error) {
      console.error('Error al guardar:', error)
      mostrarMensaje(error.message || 'Error al guardar pago', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const handleEditar = (pago) => {
    setEditando(pago.id)
    setFormData({
      arriendo_id: pago.arriendo_id,
      tipo_pago: pago.tipo_pago,
      monto: pago.monto,
      metodo_pago: pago.metodo_pago,
      fecha_programada: pago.fecha_programada ? pago.fecha_programada.split('T')[0] : '',
      fecha_pago: pago.fecha_pago ? pago.fecha_pago.split(' ')[0] : '',
      numero_documento: pago.numero_documento || '',
      banco: pago.banco || '',
      observaciones: pago.observaciones || ''
    })
    setShowModal(true)
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Está seguro de eliminar este pago?')) return

    try {
      setProcesando(true)
      await eliminarPago(id)
      mostrarMensaje('Pago eliminado correctamente', 'success')
      await cargarDatos()
    } catch (error) {
      console.error('Error al eliminar:', error)
      mostrarMensaje(error.message || 'Error al eliminar pago', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const cerrarModal = () => {
    setShowModal(false)
    setEditando(null)
    setFormData({
      arriendo_id: '',
      tipo_pago: 'parcial',
      monto: '',
      metodo_pago: 'efectivo',
      fecha_programada: '',
      fecha_pago: '',
      numero_documento: '',
      banco: '',
      observaciones: ''
    })
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

  const pagosFiltrados = pagos.filter(pago => {
    const cumpleBusqueda = !filtros.busqueda || 
      pago.numero_pago.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      pago.numero_contrato.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      pago.cliente_nombre.toLowerCase().includes(filtros.busqueda.toLowerCase())

    const cumpleEstado = !filtros.estado || pago.estado === filtros.estado
    const cumpleTipoPago = !filtros.tipo_pago || pago.tipo_pago === filtros.tipo_pago
    const cumpleMetodo = !filtros.metodo_pago || pago.metodo_pago === filtros.metodo_pago

    return cumpleBusqueda && cumpleEstado && cumpleTipoPago && cumpleMetodo
  })

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <ion-icon name="hourglass-outline"></ion-icon>
          <span>Cargando pagos...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Pagos de Arriendos</h1>
          <p className={styles.subtitle}>Gestiona los pagos de los contratos</p>
        </div>
        <button 
          className={styles.btnPrimary}
          onClick={() => setShowModal(true)}
        >
          <ion-icon name="add-circle-outline"></ion-icon>
          Registrar Pago
        </button>
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
              <span className={styles.statLabel}>Confirmados</span>
              <span className={styles.statValue}>{estadisticas.confirmados}</span>
              <span className={styles.statMonto}>S/ {estadisticas.total_confirmados?.toLocaleString()}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{background: 'linear-gradient(135deg, #ff9800 0%, #ffa726 100%)'}}>
              <ion-icon name="time-outline"></ion-icon>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Pendientes</span>
              <span className={styles.statValue}>{estadisticas.pendientes}</span>
              <span className={styles.statMonto}>S/ {estadisticas.total_pendientes?.toLocaleString()}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)'}}>
              <ion-icon name="cash-outline"></ion-icon>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Total Mes</span>
              <span className={styles.statValue}>S/ {estadisticas.total_mes?.toLocaleString()}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)'}}>
              <ion-icon name="stats-chart-outline"></ion-icon>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Total General</span>
              <span className={styles.statValue}>S/ {estadisticas.total_general?.toLocaleString()}</span>
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
              placeholder="Buscar por número, contrato o cliente..."
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
            <option value="pendiente">Pendiente</option>
            <option value="recibido">Recibido</option>
            <option value="confirmado">Confirmado</option>
            <option value="anulado">Anulado</option>
          </select>

          <select
            value={filtros.tipo_pago}
            onChange={(e) => setFiltros({...filtros, tipo_pago: e.target.value})}
            className={styles.select}
          >
            <option value="">Todos los tipos</option>
            <option value="anticipo">Anticipo</option>
            <option value="parcial">Parcial</option>
            <option value="total">Total</option>
            <option value="garantia">Garantía</option>
            <option value="mora">Mora</option>
            <option value="adicional">Adicional</option>
          </select>

          <select
            value={filtros.metodo_pago}
            onChange={(e) => setFiltros({...filtros, metodo_pago: e.target.value})}
            className={styles.select}
          >
            <option value="">Todos los métodos</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="cheque">Cheque</option>
            <option value="tarjeta_credito">Tarjeta Crédito</option>
            <option value="tarjeta_debito">Tarjeta Débito</option>
          </select>

          {(filtros.busqueda || filtros.estado || filtros.tipo_pago || filtros.metodo_pago) && (
            <button
              className={styles.btnClear}
              onClick={() => setFiltros({busqueda: '', estado: '', tipo_pago: '', metodo_pago: ''})}
            >
              <ion-icon name="close-circle-outline"></ion-icon>
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className={styles.results}>
        <span>{pagosFiltrados.length} pagos encontrados</span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Número</th>
              <th>Contrato</th>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Método</th>
              <th>Monto</th>
              <th>Fecha Pago</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagosFiltrados.map((pago) => (
              <tr key={pago.id}>
                <td className={styles.tdNumero}>{pago.numero_pago}</td>
                <td>
                  <Link href={`/admin/arriendos/ver/${pago.arriendo_id}`} className={styles.contratoLink}>
                    {pago.numero_contrato}
                  </Link>
                </td>
                <td className={styles.tdCliente}>{pago.cliente_nombre}</td>
                <td>
                  <span className={`${styles.tipoBadge} ${styles[`tipo${pago.tipo_pago.charAt(0).toUpperCase() + pago.tipo_pago.slice(1)}`]}`}>
                    {pago.tipo_pago}
                  </span>
                </td>
                <td className={styles.tdMetodo}>{pago.metodo_pago.replace('_', ' ')}</td>
                <td className={styles.tdMonto}>S/ {pago.monto?.toLocaleString()}</td>
                <td>{formatearFecha(pago.fecha_pago)}</td>
                <td>
                  <span className={`${styles.estadoBadge} ${styles[`estado${pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1)}`]}`}>
                    {pago.estado}
                  </span>
                </td>
                <td className={styles.tdAcciones}>
                  <div className={styles.acciones}>
                    <button
                      className={styles.btnEditar}
                      onClick={() => handleEditar(pago)}
                      disabled={procesando}
                      title="Editar"
                    >
                      <ion-icon name="create-outline"></ion-icon>
                    </button>
                    <button
                      className={styles.btnEliminar}
                      onClick={() => handleEliminar(pago.id)}
                      disabled={procesando}
                      title="Eliminar"
                    >
                      <ion-icon name="trash-outline"></ion-icon>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pagosFiltrados.length === 0 && (
          <div className={styles.empty}>
            <ion-icon name="cash-outline"></ion-icon>
            <h3>No se encontraron pagos</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalOverlay} onClick={cerrarModal}></div>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editando ? 'Editar Pago' : 'Registrar Pago'}</h2>
              <button className={styles.btnClose} onClick={cerrarModal}>
                <ion-icon name="close-outline"></ion-icon>
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Arriendo <span className={styles.required}>*</span></label>
                <select
                  value={formData.arriendo_id}
                  onChange={(e) => setFormData({...formData, arriendo_id: e.target.value})}
                  required
                  disabled={editando}
                >
                  <option value="">Selecciona un arriendo</option>
                  {arriendos.map(arr => (
                    <option key={arr.id} value={arr.id}>
                      {arr.numero_contrato} - {arr.cliente_nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Tipo de Pago <span className={styles.required}>*</span></label>
                  <select
                    value={formData.tipo_pago}
                    onChange={(e) => setFormData({...formData, tipo_pago: e.target.value})}
                    required
                  >
                    <option value="anticipo">Anticipo</option>
                    <option value="parcial">Parcial</option>
                    <option value="total">Total</option>
                    <option value="garantia">Garantía</option>
                    <option value="mora">Mora</option>
                    <option value="adicional">Adicional</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Monto <span className={styles.required}>*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.monto}
                    onChange={(e) => setFormData({...formData, monto: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Método de Pago <span className={styles.required}>*</span></label>
                <select
                  value={formData.metodo_pago}
                  onChange={(e) => setFormData({...formData, metodo_pago: e.target.value})}
                  required
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="cheque">Cheque</option>
                  <option value="tarjeta_credito">Tarjeta Crédito</option>
                  <option value="tarjeta_debito">Tarjeta Débito</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Fecha Programada</label>
                  <input
                    type="date"
                    value={formData.fecha_programada}
                    onChange={(e) => setFormData({...formData, fecha_programada: e.target.value})}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Fecha de Pago</label>
                  <input
                    type="date"
                    value={formData.fecha_pago}
                    onChange={(e) => setFormData({...formData, fecha_pago: e.target.value})}
                  />
                </div>
              </div>

              {(formData.metodo_pago === 'transferencia' || formData.metodo_pago === 'cheque') && (
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Número de Documento</label>
                    <input
                      type="text"
                      value={formData.numero_documento}
                      onChange={(e) => setFormData({...formData, numero_documento: e.target.value})}
                      placeholder="Número de operación o cheque"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Banco</label>
                    <input
                      type="text"
                      value={formData.banco}
                      onChange={(e) => setFormData({...formData, banco: e.target.value})}
                      placeholder="Nombre del banco"
                    />
                  </div>
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Observaciones</label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  rows="3"
                  placeholder="Observaciones adicionales..."
                ></textarea>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={cerrarModal}
                  disabled={procesando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={procesando}
                >
                  {procesando ? 'Guardando...' : editando ? 'Actualizar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}