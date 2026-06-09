import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import styles from './AdminJuegos.module.css';

interface GenericOption { id: number; nombre: string; }

export default function AdminJuegos() {
  // Opciones de bases de datos
  const [categorias, setCategorias] = useState<GenericOption[]>([]);
  const [tiposLootbox, setTiposLootbox] = useState<GenericOption[]>([]);
  const [nivelesAleatoriedad, setNivelesAleatoriedad] = useState<GenericOption[]>([]);
  const [nivelesDependencia, setNivelesDependencia] = useState<GenericOption[]>([]);

  // Campos del Formulario
  const [titulo, setTitulo] = useState('');
  const [desarrollador, setDesarrollador] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenUrl, setImagenUrl] = useState(''); 
  const [aleatoriedadID, setAleatoriedadID] = useState<number>(0);
  const [dependenciaID, setDependenciaID] = useState<number>(0);
  const [selectedCategorias, setSelectedCategorias] = useState<number[]>([]);
  const [selectedLootboxes, setSelectedLootboxes] = useState<number[]>([]);

  // NUEVO: Estados para los filtros de búsqueda por nombre
  const [busquedaCategoria, setBusquedaCategoria] = useState('');
  const [busquedaLootbox, setBusquedaLootbox] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false); 

  // Carga paralela de relaciones operativas
  useEffect(() => {
    const cargarDatosRelacionales = async () => {
      try {
        const [resCat, resLoot, resAleat, resDep] = await Promise.all([
          api.get<GenericOption[]>('/categorias'),
          api.get<GenericOption[]>('/tipos-lootbox'),
          api.get<GenericOption[]>('/niveles-aleatoriedad'),
          api.get<GenericOption[]>('/niveles-dependencia')
        ]);

        setCategorias(resCat.data || []);
        setTiposLootbox(resLoot.data || []);
        setNivelesAleatoriedad(resAleat.data || []);
        setNivelesDependencia(resDep.data || []);
      } catch (err) {
        console.error('Error al sincronizar opciones relacionales:', err);
        setError('No se pudo precargar la configuración relacional del servidor.');
      }
    };

    cargarDatosRelacionales();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSubiendoImagen(true);

    const formData = new FormData();
    formData.append('image', file); 

    try {
      const response = await api.post<{ url: string }>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setImagenUrl(response.data.url); 
      alert('¡Imagen sincronizada con Firebase con éxito!');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Error al intentar transferir la imagen a Firebase.');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleCheckboxChange = (id: number, list: number[], setList: React.Dispatch<React.SetStateAction<number[]>>) => {
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  // NUEVO: Lógica de filtrado en tiempo real por nombre
  const categoriasFiltradas = categorias.filter(cat => 
    cat.nombre.toLowerCase().includes(busquedaCategoria.toLowerCase())
  );

  const lootboxesFiltradas = tiposLootbox.filter(lb => 
    lb.nombre.toLowerCase().includes(busquedaLootbox.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (aleatoriedadID === 0 || dependenciaID === 0) {
      setError('Debes asignar métricas de aleatoriedad y dependencia obligatoriamente.');
      return;
    }

    setLoading(true);

    const payload = {
      titulo,
      descripcion,
      desarrollador,
      imagen_url: imagenUrl, 
      aleatoriedad_id: aleatoriedadID,
      dependencia_id: dependenciaID,
      categorias_ids: selectedCategorias,
      tipos_lootbox_ids: selectedLootboxes,
    };

    try {
      await api.post('/juegos', payload);
      alert('¡Juego auditado y guardado con éxito en el catálogo central!');
      
      setTitulo('');
      setDesarrollador('');
      setDescripcion('');
      setImagenUrl('');
      setAleatoriedadID(0);
      setDependenciaID(0);
      setSelectedCategorias([]);
      setSelectedLootboxes([]);
      setBusquedaCategoria(''); // Reseteamos también los campos de búsqueda
      setBusquedaLootbox('');
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Error crítico de red al transferir el juego.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Auditoría del Sistema</h1>
      <p className={styles.subtitle}>REGISTRO Y ANÁLISIS DE NUEVOS TÍTULOS EN EL ÍNDICE</p>

      <div className={styles.panelBox}>
        {error && <div className={styles.error}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className={styles.formGrid}>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Título del Juego</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Ej. Counter-Strike 2, Genshin Impact"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Desarrollador / Empresa</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Ej. Valve, miHoYo, EA"
              value={desarrollador}
              onChange={(e) => setDesarrollador(e.target.value)}
              required
            />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Portada del Juego (Firebase Storage)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={subiendoImagen}
              style={{ display: 'none' }}
              id="game-image-file"
            />
            <label htmlFor="game-image-file" className={styles.input} style={{ cursor: 'pointer', textAlign: 'center', display: 'block' }}>
              {subiendoImagen ? '⚡ Sincronizando con Google Cloud...' : imagenUrl ? '✓ Archivo en Firebase listo' : '📁 Seleccionar portada del juego'}
            </label>

            {imagenUrl && (
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <img src={imagenUrl} alt="Preview" style={{ maxWidth: '160px', borderRadius: '8px', border: '1px solid #8b5cf6' }} />
              </div>
            )}
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Descripción y Reporte de Monetización</label>
            <textarea
              className={styles.textarea}
              placeholder="Detalla cómo interactúan las mecánicas de pago y el impacto detectado..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Factor de Azar (Aleatoriedad)</label>
            <select
              className={styles.select}
              value={aleatoriedadID}
              onChange={(e) => setAleatoriedadID(Number(e.target.value))}
              required
            >
              <option value={0}>Selecciona nivel...</option>
              {nivelesAleatoriedad.map(opt => <option key={opt.id} value={opt.id}>{opt.nombre}</option>)}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Modelo Predatorio (Dependencia)</label>
            <select
              className={styles.select}
              value={dependenciaID}
              onChange={(e) => setDependenciaID(Number(e.target.value))}
              required
            >
              <option value={0}>Selecciona nivel...</option>
              {nivelesDependencia.map(opt => <option key={opt.id} value={opt.id}>{opt.nombre}</option>)}
            </select>
          </div>

          {/* SECCIÓN CATEGORÍAS CON BUSCADOR */}
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Categorías Asociadas (Géneros)</label>
            <input 
              type="text"
              className={styles.input}
              style={{ marginBottom: '12px', padding: '6px 12px', fontSize: '0.9rem' }}
              placeholder="🔍 Filtrar categorías por nombre..."
              value={busquedaCategoria}
              onChange={(e) => setBusquedaCategoria(e.target.value)}
            />
            <div className={styles.checkboxGrid}>
              {categoriasFiltradas.length > 0 ? (
                categoriasFiltradas.map(cat => (
                  <label key={cat.id} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={selectedCategorias.includes(cat.id)}
                      onChange={() => handleCheckboxChange(cat.id, selectedCategorias, setSelectedCategorias)}
                    />
                    {cat.nombre}
                  </label>
                ))
              ) : (
                <span style={{ color: '#64748b', fontSize: '0.9rem', gridColumn: '1/-1' }}>No se encontraron categorías.</span>
              )}
            </div>
          </div>

          {/* SECCIÓN MECÁNICAS CON BUSCADOR */}
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Mecánicas de Apuesta Internas (Lootboxes)</label>
            <input 
              type="text"
              className={styles.input}
              style={{ marginBottom: '12px', padding: '6px 12px', fontSize: '0.9rem' }}
              placeholder="🔍 Filtrar mecánicas por nombre..."
              value={busquedaLootbox}
              onChange={(e) => setBusquedaLootbox(e.target.value)}
            />
            <div className={styles.checkboxGrid}>
              {lootboxesFiltradas.length > 0 ? (
                lootboxesFiltradas.map(lb => (
                  <label key={lb.id} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={selectedLootboxes.includes(lb.id)}
                      onChange={() => handleCheckboxChange(lb.id, selectedLootboxes, setSelectedLootboxes)}
                    />
                    {lb.nombre}
                  </label>
                ))
              ) : (
                <span style={{ color: '#64748b', fontSize: '0.9rem', gridColumn: '1/-1' }}>No se encontraron mecánicas de apuesta.</span>
              )}
            </div>
          </div>

          <button type="submit" className={`${styles.button} ${styles.fullWidth}`} disabled={loading || subiendoImagen}>
            {loading ? 'Subiendo informe...' : 'Dar de Alta Juego'}
          </button>

        </form>
      </div>
    </div>
  );
}