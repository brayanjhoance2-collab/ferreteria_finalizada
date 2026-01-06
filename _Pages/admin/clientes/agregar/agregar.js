"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './agregar.module.css'
import { crearCliente } from './servidor'

export default function AgregarCliente() {
  const router = useRouter()
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.rut.trim()) {
      mostrarMensaje('El RUT es requerido', 'error')
      return
    }

    if (!formData.nombre.trim()) {
      mostrarMensaje('El nombre es requerido', 'error')
      return
    }

    if (!formData.email.trim()) {
      mostrarMensaje('El email es requerido', 'error')
      return
    }

    if (formData.tipo_cliente === 'empresa' && !formData.razon_social.trim()) {
      mostrarMensaje('La razón social es requerida para empresas', 'error')
      return
    }

    try {
      setProcesando(true)
      await crearCliente(formData)
      mostrarMensaje('Cliente creado correctamente', 'success')
      
      setTimeout(() => {
        router.push('/admin/clientes/lista')
      }, 1500)
    } catch (error) {
      console.error('Error al crear cliente:', error)
      mostrarMensaje(error.message || 'Error al crear cliente', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3000)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Agregar Nuevo Cliente</h1>
          <p className={styles.subtitle}>Completa los datos del cliente</p>
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
                      required
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

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <ion-icon name="shield-checkmark-outline"></ion-icon>
                Información
              </h2>
              <div className={styles.cardBody}>
                <div className={styles.infoBox}>
                  <ion-icon name="information-circle-outline"></ion-icon>
                  <div className={styles.infoContent}>
                    <h4>Datos Requeridos</h4>
                    <ul>
                      <li>RUT del cliente</li>
                      <li>Nombre completo</li>
                      <li>Email de contacto</li>
                      {formData.tipo_cliente === 'empresa' && <li>Razón social</li>}
                    </ul>
                  </div>
                </div>

                <div className={styles.infoBox}>
                  <ion-icon name="bulb-outline"></ion-icon>
                  <div className={styles.infoContent}>
                    <h4>Recomendación</h4>
                    <p>Complete todos los datos de contacto para facilitar la comunicación con el cliente.</p>
                  </div>
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
            {procesando ? 'Guardando...' : 'Crear Cliente'}
          </button>
        </div>
      </form>
    </div>
  )
}