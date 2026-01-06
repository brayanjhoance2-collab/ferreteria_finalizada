"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import styles from './editar.module.css'
import { obtenerCliente, actualizarCliente } from './servidor'

export default function EditarCliente() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [formData, setFormData] = useState({
    tipo_cliente: 'persona',
    rut: '',
    nombre: '',
    razon_social: '',
    giro: '',
    direccion: '',
    ciudad: '',
    region: '',
    pais: 'Perú',
    telefono: '',
    telefono_alternativo: '',
    email: '',
    contacto_nombre: '',
    contacto_cargo: '',
    contacto_telefono: '',
    contacto_email: '',
    credito_aprobado: false,
    limite_credito: 0,
    descuento_porcentaje: 0,
    notas: ''
  })

  useEffect(() => {
    cargarCliente()
  }, [])

  const cargarCliente = async () => {
    try {
      setLoading(true)
      const data = await obtenerCliente(params.id)
      setFormData({
        tipo_cliente: data.tipo_cliente,
        rut: data.rut,
        nombre: data.nombre,
        razon_social: data.razon_social || '',
        giro: data.giro || '',
        direccion: data.direccion || '',
        ciudad: data.ciudad || '',
        region: data.region || '',
        pais: data.pais || 'Perú',
        telefono: data.telefono || '',
        telefono_alternativo: data.telefono_alternativo || '',
        email: data.email,
        contacto_nombre: data.contacto_nombre || '',
        contacto_cargo: data.contacto_cargo || '',
        contacto_telefono: data.contacto_telefono || '',
        contacto_email: data.contacto_email || '',
        credito_aprobado: data.credito_aprobado,
        limite_credito: data.limite_credito || 0,
        descuento_porcentaje: data.descuento_porcentaje || 0,
        notas: data.notas || ''
      })
    } catch (error) {
      console.error('Error cargando cliente:', error)
      mostrarMensaje('Error al cargar el cliente', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.nombre.trim()) {
      mostrarMensaje('El nombre es requerido', 'error')
      return
    }

    if (!formData.email.trim()) {
      mostrarMensaje('El email es requerido', 'error')
      return
    }

    try {
      setProcesando(true)
      await actualizarCliente(params.id, formData)
      mostrarMensaje('Cliente actualizado correctamente', 'success')
      
      setTimeout(() => {
        router.push('/admin/clientes/lista')
      }, 1500)
    } catch (error) {
      console.error('Error al actualizar cliente:', error)
      mostrarMensaje(error.message || 'Error al actualizar cliente', 'error')
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
          <span>Cargando cliente...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Editar Cliente</h1>
          <p className={styles.subtitle}>Actualiza los datos del cliente</p>
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
                <ion-icon name="person-circle-outline"></ion-icon>
                Tipo de Cliente
              </h2>
              <div className={styles.cardBody}>
                <div className={styles.tipoButtons}>
                  <button
                    type="button"
                    className={`${styles.tipoBtn} ${formData.tipo_cliente === 'persona' ? styles.active : ''}`}
                    onClick={() => setFormData({...formData, tipo_cliente: 'persona'})}
                  >
                    <ion-icon name="person-outline"></ion-icon>
                    <span>Persona Natural</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.tipoBtn} ${formData.tipo_cliente === 'empresa' ? styles.active : ''}`}
                    onClick={() => setFormData({...formData, tipo_cliente: 'empresa'})}
                  >
                    <ion-icon name="business-outline"></ion-icon>
                    <span>Empresa</span>
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <ion-icon name="information-circle-outline"></ion-icon>
                Información Básica
              </h2>
              <div className={styles.cardBody}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>RUT <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      value={formData.rut}
                      onChange={(e) => setFormData({...formData, rut: e.target.value})}
                      placeholder="12345678-9"
                      disabled
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>
                      {formData.tipo_cliente === 'empresa' ? 'Nombre Comercial' : 'Nombre Completo'} 
                      <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      placeholder={formData.tipo_cliente === 'empresa' ? 'Nombre comercial' : 'Nombre completo'}
                      required
                    />
                  </div>
                </div>

                {formData.tipo_cliente === 'empresa' && (
                  <>
                    <div className={styles.formGroup}>
                      <label>Razón Social <span className={styles.required}>*</span></label>
                      <input
                        type="text"
                        value={formData.razon_social}
                        onChange={(e) => setFormData({...formData, razon_social: e.target.value})}
                        placeholder="Razón social completa"
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Giro</label>
                      <input
                        type="text"
                        value={formData.giro}
                        onChange={(e) => setFormData({...formData, giro: e.target.value})}
                        placeholder="Actividad comercial"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <ion-icon name="location-outline"></ion-icon>
                Dirección
              </h2>
              <div className={styles.cardBody}>
                <div className={styles.formGroup}>
                  <label>Dirección</label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                    placeholder="Dirección completa"
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Ciudad</label>
                    <input
                      type="text"
                      value={formData.ciudad}
                      onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
                      placeholder="Ciudad"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Región/Departamento</label>
                    <input
                      type="text"
                      value={formData.region}
                      onChange={(e) => setFormData({...formData, region: e.target.value})}
                      placeholder="Región"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>País</label>
                  <input
                    type="text"
                    value={formData.pais}
                    onChange={(e) => setFormData({...formData, pais: e.target.value})}
                    placeholder="País"
                  />
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <ion-icon name="call-outline"></ion-icon>
                Contacto
              </h2>
              <div className={styles.cardBody}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Teléfono</label>
                    <input
                      type="text"
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                      placeholder="+51 999 999 999"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Teléfono Alternativo</label>
                    <input
                      type="text"
                      value={formData.telefono_alternativo}
                      onChange={(e) => setFormData({...formData, telefono_alternativo: e.target.value})}
                      placeholder="+51 999 999 999"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Email <span className={styles.required}>*</span></label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>

                {formData.tipo_cliente === 'empresa' && (
                  <>
                    <div className={styles.divider}>
                      <span>Persona de Contacto</span>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Nombre</label>
                        <input
                          type="text"
                          value={formData.contacto_nombre}
                          onChange={(e) => setFormData({...formData, contacto_nombre: e.target.value})}
                          placeholder="Nombre de contacto"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Cargo</label>
                        <input
                          type="text"
                          value={formData.contacto_cargo}
                          onChange={(e) => setFormData({...formData, contacto_cargo: e.target.value})}
                          placeholder="Cargo"
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Teléfono</label>
                        <input
                          type="text"
                          value={formData.contacto_telefono}
                          onChange={(e) => setFormData({...formData, contacto_telefono: e.target.value})}
                          placeholder="+51 999 999 999"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Email</label>
                        <input
                          type="email"
                          value={formData.contacto_email}
                          onChange={(e) => setFormData({...formData, contacto_email: e.target.value})}
                          placeholder="contacto@empresa.com"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <ion-icon name="reader-outline"></ion-icon>
                Notas Adicionales
              </h2>
              <div className={styles.cardBody}>
                <div className={styles.formGroup}>
                  <label>Notas</label>
                  <textarea
                    value={formData.notas}
                    onChange={(e) => setFormData({...formData, notas: e.target.value})}
                    rows="4"
                    placeholder="Información adicional sobre el cliente..."
                  ></textarea>
                </div>
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
                <div className={styles.formCheckbox}>
                  <input
                    type="checkbox"
                    id="credito"
                    checked={formData.credito_aprobado}
                    onChange={(e) => setFormData({...formData, credito_aprobado: e.target.checked})}
                  />
                  <label htmlFor="credito">Crédito Aprobado</label>
                </div>

                {formData.credito_aprobado && (
                  <div className={styles.formGroup}>
                    <label>Límite de Crédito</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.limite_credito}
                      onChange={(e) => setFormData({...formData, limite_credito: e.target.value})}
                      placeholder="0.00"
                    />
                    <span className={styles.helpText}>Monto máximo de crédito en soles</span>
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label>Descuento (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.descuento_porcentaje}
                    onChange={(e) => setFormData({...formData, descuento_porcentaje: e.target.value})}
                    min="0"
                    max="100"
                    placeholder="0.00"
                  />
                  <span className={styles.helpText}>Descuento por defecto en arriendos</span>
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
            disabled={procesando}
          >
            {procesando ? 'Guardando...' : 'Actualizar Cliente'}
          </button>
        </div>
      </form>
    </div>
  )
}