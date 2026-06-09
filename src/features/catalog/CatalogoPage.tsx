import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { type Juego } from '../../interfaces';
import JuegoCard from './JuegoCard';
import styles from './CatalogoPage.module.css';

// Interfaz local para manejar el tipado de categorías que vienen de la BD
interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface CatalogoPageProps {
  onNavigate: (page: string, juegoId?: number) => void;
}

export default function CatalogoPage({ onNavigate }: CatalogoPageProps) {
  const [juegos, setJuegos] = useState<Juego[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]); // <-- NUEVO: Estado para las categorías de la BD
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para búsqueda y filtrado
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');

  // Carga paralela de Juegos y Categorías desde Railway
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        // Ejecutamos ambas peticiones al mismo tiempo para ahorrar tiempo de carga
        const [juegosRes, catsRes] = await Promise.all([
          api.get<Juego[]>('/juegos'),
          api.get<Categoria[]>('/categorias') // <-- Asegúrate de tener esta ruta configurada en Gin
        ]);

        setJuegos(juegosRes.data || []);
        setCategorias(catsRes.data || []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Error al sincronizar con el índice central.');
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  // Lógica combinada de filtrado
  const juegosFiltrados = juegos.filter((juego) => {
    const cumpleBusqueda = juego.titulo.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtramos comparando contra el nombre de la categoría mapeada dinámicamente
    const cumpleCategoria = activeCategory === 'Todos' || juego.categorias?.some(
      (cat) => cat.nombre.toLowerCase() === activeCategory.toLowerCase()
    );

    return cumpleBusqueda && cumpleCategoria;
  });

  if (loading) return <div className={styles.loading}>Cargando interfaz de auditoría...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      
      {/* Banner Principal */}
      <div className={styles.banner}>
        <div className={styles.bannerContent}>
          <h1 className={styles.title}>
            JUEGOS <span className={styles.titleAccent}>Y LOOTBOXES</span>
          </h1>
          <p className={styles.subtitle}>
            Explorá. Informate. Jugá con conciencia.
          </p>
          <div className={styles.warningCard}>
            <span className={styles.warningIcon}>⚠️</span>
            <span>Las lootboxes pueden generar gastos innecesarios y adicción.</span>
          </div>
        </div>
        <div className={styles.bannerIllustration}>
          <span className={styles.lootboxPlaceholder}>📦</span>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div className={styles.searchContainer}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar juegos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Selector de Categorías 100% DINÁMICO */}
      <div className={styles.filterContainer}>
        {/* Botón estático para limpiar filtros */}
        <button
          className={`${styles.filterBtn} ${activeCategory === 'Todos' ? styles.filterBtnActive : ''}`}
          onClick={() => setActiveCategory('Todos')}
        >
          Todos
        </button>

        {/* Mapeo de las categorías reales de PostgreSQL */}
        {categorias.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.filterBtn} ${activeCategory === cat.nombre ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveCategory(cat.nombre)}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* Renderizado de la lista */}
      <div className={styles.listStack}>
        {juegosFiltrados.length > 0 ? (
          juegosFiltrados.map((juego) => (
            <div 
              key={juego.id} 
              onClick={() => onNavigate('detalle-juego', juego.id)} 
              style={{ cursor: 'pointer' }}
            >
              <JuegoCard juego={juego} />
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>No se encontraron juegos que coincidan con los criterios de búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
}