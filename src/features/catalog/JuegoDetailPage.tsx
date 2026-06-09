import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { type Juego } from '../../interfaces';
import styles from './JuegoDetailPage.module.css';

interface JuegoDetailPageProps {
    juegoId: number;
    onBack: () => void;
}

export default function JuegoDetailPage({ juegoId, onBack }: JuegoDetailPageProps) {
    const [juego, setJuego] = useState<Juego | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para el nuevo comentario
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [enviando, setEnviando] = useState(false);

    // CORREGIDO: Carga inicial del reporte completo usando un método GET limpio
    useEffect(() => {
        const cargarDetalle = async () => {
            try {
                setLoading(true);
                // Consultamos al endpoint dinámico que configuramos en Gin
                const response = await api.get<Juego>(`/juegos/${juegoId}`);
                setJuego(response.data);
                setError(null);
            } catch (err) {
                console.error(err);
                setError('No se pudo establecer conexión con los servidores del índice.');
            } finally {
                setLoading(false);
            }
        };
        cargarDetalle();
    }, [juegoId]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    setEnviando(true);
    try {
        // CORREGIDO: Cambiamos "contenido" por "comentario" para alinearse con el DTO de Go
        const response = await api.post('/resenas', { 
            comentario: nuevoComentario, // <-- CAMBIO AQUÍ
            juego_id: juegoId
        });

        // Al actualizar el estado de React localmente, adaptamos la respuesta 
        // mapeando "comentario" a la propiedad text que use tu interfaz si es necesario.
        const nuevaResena = response.data;
        
        // Si tu renderizador abajo usa res.contenido, puedes inyectarlo para que se dibuje bien:
        if (!nuevaResena.contenido && nuevaResena.comentario) {
            nuevaResena.contenido = nuevaResena.comentario;
        }

        setJuego((prevJuego: any) => {
            if (!prevJuego) return null;
            return {
                ...prevJuego,
                resenas: [nuevaResena, ...(prevJuego.resenas || [])]
            };
        });

        setNuevoComentario('');
        alert('Reporte comunitario añadido a la bitácora.');
    } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.error || 'Debes iniciar sesión para publicar un informe.');
    } finally {
        setEnviando(false);
    }
};

    if (loading) return <div className={styles.container} style={{ color: '#fff' }}>Decodificando archivos del juego...</div>;
    if (error || !juego) return <div className={styles.container} style={{ color: '#f87171' }}>⚠️ {error || 'Juego no encontrado.'}</div>;

    return (
        <div className={styles.container}>
            {/* Botón Volver */}
            <button className={styles.backBtn} onClick={onBack}>
                ← Regresar al catálogo central
            </button>

            {/* PANEL SUPERIOR: Ficha Técnica */}
            <div className={styles.mainPanel}>
                <div className={styles.coverContainer}>
                    {juego.imagen_url ? (
                        <img src={juego.imagen_url} alt={juego.titulo} className={styles.coverImage} />
                    ) : (
                        <div className={styles.noImage}>NO PORTADA AVAILABLE</div>
                    )}
                </div>

                <div className={styles.details}>
                    <h1 className={styles.title}>{juego.titulo}</h1>
                    <span className={styles.developer}>Desarrollado por: {juego.desarrollador}</span>

                    <div className={styles.sectionTitle}>Análisis de Riesgo de Ludopatía</div>
                    <div className={styles.badgeStack}>
                        {juego.nivel_aleatoriedad && (
                            <span className={`${styles.badge} ${styles.badgePurple}`}>
                                🎰 Azar: {juego.nivel_aleatoriedad.nombre}
                            </span>
                        )}
                        {juego.nivel_dependencia && (
                            <span className={`${styles.badge} ${styles.badgeRed}`}>
                                🚨 Modelo: {juego.nivel_dependencia.nombre}
                            </span>
                        )}
                    </div>

                    <div className={styles.sectionTitle}>Mecánicas Predatorias Detectadas</div>
                    <div className={styles.badgeStack}>
                        {juego.tipos_lootbox && juego.tipos_lootbox.length > 0 ? (
                            juego.tipos_lootbox.map(lb => (
                                <span key={lb.id} className={`${styles.badge} ${styles.badgeBlue}`}>
                                    📦 {lb.nombre}
                                </span>
                            ))
                        ) : (
                            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>No se reportan cajas de botín de momento.</span>
                        )}
                    </div>

                    <div className={styles.sectionTitle}>Reporte Clínico Oficial</div>
                    <p className={styles.description}>{juego.descripcion}</p>
                </div>
            </div>

            {/* PANEL INFERIOR: Auditoría Social (Comentarios) */}
            <div className={styles.commentsSection}>
                <h3 style={{ color: '#fff', margin: '0 0 4px 0', fontSize: '1.4rem' }}>Auditoría Social Comunitaria</h3>
                <p style={{ color: '#64748b', margin: '0 0 24px 0', fontSize: '0.9rem' }}>REPORTES ANÓNIMOS Y EXPERIENCIAS DE USUARIOS SOBRE EL SISTEMA ECONÓMICO</p>

                {/* Formulario para dejar reseñas */}
                <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                    <textarea
                        className={styles.textarea}
                        placeholder="Escribe tu reporte o experiencia con los micropagos de este juego..."
                        value={nuevoComentario}
                        onChange={(e) => setNuevoComentario(e.target.value)}
                        required
                    />
                    <button type="submit" className={styles.submitBtn} disabled={enviando}>
                        {enviando ? 'Enviando...' : 'Publicar Reporte'}
                    </button>
                </form>

                {/* Lista de reseñas */}
                <div className={styles.commentList}>
                    {juego.resenas && juego.resenas.length > 0 ? (
                        juego.resenas.map((res: any) => (
                            <div key={res.id} className={styles.commentBox}>
                                <div className={styles.commentHeader}>
                                    <span className={styles.commentUser}>Auditor: {res.usuario?.nombre || 'Anónimo'}</span>
                                    <span className={styles.commentDate}>
                                        {res.created_at ? new Date(res.created_at).toLocaleDateString() : 'Reciente'}
                                    </span>
                                </div>
                                <p className={styles.commentText}>{res.comentario || res.contenido}</p>
                            </div>
                        ))
                    ) : (
                        <div className={styles.noComments}>
                            Aún no hay reportes de usuarios en esta bitácora. ¡Sé el primero en auditar!
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}