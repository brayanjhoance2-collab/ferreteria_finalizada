"use client"

import { useState, useEffect } from 'react'
import styles from './contacto.module.css'
import { obtenerContactos, obtenerContacto, actualizarContacto, eliminarContacto, responderContacto } from './servidor'

export default function Contacto() {
  const [contactos, setContactos] = useState([])
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [filtros, setFiltros] = useState({
    estado: '',
    tipo_consulta: '',
    buscar: ''
  })
  const [paginacion, setPaginacion] = useState({
    pagina: 1,
    limite: 20,
    total: 0,
    totalPaginas: 0
  })
  const [modalDetalle, setModalDetalle] = useState(false)
  const [modalRespuesta, setModalRespuesta] = useState(false)
  const [contactoSeleccionado, setContactoSeleccionado] = useState(null)
  const [respuesta, setRespuesta] = useState('')

  useEffect(() => {
    cargarContactos()
  }, [filtros, paginacion.pagina])

  const cargarContactos = async () => {
    try {
      setProcesando(true)
      const data = await obtenerContactos({
        ...filtros,
        pagina: paginacion.pagina,
        limite: paginacion.limite
      })
      setContactos(data.registros)
      setPaginacion({
        ...paginacion,
        total: data.total,
        totalPaginas: data.totalPaginas
      })
    } catch (error) {
      console.error('Error cargando contactos:', error)
      mostrarMensaje('Error al cargar mensajes de contacto', 'error')
    } finally {
      setProcesando(false)
      setLoading(false)
    }
  }

  const handleVerDetalle = async (id) => {
    try {
      setProcesando(true)
      const data = await obtenerContacto(id)
      setContactoSeleccionado(data)
      setModalDetalle(true)
    } catch (error) {
      console.error('Error al obtener detalle:', error)
      mostrarMensaje('Error al cargar detalle del contacto', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      setProcesando(true)
      await actualizarContacto(id, { estado: nuevoEstado })
      mostrarMensaje('Estado actualizado correctamente', 'success')
      await cargarContactos()
      if (contactoSeleccionado?.id === id) {
        const data = await obtenerContacto(id)
        setContactoSeleccionado(data)
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      mostrarMensaje('Error al actualizar estado', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const handleResponder = (contacto) => {
    setContactoSeleccionado(contacto)
    setRespuesta('')
    setModalRespuesta(true)
  }

  const handleEnviarRespuesta = async () => {
    if (!respuesta.trim()) {
      mostrarMensaje('La respuesta no puede estar vacía', 'error')
      return
    }

    try {
      setProcesando(true)
      await responderContacto(contactoSeleccionado.id, respuesta)
      mostrarMensaje('Respuesta enviada correctamente', 'success')
      setModalRespuesta(false)
      setRespuesta('')
      await cargarContactos()
    } catch (error) {
      console.error('Error al enviar respuesta:', error)
      mostrarMensaje(error.message || 'Error al enviar respuesta', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Está seguro de eliminar este mensaje de contacto?')) return

    try {
      setProcesando(true)
      await eliminarContacto(id)
      mostrarMensaje('Mensaje eliminado correctamente', 'success')
      await cargarContactos()
      if (modalDetalle) {
        setModalDetalle(false)
        setContactoSeleccionado(null)
      }
    } catch (error) {
      console.error('Error al eliminar:', error)
      mostrarMensaje('Error al eliminar mensaje', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= paginacion.totalPaginas) {
      setPaginacion({...paginacion, pagina: nuevaPagina})
    }
  }

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3000)
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return '-'
    return new Date(fecha).toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getColorEstado = (estado) => {
    const colores = {
      'nuevo': styles.estadoNuevo,
      'en_revision': styles.estadoRevision,
      'contactado': styles.estadoContactado,
      'respondido': styles.estadoRespondido,
      'cerrado': styles.estadoCerrado,
      'spam': styles.estadoSpam
    }
    return colores[estado] || ''
  }

  const getNombreEstado = (estado) => {
    const nombres = {
      'nuevo': 'Nuevo',
      'en_revision': 'En Revisión',
      'contactado': 'Contactado',
      'respondido': 'Respondido',
      'cerrado': 'Cerrado',
      'spam': 'Spam'
    }
    return nombres[estado] || estado
  }

  const getTipoConsulta = (tipo) => {
    const tipos = {
      'arriendo': 'Arriendo',
      'servicio_tecnico': 'Servicio Técnico',
      'certificacion': 'Certificación',
      'cotizacion': 'Cotización',
      'reclamo': 'Reclamo',
      'general': 'General'
    }
    return tipos[tipo] || tipo
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <ion-icon name="hourglass-outline"></ion-icon>
          <span>Cargando mensajes de contacto...</span>
        </div>
      </div>
    )
  }

  const estadisticas = {
    nuevos: contactos.filter(c => c.estado === 'nuevo').length,
    revision: contactos.filter(c => c.estado === 'en_revision').length,
    respondidos: contactos.filter(c => c.estado === 'respondido').length,
    cerrados: contactos.filter(c => c.estado === 'cerrado').length
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Mensajes de Contacto</h1>
          <p className={styles.subtitle}>Gestiona los mensajes recibidos del formulario de contacto</p>
        </div>
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

      <div className={styles.estadisticas}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <ion-icon name="mail-unread-outline"></ion-icon>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Nuevos</span>
            <span className={styles.statValue}>{estadisticas.nuevos}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <ion-icon name="eye-outline"></ion-icon>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>En Revisión</span>
            <span className={styles.statValue}>{estadisticas.revision}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <ion-icon name="chatbubble-ellipses-outline"></ion-icon>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Respondidos</span>
            <span className={styles.statValue}>{estadisticas.respondidos}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <ion-icon name="checkmark-done-outline"></ion-icon>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Cerrados</span>
            <span className={styles.statValue}>{estadisticas.cerrados}</span>
          </div>
        </div>
      </div>

      <div className={styles.filtros}>
        <div className={styles.filtroItem}>
          <ion-icon name="funnel-outline"></ion-icon>
          <select 
            value={filtros.estado} 
            onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
            className={styles.select}
          >
            <option value="">Todos los estados</option>
            <option value="nuevo">Nuevo</option>
            <option value="en_revision">En Revisión</option>
            <option value="contactado">Contactado</option>
            <option value="respondido">Respondido</option>
            <option value="cerrado">Cerrado</option>
            <option value="spam">Spam</option>
          </select>
        </div>

        <div className={styles.filtroItem}>
          <ion-icon name="pricetag-outline"></ion-icon>
          <select 
            value={filtros.tipo_consulta} 
            onChange={(e) => setFiltros({...filtros, tipo_consulta: e.target.value})}
            className={styles.select}
          >
            <option value="">Todos los tipos</option>
            <option value="arriendo">Arriendo</option>
            <option value="servicio_tecnico">Servicio Técnico</option>
            <option value="certificacion">Certificación</option>
            <option value="cotizacion">Cotización</option>
            <option value="reclamo">Reclamo</option>
            <option value="general">General</option>
          </select>
        </div>

        <div className={styles.filtroItem}>
          <ion-icon name="search-outline"></ion-icon>
          <input
            type="text"
            placeholder="Buscar por nombre, email..."
            value={filtros.buscar}
            onChange={(e) => setFiltros({...filtros, buscar: e.target.value})}
            className={styles.inputBuscar}
          />
        </div>

        {(filtros.estado || filtros.tipo_consulta || filtros.buscar) && (
          <button 
            className={styles.btnLimpiar}
            onClick={() => setFiltros({ estado: '', tipo_consulta: '', buscar: '' })}
          >
            <ion-icon name="close-circle-outline"></ion-icon>
            Limpiar
          </button>
        )}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Asunto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {contactos.length === 0 ? (
              <tr>
                <td colSpan="8" className={styles.emptyRow}>
                  <ion-icon name="mail-outline"></ion-icon>
                  <p>No se encontraron mensajes de contacto</p>
                </td>
              </tr>
            ) : (
              contactos.map((contacto) => (
                <tr key={contacto.id} className={contacto.estado === 'nuevo' ? styles.rowNuevo : ''}>
                  <td>{contacto.id}</td>
                  <td className={styles.fecha}>{formatearFecha(contacto.fecha_envio)}</td>
                  <td className={styles.nombre}>{contacto.nombre}</td>
                  <td className={styles.email}>{contacto.email}</td>
                  <td>
                    <span className={styles.tipoBadge}>{getTipoConsulta(contacto.tipo_consulta)}</span>
                  </td>
                  <td className={styles.asunto}>{contacto.asunto}</td>
                  <td>
                    <span className={`${styles.estadoBadge} ${getColorEstado(contacto.estado)}`}>
                      {getNombreEstado(contacto.estado)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.acciones}>
                      <button
                        className={styles.btnVer}
                        onClick={() => handleVerDetalle(contacto.id)}
                        title="Ver detalle"
                      >
                        <ion-icon name="eye-outline"></ion-icon>
                      </button>
                      <button
                        className={styles.btnResponder}
                        onClick={() => handleResponder(contacto)}
                        title="Responder"
                        disabled={contacto.estado === 'cerrado' || contacto.estado === 'spam'}
                      >
                        <ion-icon name="mail-outline"></ion-icon>
                      </button>
                      <button
                        className={styles.btnEliminar}
                        onClick={() => handleEliminar(contacto.id)}
                        title="Eliminar"
                      >
                        <ion-icon name="trash-outline"></ion-icon>
                      </button>
                    </div>
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
            disabled={paginacion.pagina === 1}
          >
            <ion-icon name="play-back-outline"></ion-icon>
          </button>
          <button
            className={styles.btnPaginacion}
            onClick={() => cambiarPagina(paginacion.pagina - 1)}
            disabled={paginacion.pagina === 1}
          >
            <ion-icon name="chevron-back-outline"></ion-icon>
          </button>
          
          <span className={styles.paginacionInfo}>
            Página {paginacion.pagina} de {paginacion.totalPaginas}
          </span>
          
          <button
            className={styles.btnPaginacion}
            onClick={() => cambiarPagina(paginacion.pagina + 1)}
            disabled={paginacion.pagina === paginacion.totalPaginas}
          >
            <ion-icon name="chevron-forward-outline"></ion-icon>
          </button>
          <button
            className={styles.btnPaginacion}
            onClick={() => cambiarPagina(paginacion.totalPaginas)}
            disabled={paginacion.pagina === paginacion.totalPaginas}
          >
            <ion-icon name="play-forward-outline"></ion-icon>
          </button>
        </div>
      )}

      {modalDetalle && contactoSeleccionado && (
        <div className={styles.modal}>
          <div className={styles.modalOverlay} onClick={() => setModalDetalle(false)}></div>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Detalle del Mensaje</h2>
              <button className={styles.btnClose} onClick={() => setModalDetalle(false)}>
                <ion-icon name="close-outline"></ion-icon>
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detalleGrid}>
                <div className={styles.detalleItem}>
                  <label>ID</label>
                  <span>{contactoSeleccionado.id}</span>
                </div>
                <div className={styles.detalleItem}>
                  <label>Fecha de Envío</label>
                  <span>{formatearFecha(contactoSeleccionado.fecha_envio)}</span>
                </div>
                <div className={styles.detalleItem}>
                  <label>Nombre</label>
                  <span>{contactoSeleccionado.nombre}</span>
                </div>
                <div className={styles.detalleItem}>
                  <label>Email</label>
                  <span>{contactoSeleccionado.email}</span>
                </div>
                <div className={styles.detalleItem}>
                  <label>Teléfono</label>
                  <span>{contactoSeleccionado.telefono || '-'}</span>
                </div>
                <div className={styles.detalleItem}>
                  <label>Empresa</label>
                  <span>{contactoSeleccionado.empresa || '-'}</span>
                </div>
                <div className={styles.detalleItem}>
                  <label>Tipo de Consulta</label>
                  <span className={styles.tipoBadge}>{getTipoConsulta(contactoSeleccionado.tipo_consulta)}</span>
                </div>
                <div className={styles.detalleItem}>
                  <label>Estado Actual</label>
                  <span className={`${styles.estadoBadge} ${getColorEstado(contactoSeleccionado.estado)}`}>
                    {getNombreEstado(contactoSeleccionado.estado)}
                  </span>
                </div>
              </div>

              <div className={styles.detalleSeccion}>
                <h3>Asunto</h3>
                <p>{contactoSeleccionado.asunto}</p>
              </div>

              <div className={styles.detalleSeccion}>
                <h3>Mensaje</h3>
                <p className={styles.mensaje}>{contactoSeleccionado.mensaje}</p>
              </div>

              {contactoSeleccionado.respuesta && (
                <div className={styles.detalleSeccion}>
                  <h3>Respuesta Enviada</h3>
                  <p className={styles.respuesta}>{contactoSeleccionado.respuesta}</p>
                  <small>Respondido el {formatearFecha(contactoSeleccionado.fecha_primera_respuesta)}</small>
                </div>
              )}

              <div className={styles.cambiarEstado}>
                <label>Cambiar Estado:</label>
                <select
                  value={contactoSeleccionado.estado}
                  onChange={(e) => handleCambiarEstado(contactoSeleccionado.id, e.target.value)}
                  disabled={procesando}
                  className={styles.select}
                >
                  <option value="nuevo">Nuevo</option>
                  <option value="en_revision">En Revisión</option>
                  <option value="contactado">Contactado</option>
                  <option value="respondido">Respondido</option>
                  <option value="cerrado">Cerrado</option>
                  <option value="spam">Spam</option>
                </select>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnSecondary}
                onClick={() => setModalDetalle(false)}
              >
                Cerrar
              </button>
              <button
                className={styles.btnPrimary}
                onClick={() => {
                  setModalDetalle(false)
                  handleResponder(contactoSeleccionado)
                }}
                disabled={contactoSeleccionado.estado === 'cerrado' || contactoSeleccionado.estado === 'spam'}
              >
                <ion-icon name="mail-outline"></ion-icon>
                Responder
              </button>
            </div>
          </div>
        </div>
      )}

      {modalRespuesta && contactoSeleccionado && (
        <div className={styles.modal}>
          <div className={styles.modalOverlay} onClick={() => setModalRespuesta(false)}></div>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Responder Mensaje</h2>
              <button className={styles.btnClose} onClick={() => setModalRespuesta(false)}>
                <ion-icon name="close-outline"></ion-icon>
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.destinatarioInfo}>
                <strong>Para:</strong> {contactoSeleccionado.nombre} ({contactoSeleccionado.email})
              </div>
              <div className={styles.destinatarioInfo}>
                <strong>Asunto:</strong> Re: {contactoSeleccionado.asunto}
              </div>

              <div className={styles.formGroup}>
                <label>Respuesta</label>
                <textarea
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  placeholder="Escribe tu respuesta aquí..."
                  rows="10"
                  className={styles.textarea}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnSecondary}
                onClick={() => setModalRespuesta(false)}
                disabled={procesando}
              >
                Cancelar
              </button>
              <button
                className={styles.btnSuccess}
                onClick={handleEnviarRespuesta}
                disabled={procesando}
              >
                <ion-icon name="send-outline"></ion-icon>
                {procesando ? 'Enviando...' : 'Enviar Respuesta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}