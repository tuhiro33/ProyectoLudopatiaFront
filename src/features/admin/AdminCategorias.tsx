import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import styles from './AdminCategorias.module.css';

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
}

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Cargar categorías existentes al montar el componente
  const cargarCategorias = async () => {
    try {
      const response = await api.get<Categoria[]>('/categorias');
      setCategorias(response.data || []);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // El interceptor de Axios añadirá el "Bearer <token>" automáticamente
      await api.post('/categorias', {
        nombre,
        descripcion,
      });

      alert('¡Categoría registrada exitosamente en el núcleo!');
      setNombre('');
      setDescripcion('');
      
      // Refrescamos la lista de categorías para ver el nuevo registro de inmediato
      cargarCategorias();
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Acceso denegado. No tienes permisos de administrador o tu sesión expiró.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Error al procesar la solicitud en el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Panel de Control</h1>
      <p className={styles.subtitle}>ADMINISTRACIÓN GLOBAL DE CATEGORÍAS DE AUDITORÍA</p>

      <div className={styles.gridAdmin}>
        
        {/* Columna Izquierda: Formulario de Registro */}
        <div className={styles.panelBox}>
          <h3 className={styles.panelTitle}>Nueva Categoría</h3>
          
          {error && <div className={styles.error}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre de la Categoría</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Ej. Gacha, Shooter, MMORPG"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Descripción Operativa</label>
              <textarea
                className={styles.textarea}
                placeholder="Especifica el impacto o naturaleza de este género..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? 'Registrando...' : 'Añadir Categoría'}
            </button>
          </form>
        </div>

        {/* Columna Derecha: Base de Datos de Categorías actuales */}
        <div className={styles.panelBox}>
          <h3 className={styles.panelTitle}>Categorías en el Sistema ({categorias.length})</h3>
          
          <div className={styles.listStack}>
            {categorias.length > 0 ? (
              categorias.map((cat) => (
                <div key={cat.id} className={styles.itemCard}>
                  <h4 className={styles.itemName}>{cat.nombre}</h4>
                  <p className={styles.itemDesc}>{cat.descripcion || 'Sin descripción operativa.'}</p>
                </div>
              ))
            ) : (
              <p className={styles.emptyText}>No hay categorías cargadas en el mapa actual.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}