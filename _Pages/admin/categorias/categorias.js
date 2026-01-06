"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './categorias.module.css'
import { obtenerCategorias, crearCategoria, actualizarCategoria, eliminarCategoria, cambiarOrden, subirImagen } from './servidor'

export default function Categorias() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo_tendido: 'ambos',
    imagen_url: '',
    activo: true
  })
  const [mensaje, setMensaje] = useState(null)
  const [procesando, setProcesando] = useState(false)
  const [archivoImagen, setArchivoImagen] = useState(null)
  const [previewImagen, setPreviewImagen] = useState(null)
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  const [tipoImagen, setTipoImagen] = useState('url')

  useEffect(() => {
    cargarCategorias()
  }, [])

  const cargarCategorias = async () => {
    try {
      setLoading(true)
      const data = await obtenerCategorias()
      setCategorias(data)
    } catch (error) {
      console.error('Error cargando categorias:', error)
      mostrarMensaje('Error al cargar categorías', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        mostrarMensaje('Solo se permiten archivos de imagen', 'error')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        mostrarMensaje('La imagen no debe superar 5MB', 'error')
        return
      }

      setArchivoImagen(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImagen(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubirImagen = async () => {
    if (!archivoImagen) {
      mostrarMensaje('Selecciona una imagen primero', 'error')
      return
    }

    try {
      setSubiendoImagen(true)
      const formDataImg = new FormData()
      formDataImg.append('imagen', archivoImagen)

      const resultado = await subirImagen(formDataImg)
      
      setFormData({...formData, imagen_url: resultado.url})
      setArchivoImagen(null)
      setPreviewImagen(null)
      mostrarMensaje('Imagen subida correctamente', 'success')
    } catch (error) {
      console.error('Error subiendo imagen:', error)
      mostrarMensaje(error.message || 'Error al subir imagen', 'error')
    } finally {
      setSubiendoImagen(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.nombre.trim()) {
      mostrarMensaje('El nombre es requerido', 'error')
      return
    }

    try {
      setProcesando(true)
      
      if (editando) {
        await actualizarCategoria(editando, formData)
        mostrarMensaje('Categoría actualizada correctamente', 'success')
      } else {
        await crearCategoria(formData)
        mostrarMensaje('Categoría creada correctamente', 'success')
      }

      await cargarCategorias()
      cerrarModal()
    } catch (error) {
      console.error('Error al guardar:', error)
      mostrarMensaje(error.message || 'Error al guardar categoría', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const handleEditar = (categoria) => {
    setEditando(categoria.id)
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      tipo_tendido: categoria.tipo_tendido,
      imagen_url: categoria.imagen_url || '',
      activo: categoria.activo
    })
    setShowModal(true)
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Está seguro de eliminar esta categoría?')) return

    try {
      setProcesando(true)
      await eliminarCategoria(id)
      mostrarMensaje('Categoría eliminada correctamente', 'success')
      await cargarCategorias()
    } catch (error) {
      console.error('Error al eliminar:', error)
      mostrarMensaje(error.message || 'Error al eliminar categoría', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const handleCambiarOrden = async (id, direccion) => {
    try {
      await cambiarOrden(id, direccion)
      await cargarCategorias()
    } catch (error) {
      console.error('Error al cambiar orden:', error)
      mostrarMensaje('Error al cambiar orden', 'error')
    }
  }

  const cerrarModal = () => {
    setShowModal(false)
    setEditando(null)
    setFormData({
      nombre: '',
      descripcion: '',
      tipo_tendido: 'ambos',
      imagen_url: '',
      activo: true
    })
    setArchivoImagen(null)
    setPreviewImagen(null)
    setTipoImagen('url')
  }

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3000)
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <ion-icon name="hourglass-outline"></ion-icon>
          <span>Cargando categorías...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Categorías de Equipos</h1>
          <p className={styles.subtitle}>Gestiona las categorías de equipos del sistema</p>
        </div>
        <button 
          className={styles.btnPrimary}
          onClick={() => setShowModal(true)}
          disabled={procesando}
        >
          <ion-icon name="add-circle-outline"></ion-icon>
          Nueva Categoría
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

      <div className={styles.grid}>
        {categorias.map((categoria) => (
          <div key={categoria.id} className={styles.card}>
            <div className={styles.cardHeader}>
              {categoria.imagen_url ? (
                <img 
                  src={categoria.imagen_url} 
                  alt={categoria.nombre}
                  className={styles.cardImage}
                />
              ) : (
                <div className={styles.cardImagePlaceholder}>
                  <ion-icon name="image-outline"></ion-icon>
                </div>
              )}
              <div className={styles.cardBadges}>
                <span className={`${styles.badge} ${categoria.activo ? styles.badgeSuccess : styles.badgeInactive}`}>
                  {categoria.activo ? 'Activo' : 'Inactivo'}
                </span>
                <span className={`${styles.badge} ${styles.badgeInfo}`}>
                  {categoria.tipo_tendido === 'aereo' ? 'Aéreo' : 
                   categoria.tipo_tendido === 'subterraneo' ? 'Subterráneo' : 'Ambos'}
                </span>
              </div>
            </div>

            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle}>{categoria.nombre}</h3>
              <p className={styles.cardDescription}>
                {categoria.descripcion || 'Sin descripción'}
              </p>
              
              <div className={styles.cardStats}>
                <div className={styles.stat}>
                  <ion-icon name="construct-outline"></ion-icon>
                  <span>{categoria.total_equipos} equipos</span>
                </div>
                <div className={styles.stat}>
                  <ion-icon name="eye-outline"></ion-icon>
                  <span>Orden: {categoria.orden}</span>
                </div>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <div className={styles.ordenBtns}>
                <button
                  className={styles.btnIcon}
                  onClick={() => handleCambiarOrden(categoria.id, 'subir')}
                  title="Subir"
                  disabled={procesando}
                >
                  <ion-icon name="arrow-up-outline"></ion-icon>
                </button>
                <button
                  className={styles.btnIcon}
                  onClick={() => handleCambiarOrden(categoria.id, 'bajar')}
                  title="Bajar"
                  disabled={procesando}
                >
                  <ion-icon name="arrow-down-outline"></ion-icon>
                </button>
              </div>
              
              <div className={styles.cardActions}>
                <button
                  className={styles.btnEdit}
                  onClick={() => handleEditar(categoria)}
                  disabled={procesando}
                >
                  <ion-icon name="create-outline"></ion-icon>
                  Editar
                </button>
                <button
                  className={styles.btnDelete}
                  onClick={() => handleEliminar(categoria.id)}
                  disabled={procesando}
                >
                  <ion-icon name="trash-outline"></ion-icon>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}

        {categorias.length === 0 && (
          <div className={styles.empty}>
            <ion-icon name="folder-open-outline"></ion-icon>
            <h3>No hay categorías registradas</h3>
            <p>Comienza agregando tu primera categoría</p>
            <button 
              className={styles.btnPrimary}
              onClick={() => setShowModal(true)}
            >
              <ion-icon name="add-circle-outline"></ion-icon>
              Crear Categoría
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalOverlay} onClick={cerrarModal}></div>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editando ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button className={styles.btnClose} onClick={cerrarModal}>
                <ion-icon name="close-outline"></ion-icon>
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Nombre de la categoría"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Descripción de la categoría"
                  rows="3"
                ></textarea>
              </div>

              <div className={styles.formGroup}>
                <label>Tipo de Tendido</label>
                <select
                  value={formData.tipo_tendido}
                  onChange={(e) => setFormData({...formData, tipo_tendido: e.target.value})}
                >
                  <option value="aereo">Aéreo</option>
                  <option value="subterraneo">Subterráneo</option>
                  <option value="ambos">Ambos</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Imagen</label>
                <div className={styles.imageTabs}>
                  <button
                    type="button"
                    className={`${styles.tabBtn} ${tipoImagen === 'url' ? styles.active : ''}`}
                    onClick={() => setTipoImagen('url')}
                  >
                    <ion-icon name="link-outline"></ion-icon>
                    URL
                  </button>
                  <button
                    type="button"
                    className={`${styles.tabBtn} ${tipoImagen === 'local' ? styles.active : ''}`}
                    onClick={() => setTipoImagen('local')}
                  >
                    <ion-icon name="cloud-upload-outline"></ion-icon>
                    Subir Local
                  </button>
                </div>

                {tipoImagen === 'url' ? (
                  <input
                    type="text"
                    value={formData.imagen_url}
                    onChange={(e) => setFormData({...formData, imagen_url: e.target.value})}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                ) : (
                  <div className={styles.uploadArea}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      id="fileInput"
                      className={styles.fileInput}
                    />
                    <label htmlFor="fileInput" className={styles.fileLabel}>
                      <ion-icon name="cloud-upload-outline"></ion-icon>
                      <span>Seleccionar imagen</span>
                      <span className={styles.fileHint}>JPG, PNG, GIF (Max 5MB)</span>
                    </label>

                    {previewImagen && (
                      <div className={styles.previewContainer}>
                        <img src={previewImagen} alt="Preview" className={styles.previewImage} />
                        <button
                          type="button"
                          className={styles.btnUpload}
                          onClick={handleSubirImagen}
                          disabled={subiendoImagen}
                        >
                          {subiendoImagen ? 'Subiendo...' : 'Confirmar y Subir'}
                        </button>
                      </div>
                    )}

                    {formData.imagen_url && !previewImagen && (
                      <div className={styles.currentImage}>
                        <img src={formData.imagen_url} alt="Imagen actual" />
                        <span>Imagen actual</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.formCheckbox}>
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                />
                <label htmlFor="activo">Categoría activa</label>
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