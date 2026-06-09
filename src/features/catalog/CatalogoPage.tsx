import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { type Juego } from '../../interfaces';
import JuegoCard from './JuegoCard';
import styles from './CatalogoPage.module.css';

// 1. Definimos la interfaz para recibir la navegación del App.tsx
interface CatalogoPageProps {
  onNavigate: (page: string, juegoId?: number) => void;
}

export default function CatalogoPage({ onNavigate }: CatalogoPageProps) {
  const [juegos, setJuegos] = useState<Juego[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para búsqueda y filtrado
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');

  useEffect(() => {
    const cargarJuegos = async () => {
      try {
        setLoading(true);
        const response = await api.get<Juego[]>('/juegos');
        setJuegos(response.data || []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Error al sincronizar con el índice central.');
      } finally {
        setLoading(false);
      }
    };
    cargarJuegos();
  }, []);

  // Lista de categorías estáticas
  const categoriesFiltro = ['Todos', 'Acción', 'Aventura', 'Deportes', 'Estrategia', 'Multijugador'];

  // Lógica combinada de filtrado
  const juegosFiltrados = juegos.filter((juego) => {
    const cumpleBusqueda = juego.titulo.toLowerCase().includes(searchQuery.toLowerCase());
    
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

      {/* Selector de Categorías */}
      <div className={styles.filterContainer}>
        {categoriesFiltro.map((cat) => (
          <button
            key={cat}
            className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Renderizado de la lista */}
      <div className={styles.listStack}>
        {juegosFiltrados.length > 0 ? (
          juegosFiltrados.map((juego) => (
            // 2. Usamos el onNavigate nativo con el id real del juego
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