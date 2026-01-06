"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './agregar.module.css'
import { obtenerCategorias, crearEquipo, subirImagen, generarCodigoUnico } from './servidor'

export default function AgregarEquipo() {
  const router = useRouter()
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [formData, setFormData] = useState({
    categoria_id: '',
    codigo: 'Generando...',
    nombre: '',
    tipo: '',
    marca: '',
    modelo: '',
    capacidad: '',
    descripcion_corta: '',
    descripcion_completa: '',
    tecnologia: '',
    caracteristicas: [],
    estado: 'disponible',
    stock: 1,
    precio_dia: '',
    precio_semana: '',
    precio_semana: '',
    precio_mes: '',
    precio_compra: '',
    fecha_adquisicion: '',
    garantia_meses: '',
    peso_kg: '',
    dimensiones: '',
    imagen_principal: '',
    activo: true,
    destacado: false
  })
  const [caracteristica, setCaracteristica] = useState('')
  const [imagenes, setImagenes] = useState([])
  const [especificaciones, setEspecificaciones] = useState([])
  const [nuevaEspec, setNuevaEspec] = useState({ nombre: '', valor: '', unidad: '' })
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  const [imagenPrincipalPreview, setImagenPrincipalPreview] = useState(null)

  useEffect(() => {
    cargarCategorias()
    generarCodigo()
  }, [])

  const generarCodigo = async () => {
    try {
      setFormData(prev => ({...prev, codigo: 'Generando...'}))
      const resultado = await generarCodigoUnico()
      console.log('Código generado:', resultado)
      setFormData(prev => ({...prev, codigo: resultado.codigo}))
    } catch (error) {
      console.error('Error generando código:', error)
      mostrarMensaje('Error al generar código automático', 'error')
      setFormData(prev => ({...prev, codigo: 'ERROR'}))
    }
  }

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

  const handleImagenPrincipalChange = async (e) => {
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

      try {
        setSubiendoImagen(true)
        const formDataImg = new FormData()
        formDataImg.append('imagen', file)
        formDataImg.append('tipo', 'principal')

        const resultado = await subirImagen(formDataImg)
        setFormData({...formData, imagen_principal: resultado.url})
        setImagenPrincipalPreview(resultado.url)
        mostrarMensaje('Imagen principal subida correctamente', 'success')
      } catch (error) {
        console.error('Error subiendo imagen:', error)
        mostrarMensaje(error.message || 'Error al subir imagen', 'error')
      } finally {
        setSubiendoImagen(false)
      }
    }
  }

  const handleImagenesSecundariasChange = async (e) => {
    const files = Array.from(e.target.files)
    
    if (files.length + imagenes.length > 5) {
      mostrarMensaje('Máximo 5 imágenes secundarias', 'error')
      return
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        mostrarMensaje('Solo se permiten archivos de imagen', 'error')
        continue
      }

      if (file.size > 5 * 1024 * 1024) {
        mostrarMensaje('La imagen no debe superar 5MB', 'error')
        continue
      }

      try {
        setSubiendoImagen(true)
        const formDataImg = new FormData()
        formDataImg.append('imagen', file)
        formDataImg.append('tipo', 'secundaria')

        const resultado = await subirImagen(formDataImg)
        setImagenes([...imagenes, { url: resultado.url, alt_text: '', orden: imagenes.length }])
        mostrarMensaje('Imagen agregada correctamente', 'success')
      } catch (error) {
        console.error('Error subiendo imagen:', error)
        mostrarMensaje(error.message || 'Error al subir imagen', 'error')
      } finally {
        setSubiendoImagen(false)
      }
    }
  }

  const eliminarImagen = (index) => {
    setImagenes(imagenes.filter((_, i) => i !== index))
  }

  const agregarCaracteristica = () => {
    if (caracteristica.trim()) {
      setFormData({
        ...formData,
        caracteristicas: [...formData.caracteristicas, caracteristica.trim()]
      })
      setCaracteristica('')
    }
  }

  const eliminarCaracteristica = (index) => {
    setFormData({
      ...formData,
      caracteristicas: formData.caracteristicas.filter((_, i) => i !== index)
    })
  }

  const agregarEspecificacion = () => {
    if (nuevaEspec.nombre && nuevaEspec.valor) {
      setEspecificaciones([
        ...especificaciones,
        { ...nuevaEspec, orden: especificaciones.length }
      ])
      setNuevaEspec({ nombre: '', valor: '', unidad: '' })
    }
  }

  const eliminarEspecificacion = (index) => {
    setEspecificaciones(especificaciones.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.categoria_id) {
      mostrarMensaje('Selecciona una categoría', 'error')
      return
    }

    if (!formData.nombre.trim()) {
      mostrarMensaje('El nombre es requerido', 'error')
      return
    }

    if (formData.codigo === 'Generando...') {
      mostrarMensaje('Espera a que se genere el código', 'error')
      return
    }

    try {
      setProcesando(true)

      const datosEquipo = {
        ...formData,
        imagenes,
        especificaciones
      }

      await crearEquipo(datosEquipo)
      mostrarMensaje('Equipo creado correctamente', 'success')
      
      setTimeout(() => {
        router.push('/admin/equipos/lista')
      }, 1500)
    } catch (error) {
      console.error('Error al crear equipo:', error)
      mostrarMensaje(error.message || 'Error al crear equipo', 'error')
    } finally {
      setProcesando(false)
    }
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
          <span>Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Agregar Nuevo Equipo</h1>
          <p className={styles.subtitle}>Completa los datos del equipo</p>
        </div>
        <button 
          type="button"
          className={styles.btnSecondary}
          onClick={() => router.back()}
        >
          <ion-icon name="arrow-back-outline"></ion-icon>
          Volver
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

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.mainColumn}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <ion-icon name="information-circle-outline"></ion-icon>
                Información Básica
              </h2>
              <div className={styles.cardBody}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Categoría <span className={styles.required}>*</span></label>
                    <select
                      value={formData.categoria_id}
                      onChange={(e) => setFormData({...formData, categoria_id: e.target.value})}
                      required
                    >
                      <option value="">Selecciona una categoría</option>
                      {categorias.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Código <span className={styles.required}>*</span></label>
                    <div className={styles.codigoWrapper}>
                      <input
                        type="text"
                        value={formData.codigo}
                        readOnly
                        disabled
                      />
                      <button
                        type="button"
                        className={styles.btnRegenerar}
                        onClick={generarCodigo}
                        title="Regenerar código"
                      >
                        <ion-icon name="refresh-outline"></ion-icon>
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Nombre del Equipo <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Nombre del equipo"
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Tipo</label>
                    <input
                      type="text"
                      value={formData.tipo}
                      onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                      placeholder="Tipo de equipo"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Marca</label>
                    <input
                      type="text"
                      value={formData.marca}
                      onChange={(e) => setFormData({...formData, marca: e.target.value})}
                      placeholder="Marca"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Modelo</label>
                    <input
                      type="text"
                      value={formData.modelo}
                      onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                      placeholder="Modelo"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Capacidad</label>
                    <input
                      type="text"
                      value={formData.capacidad}
                      onChange={(e) => setFormData({...formData, capacidad: e.target.value})}
                      placeholder="Ej: 5 ton, 100 HP"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Descripción Corta</label>
                  <textarea
                    value={formData.descripcion_corta}
                    onChange={(e) => setFormData({...formData, descripcion_corta: e.target.value})}
                    placeholder="Descripción breve del equipo"
                    rows="2"
                    maxLength="255"
                  ></textarea>
                </div>

                <div className={styles.formGroup}>
                  <label>Descripción Completa</label>
                  <textarea
                    value={formData.descripcion_completa}
                    onChange={(e) => setFormData({...formData, descripcion_completa: e.target.value})}
                    placeholder="Descripción detallada del equipo"
                    rows="4"
                  ></textarea>
                </div>

                <div className={styles.formGroup}>
                  <label>Tecnología</label>
                  <textarea
                    value={formData.tecnologia}
                    onChange={(e) => setFormData({...formData, tecnologia: e.target.value})}
                    placeholder="Información sobre la tecnología del equipo"
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <ion-icon name="list-outline"></ion-icon>
                Características
              </h2>
              <div className={styles.cardBody}>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    value={caracteristica}
                    onChange={(e) => setCaracteristica(e.target.value)}
                    placeholder="Escribe una característica"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarCaracteristica())}
                  />
                  <button
                    type="button"
                    className={styles.btnAdd}
                    onClick={agregarCaracteristica}
                  >
                    <ion-icon name="add-outline"></ion-icon>
                    Agregar
                  </button>
                </div>

                {formData.caracteristicas.length > 0 && (
                  <div className={styles.itemsList}>
                    {formData.caracteristicas.map((car, index) => (
                      <div key={index} className={styles.listItem}>
                        <ion-icon name="checkmark-circle-outline"></ion-icon>
                        <span>{car}</span>
                        <button
                          type="button"
                          className={styles.btnRemove}
                          onClick={() => eliminarCaracteristica(index)}
                        >
                          <ion-icon name="close-outline"></ion-icon>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <ion-icon name="document-text-outline"></ion-icon>
                Especificaciones Técnicas
              </h2>
              <div className={styles.cardBody}>
                <div className={styles.especRow}>
                  <input
                    type="text"
                    value={nuevaEspec.nombre}
                    onChange={(e) => setNuevaEspec({...nuevaEspec, nombre: e.target.value})}
                    placeholder="Nombre"
                  />
                  <input
                    type="text"
                    value={nuevaEspec.valor}
                    onChange={(e) => setNuevaEspec({...nuevaEspec, valor: e.target.value})}
                    placeholder="Valor"
                  />
                  <input
                    type="text"
                    value={nuevaEspec.unidad}
                    onChange={(e) => setNuevaEspec({...nuevaEspec, unidad: e.target.value})}
                    placeholder="Unidad"
                    className={styles.inputSmall}
                  />
                  <button
                    type="button"
                    className={styles.btnAdd}
                    onClick={agregarEspecificacion}
                  >
                    <ion-icon name="add-outline"></ion-icon>
                  </button>
                </div>

                {especificaciones.length > 0 && (
                  <div className={styles.especsList}>
                    {especificaciones.map((espec, index) => (
                      <div key={index} className={styles.especItem}>
                        <div className={styles.especInfo}>
                          <strong>{espec.nombre}:</strong>
                          <span>{espec.valor} {espec.unidad}</span>
                        </div>
                        <button
                          type="button"
                          className={styles.btnRemove}
                          onClick={() => eliminarEspecificacion(index)}
                        >
                          <ion-icon name="close-outline"></ion-icon>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.sideColumn}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <ion-icon name="image-outline"></ion-icon>
                Imágenes
              </h2>
              <div className={styles.cardBody}>
                <div className={styles.formGroup}>
                  <label>Imagen Principal</label>
                  <div className={styles.uploadArea}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImagenPrincipalChange}
                      id="imagenPrincipal"
                      className={styles.fileInput}
                      disabled={subiendoImagen}
                    />
                    <label htmlFor="imagenPrincipal" className={styles.fileLabel}>
                      {imagenPrincipalPreview ? (
                        <img src={imagenPrincipalPreview} alt="Preview" className={styles.imagePreview} />
                      ) : (
                        <>
                          <ion-icon name="cloud-upload-outline"></ion-icon>
                          <span>Subir imagen principal</span>
                          <span className={styles.fileHint}>JPG, PNG (Max 5MB)</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Imágenes Secundarias (Máx. 5)</label>
                  <div className={styles.uploadArea}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagenesSecundariasChange}
                      id="imagenesSecundarias"
                      className={styles.fileInput}
                      disabled={subiendoImagen || imagenes.length >= 5}
                    />
                    <label htmlFor="imagenesSecundarias" className={styles.fileLabel}>
                      <ion-icon name="images-outline"></ion-icon>
                      <span>Agregar imágenes</span>
                      <span className={styles.fileHint}>{imagenes.length}/5 imágenes</span>
                    </label>
                  </div>

                  {imagenes.length > 0 && (
                    <div className={styles.imagenesGrid}>
                      {imagenes.map((img, index) => (
                        <div key={index} className={styles.imagenItem}>
                          <img src={img.url} alt={`Imagen ${index + 1}`} />
                          <button
                            type="button"
                            className={styles.btnRemoveImage}
                            onClick={() => eliminarImagen(index)}
                          >
                            <ion-icon name="close-outline"></ion-icon>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <ion-icon name="cash-outline"></ion-icon>
                Precios
              </h2>
              <div className={styles.cardBody}>
                <div className={styles.formGroup}>
                  <label>Precio por Día</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precio_dia}
                    onChange={(e) => setFormData({...formData, precio_dia: e.target.value})}
                    placeholder="0.00"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Precio por Semana</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precio_semana}
                    onChange={(e) => setFormData({...formData, precio_semana: e.target.value})}
                    placeholder="0.00"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Precio por Mes</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precio_mes}
                    onChange={(e) => setFormData({...formData, precio_mes: e.target.value})}
                    placeholder="0.00"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Precio de Compra</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precio_compra}
                    onChange={(e) => setFormData({...formData, precio_compra: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <ion-icon name="settings-outline"></ion-icon>
                Configuración
              </h2>
              <div className={styles.cardBody}>
                <div className={styles.formGroup}>
                  <label>Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  >
                    <option value="disponible">Disponible</option>
                    <option value="arrendado">Arrendado</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="reparacion">Reparación</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    min="0"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Fecha de Adquisición</label>
                  <input
                    type="date"
                    value={formData.fecha_adquisicion}
                    onChange={(e) => setFormData({...formData, fecha_adquisicion: e.target.value})}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Garantía (meses)</label>
                  <input
                    type="number"
                    value={formData.garantia_meses}
                    onChange={(e) => setFormData({...formData, garantia_meses: e.target.value})}
                    min="0"
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Peso (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.peso_kg}
                      onChange={(e) => setFormData({...formData, peso_kg: e.target.value})}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Dimensiones</label>
                    <input
                      type="text"
                      value={formData.dimensiones}
                      onChange={(e) => setFormData({...formData, dimensiones: e.target.value})}
                      placeholder="LxAxA"
                    />
                  </div>
                </div>

                <div className={styles.formCheckbox}>
                  <input
                    type="checkbox"
                    id="activo"
                    checked={formData.activo}
                    onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                  />
                  <label htmlFor="activo">Equipo activo</label>
                </div>

                <div className={styles.formCheckbox}>
                  <input
                    type="checkbox"
                    id="destacado"
                    checked={formData.destacado}
                    onChange={(e) => setFormData({...formData, destacado: e.target.checked})}
                  />
                  <label htmlFor="destacado">Equipo destacado</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.formFooter}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => router.back()}
            disabled={procesando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={procesando || subiendoImagen}
          >
            {procesando ? 'Guardando...' : 'Crear Equipo'}
          </button>
        </div>
      </form>
    </div>
  )
}