"use client"

import { useState, useEffect } from 'react'
import styles from './terminos.module.css'
import { getTerminosCondiciones } from './servidor'

export default function Terminos() {
  const [terminos, setTerminos] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getTerminosCondiciones()
        setTerminos(data)
      } catch (error) {
        console.error('Error cargando términos:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>
  }

  if (!terminos) {
    return <div className={styles.error}>Error al cargar los términos y condiciones</div>
  }

  const sections = [
    { id: 'intro', title: 'Introducción', icon: 'document-text-outline' },
    { id: 'arriendo', title: 'Condiciones de Arriendo', icon: 'cart-outline' },
    { id: 'pagos', title: 'Pagos y Facturación', icon: 'card-outline' },
    { id: 'responsabilidades', title: 'Responsabilidades', icon: 'shield-checkmark-outline' },
    { id: 'mantenimiento', title: 'Mantenimiento y Reparaciones', icon: 'construct-outline' },
    { id: 'garantias', title: 'Garantías', icon: 'ribbon-outline' },
    { id: 'cancelaciones', title: 'Cancelaciones y Devoluciones', icon: 'close-circle-outline' },
    { id: 'privacidad', title: 'Privacidad y Datos', icon: 'lock-closed-outline' },
    { id: 'disputas', title: 'Resolución de Disputas', icon: 'people-outline' },
    { id: 'modificaciones', title: 'Modificaciones', icon: 'create-outline' }
  ]

  return (
    <main className={styles.terminos}>
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
              <section id="intro" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <ion-icon name="document-text-outline"></ion-icon>
                  <h2 className={styles.sectionTitle}>Introducción</h2>
                </div>
                <div className={styles.sectionContent}>
                  <p className={styles.text}>
                    Bienvenido a Ferretería RyM. Al utilizar nuestros servicios de arriendo de equipos
                    para tendidos eléctricos, usted acepta estar sujeto a estos términos y condiciones.
                    Le recomendamos leer cuidadosamente este documento antes de contratar cualquiera
                    de nuestros servicios.
                  </p>
                  <p className={styles.text}>
                    Estos términos regulan la relación contractual entre Ferretería RyM y el cliente,
                    estableciendo los derechos y obligaciones de ambas partes durante todo el período
                    de arriendo de equipos y servicios asociados.
                  </p>
                </div>
              </section>

              <section id="arriendo" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <ion-icon name="cart-outline"></ion-icon>
                  <h2 className={styles.sectionTitle}>Condiciones de Arriendo</h2>
                </div>
                <div className={styles.sectionContent}>
                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Elegibilidad</h3>
                    <ul className={styles.list}>
                      <li>El cliente debe ser mayor de 18 años o representante legal de una empresa</li>
                      <li>Presentar identificación oficial vigente</li>
                      <li>Proporcionar información de contacto válida y actualizada</li>
                      <li>En caso de empresas, presentar documentación legal correspondiente</li>
                    </ul>
                  </div>

                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Período de Arriendo</h3>
                    <p className={styles.text}>
                      Los períodos de arriendo se calculan en días completos. El arriendo inicia cuando
                      el equipo es entregado al cliente y finaliza cuando es devuelto a nuestras
                      instalaciones en las condiciones pactadas.
                    </p>
                    <ul className={styles.list}>
                      <li>Arriendo mínimo: 1 día completo</li>
                      <li>Períodos disponibles: diario, semanal, mensual</li>
                      <li>Extensiones sujetas a disponibilidad y aprobación previa</li>
                      <li>Devoluciones tardías generan cargos adicionales</li>
                    </ul>
                  </div>

                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Condiciones del Equipo</h3>
                    <p className={styles.text}>
                      Al momento de la entrega, el cliente debe inspeccionar el equipo y reportar
                      cualquier daño o irregularidad. El equipo debe ser devuelto en las mismas
                      condiciones en que fue entregado, salvo el desgaste normal por uso adecuado.
                    </p>
                  </div>
                </div>
              </section>

              <section id="pagos" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <ion-icon name="card-outline"></ion-icon>
                  <h2 className={styles.sectionTitle}>Pagos y Facturación</h2>
                </div>
                <div className={styles.sectionContent}>
                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Métodos de Pago</h3>
                    <p className={styles.text}>Aceptamos los siguientes métodos de pago:</p>
                    <ul className={styles.list}>
                      <li>Efectivo</li>
                      <li>Transferencia bancaria</li>
                      <li>Tarjetas de crédito y débito</li>
                      <li>Cheques (sujeto a aprobación)</li>
                    </ul>
                  </div>

                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Depósito de Garantía</h3>
                    <p className={styles.text}>
                      Se requiere un depósito de garantía equivalente al 30% del valor total del
                      arriendo. Este depósito será reembolsado una vez que el equipo sea devuelto
                      en condiciones satisfactorias, previa inspección.
                    </p>
                  </div>

                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Facturación</h3>
                    <ul className={styles.list}>
                      <li>Todas las tarifas incluyen IGV (18%)</li>
                      <li>Las facturas se emiten electrónicamente</li>
                      <li>Pagos atrasados generan intereses moratorios del 1% diario</li>
                      <li>Los precios pueden variar según temporada y disponibilidad</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="responsabilidades" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <ion-icon name="shield-checkmark-outline"></ion-icon>
                  <h2 className={styles.sectionTitle}>Responsabilidades</h2>
                </div>
                <div className={styles.sectionContent}>
                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Responsabilidades del Cliente</h3>
                    <ul className={styles.list}>
                      <li>Operar el equipo según las instrucciones proporcionadas</li>
                      <li>Mantener el equipo en condiciones seguras durante el período de arriendo</li>
                      <li>Reportar inmediatamente cualquier daño o mal funcionamiento</li>
                      <li>No subarrendar ni transferir el equipo a terceros</li>
                      <li>Contar con personal capacitado para operar el equipo</li>
                      <li>Asumir responsabilidad por daños causados por uso inadecuado</li>
                      <li>Cumplir con todas las normativas de seguridad aplicables</li>
                    </ul>
                  </div>

                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Responsabilidades de Ferretería RyM</h3>
                    <ul className={styles.list}>
                      <li>Entregar equipos en condiciones óptimas de funcionamiento</li>
                      <li>Proporcionar manuales de operación y seguridad</li>
                      <li>Ofrecer soporte técnico durante el período de arriendo</li>
                      <li>Mantener equipos con certificaciones vigentes</li>
                      <li>Responder a consultas y reclamos en tiempo oportuno</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="mantenimiento" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <ion-icon name="construct-outline"></ion-icon>
                  <h2 className={styles.sectionTitle}>Mantenimiento y Reparaciones</h2>
                </div>
                <div className={styles.sectionContent}>
                  <p className={styles.text}>
                    Ferretería RyM se encarga del mantenimiento preventivo de todos los equipos.
                    El cliente debe reportar cualquier mal funcionamiento inmediatamente.
                  </p>
                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Reparaciones Durante el Arriendo</h3>
                    <ul className={styles.list}>
                      <li>Reparaciones por defectos de fábrica: sin costo para el cliente</li>
                      <li>Reparaciones por uso inadecuado: a cargo del cliente</li>
                      <li>Reemplazo de equipo defectuoso sin costo adicional cuando sea posible</li>
                      <li>Tiempo de reparación no se cobra si supera las 48 horas</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="garantias" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <ion-icon name="ribbon-outline"></ion-icon>
                  <h2 className={styles.sectionTitle}>Garantías</h2>
                </div>
                <div className={styles.sectionContent}>
                  <p className={styles.text}>
                    Todos nuestros equipos cuentan con garantía de funcionamiento durante el período
                    de arriendo. Esta garantía no cubre daños causados por:
                  </p>
                  <ul className={styles.list}>
                    <li>Uso inadecuado o negligente del equipo</li>
                    <li>Modificaciones no autorizadas</li>
                    <li>Accidentes o casos fortuitos</li>
                    <li>Mantenimiento realizado por personal no autorizado</li>
                    <li>Condiciones ambientales extremas no especificadas</li>
                  </ul>
                </div>
              </section>

              <section id="cancelaciones" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <ion-icon name="close-circle-outline"></ion-icon>
                  <h2 className={styles.sectionTitle}>Cancelaciones y Devoluciones</h2>
                </div>
                <div className={styles.sectionContent}>
                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Política de Cancelación</h3>
                    <ul className={styles.list}>
                      <li>Cancelaciones con más de 48 horas: reembolso del 100%</li>
                      <li>Cancelaciones con 24-48 horas: reembolso del 50%</li>
                      <li>Cancelaciones con menos de 24 horas: sin reembolso</li>
                      <li>El depósito de garantía no es reembolsable en cancelaciones</li>
                    </ul>
                  </div>

                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Devoluciones Anticipadas</h3>
                    <p className={styles.text}>
                      Las devoluciones anticipadas no generan reembolsos por días no utilizados,
                      salvo en casos de fuerza mayor debidamente justificados y aprobados por
                      la gerencia.
                    </p>
                  </div>
                </div>
              </section>

              <section id="privacidad" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <ion-icon name="lock-closed-outline"></ion-icon>
                  <h2 className={styles.sectionTitle}>Privacidad y Protección de Datos</h2>
                </div>
                <div className={styles.sectionContent}>
                  <p className={styles.text}>
                    Ferretería RyM se compromete a proteger la privacidad de sus clientes conforme
                    a la Ley de Protección de Datos Personales de Perú.
                  </p>
                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Uso de Información</h3>
                    <ul className={styles.list}>
                      <li>Procesamiento de contratos y pagos</li>
                      <li>Comunicaciones relacionadas con el servicio</li>
                      <li>Mejora de nuestros servicios</li>
                      <li>Cumplimiento de obligaciones legales</li>
                    </ul>
                  </div>
                  <p className={styles.text}>
                    No compartimos información personal con terceros sin consentimiento expreso,
                    excepto cuando sea requerido por ley.
                  </p>
                </div>
              </section>

              <section id="disputas" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <ion-icon name="people-outline"></ion-icon>
                  <h2 className={styles.sectionTitle}>Resolución de Disputas</h2>
                </div>
                <div className={styles.sectionContent}>
                  <p className={styles.text}>
                    En caso de desacuerdo o disputa, ambas partes se comprometen a intentar
                    resolver el conflicto de manera amistosa mediante negociación directa.
                  </p>
                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>Proceso de Reclamos</h3>
                    <ol className={styles.orderedList}>
                      <li>Presentar reclamo por escrito detallando el problema</li>
                      <li>Ferretería RyM responderá en un plazo máximo de 5 días hábiles</li>
                      <li>Se intentará llegar a un acuerdo mediante conciliación</li>
                      <li>De no resolverse, se someterá a arbitraje según legislación peruana</li>
                    </ol>
                  </div>
                  <p className={styles.text}>
                    Todas las disputas se regirán por las leyes de la República del Perú y
                    serán resueltas en los tribunales de Lima.
                  </p>
                </div>
              </section>

              <section id="modificaciones" className={styles.section}>
                <div className={styles.sectionHeader}>
                  <ion-icon name="create-outline"></ion-icon>
                  <h2 className={styles.sectionTitle}>Modificaciones a los Términos</h2>
                </div>
                <div className={styles.sectionContent}>
                  <p className={styles.text}>
                    Ferretería RyM se reserva el derecho de modificar estos términos y condiciones
                    en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después
                    de su publicación en nuestro sitio web.
                  </p>
                  <p className={styles.text}>
                    Los clientes serán notificados de cambios significativos por correo electrónico.
                    El uso continuado de nuestros servicios después de las modificaciones constituye
                    la aceptación de los nuevos términos.
                  </p>
                </div>
              </section>

              <div className={styles.contactBox}>
                <div className={styles.contactBoxHeader}>
                  <ion-icon name="mail-outline"></ion-icon>
                  <h3 className={styles.contactBoxTitle}>¿Tienes Preguntas?</h3>
                </div>
                <p className={styles.contactBoxText}>
                  Si tienes alguna duda sobre estos términos y condiciones, no dudes en contactarnos.
                </p>
                <div className={styles.contactBoxInfo}>
                  <div className={styles.contactItem}>
                    <ion-icon name="call-outline"></ion-icon>
                    <span>+51 1 234 5678</span>
                  </div>
                  <div className={styles.contactItem}>
                    <ion-icon name="mail-outline"></ion-icon>
                    <span>contacto@ferreteriarym.pe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}