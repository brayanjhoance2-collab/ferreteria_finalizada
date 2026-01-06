"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './lista.module.css'
import { obtenerClientes, eliminarCliente, obtenerEstadisticas } from './servidor'

export default function ListaClientes() {
  const [clientes, setClientes] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [filtros, setFiltros] = useState({
    busqueda: '',
    tipo_cliente: '',
    credito: '',
    ciudad: ''
  })
  const [vistaActual, setVistaActual] = useState('grid')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [dataClientes, dataEstadisticas] = await Promise.all([
        obtenerClientes(),
        obtenerEstadisticas()
      ])
      setClientes(dataClientes)
      setEstadisticas(dataEstadisticas)
    } catch (error) {
      console.error('Error cargando datos:', error)
      mostrarMensaje('Error al cargar los datos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return

    try {
      setProcesando(true)
      await eliminarCliente(id)
      mostrarMensaje('Cliente eliminado correctamente', 'success')
      await cargarDatos()
    } catch (error) {
      console.error('Error al eliminar:', error)
      mostrarMensaje(error.message || 'Error al eliminar cliente', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3000)
  }

  const clientesFiltrados = clientes.filter(cliente => {
    const cumpleBusqueda = !filtros.busqueda || 
      cliente.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      cliente.rut.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(filtros.busqueda.toLowerCase())

    const cumpleTipo = !filtros.tipo_cliente || cliente.tipo_cliente === filtros.tipo_cliente
    const cumpleCredito = !filtros.credito || 
      (filtros.credito === 'con_credito' && cliente.credito_aprobado) ||
      (filtros.credito === 'sin_credito' && !cliente.credito_aprobado)
    const cumpleCiudad = !filtros.ciudad || cliente.ciudad === filtros.ciudad

    return cumpleBusqueda && cumpleTipo && cumpleCredito && cumpleCiudad
  })

  const ciudadesUnicas = [...new Set(clientes.map(c => c.ciudad).filter(Boolean))].sort()

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <ion-icon name="hourglass-outline"></ion-icon>
          <span>Cargando clientes...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Clientes</h1>
          <p className={styles.subtitle}>Gestiona la base de datos de clientes</p>
        </div>
        <Link href="/admin/clientes/agregar" className={styles.btnPrimary}>
          <ion-icon name="add-circle-outline"></ion-icon>
          Nuevo Cliente
        </Link>
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

      {estadisticas && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)'}}>
              <ion-icon name="people-outline"></ion-icon>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Total Clientes</span>
              <span className={styles.statValue}>{estadisticas.total}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)'}}>
              <ion-icon name="person-outline"></ion-icon>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Personas</span>
              <span className={styles.statValue}>{estadisticas.personas}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{background: 'linear-gradient(135deg, #ff9800 0%, #ffa726 100%)'}}>
              <ion-icon name="business-outline"></ion-icon>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Empresas</span>
              <span className={styles.statValue}>{estadisticas.empresas}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)'}}>
              <ion-icon name="card-outline"></ion-icon>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Con Crédito</span>
              <span className={styles.statValue}>{estadisticas.con_credito}</span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <ion-icon name="search-outline"></ion-icon>
            <input
              type="text"
              placeholder="Buscar por nombre, RUT o email..."
              value={filtros.busqueda}
              onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
            />
          </div>

          <select
            value={filtros.tipo_cliente}
            onChange={(e) => setFiltros({...filtros, tipo_cliente: e.target.value})}
            className={styles.select}
          >
            <option value="">Todos los tipos</option>
            <option value="persona">Persona</option>
            <option value="empresa">Empresa</option>
          </select>

          <select
            value={filtros.credito}
            onChange={(e) => setFiltros({...filtros, credito: e.target.value})}
            className={styles.select}
          >
            <option value="">Todo crédito</option>
            <option value="con_credito">Con Crédito</option>
            <option value="sin_credito">Sin Crédito</option>
          </select>

          <select
            value={filtros.ciudad}
            onChange={(e) => setFiltros({...filtros, ciudad: e.target.value})}
            className={styles.select}
          >
            <option value="">Todas las ciudades</option>
            {ciudadesUnicas.map(ciudad => (
              <option key={ciudad} value={ciudad}>{ciudad}</option>
            ))}
          </select>

          {(filtros.busqueda || filtros.tipo_cliente || filtros.credito || filtros.ciudad) && (
            <button
              className={styles.btnClear}
              onClick={() => setFiltros({busqueda: '', tipo_cliente: '', credito: '', ciudad: ''})}
            >
              <ion-icon name="close-circle-outline"></ion-icon>
              Limpiar
            </button>
          )}
        </div>

        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${vistaActual === 'grid' ? styles.active : ''}`}
            onClick={() => setVistaActual('grid')}
          >
            <ion-icon name="grid-outline"></ion-icon>
          </button>
          <button
            className={`${styles.viewBtn} ${vistaActual === 'list' ? styles.active : ''}`}
            onClick={() => setVistaActual('list')}
          >
            <ion-icon name="list-outline"></ion-icon>
          </button>
        </div>
      </div>

      <div className={styles.results}>
        <span>{clientesFiltrados.length} clientes encontrados</span>
      </div>

      {vistaActual === 'grid' ? (
        <div className={styles.grid}>
          {clientesFiltrados.map((cliente) => (
            <div key={cliente.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.avatarCircle}>
                  <ion-icon name={cliente.tipo_cliente === 'empresa' ? 'business' : 'person'}></ion-icon>
                </div>
                <div className={styles.cardBadges}>
                  <span className={`${styles.badge} ${styles[`badge${cliente.tipo_cliente.charAt(0).toUpperCase() + cliente.tipo_cliente.slice(1)}`]}`}>
                    {cliente.tipo_cliente}
                  </span>
                  {cliente.credito_aprobado && (
                    <span className={`${styles.badge} ${styles.badgeCredito}`}>
                      <ion-icon name="card"></ion-icon>
                      Crédito
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{cliente.nombre}</h3>
                <p className={styles.cardRut}>{cliente.rut}</p>

                <div className={styles.cardInfo}>
                  {cliente.email && (
                    <div className={styles.infoItem}>
                      <ion-icon name="mail-outline"></ion-icon>
                      <span>{cliente.email}</span>
                    </div>
                  )}
                  {cliente.telefono && (
                    <div className={styles.infoItem}>
                      <ion-icon name="call-outline"></ion-icon>
                      <span>{cliente.telefono}</span>
                    </div>
                  )}
                  {cliente.ciudad && (
                    <div className={styles.infoItem}>
                      <ion-icon name="location-outline"></ion-icon>
                      <span>{cliente.ciudad}</span>
                    </div>
                  )}
                </div>

                <div className={styles.cardStats}>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>{cliente.total_arriendos}</span>
                    <span className={styles.statLabel}>Arriendos</span>
                  </div>
                  {cliente.credito_aprobado && (
                    <div className={styles.stat}>
                      <span className={styles.statNumber}>S/ {cliente.limite_credito?.toLocaleString()}</span>
                      <span className={styles.statLabel}>Límite</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.cardFooter}>
                <Link href={`/admin/clientes/ver/${cliente.id}`} className={styles.btnVer}>
                  <ion-icon name="eye-outline"></ion-icon>
                  Ver
                </Link>
                <Link href={`/admin/clientes/editar/${cliente.id}`} className={styles.btnEditar}>
                  <ion-icon name="create-outline"></ion-icon>
                  Editar
                </Link>
                <button
                  className={styles.btnEliminar}
                  onClick={() => handleEliminar(cliente.id)}
                  disabled={procesando}
                >
                  <ion-icon name="trash-outline"></ion-icon>
                </button>
              </div>
            </div>
          ))}

          {clientesFiltrados.length === 0 && (
            <div className={styles.empty}>
              <ion-icon name="people-outline"></ion-icon>
              <h3>No se encontraron clientes</h3>
              <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>RUT</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Ciudad</th>
                <th>Crédito</th>
                <th>Arriendos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id}>
                  <td className={styles.tdRut}>{cliente.rut}</td>
                  <td className={styles.tdNombre}>
                    <div className={styles.nombreWrapper}>
                      <div className={styles.miniAvatar}>
                        <ion-icon name={cliente.tipo_cliente === 'empresa' ? 'business' : 'person'}></ion-icon>
                      </div>
                      <span>{cliente.nombre}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.tipoBadge} ${styles[`tipo${cliente.tipo_cliente.charAt(0).toUpperCase() + cliente.tipo_cliente.slice(1)}`]}`}>
                      {cliente.tipo_cliente}
                    </span>
                  </td>
                  <td className={styles.tdEmail}>{cliente.email || '-'}</td>
                  <td>{cliente.telefono || '-'}</td>
                  <td>{cliente.ciudad || '-'}</td>
                  <td className={styles.tdCredito}>
                    {cliente.credito_aprobado ? (
                      <span className={styles.creditoSi}>
                        <ion-icon name="checkmark-circle"></ion-icon>
                        S/ {cliente.limite_credito?.toLocaleString()}
                      </span>
                    ) : (
                      <span className={styles.creditoNo}>
                        <ion-icon name="close-circle"></ion-icon>
                        No
                      </span>
                    )}
                  </td>
                  <td className={styles.tdCentrado}>{cliente.total_arriendos}</td>
                  <td className={styles.tdAcciones}>
                    <div className={styles.acciones}>
                      <Link href={`/admin/clientes/ver/${cliente.id}`} className={styles.btnTableVer} title="Ver">
                        <ion-icon name="eye-outline"></ion-icon>
                      </Link>
                      <Link href={`/admin/clientes/editar/${cliente.id}`} className={styles.btnTableEditar} title="Editar">
                        <ion-icon name="create-outline"></ion-icon>
                      </Link>
                      <button
                        className={styles.btnTableEliminar}
                        onClick={() => handleEliminar(cliente.id)}
                        disabled={procesando}
                        title="Eliminar"
                      >
                        <ion-icon name="trash-outline"></ion-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {clientesFiltrados.length === 0 && (
            <div className={styles.empty}>
              <ion-icon name="people-outline"></ion-icon>
              <h3>No se encontraron clientes</h3>
              <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}