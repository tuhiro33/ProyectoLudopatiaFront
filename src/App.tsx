import { useState } from 'react';
import Navbar from './layouts/Navbar';
import CatalogoPage from './features/catalog/CatalogoPage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/Register'; 
import AdminCategorias from './features/admin/AdminCategorias';
import AdminJuegos from './features/admin/AdminJuegos';
import JuegoDetailPage from './features/catalog/JuegoDetailPage'; // <-- IMPORTAMOS LA NUEVA PÁGINA

export default function App() {
  // 1. Estado de la página y almacenamiento en memoria del ID seleccionado
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedJuegoId, setSelectedJuegoId] = useState<number | null>(null);

  // 2. Manejador centralizado de rutas capaz de capturar IDs dinámicos
  const handleNavigation = (page: string, juegoId?: number) => {
    if (juegoId !== undefined) {
      setSelectedJuegoId(juegoId);
    }
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        // 3. Le pasamos el manejador al catálogo principal
        return <CatalogoPage onNavigate={handleNavigation} />;
      case 'login':
        return <LoginPage onLoginSuccess={() => setCurrentPage('home')} />;
      case 'register':
        return (
          <RegisterPage 
            onRegisterSuccess={() => setCurrentPage('login')} 
            onNavigateToLogin={() => setCurrentPage('login')}
          />
        );
      case 'admin-categorias':
        return <AdminCategorias />;
      case 'admin-juegos':
        return <AdminJuegos />;
      case 'detalle-juego':
        // 4. Conectamos el componente real inyectando el ID guardado y la función de regreso
        return (
          <JuegoDetailPage 
            juegoId={selectedJuegoId!} 
            onBack={() => setCurrentPage('home')} 
          />
        );
      default:
        return <CatalogoPage onNavigate={handleNavigation} />;
    }
  };

  return (
    <main style={{ backgroundColor: '#0b0f19', minHeight: '100vh' }}>
      {/* Sincronizamos también el Navbar con el manejador dinámico */}
      <Navbar currentPage={currentPage as any} onNavigate={(page: any) => handleNavigation(page)} />
      {renderPage()}
    </main>
  );
}