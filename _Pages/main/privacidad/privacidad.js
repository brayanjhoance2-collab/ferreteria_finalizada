"use client"

import { useState, useEffect } from 'react'
import styles from './privacidad.module.css'
import { getPoliticaPrivacidad } from './servidor'

export default function Privacidad() {
  const [politica, setPolitica] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPoliticaPrivacidad()
        setPolitica(data)
      } catch (error) {
        console.error('Error cargando política:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>
  }

  if (!politica) {
    return <div className={styles.error}>Error al cargar la política de privacidad</div>
  }

  const sections = [
    { id: 'intro', title: 'Introducción', icon: 'information-circle-outline' },
    { id: 'recopilacion', title: 'Información que Recopilamos', icon: 'document-text-outline' },
    { id: 'uso', title: 'Uso de la Información', icon: 'analytics-outline' },
    { id: 'compartir', title: 'Compartir Información', icon: 'share-social-outline' },
    { id: 'cookies', title: 'Cookies y Tecnologías', icon: 'settings-outline' },
    { id: 'seguridad', title: 'Seguridad de Datos', icon: 'shield-checkmark-outline' },
    { id: 'derechos', title: 'Tus Derechos', icon: 'person-outline' },
    { id: 'menores', title: 'Protección de Menores', icon: 'people-outline' },
    { id: 'cambios', title: 'Cambios a la Política', icon: 'create-outline' },
    { id: 'contacto', title: 'Contacto', icon: 'mail-outline' }
  ]

  return (
    <main className={styles.privacidad}>
      <section className={styles.content}>
        <div className={styles.container}>
          <div className={styles.contentGrid}>
            <aside className={styles.sidebar}>
              <div className={styles.sidebarSticky}>
                <h3 className={styles.sidebarTitle}>Índice</h3>
                <nav className={styles.nav}>
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      className={`${styles.navItem} ${activeSection === section.id ? styles.active : ''}`}
                      onClick={() => {
                        const element = document.getElementById(section.id)
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }
                      }}
                    >
                      <ion-icon name={section.icon}></ion-icon>
                      <span>{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            <div className={styles.mainContent}>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Política de Privacidad</h1>
                <p className={styles.pageSubtitle}>
                  En Ferretería RyM valoramos y respetamos tu privacidad. Esta política describe cómo
                  recopilamos, usamos y protegemos tu información personal.
                </p>
              </div>

              <section id="intro" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <ion-icon name="information-circle-outline"></ion-icon>
                  <h2 className={styles.sectionTitle}>Introducción</h2>
                </div>
                <div className={styles.sectionContent}>
                  <p className={styles.text}>
                    Ferretería RyM se compromete a proteger la privacidad de nuestros clientes y usuarios.
                    Esta Política de Privacidad explica cómo recopilamos, utilizamos, divulgamos y
                    protegemos la información personal que usted nos proporciona al utilizar nuestros
                    servicios de arriendo de equipos y al visitar nuestro sitio web.
                  </p>
                  <p className={styles.text}>
                    Cumplimos con la Ley de Protección de Datos Personales de Perú (Ley N° 29733) y su
                    reglamento, así como con todas las normativas aplicables en materia de protección
                    de datos personales.
                  </p>
                  <div className={styles.highlightBox}>
                    <ion-icon name="shield-checkmark-outline"></ion-icon>
                    <p>
                      Al utilizar nuestros servicios, usted acepta las prácticas descritas en esta
                      política. Si no está de acuerdo con algún aspecto de esta política, le
                      recomendamos no utilizar nuestros servicios.
                    </p>
                  </div>
                </div>
              </section>

              <section id="recopilacion" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <ion-icon name="document-text-outline"></ion-icon>
                  <h2 className={styles.sectionTitle}>Información que Recopilamos</h2>
                </div>
                <div className={styles.sectionContent}>
                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Información Personal</h3>
                    <p className={styles.text}>
                      Recopilamos información personal que usted nos proporciona directamente cuando:
                    </p>
                    <ul className={styles.list}>
                      <li>Se registra en nuestro sitio web</li>
                      <li>Solicita un arriendo de equipos</li>
                      <li>Se comunica con nosotros por teléfono, email o formularios</li>
                      <li>Se suscribe a nuestros boletines informativos</li>
                      <li>Participa en encuestas o promociones</li>
                    </ul>
                    <p className={styles.text}>Esta información puede incluir:</p>
                    <ul className={styles.list}>
                      <li>Nombre completo</li>
                      <li>Documento de identidad (DNI, RUC)</li>
                      <li>Dirección de correo electrónico</li>
                      <li>Número de teléfono</li>
                      <li>Dirección física</li>
                      <li>Información de facturación y pago</li>
                      <li>Nombre de empresa y cargo (en caso de clientes corporativos)</li>
                    </ul>
                  </div>

                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Información Técnica</h3>
                    <p className={styles.text}>
                      Cuando visita nuestro sitio web, recopilamos automáticamente:
                    </p>
                    <ul className={styles.list}>
                      <li>Dirección IP</li>
                      <li>Tipo y versión de navegador</li>
                      <li>Sistema operativo</li>
                      <li>Páginas visitadas y tiempo de navegación</li>
                      <li>Referencia de la página de origen</li>
                      <li>Datos de ubicación geográfica aproximada</li>
                    </ul>
                  </div>

                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Información de Uso</h3>
                    <p className={styles.text}>
                      Recopilamos información sobre cómo interactúa con nuestros servicios:
                    </p>
                    <ul className={styles.list}>
                      <li>Equipos arrendados y fechas de arriendo</li>
                      <li>Historial de transacciones y pagos</li>
                      <li>Comunicaciones con nuestro equipo de soporte</li>
                      <li>Preferencias de servicio</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="uso" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <ion-icon name="analytics-outline"></ion-icon>
                  <h2 className={styles.sectionTitle}>Uso de la Información</h2>
                </div>
                <div className={styles.sectionContent}>
                  <p className={styles.text}>
                    Utilizamos la información recopilada para los siguientes propósitos:
                  </p>
                  
                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Prestación de Servicios</h3>
                    <ul className={styles.list}>
                      <li>Procesar y gestionar arriendos de equipos</li>
                      <li>Procesar pagos y emitir facturas</li>
                      <li>Entregar y recoger equipos</li>
                      <li>Proporcionar soporte técnico y atención al cliente</li>
                      <li>Gestionar garantías y mantenimiento</li>
                    </ul>
                  </div>

                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Comunicaciones</h3>
                    <ul className={styles.list}>
                      <li>Enviar confirmaciones de pedidos y actualizaciones</li>
                      <li>Responder a consultas y solicitudes</li>
                      <li>Enviar recordatorios de pagos o devoluciones</li>
                      <li>Informar sobre cambios en nuestros servicios</li>
                      <li>Enviar boletines informativos (con su consentimiento)</li>
                    </ul>
                  </div>

                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Mejora de Servicios</h3>
                    <ul className={styles.list}>
                      <li>Analizar patrones de uso y preferencias</li>
                      <li>Mejorar la experiencia del usuario</li>
                      <li>Desarrollar nuevos servicios y funcionalidades</li>
                      <li>Realizar estudios de mercado y encuestas</li>
                    </ul>
                  </div>

                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Seguridad y Cumplimiento</h3>
                    <ul className={styles.list}>
                      <li>Prevenir fraudes y actividades ilegales</li>
                      <li>Cumplir con obligaciones legales y regulatorias</li>
                      <li>Proteger nuestros derechos y propiedades</li>
                      <li>Resolver disputas</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="compartir" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <ion-icon name="share-social-outline"></ion-icon>
                  <h2 className={styles.sectionTitle}>Compartir Información</h2>
                </div>
                <div className={styles.sectionContent}>
                  <p className={styles.text}>
                    No vendemos, alquilamos ni compartimos su información personal con terceros para
                    fines de marketing sin su consentimiento expreso. Podemos compartir información
                    en las siguientes circunstancias:
                  </p>

                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Proveedores de Servicios</h3>
                    <p className={styles.text}>
                      Compartimos información con proveedores que nos ayudan a operar nuestro negocio:
                    </p>
                    <ul className={styles.list}>
                      <li>Procesadores de pagos</li>
                      <li>Servicios de hosting y tecnología</li>
                      <li>Proveedores de transporte y logística</li>
                      <li>Servicios de atención al cliente</li>
                      <li>Servicios de análisis y marketing</li>
                    </ul>
                    <p className={styles.text}>
                      Estos proveedores están obligados contractualmente a proteger su información
                      y solo pueden usarla para los fines especificados.
                    </p>
                  </div>

                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Requisitos Legales</h3>
                    <p className={styles.text}>
                      Podemos divulgar información cuando sea requerido por ley o para:
                    </p>
                    <ul className={styles.list}>
                      <li>Cumplir con procesos legales o requerimientos gubernamentales</li>
                      <li>Proteger nuestros derechos, privacidad, seguridad o propiedad</li>
                      <li>Proteger a nuestros clientes y al público</li>
                      <li>Prevenir fraudes o actividades ilegales</li>
                    </ul>
                  </div>

                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Transferencias Empresariales</h3>
                    <p className={styles.text}>
                      En caso de fusión, adquisición o venta de activos, su información puede
                      transferirse como parte de la transacción. Le notificaremos de cualquier
                      cambio en la titularidad de sus datos.
                    </p>
                  </div>
                </div>
              </section>

              <section id="cookies" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <ion-icon name="settings-outline"></ion-icon>
                  <h2 className={styles.sectionTitle}>Cookies y Tecnologías Similares</h2>
                </div>
                <div className={styles.sectionContent}>
                  <p className={styles.text}>
                    Utilizamos cookies y tecnologías similares para mejorar su experiencia en nuestro
                    sitio web, analizar el tráfico y personalizar el contenido.
                  </p>

                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Tipos de Cookies</h3>
                    <ul className={styles.list}>
                      <li>
                        <strong>Cookies Esenciales:</strong> Necesarias para el funcionamiento básico
                        del sitio web
                      </li>
                      <li>
                        <strong>Cookies de Rendimiento:</strong> Nos ayudan a entender cómo los
                        visitantes interactúan con nuestro sitio
                      </li>
                      <li>
                        <strong>Cookies de Funcionalidad:</strong> Permiten recordar sus preferencias
                      </li>
                      <li>
                        <strong>Cookies de Marketing:</strong> Utilizadas para rastrear visitantes
                        y mostrar anuncios relevantes
                      </li>
                    </ul>
                  </div>

                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Gestión de Cookies</h3>
                    <p className={styles.text}>
                      Puede configurar su navegador para rechazar cookies o alertarle cuando se envíen
                      cookies. Sin embargo, algunas funciones del sitio pueden no funcionar correctamente
                      sin cookies.
                    </p>
                  </div>
                </div>
              </section>

              <section id="seguridad" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <ion-icon name="shield-checkmark-outline"></ion-icon>
                  <h2 className={styles.sectionTitle}>Seguridad de Datos</h2>
                </div>
                <div className={styles.sectionContent}>
                  <p className={styles.text}>
                    Implementamos medidas de seguridad técnicas, administrativas y físicas para
                    proteger su información personal contra acceso no autorizado, alteración,
                    divulgación o destrucción.
                  </p>

                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Medidas de Seguridad</h3>
                    <ul className={styles.list}>
                      <li>Cifrado SSL/TLS para transmisión de datos sensibles</li>
                      <li>Servidores seguros con firewall y protección contra intrusiones</li>
                      <li>Acceso restringido a información personal solo a empleados autorizados</li>
                      <li>Auditorías de seguridad regulares</li>
                      <li>Capacitación continua del personal en protección de datos</li>
                      <li>Copias de seguridad periódicas</li>
                    </ul>
                  </div>

                  <div className={styles.highlightBox}>
                    <ion-icon name="warning-outline"></ion-icon>
                    <p>
                      Aunque implementamos medidas de seguridad razonables, ningún sistema es
                      completamente seguro. No podemos garantizar la seguridad absoluta de su
                      información transmitida a través de Internet.
                    </p>
                  </div>
                </div>
              </section>

              <section id="derechos" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <ion-icon name="person-outline"></ion-icon>
                  <h2 className={styles.sectionTitle}>Tus Derechos</h2>
                </div>
                <div className={styles.sectionContent}>
                  <p className={styles.text}>
                    De acuerdo con la legislación peruana de protección de datos personales, usted tiene
                    los siguientes derechos:
                  </p>

                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Derechos ARCO</h3>
                    <ul className={styles.list}>
                      <li>
                        <strong>Acceso:</strong> Solicitar información sobre los datos personales que
                        tenemos sobre usted
                      </li>
                      <li>
                        <strong>Rectificación:</strong> Solicitar la corrección de datos inexactos o
                        incompletos
                      </li>
                      <li>
                        <strong>Cancelación:</strong> Solicitar la eliminación de sus datos personales
                      </li>
                      <li>
                        <strong>Oposición:</strong> Oponerse al tratamiento de sus datos para fines
                        específicos
                      </li>
                    </ul>
                  </div>

                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Otros Derechos</h3>
                    <ul className={styles.list}>
                      <li>Retirar su consentimiento en cualquier momento</li>
                      <li>Solicitar la portabilidad de sus datos</li>
                      <li>Presentar una queja ante la autoridad de protección de datos</li>
                      <li>Darse de baja de comunicaciones de marketing</li>
                    </ul>
                  </div>

                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Ejercicio de Derechos</h3>
                    <p className={styles.text}>
                      Para ejercer cualquiera de estos derechos, puede contactarnos a través de:
                    </p>
                    <ul className={styles.list}>
                      <li>Email: privacidad@ferreteriarym.pe</li>
                      <li>Teléfono: +51 1 234 5678</li>
                      <li>Dirección: Nuestras oficinas principales</li>
                    </ul>
                    <p className={styles.text}>
                      Responderemos a su solicitud dentro de los 20 días hábiles establecidos por ley.
                    </p>
                  </div>
                </div>
              </section>

              <section id="menores" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <ion-icon name="people-outline"></ion-icon>
                  <h2 className={styles.sectionTitle}>Protección de Menores</h2>
                </div>
                <div className={styles.sectionContent}>
                  <p className={styles.text}>
                    Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos
                    intencionalmente información personal de menores de edad.
                  </p>
                  <p className={styles.text}>
                    Si descubrimos que hemos recopilado información personal de un menor sin el
                    consentimiento de los padres o tutores, tomaremos medidas para eliminar esa
                    información de nuestros servidores.
                  </p>
                  <p className={styles.text}>
                    Si usted es padre, madre o tutor y cree que su hijo nos ha proporcionado
                    información personal, contáctenos inmediatamente para que podamos tomar las
                    medidas apropiadas.
                  </p>
                </div>
              </section>

              <section id="cambios" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <ion-icon name="create-outline"></ion-icon>
                  <h2 className={styles.sectionTitle}>Cambios a la Política</h2>
                </div>
                <div className={styles.sectionContent}>
                  <p className={styles.text}>
                    Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier
                    momento. Cuando realicemos cambios, actualizaremos la fecha de última modificación
                    en la parte superior de esta página.
                  </p>
                  <p className={styles.text}>
                    Los cambios significativos serán notificados a través de:
                  </p>
                  <ul className={styles.list}>
                    <li>Correo electrónico a la dirección registrada</li>
                    <li>Aviso destacado en nuestro sitio web</li>
                    <li>Notificación en la aplicación (si aplica)</li>
                  </ul>
                  <p className={styles.text}>
                    Le recomendamos revisar periódicamente esta política para mantenerse informado
                    sobre cómo protegemos su información.
                  </p>
                </div>
              </section>

              <section id="contacto" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <ion-icon name="mail-outline"></ion-icon>
                  <h2 className={styles.sectionTitle}>Contacto</h2>
                </div>
                <div className={styles.sectionContent}>
                  <p className={styles.text}>
                    Si tiene preguntas, comentarios o inquietudes sobre esta Política de Privacidad
                    o nuestras prácticas de privacidad, no dude en contactarnos:
                  </p>
                  <div className={styles.contactGrid}>
                    <div className={styles.contactCard}>
                      <ion-icon name="mail-outline"></ion-icon>
                      <h4>Email</h4>
                      <p>privacidad@ferreteriarym.pe</p>
                    </div>
                    <div className={styles.contactCard}>
                      <ion-icon name="call-outline"></ion-icon>
                      <h4>Teléfono</h4>
                      <p>+51 1 234 5678</p>
                    </div>
                    <div className={styles.contactCard}>
                      <ion-icon name="time-outline"></ion-icon>
                      <h4>Horario</h4>
                      <p>Lunes a Viernes: 8:00 - 18:00</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}