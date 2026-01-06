"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './empresa.module.css'
import { obtenerEmpresa, actualizarEmpresa, subirLogo, obtenerValores, crearValor, actualizarValor, eliminarValor, reordenarValores } from './servidor'

export default function Empresa() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [tabActiva, setTabActiva] = useState('informacion')
  const [empresa, setEmpresa] = useState(null)
  const [valores, setValores] = useState([])
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    horario_lun_jue: '',
    horario_vie: '',
    horario_sab: '',
    descripcion: '',
    historia: '',
    fecha_fundacion: '',
    anios_experiencia: ''
  })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [modalValor, setModalValor] = useState(false)
  const [valorActual, setValorActual] = useState(null)
  const [formValor, setFormValor] = useState({
    nombre: '',
    descripcion: ''
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [dataEmpresa, dataValores] = await Promise.all([
        obtenerEmpresa(),
        obtenerValores()
      ])
      
      setEmpresa(dataEmpresa)
      setFormData({
        nombre: dataEmpresa.nombre || '',
        telefono: dataEmpresa.telefono || '',
        email: dataEmpresa.email || '',
        horario_lun_jue: dataEmpresa.horario_lun_jue || '',
        horario_vie: dataEmpresa.horario_vie || '',
        horario_sab: dataEmpresa.horario_sab || '',
        descripcion: dataEmpresa.descripcion || '',
        historia: dataEmpresa.historia || '',
        fecha_fundacion: dataEmpresa.fecha_fundacion || '',
        anios_experiencia: dataEmpresa.anios_experiencia || ''
      })
      setValores(dataValores)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      mostrarMensaje('Error al cargar informacion de la empresa', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        mostrarMensaje('La imagen no puede superar los 2MB', 'error')
        return
      }
      if (!file.type.startsWith('image/')) {
        mostrarMensaje('Solo se permiten archivos de imagen', 'error')
        return
      }
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleActualizarEmpresa = async (e) => {
    e.preventDefault()
    
    if (!formData.nombre.trim()) {
      mostrarMensaje('El nombre de la empresa es requerido', 'error')
      return
    }

    if (!formData.email.trim()) {
      mostrarMensaje('El email es requerido', 'error')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      mostrarMensaje('Email no valido', 'error')
      return
    }

    try {
      setProcesando(true)
      await actualizarEmpresa(formData)
      mostrarMensaje('Informacion actualizada correctamente', 'success')
      await cargarDatos()
    } catch (error) {
      console.error('Error al actualizar empresa:', error)
      mostrarMensaje(error.message || 'Error al actualizar informacion', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const handleSubirLogo = async () => {
    if (!logoFile) {
      mostrarMensaje('Selecciona una imagen primero', 'error')
      return
    }

    try {
      setProcesando(true)
      const formDataLogo = new FormData()
      formDataLogo.append('logo', logoFile)
      
      await subirLogo(formDataLogo)
      mostrarMensaje('Logo actualizado correctamente', 'success')
      setLogoFile(null)
      setLogoPreview(null)
      await cargarDatos()
    } catch (error) {
      console.error('Error al subir logo:', error)
      mostrarMensaje(error.message || 'Error al subir logo', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const handleAbrirModalValor = (valor = null) => {
    if (valor) {
      setValorActual(valor)
      setFormValor({
        nombre: valor.nombre,
        descripcion: valor.descripcion
      })
    } else {
      setValorActual(null)
      setFormValor({
        nombre: '',
        descripcion: ''
      })
    }
    setModalValor(true)
  }

  const handleCerrarModalValor = () => {
    setModalValor(false)
    setValorActual(null)
    setFormValor({
      nombre: '',
      descripcion: ''
    })
  }

  const handleGuardarValor = async (e) => {
    e.preventDefault()

    if (!formValor.nombre.trim() || !formValor.descripcion.trim()) {
      mostrarMensaje('Todos los campos son requeridos', 'error')
      return
    }

    try {
      setProcesando(true)
      if (valorActual) {
        await actualizarValor(valorActual.id, formValor)
        mostrarMensaje('Valor actualizado correctamente', 'success')
      } else {
        await crearValor(formValor)
        mostrarMensaje('Valor creado correctamente', 'success')
      }
      handleCerrarModalValor()
      await cargarDatos()
    } catch (error) {
      console.error('Error al guardar valor:', error)
      mostrarMensaje(error.message || 'Error al guardar valor', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const handleEliminarValor = async (id) => {
    if (!confirm('Esta seguro de eliminar este valor?')) return

    try {
      setProcesando(true)
      await eliminarValor(id)
      mostrarMensaje('Valor eliminado correctamente', 'success')
      await cargarDatos()
    } catch (error) {
      console.error('Error al eliminar valor:', error)
      mostrarMensaje(error.message || 'Error al eliminar valor', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const handleMoverValor = async (id, direccion) => {
    const index = valores.findIndex(v => v.id === id)
    if (index === -1) return
    if (direccion === 'arriba' && index === 0) return
    if (direccion === 'abajo' && index === valores.length - 1) return

    const nuevoOrden = [...valores]
    const targetIndex = direccion === 'arriba' ? index - 1 : index + 1
    const temp = nuevoOrden[index]
    nuevoOrden[index] = nuevoOrden[targetIndex]
    nuevoOrden[targetIndex] = temp

    setValores(nuevoOrden)

    try {
      const ordenIds = nuevoOrden.map(v => v.id)
      await reordenarValores(ordenIds)
    } catch (error) {
      console.error('Error al reordenar valores:', error)
      mostrarMensaje('Error al reordenar valores', 'error')
      await cargarDatos()
    }
  }

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 4000)
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <ion-icon name="hourglass-outline"></ion-icon>
          <span>Cargando informacion de la empresa...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Informacion de la Empresa</h1>
          <p className={styles.subtitle}>Administra la informacion y valores de tu empresa</p>
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

      <div className={styles.content}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tabActiva === 'informacion' ? styles.tabActive : ''}`}
            onClick={() => setTabActiva('informacion')}
          >
            <ion-icon name="business-outline"></ion-icon>
            Informacion General
          </button>
          <button
            className={`${styles.tab} ${tabActiva === 'valores' ? styles.tabActive : ''}`}
            onClick={() => setTabActiva('valores')}
          >
            <ion-icon name="heart-outline"></ion-icon>
            Valores Corporativos
          </button>
        </div>

        <div className={styles.mainContent}>
          {tabActiva === 'informacion' && (
            <div className={styles.tabContent}>
              <div className={styles.logoSection}>
                <h2>Logo de la Empresa</h2>
                <div className={styles.logoContainer}>
                  <div className={styles.logoPreview}>
                    {logoPreview || empresa?.logo_url ? (
                      <img 
                        src={logoPreview || empresa.logo_url} 
                        alt={empresa.nombre}
                        className={styles.logoImage}
                      />
                    ) : (
                      <div className={styles.logoPlaceholder}>
                        <ion-icon name="image-outline"></ion-icon>
                        <p>Sin logo</p>
                      </div>
                    )}
                  </div>
                  <div className={styles.logoActions}>
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className={styles.fileInput}
                    />
                    <label htmlFor="logo-upload" className={styles.btnUpload}>
                      <ion-icon name="cloud-upload-outline"></ion-icon>
                      Seleccionar logo
                    </label>
                    {logoFile && (
                      <button 
                        className={styles.btnSaveLogo}
                        onClick={handleSubirLogo}
                        disabled={procesando}
                      >
                        <ion-icon name="checkmark-outline"></ion-icon>
                        Guardar logo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleActualizarEmpresa} className={styles.form}>
                <div className={styles.sectionHeader}>
                  <h2>Datos de Contacto</h2>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="nombre">
                      <ion-icon name="business-outline"></ion-icon>
                      Nombre de la Empresa
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      placeholder="Ferreteria RyM"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="telefono">
                      <ion-icon name="call-outline"></ion-icon>
                      Telefono
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      placeholder="+51 1 234 5678"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email">
                      <ion-icon name="mail-outline"></ion-icon>
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="contacto@empresa.com"
                      required
                    />
                  </div>
                </div>

                <div className={styles.sectionHeader}>
                  <h2>Horarios de Atencion</h2>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="horario_lun_jue">
                      <ion-icon name="time-outline"></ion-icon>
                      Lunes a Jueves
                    </label>
                    <input
                      type="text"
                      id="horario_lun_jue"
                      name="horario_lun_jue"
                      value={formData.horario_lun_jue}
                      onChange={handleInputChange}
                      placeholder="08:00 - 18:00"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="horario_vie">
                      <ion-icon name="time-outline"></ion-icon>
                      Viernes
                    </label>
                    <input
                      type="text"
                      id="horario_vie"
                      name="horario_vie"
                      value={formData.horario_vie}
                      onChange={handleInputChange}
                      placeholder="08:00 - 18:00"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="horario_sab">
                      <ion-icon name="time-outline"></ion-icon>
                      Sabado
                    </label>
                    <input
                      type="text"
                      id="horario_sab"
                      name="horario_sab"
                      value={formData.horario_sab}
                      onChange={handleInputChange}
                      placeholder="08:00 - 14:00"
                    />
                  </div>
                </div>

                <div className={styles.sectionHeader}>
                  <h2>Historia y Descripcion</h2>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="fecha_fundacion">
                      <ion-icon name="calendar-outline"></ion-icon>
                      Año de Fundacion
                    </label>
                    <input
                      type="number"
                      id="fecha_fundacion"
                      name="fecha_fundacion"
                      value={formData.fecha_fundacion}
                      onChange={handleInputChange}
                      placeholder="2000"
                      min="1900"
                      max="2100"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="anios_experiencia">
                      <ion-icon name="trophy-outline"></ion-icon>
                      Años de Experiencia
                    </label>
                    <input
                      type="number"
                      id="anios_experiencia"
                      name="anios_experiencia"
                      value={formData.anios_experiencia}
                      onChange={handleInputChange}
                      placeholder="24"
                      min="0"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="descripcion">
                    <ion-icon name="document-text-outline"></ion-icon>
                    Descripcion de la Empresa
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    placeholder="Descripcion breve de la empresa..."
                    rows="4"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="historia">
                    <ion-icon name="book-outline"></ion-icon>
                    Historia de la Empresa
                  </label>
                  <textarea
                    id="historia"
                    name="historia"
                    value={formData.historia}
                    onChange={handleInputChange}
                    placeholder="Historia detallada de la empresa..."
                    rows="6"
                  />
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={cargarDatos}
                    disabled={procesando}
                  >
                    <ion-icon name="refresh-outline"></ion-icon>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={styles.btnPrimary}
                    disabled={procesando}
                  >
                    <ion-icon name="save-outline"></ion-icon>
                    {procesando ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {tabActiva === 'valores' && (
            <div className={styles.tabContent}>
              <div className={styles.valoresHeader}>
                <div>
                  <h2>Valores Corporativos</h2>
                  <p>Gestiona los valores que representan a tu empresa</p>
                </div>
                <button
                  className={styles.btnPrimary}
                  onClick={() => handleAbrirModalValor()}
                >
                  <ion-icon name="add-outline"></ion-icon>
                  Agregar Valor
                </button>
              </div>

              <div className={styles.valoresList}>
                {valores.length === 0 ? (
                  <div className={styles.empty}>
                    <ion-icon name="heart-outline"></ion-icon>
                    <p>No hay valores registrados</p>
                    <button
                      className={styles.btnPrimary}
                      onClick={() => handleAbrirModalValor()}
                    >
                      Agregar primer valor
                    </button>
                  </div>
                ) : (
                  valores.map((valor, index) => (
                    <div key={valor.id} className={styles.valorCard}>
                      <div className={styles.valorOrden}>
                        <span>#{index + 1}</span>
                        <div className={styles.valorOrdenBotones}>
                          <button
                            onClick={() => handleMoverValor(valor.id, 'arriba')}
                            disabled={index === 0}
                            title="Mover arriba"
                          >
                            <ion-icon name="chevron-up-outline"></ion-icon>
                          </button>
                          <button
                            onClick={() => handleMoverValor(valor.id, 'abajo')}
                            disabled={index === valores.length - 1}
                            title="Mover abajo"
                          >
                            <ion-icon name="chevron-down-outline"></ion-icon>
                          </button>
                        </div>
                      </div>
                      <div className={styles.valorContent}>
                        <h3>{valor.nombre}</h3>
                        <p>{valor.descripcion}</p>
                      </div>
                      <div className={styles.valorAcciones}>
                        <button
                          className={styles.btnEditar}
                          onClick={() => handleAbrirModalValor(valor)}
                          title="Editar"
                        >
                          <ion-icon name="pencil-outline"></ion-icon>
                        </button>
                        <button
                          className={styles.btnEliminar}
                          onClick={() => handleEliminarValor(valor.id)}
                          title="Eliminar"
                        >
                          <ion-icon name="trash-outline"></ion-icon>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {modalValor && (
        <div className={styles.modal}>
          <div className={styles.modalOverlay} onClick={handleCerrarModalValor}></div>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{valorActual ? 'Editar Valor' : 'Agregar Valor'}</h2>
              <button className={styles.btnClose} onClick={handleCerrarModalValor}>
                <ion-icon name="close-outline"></ion-icon>
              </button>
            </div>

            <form onSubmit={handleGuardarValor} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label htmlFor="nombre_valor">
                  <ion-icon name="heart-outline"></ion-icon>
                  Nombre del Valor
                </label>
                <input
                  type="text"
                  id="nombre_valor"
                  value={formValor.nombre}
                  onChange={(e) => setFormValor({...formValor, nombre: e.target.value})}
                  placeholder="Ej: Calidad, Compromiso, Innovacion..."
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="descripcion_valor">
                  <ion-icon name="document-text-outline"></ion-icon>
                  Descripcion
                </label>
                <textarea
                  id="descripcion_valor"
                  value={formValor.descripcion}
                  onChange={(e) => setFormValor({...formValor, descripcion: e.target.value})}
                  placeholder="Describe que significa este valor para la empresa..."
                  rows="4"
                  required
                />
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={handleCerrarModalValor}
                  disabled={procesando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={procesando}
                >
                  <ion-icon name="checkmark-outline"></ion-icon>
                  {procesando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}