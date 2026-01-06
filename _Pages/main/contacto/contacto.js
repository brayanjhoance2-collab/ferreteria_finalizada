"use client"

import { useState, useEffect } from 'react'
import styles from './contacto.module.css'
import { getEmpresaInfo, getPaginaContacto, enviarFormularioContacto } from './servidor'

export default function Contacto() {
  const [empresaInfo, setEmpresaInfo] = useState(null)
  const [paginaContacto, setPaginaContacto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    empresa: '',
    asunto: '',
    mensaje: '',
    tipo_consulta: 'general'
  })
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [dataEmpresa, dataPagina] = await Promise.all([
          getEmpresaInfo(),
          getPaginaContacto()
        ])
        setEmpresaInfo(dataEmpresa)
        setPaginaContacto(dataPagina)
      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setResultado(null)

    try {
      const response = await enviarFormularioContacto(formData)
      
      if (response.success) {
        setResultado({
          tipo: 'success',
          mensaje: 'Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.'
        })
        setFormData({
          nombre: '',
          email: '',
          telefono: '',
          empresa: '',
          asunto: '',
          mensaje: '',
          tipo_consulta: 'general'
        })
      } else {
        setResultado({
          tipo: 'error',
          mensaje: 'Hubo un error al enviar el mensaje. Por favor intenta nuevamente.'
        })
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error)
      setResultado({
        tipo: 'error',
        mensaje: 'Hubo un error al enviar el mensaje. Por favor intenta nuevamente.'
      })
    } finally {
      setEnviando(false)
    }
  }

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>
  }

  if (!empresaInfo || !paginaContacto) {
    return <div className={styles.error}>Error al cargar la informacion</div>
  }

  return (
    <main className={styles.contacto}>
      {(paginaContacto.hero_titulo || paginaContacto.hero_subtitulo || paginaContacto.hero_imagen_url) && (
        <section className={styles.hero} style={{
          backgroundImage: paginaContacto.hero_imagen_url ? `url(${paginaContacto.hero_imagen_url})` : 'none'
        }}>
          {(paginaContacto.hero_titulo || paginaContacto.hero_subtitulo) && (
            <div className={styles.heroContent}>
              <div className={styles.container}>
                {paginaContacto.hero_titulo && (
                  <h1 className={styles.heroTitle}>{paginaContacto.hero_titulo}</h1>
                )}
                {paginaContacto.hero_subtitulo && (
                  <p className={styles.heroSubtitle}>
                    {paginaContacto.hero_subtitulo}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      <section className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.contentGrid}>
            <div className={styles.infoSection}>
              <div className={styles.infoCard}>
                <span className={styles.sectionLabel}>Informacion de Contacto</span>
                {paginaContacto.info_titulo && (
                  <h2 className={styles.sectionTitle}>{paginaContacto.info_titulo}</h2>
                )}
                {paginaContacto.info_descripcion && (
                  <p className={styles.infoText}>
                    {paginaContacto.info_descripcion}
                  </p>
                )}

                <div className={styles.contactDetails}>
                  <div className={styles.detailItem}>
                    <div className={styles.detailIcon}>
                      <ion-icon name="call"></ion-icon>
                    </div>
                    <div className={styles.detailContent}>
                      <h3 className={styles.detailTitle}>Telefono</h3>
                      <a href={`tel:${empresaInfo.telefono}`} className={styles.detailLink}>
                        {empresaInfo.telefono}
                      </a>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <div className={styles.detailIcon}>
                      <ion-icon name="mail"></ion-icon>
                    </div>
                    <div className={styles.detailContent}>
                      <h3 className={styles.detailTitle}>Email</h3>
                      <a href={`mailto:${empresaInfo.email}`} className={styles.detailLink}>
                        {empresaInfo.email}
                      </a>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <div className={styles.detailIcon}>
                      <ion-icon name="time"></ion-icon>
                    </div>
                    <div className={styles.detailContent}>
                      <h3 className={styles.detailTitle}>Horario de Atencion</h3>
                      <p className={styles.detailText}>Lun - Jue: {empresaInfo.horario_lun_jue}</p>
                      <p className={styles.detailText}>Viernes: {empresaInfo.horario_vie}</p>
                      <p className={styles.detailText}>Sabado: {empresaInfo.horario_sab}</p>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <div className={styles.detailIcon}>
                      <ion-icon name="location"></ion-icon>
                    </div>
                    <div className={styles.detailContent}>
                      <h3 className={styles.detailTitle}>Ubicacion</h3>
                      <p className={styles.detailText}>{paginaContacto.ubicacion_texto || 'Lima, Peru'}</p>
                    </div>
                  </div>
                </div>

                {(paginaContacto.facebook_url || paginaContacto.instagram_url || paginaContacto.linkedin_url || paginaContacto.whatsapp_url) && (
                  <div className={styles.socialLinks}>
                    <h3 className={styles.socialTitle}>Siguenos</h3>
                    <div className={styles.socialIcons}>
                      {paginaContacto.facebook_url && (
                        <a href={paginaContacto.facebook_url} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Facebook">
                          <ion-icon name="logo-facebook"></ion-icon>
                        </a>
                      )}
                      {paginaContacto.instagram_url && (
                        <a href={paginaContacto.instagram_url} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram">
                          <ion-icon name="logo-instagram"></ion-icon>
                        </a>
                      )}
                      {paginaContacto.linkedin_url && (
                        <a href={paginaContacto.linkedin_url} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="LinkedIn">
                          <ion-icon name="logo-linkedin"></ion-icon>
                        </a>
                      )}
                      {paginaContacto.whatsapp_url && (
                        <a href={paginaContacto.whatsapp_url} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="WhatsApp">
                          <ion-icon name="logo-whatsapp"></ion-icon>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.formCard}>
                <span className={styles.sectionLabel}>Formulario de Contacto</span>
                <h2 className={styles.sectionTitle}>Envianos un Mensaje</h2>
                <p className={styles.formText}>
                  Completa el formulario y nos pondremos en contacto contigo lo antes posible
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="nombre" className={styles.label}>
                        Nombre Completo <span className={styles.required}>*</span>
                      </label>
                      <div className={styles.inputWrapper}>
                        <ion-icon name="person-outline"></ion-icon>
                        <input
                          type="text"
                          id="nombre"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          className={styles.input}
                          placeholder="Tu nombre completo"
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="email" className={styles.label}>
                        Correo Electronico <span className={styles.required}>*</span>
                      </label>
                      <div className={styles.inputWrapper}>
                        <ion-icon name="mail-outline"></ion-icon>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={styles.input}
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="telefono" className={styles.label}>
                        Telefono
                      </label>
                      <div className={styles.inputWrapper}>
                        <ion-icon name="call-outline"></ion-icon>
                        <input
                          type="tel"
                          id="telefono"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          className={styles.input}
                          placeholder="+51 999 999 999"
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="empresa" className={styles.label}>
                        Empresa
                      </label>
                      <div className={styles.inputWrapper}>
                        <ion-icon name="business-outline"></ion-icon>
                        <input
                          type="text"
                          id="empresa"
                          name="empresa"
                          value={formData.empresa}
                          onChange={handleChange}
                          className={styles.input}
                          placeholder="Nombre de tu empresa"
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="tipo_consulta" className={styles.label}>
                      Tipo de Consulta <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.inputWrapper}>
                      <ion-icon name="list-outline"></ion-icon>
                      <select
                        id="tipo_consulta"
                        name="tipo_consulta"
                        value={formData.tipo_consulta}
                        onChange={handleChange}
                        className={styles.select}
                        required
                      >
                        <option value="general">Consulta General</option>
                        <option value="arriendo">Arriendo de Equipos</option>
                        <option value="servicio_tecnico">Servicio Tecnico</option>
                        <option value="certificacion">Certificaciones</option>
                        <option value="cotizacion">Solicitar Cotizacion</option>
                        <option value="reclamo">Reclamo</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="asunto" className={styles.label}>
                      Asunto <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.inputWrapper}>
                      <ion-icon name="bookmark-outline"></ion-icon>
                      <input
                        type="text"
                        id="asunto"
                        name="asunto"
                        value={formData.asunto}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="Asunto de tu consulta"
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="mensaje" className={styles.label}>
                      Mensaje <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.inputWrapper}>
                      <ion-icon name="chatbox-outline"></ion-icon>
                      <textarea
                        id="mensaje"
                        name="mensaje"
                        value={formData.mensaje}
                        onChange={handleChange}
                        className={styles.textarea}
                        placeholder="Cuentanos en que podemos ayudarte..."
                        rows="6"
                        required
                      ></textarea>
                    </div>
                  </div>

                  {resultado && (
                    <div className={`${styles.alert} ${styles[resultado.tipo]}`}>
                      <ion-icon name={resultado.tipo === 'success' ? 'checkmark-circle' : 'alert-circle'}></ion-icon>
                      <span>{resultado.mensaje}</span>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className={styles.submitBtn}
                    disabled={enviando}
                  >
                    {enviando ? (
                      <>
                        <ion-icon name="hourglass-outline"></ion-icon>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <ion-icon name="paper-plane-outline"></ion-icon>
                        Enviar Mensaje
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {paginaContacto.mapa_url && (
        <section className={styles.map}>
          <div className={styles.mapContainer}>
            <iframe
              src={paginaContacto.mapa_url}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicacion"
            ></iframe>
          </div>
        </section>
      )}

      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            {paginaContacto.cta_titulo && (
              <h2 className={styles.ctaTitle}>{paginaContacto.cta_titulo}</h2>
            )}
            {paginaContacto.cta_descripcion && (
              <p className={styles.ctaText}>
                {paginaContacto.cta_descripcion}
              </p>
            )}
            <a href={`tel:${empresaInfo.telefono}`} className={styles.ctaButton}>
              <ion-icon name="call"></ion-icon>
              {empresaInfo.telefono}
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}