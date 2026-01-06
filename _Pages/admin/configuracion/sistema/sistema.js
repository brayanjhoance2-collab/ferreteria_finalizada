"use client"

import { useState, useEffect } from 'react'
import styles from './sistema.module.css'
import { obtenerConfiguraciones, crearConfiguracion, actualizarConfiguracion, eliminarConfiguracion, obtenerGrupos } from './servidor'

export default function ConfiguracionSistema() {
  const [configuraciones, setConfiguraciones] = useState([])
  const [grupos, setGrupos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [formData, setFormData] = useState({
    clave: '',
    valor: '',
    tipo: 'texto',
    descripcion: '',
    grupo: ''
  })
  const [mensaje, setMensaje] = useState(null)
  const [procesando, setProcesando] = useState(false)
  const [filtroGrupo, setFiltroGrupo] = useState('')
  const [filtroBuscar, setFiltroBuscar] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [dataConfig, dataGrupos] = await Promise.all([
        obtenerConfiguraciones(),
        obtenerGrupos()
      ])
      setConfiguraciones(dataConfig)
      setGrupos(dataGrupos)
    } catch (error) {
      console.error('Error cargando datos:', error)
      mostrarMensaje('Error al cargar configuraciones', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.clave.trim() || !formData.valor.trim()) {
      mostrarMensaje('La clave y el valor son requeridos', 'error')
      return
    }

    try {
      setProcesando(true)
      
      if (editando) {
        await actualizarConfiguracion(editando, formData)
        mostrarMensaje('Configuración actualizada correctamente', 'success')
      } else {
        await crearConfiguracion(formData)
        mostrarMensaje('Configuración creada correctamente', 'success')
      }

      await cargarDatos()
      cerrarModal()
    } catch (error) {
      console.error('Error al guardar:', error)
      mostrarMensaje(error.message || 'Error al guardar configuración', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const handleEditar = (config) => {
    setEditando(config.id)
    setFormData({
      clave: config.clave,
      valor: config.valor,
      tipo: config.tipo,
      descripcion: config.descripcion || '',
      grupo: config.grupo || ''
    })
    setShowModal(true)
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Está seguro de eliminar esta configuración?')) return

    try {
      setProcesando(true)
      await eliminarConfiguracion(id)
      mostrarMensaje('Configuración eliminada correctamente', 'success')
      await cargarDatos()
    } catch (error) {
      console.error('Error al eliminar:', error)
      mostrarMensaje(error.message || 'Error al eliminar configuración', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const cerrarModal = () => {
    setShowModal(false)
    setEditando(null)
    setFormData({
      clave: '',
      valor: '',
      tipo: 'texto',
      descripcion: '',
      grupo: ''
    })
  }

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3000)
  }

  const configsFiltradas = configuraciones.filter(config => {
    const matchGrupo = !filtroGrupo || config.grupo === filtroGrupo
    const matchBuscar = !filtroBuscar || 
      config.clave.toLowerCase().includes(filtroBuscar.toLowerCase()) ||
      config.descripcion?.toLowerCase().includes(filtroBuscar.toLowerCase())
    return matchGrupo && matchBuscar
  })

  const configsPorGrupo = configsFiltradas.reduce((acc, config) => {
    const grupo = config.grupo || 'Sin grupo'
    if (!acc[grupo]) acc[grupo] = []
    acc[grupo].push(config)
    return acc
  }, {})

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <ion-icon name="hourglass-outline"></ion-icon>
          <span>Cargando configuraciones...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Configuración del Sistema</h1>
          <p className={styles.subtitle}>Gestiona los parámetros generales del sistema</p>
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

      <div className={styles.filtros}>
        <div className={styles.filtroItem}>
          <ion-icon name="funnel-outline"></ion-icon>
          <select 
            value={filtroGrupo} 
            onChange={(e) => setFiltroGrupo(e.target.value)}
            className={styles.select}
          >
            <option value="">Todos los grupos</option>
            {grupos.map(grupo => (
              <option key={grupo} value={grupo}>{grupo}</option>
            ))}
          </select>
        </div>

        <div className={styles.filtroItem}>
          <ion-icon name="search-outline"></ion-icon>
          <input
            type="text"
            placeholder="Buscar configuración..."
            value={filtroBuscar}
            onChange={(e) => setFiltroBuscar(e.target.value)}
            className={styles.inputBuscar}
          />
        </div>

        {(filtroGrupo || filtroBuscar) && (
          <button 
            className={styles.btnLimpiar}
            onClick={() => {
              setFiltroGrupo('')
              setFiltroBuscar('')
            }}
          >
            <ion-icon name="close-circle-outline"></ion-icon>
            Limpiar
          </button>
        )}
      </div>

      <div className={styles.estadisticas}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <ion-icon name="settings-outline"></ion-icon>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Configuraciones</span>
            <span className={styles.statValue}>{configuraciones.length}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <ion-icon name="folder-outline"></ion-icon>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Grupos</span>
            <span className={styles.statValue}>{grupos.length}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <ion-icon name="eye-outline"></ion-icon>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Mostrando</span>
            <span className={styles.statValue}>{configsFiltradas.length}</span>
          </div>
        </div>
      </div>

      {Object.keys(configsPorGrupo).length === 0 ? (
        <div className={styles.empty}>
          <ion-icon name="settings-outline"></ion-icon>
          <h3>No hay configuraciones</h3>
          <p>Comienza agregando tu primera configuración del sistema</p>
          <button 
            className={styles.btnPrimary}
            onClick={() => setShowModal(true)}
          >
            <ion-icon name="add-circle-outline"></ion-icon>
            Crear Configuración
          </button>
        </div>
      ) : (
        <div className={styles.grupos}>
          {Object.entries(configsPorGrupo).map(([grupo, configs]) => (
            <div key={grupo} className={styles.grupoSection}>
              <h2 className={styles.grupoTitulo}>
                <ion-icon name="folder-open-outline"></ion-icon>
                {grupo}
                <span className={styles.grupoCount}>{configs.length}</span>
              </h2>

              <div className={styles.grid}>
                {configs.map((config) => (
                  <div key={config.id} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <div className={styles.cardTitleGroup}>
                        <h3 className={styles.cardTitle}>{config.clave}</h3>
                        <span className={`${styles.tipoBadge} ${styles[`tipo${config.tipo.charAt(0).toUpperCase() + config.tipo.slice(1)}`]}`}>
                          {config.tipo === 'texto' && <ion-icon name="text-outline"></ion-icon>}
                          {config.tipo === 'numero' && <ion-icon name="calculator-outline"></ion-icon>}
                          {config.tipo === 'boolean' && <ion-icon name="toggle-outline"></ion-icon>}
                          {config.tipo === 'json' && <ion-icon name="code-outline"></ion-icon>}
                          {config.tipo}
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardBody}>
                      {config.descripcion && (
                        <p className={styles.cardDescripcion}>{config.descripcion}</p>
                      )}
                      
                      <div className={styles.valorContainer}>
                        <label>Valor:</label>
                        <div className={styles.valor}>
                          {config.tipo === 'boolean' ? (
                            <span className={`${styles.booleanBadge} ${config.valor === 'true' ? styles.booleanTrue : styles.booleanFalse}`}>
                              <ion-icon name={config.valor === 'true' ? 'checkmark-circle' : 'close-circle'}></ion-icon>
                              {config.valor === 'true' ? 'Verdadero' : 'Falso'}
                            </span>
                          ) : config.tipo === 'json' ? (
                            <pre className={styles.jsonValor}>{config.valor}</pre>
                          ) : (
                            <span className={styles.textoValor}>{config.valor}</span>
                          )}
                        </div>
                      </div>

                      <div className={styles.cardMeta}>
                        <span>
                          <ion-icon name="time-outline"></ion-icon>
                          Actualizado: {new Date(config.fecha_actualizacion).toLocaleDateString('es-PE')}
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      <button
                        className={styles.btnEdit}
                        onClick={() => handleEditar(config)}
                        disabled={procesando}
                      >
                        <ion-icon name="create-outline"></ion-icon>
                        Editar
                      </button>
                      <button
                        className={styles.btnDelete}
                        onClick={() => handleEliminar(config.id)}
                        disabled={procesando}
                      >
                        <ion-icon name="trash-outline"></ion-icon>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalOverlay} onClick={cerrarModal}></div>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editando ? 'Editar Configuración' : 'Nueva Configuración'}</h2>
              <button className={styles.btnClose} onClick={cerrarModal}>
                <ion-icon name="close-outline"></ion-icon>
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Clave</label>
                <input
                  type="text"
                  value={formData.clave}
                  onChange={(e) => setFormData({...formData, clave: e.target.value})}
                  placeholder="Ej: igv_porcentaje"
                  required
                  disabled={editando}
                />
                <small>Solo letras minúsculas, números y guión bajo</small>
              </div>

              <div className={styles.formGroup}>
                <label>Tipo de Dato</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  required
                >
                  <option value="texto">Texto</option>
                  <option value="numero">Número</option>
                  <option value="boolean">Booleano</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Valor</label>
                {formData.tipo === 'boolean' ? (
                  <select
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: e.target.value})}
                    required
                  >
                    <option value="true">Verdadero</option>
                    <option value="false">Falso</option>
                  </select>
                ) : formData.tipo === 'json' ? (
                  <textarea
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: e.target.value})}
                    placeholder='{"ejemplo": "valor"}'
                    rows="5"
                    required
                  ></textarea>
                ) : (
                  <input
                    type={formData.tipo === 'numero' ? 'number' : 'text'}
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: e.target.value})}
                    placeholder="Ingrese el valor"
                    required
                    step={formData.tipo === 'numero' ? 'any' : undefined}
                  />
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Descripción de esta configuración"
                  rows="3"
                ></textarea>
              </div>

              <div className={styles.formGroup}>
                <label>Grupo</label>
                <input
                  type="text"
                  value={formData.grupo}
                  onChange={(e) => setFormData({...formData, grupo: e.target.value})}
                  placeholder="Ej: facturacion, general, arriendos"
                  list="grupos-list"
                />
                <datalist id="grupos-list">
                  {grupos.map(grupo => (
                    <option key={grupo} value={grupo} />
                  ))}
                </datalist>
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
                  {procesando ? 'Guardando...' : editando ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}