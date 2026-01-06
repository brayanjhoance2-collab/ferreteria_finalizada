"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './lista.module.css'
import { obtenerEquipos, eliminarEquipo, cambiarEstado, obtenerCategorias, obtenerEstadisticas } from './servidor'

export default function ListaEquipos() {
  const [equipos, setEquipos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: '',
    estado: '',
    marca: ''
  })
  const [vistaActual, setVistaActual] = useState('grid')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [dataEquipos, dataCategorias, dataEstadisticas] = await Promise.all([
        obtenerEquipos(),
        obtenerCategorias(),
        obtenerEstadisticas()
      ])
      setEquipos(dataEquipos)
      setCategorias(dataCategorias)
      setEstadisticas(dataEstadisticas)
    } catch (error) {
      console.error('Error cargando datos:', error)
      mostrarMensaje('Error al cargar los datos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Está seguro de eliminar este equipo?')) return

    try {
      setProcesando(true)
      await eliminarEquipo(id)
      mostrarMensaje('Equipo eliminado correctamente', 'success')
      await cargarDatos()
    } catch (error) {
      console.error('Error al eliminar:', error)
      mostrarMensaje(error.message || 'Error al eliminar equipo', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      setProcesando(true)
      await cambiarEstado(id, nuevoEstado)
      mostrarMensaje('Estado actualizado correctamente', 'success')
      await cargarDatos()
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      mostrarMensaje(error.message || 'Error al cambiar estado', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3000)
  }

  const equiposFiltrados = equipos.filter(equipo => {
    const cumpleBusqueda = !filtros.busqueda || 
      equipo.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      equipo.codigo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      equipo.marca?.toLowerCase().includes(filtros.busqueda.toLowerCase())

    const cumpleCategoria = !filtros.categoria || equipo.categoria_id == filtros.categoria
    const cumpleEstado = !filtros.estado || equipo.estado === filtros.estado
    const cumpleMarca = !filtros.marca || equipo.marca === filtros.marca

    return cumpleBusqueda && cumpleCategoria && cumpleEstado && cumpleMarca
  })

  const marcasUnicas = [...new Set(equipos.map(e => e.marca).filter(Boolean))].sort()

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <ion-icon name="hourglass-outline"></ion-icon>
          <span>Cargando equipos...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Lista de Equipos</h1>
          <p className={styles.subtitle}>Gestiona todos los equipos del inventario</p>
        </div>
        <Link href="/admin/equipos/agregar" className={styles.btnPrimary}>
          <ion-icon name="add-circle-outline"></ion-icon>
          Nuevo Equipo
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
              <ion-icon name="checkmark-circle-outline"></ion-icon>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Disponibles</span>
              <span className={styles.statValue}>{estadisticas.disponibles}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{background: 'linear-gradient(135deg, #ff9800 0%, #ffa726 100%)'}}>
              <ion-icon name="cart-outline"></ion-icon>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Arrendados</span>
              <span className={styles.statValue}>{estadisticas.arrendados}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{background: 'linear-gradient(135deg, #f44336 0%, #e57373 100%)'}}>
              <ion-icon name="construct-outline"></ion-icon>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Mantenimiento</span>
              <span className={styles.statValue}>{estadisticas.mantenimiento}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)'}}>
              <ion-icon name="layers-outline"></ion-icon>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Total</span>
              <span className={styles.statValue}>{estadisticas.total}</span>
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
              placeholder="Buscar por nombre, código o marca..."
              value={filtros.busqueda}
              onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
            />
          </div>

          <select
            value={filtros.categoria}
            onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
            className={styles.select}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>

          <select
            value={filtros.estado}
            onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
            className={styles.select}
          >
            <option value="">Todos los estados</option>
            <option value="disponible">Disponible</option>
            <option value="arrendado">Arrendado</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="reparacion">Reparación</option>
            <option value="baja">Baja</option>
          </select>

          <select
            value={filtros.marca}
            onChange={(e) => setFiltros({...filtros, marca: e.target.value})}
            className={styles.select}
          >
            <option value="">Todas las marcas</option>
            {marcasUnicas.map(marca => (
              <option key={marca} value={marca}>{marca}</option>
            ))}
          </select>

          {(filtros.busqueda || filtros.categoria || filtros.estado || filtros.marca) && (
            <button
              className={styles.btnClear}
              onClick={() => setFiltros({busqueda: '', categoria: '', estado: '', marca: ''})}
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
        <span>{equiposFiltrados.length} equipos encontrados</span>
      </div>

      {vistaActual === 'grid' ? (
        <div className={styles.grid}>
          {equiposFiltrados.map((equipo) => (
            <div key={equipo.id} className={styles.card}>
              <div className={styles.cardHeader}>
                {equipo.imagen_principal ? (
                  <img 
                    src={equipo.imagen_principal} 
                    alt={equipo.nombre}
                    className={styles.cardImage}
                  />
                ) : (
                  <div className={styles.cardImagePlaceholder}>
                    <ion-icon name="construct-outline"></ion-icon>
                  </div>
                )}
                <div className={styles.cardBadges}>
                  <span className={`${styles.badge} ${styles[`badge${equipo.estado.charAt(0).toUpperCase() + equipo.estado.slice(1)}`]}`}>
                    {equipo.estado}
                  </span>
                  {equipo.destacado && (
                    <span className={`${styles.badge} ${styles.badgeDestacado}`}>
                      <ion-icon name="star"></ion-icon>
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardCode}>
                  <ion-icon name="barcode-outline"></ion-icon>
                  <span>{equipo.codigo}</span>
                </div>
                <h3 className={styles.cardTitle}>{equipo.nombre}</h3>
                <p className={styles.cardCategory}>{equipo.categoria_nombre}</p>
                
                <div className={styles.cardInfo}>
                  {equipo.marca && (
                    <div className={styles.infoItem}>
                      <ion-icon name="business-outline"></ion-icon>
                      <span>{equipo.marca}</span>
                    </div>
                  )}
                  {equipo.modelo && (
                    <div className={styles.infoItem}>
                      <ion-icon name="pricetag-outline"></ion-icon>
                      <span>{equipo.modelo}</span>
                    </div>
                  )}
                </div>

                <div className={styles.cardPrices}>
                  <div className={styles.price}>
                    <span className={styles.priceLabel}>Día</span>
                    <span className={styles.priceValue}>S/ {equipo.precio_dia}</span>
                  </div>
                  <div className={styles.price}>
                    <span className={styles.priceLabel}>Semana</span>
                    <span className={styles.priceValue}>S/ {equipo.precio_semana}</span>
                  </div>
                  <div className={styles.price}>
                    <span className={styles.priceLabel}>Mes</span>
                    <span className={styles.priceValue}>S/ {equipo.precio_mes}</span>
                  </div>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <select
                  className={styles.estadoSelect}
                  value={equipo.estado}
                  onChange={(e) => handleCambiarEstado(equipo.id, e.target.value)}
                  disabled={procesando}
                >
                  <option value="disponible">Disponible</option>
                  <option value="arrendado">Arrendado</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="reparacion">Reparación</option>
                  <option value="baja">Baja</option>
                </select>

                <div className={styles.cardActions}>
                  <Link href={`/admin/equipos/editar/${equipo.id}`} className={styles.btnEdit}>
                    <ion-icon name="create-outline"></ion-icon>
                  </Link>
                  <button
                    className={styles.btnDelete}
                    onClick={() => handleEliminar(equipo.id)}
                    disabled={procesando}
                  >
                    <ion-icon name="trash-outline"></ion-icon>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {equiposFiltrados.length === 0 && (
            <div className={styles.empty}>
              <ion-icon name="search-outline"></ion-icon>
              <h3>No se encontraron equipos</h3>
              <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.table}>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Estado</th>
                <th>Precio/Día</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {equiposFiltrados.map((equipo) => (
                <tr key={equipo.id}>
                  <td className={styles.tdCodigo}>{equipo.codigo}</td>
                  <td className={styles.tdNombre}>
                    <div className={styles.nombreWrapper}>
                      {equipo.imagen_principal && (
                        <img src={equipo.imagen_principal} alt={equipo.nombre} />
                      )}
                      <span>{equipo.nombre}</span>
                    </div>
                  </td>
                  <td>{equipo.categoria_nombre}</td>
                  <td>{equipo.marca || '-'}</td>
                  <td>{equipo.modelo || '-'}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[`badge${equipo.estado.charAt(0).toUpperCase() + equipo.estado.slice(1)}`]}`}>
                      {equipo.estado}
                    </span>
                  </td>
                  <td className={styles.tdPrecio}>S/ {equipo.precio_dia}</td>
                  <td className={styles.tdStock}>{equipo.stock}</td>
                  <td className={styles.tdAcciones}>
                    <Link href={`/admin/equipos/editar/${equipo.id}`} className={styles.btnTableEdit}>
                      <ion-icon name="create-outline"></ion-icon>
                    </Link>
                    <button
                      className={styles.btnTableDelete}
                      onClick={() => handleEliminar(equipo.id)}
                      disabled={procesando}
                    >
                      <ion-icon name="trash-outline"></ion-icon>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {equiposFiltrados.length === 0 && (
            <div className={styles.empty}>
              <ion-icon name="search-outline"></ion-icon>
              <h3>No se encontraron equipos</h3>
              <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}