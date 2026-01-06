"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './nuevo.module.css'
import { obtenerClientes, obtenerEquipos, crearArriendo, generarNumeroContrato } from './servidor'

export default function NuevoArriendo() {
  const router = useRouter()
  const [clientes, setClientes] = useState([])
  const [equipos, setEquipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [formData, setFormData] = useState({
    numero_contrato: 'Generando...',
    cliente_id: '',
    fecha_inicio: '',
    fecha_fin_estimada: '',
    tipo_arriendo: 'diario',
    modalidad: 'corto_plazo',
    lugar_entrega: '',
    direccion_entrega: '',
    lugar_devolucion: '',
    requiere_transporte: false,
    costo_transporte: 0,
    requiere_operador: false,
    costo_operador: 0,
    garantia_deposito: 0,
    descuento_porcentaje: 0,
    observaciones: '',
    condiciones_especiales: ''
  })
  const [equiposSeleccionados, setEquiposSeleccionados] = useState([])
  const [busquedaEquipo, setBusquedaEquipo] = useState('')

  useEffect(() => {
    cargarDatos()
    generarNumero()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [dataClientes, dataEquipos] = await Promise.all([
        obtenerClientes(),
        obtenerEquipos()
      ])
      setClientes(dataClientes)
      setEquipos(dataEquipos)
    } catch (error) {
      console.error('Error cargando datos:', error)
      mostrarMensaje('Error al cargar los datos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const generarNumero = async () => {
    try {
      const resultado = await generarNumeroContrato()
      setFormData(prev => ({...prev, numero_contrato: resultado.numero}))
    } catch (error) {
      console.error('Error generando número:', error)
      mostrarMensaje('Error al generar número de contrato', 'error')
    }
  }

  const calcularDias = () => {
    if (!formData.fecha_inicio || !formData.fecha_fin_estimada) return 0
    const inicio = new Date(formData.fecha_inicio)
    const fin = new Date(formData.fecha_fin_estimada)
    const diff = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  const agregarEquipo = (equipo) => {
    const yaAgregado = equiposSeleccionados.find(e => e.equipo_id === equipo.id)
    if (yaAgregado) {
      mostrarMensaje('Este equipo ya fue agregado', 'error')
      return
    }

    let precioUnitario = 0
    let unidadTiempo = 'dia'
    let cantidadTiempo = calcularDias()

    if (formData.tipo_arriendo === 'diario') {
      precioUnitario = equipo.precio_dia
      unidadTiempo = 'dia'
    } else if (formData.tipo_arriendo === 'semanal') {
      precioUnitario = equipo.precio_semana
      unidadTiempo = 'semana'
      cantidadTiempo = Math.ceil(cantidadTiempo / 7)
    } else if (formData.tipo_arriendo === 'mensual') {
      precioUnitario = equipo.precio_mes
      unidadTiempo = 'mes'
      cantidadTiempo = Math.ceil(cantidadTiempo / 30)
    }

    const nuevoEquipo = {
      equipo_id: equipo.id,
      nombre: equipo.nombre,
      codigo: equipo.codigo,
      cantidad: 1,
      precio_unitario: precioUnitario,
      unidad_tiempo: unidadTiempo,
      cantidad_tiempo: cantidadTiempo,
      subtotal: precioUnitario * cantidadTiempo
    }

    setEquiposSeleccionados([...equiposSeleccionados, nuevoEquipo])
    setBusquedaEquipo('')
  }

  const actualizarEquipo = (index, campo, valor) => {
    const nuevosEquipos = [...equiposSeleccionados]
    nuevosEquipos[index][campo] = parseFloat(valor) || 0
    
    if (campo === 'cantidad' || campo === 'precio_unitario' || campo === 'cantidad_tiempo') {
      nuevosEquipos[index].subtotal = 
        nuevosEquipos[index].cantidad * 
        nuevosEquipos[index].precio_unitario * 
        nuevosEquipos[index].cantidad_tiempo
    }
    
    setEquiposSeleccionados(nuevosEquipos)
  }

  const eliminarEquipo = (index) => {
    setEquiposSeleccionados(equiposSeleccionados.filter((_, i) => i !== index))
  }

  const calcularTotales = () => {
    const subtotal = equiposSeleccionados.reduce((sum, eq) => sum + eq.subtotal, 0)
    const descuento = subtotal * (formData.descuento_porcentaje / 100)
    const subtotalConDescuento = subtotal - descuento
    const transporte = formData.requiere_transporte ? parseFloat(formData.costo_transporte) || 0 : 0
    const operador = formData.requiere_operador ? parseFloat(formData.costo_operador) || 0 : 0
    const base = subtotalConDescuento + transporte + operador
    const iva = base * 0.18
    const total = base + iva

    return { subtotal, descuento, base, iva, total }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.cliente_id) {
      mostrarMensaje('Selecciona un cliente', 'error')
      return
    }

    if (!formData.fecha_inicio || !formData.fecha_fin_estimada) {
      mostrarMensaje('Las fechas son requeridas', 'error')
      return
    }

    if (equiposSeleccionados.length === 0) {
      mostrarMensaje('Agrega al menos un equipo', 'error')
      return
    }

    try {
      setProcesando(true)

      const totales = calcularTotales()
      const dias = calcularDias()

      const datosArriendo = {
        ...formData,
        dias_totales: dias,
        equipos: equiposSeleccionados,
        subtotal: totales.subtotal,
        descuento_monto: totales.descuento,
        iva: totales.iva,
        total: totales.total
      }

      await crearArriendo(datosArriendo)
      mostrarMensaje('Arriendo creado correctamente', 'success')
      
      setTimeout(() => {
        router.push('/admin/arriendos/lista')
      }, 1500)
    } catch (error) {
      console.error('Error al crear arriendo:', error)
      mostrarMensaje(error.message || 'Error al crear arriendo', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3000)
  }

  const equiposFiltrados = equipos.filter(eq => 
    eq.estado === 'disponible' &&
    (eq.nombre.toLowerCase().includes(busquedaEquipo.toLowerCase()) ||
     eq.codigo.toLowerCase().includes(busquedaEquipo.toLowerCase()))
  )

  const totales = calcularTotales()

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
          <h1 className={styles.title}>Nuevo Arriendo</h1>
          <p className={styles.subtitle}>Crea un nuevo contrato de arriendo</p>
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
                <ion-icon name="document-text-outline"></ion-icon>
                Información del Contrato
              </h2>
              <div className={styles.cardBody}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Número de Contrato</label>
                    <div className={styles.contratoWrapper}>
                      <input
                        type="text"
                        value={formData.numero_contrato}
                        readOnly
                        disabled
                      />
                      <button
                        type="button"
                        className={styles.btnRegenerar}
                        onClick={generarNumero}
                        title="Regenerar número"
                      >
                        <ion-icon name="refresh-outline"></ion-icon>
                      </button>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Cliente <span className={styles.required}>*</span></label>
                    <select
                      value={formData.cliente_id}
                      onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}
                      required
                    >
                      <option value="">Selecciona un cliente</option>
                      {clientes.map(cli => (
                        <option key={cli.id} value={cli.id}>
                          {cli.nombre} - {cli.rut}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Fecha Inicio <span className={styles.required}>*</span></label>
                    <input
                      type="date"
                      value={formData.fecha_inicio}
                      onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Fecha Fin Estimada <span className={styles.required}>*</span></label>
                    <input
                      type="date"
                      value={formData.fecha_fin_estimada}
                      onChange={(e) => setFormData({...formData, fecha_fin_estimada: e.target.value})}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Días Totales</label>
                    <input
                      type="text"
                      value={calcularDias()}
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Tipo de Arriendo</label>
                    <select
                      value={formData.tipo_arriendo}
                      onChange={(e) => setFormData({...formData, tipo_arriendo: e.target.value})}
                    >
                      <option value="diario">Diario</option>
                      <option value="semanal">Semanal</option>
                      <option value="mensual">Mensual</option>
                      <option value="personalizado">Personalizado</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Modalidad</label>
                    <select
                      value={formData.modalidad}
                      onChange={(e) => setFormData({...formData, modalidad: e.target.value})}
                    >
                      <option value="corto_plazo">Corto Plazo</option>
                      <option value="largo_plazo">Largo Plazo</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <ion-icon name="construct-outline"></ion-icon>
                Equipos
              </h2>
              <div className={styles.cardBody}>
                <div className={styles.searchEquipo}>
                  <ion-icon name="search-outline"></ion-icon>
                  <input
                    type="text"
                    placeholder="Buscar equipo por nombre o código..."
                    value={busquedaEquipo}
                    onChange={(e) => setBusquedaEquipo(e.target.value)}
                  />
                </div>

                {busquedaEquipo && equiposFiltrados.length > 0 && (
                  <div className={styles.equiposDropdown}>
                    {equiposFiltrados.slice(0, 5).map(eq => (
                      <div
                        key={eq.id}
                        className={styles.equipoItem}
                        onClick={() => agregarEquipo(eq)}
                      >
                        <span className={styles.equipoCodigo}>{eq.codigo}</span>
                        <span className={styles.equipoNombre}>{eq.nombre}</span>
                        <span className={styles.equipoPrecio}>S/ {eq.precio_dia}/día</span>
                      </div>
                    ))}
                  </div>
                )}

                {equiposSeleccionados.length > 0 && (
                  <div className={styles.equiposTable}>
                    <table>
                      <thead>
                        <tr>
                          <th>Equipo</th>
                          <th>Cant.</th>
                          <th>Precio Unit.</th>
                          <th>Tiempo</th>
                          <th>Subtotal</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {equiposSeleccionados.map((eq, index) => (
                          <tr key={index}>
                            <td>
                              <div className={styles.equipoInfo}>
                                <span className={styles.equipoCod}>{eq.codigo}</span>
                                <span className={styles.equipoNom}>{eq.nombre}</span>
                              </div>
                            </td>
                            <td>
                              <input
                                type="number"
                                value={eq.cantidad}
                                onChange={(e) => actualizarEquipo(index, 'cantidad', e.target.value)}
                                min="1"
                                className={styles.inputSmall}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                value={eq.precio_unitario}
                                onChange={(e) => actualizarEquipo(index, 'precio_unitario', e.target.value)}
                                className={styles.inputSmall}
                              />
                            </td>
                            <td>
                              <div className={styles.tiempoWrapper}>
                                <input
                                  type="number"
                                  value={eq.cantidad_tiempo}
                                  onChange={(e) => actualizarEquipo(index, 'cantidad_tiempo', e.target.value)}
                                  min="1"
                                  className={styles.inputSmall}
                                />
                                <span className={styles.unidad}>{eq.unidad_tiempo}s</span>
                              </div>
                            </td>
                            <td className={styles.subtotalCol}>S/ {eq.subtotal.toFixed(2)}</td>
                            <td>
                              <button
                                type="button"
                                className={styles.btnEliminar}
                                onClick={() => eliminarEquipo(index)}
                              >
                                <ion-icon name="trash-outline"></ion-icon>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {equiposSeleccionados.length === 0 && (
                  <div className={styles.noEquipos}>
                    <ion-icon name="cube-outline"></ion-icon>
                    <p>No hay equipos agregados</p>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <ion-icon name="location-outline"></ion-icon>
                Logística
              </h2>
              <div className={styles.cardBody}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Lugar de Entrega</label>
                    <input
                      type="text"
                      value={formData.lugar_entrega}
                      onChange={(e) => setFormData({...formData, lugar_entrega: e.target.value})}
                      placeholder="Ciudad o ubicación"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Lugar de Devolución</label>
                    <input
                      type="text"
                      value={formData.lugar_devolucion}
                      onChange={(e) => setFormData({...formData, lugar_devolucion: e.target.value})}
                      placeholder="Ciudad o ubicación"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Dirección de Entrega</label>
                  <input
                    type="text"
                    value={formData.direccion_entrega}
                    onChange={(e) => setFormData({...formData, direccion_entrega: e.target.value})}
                    placeholder="Dirección completa"
                  />
                </div>

                <div className={styles.formCheckbox}>
                  <input
                    type="checkbox"
                    id="transporte"
                    checked={formData.requiere_transporte}
                    onChange={(e) => setFormData({...formData, requiere_transporte: e.target.checked})}
                  />
                  <label htmlFor="transporte">Requiere transporte</label>
                </div>

                {formData.requiere_transporte && (
                  <div className={styles.formGroup}>
                    <label>Costo de Transporte</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.costo_transporte}
                      onChange={(e) => setFormData({...formData, costo_transporte: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                )}

                <div className={styles.formCheckbox}>
                  <input
                    type="checkbox"
                    id="operador"
                    checked={formData.requiere_operador}
                    onChange={(e) => setFormData({...formData, requiere_operador: e.target.checked})}
                  />
                  <label htmlFor="operador">Requiere operador</label>
                </div>

                {formData.requiere_operador && (
                  <div className={styles.formGroup}>
                    <label>Costo de Operador</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.costo_operador}
                      onChange={(e) => setFormData({...formData, costo_operador: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <ion-icon name="reader-outline"></ion-icon>
                Observaciones
              </h2>
              <div className={styles.cardBody}>
                <div className={styles.formGroup}>
                  <label>Observaciones</label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                    rows="3"
                    placeholder="Observaciones adicionales..."
                  ></textarea>
                </div>

                <div className={styles.formGroup}>
                  <label>Condiciones Especiales</label>
                  <textarea
                    value={formData.condiciones_especiales}
                    onChange={(e) => setFormData({...formData, condiciones_especiales: e.target.value})}
                    rows="3"
                    placeholder="Condiciones especiales del contrato..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sideColumn}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <ion-icon name="calculator-outline"></ion-icon>
                Resumen
              </h2>
              <div className={styles.cardBody}>
                <div className={styles.resumenItem}>
                  <span>Subtotal:</span>
                  <span>S/ {totales.subtotal.toFixed(2)}</span>
                </div>

                <div className={styles.formGroup}>
                  <label>Descuento (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.descuento_porcentaje}
                    onChange={(e) => setFormData({...formData, descuento_porcentaje: e.target.value})}
                    min="0"
                    max="100"
                  />
                </div>

                {formData.descuento_porcentaje > 0 && (
                  <div className={styles.resumenItem}>
                    <span>Descuento:</span>
                    <span className={styles.descuento}>- S/ {totales.descuento.toFixed(2)}</span>
                  </div>
                )}

                {formData.requiere_transporte && (
                  <div className={styles.resumenItem}>
                    <span>Transporte:</span>
                    <span>S/ {parseFloat(formData.costo_transporte || 0).toFixed(2)}</span>
                  </div>
                )}

                {formData.requiere_operador && (
                  <div className={styles.resumenItem}>
                    <span>Operador:</span>
                    <span>S/ {parseFloat(formData.costo_operador || 0).toFixed(2)}</span>
                  </div>
                )}

                <div className={styles.resumenItem}>
                  <span>IGV (18%):</span>
                  <span>S/ {totales.iva.toFixed(2)}</span>
                </div>

                <div className={styles.resumenDivider}></div>

                <div className={styles.resumenTotal}>
                  <span>Total:</span>
                  <span>S/ {totales.total.toFixed(2)}</span>
                </div>

                <div className={styles.formGroup}>
                  <label>Depósito de Garantía</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.garantia_deposito}
                    onChange={(e) => setFormData({...formData, garantia_deposito: e.target.value})}
                    placeholder="0.00"
                  />
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
            {procesando ? 'Guardando...' : 'Crear Arriendo'}
          </button>
        </div>
      </form>
    </div>
  )
}