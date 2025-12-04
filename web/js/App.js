const App = () => {
  // estado de autenticacion
  const [autenticado, setAutenticado] = useState(false);

  // estado principal de la app, por defecto empiezo en participantes
  const [paginaActual, setPaginaActual] = useState("participantes");

  // para mostrar loading mientras arranca todo
  const [cargando, setCargando] = useState(true);

  // si hay algun error lo guardo aca
  const [error, setError] = useState("");

  // para saber si estoy conectado al servidor
  const [estadoConexion, setEstadoConexion] = useState("verificando");

  // funcion para chequear si el servidor esta funcionando
  const verificarConexion = async () => {
    try {
      setEstadoConexion("verificando");

      const respuesta = await fetch("/api/participants");

      if (respuesta.ok) {
        setError("");
        setEstadoConexion("conectado");
      } else {
        setError("no se puede conectar con el servidor");
        setEstadoConexion("error");
      }
    } catch (error) {
      setError("error de conexion: " + error.message);
      setEstadoConexion("error");
    } finally {
      setCargando(false); // siempre paro el loading
    }
  };

  // cuando arranca la app, verifico la conexion
  useEffect(() => {
    verificarConexion();
  }, []);

  // funcion para manejar el login exitoso
  const manejarLogin = () => {
    setAutenticado(true);
  };

  // funcion para cerrar sesion
  const manejarLogout = () => {
    setAutenticado(false);
    setPaginaActual("participantes"); // volver a la pagina inicial
  };

  // funcion para cambiar entre paginas
  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
  };

  // aca decido que pagina mostrar segun donde este el usuario
  const renderizarContenido = () => {
    switch (paginaActual) {
      case "participantes":
        return <ParticipantesPage />;
      case "salas":
        return <SalasPage />;
      case "sanciones":
        return <SancionesPage />;
      case "reservas":
        return <ReservasPage />;
      case "reportes":
        return <ReportesPage />;
      default:
        return <ParticipantesPage />; // por defecto participantes
    }
  };

  // si no esta autenticado mostrar login
  if (!autenticado) {
    return <Login onLogin={manejarLogin} />;
  }

  // pantalla de carga mientras conecto
  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border mb-3" role="status">
            <span className="visually-hidden">cargando...</span>
          </div>
          <p>conectando con el servidor...</p>
        </div>
      </div>
    );
  }

  // si no se puede conectar muestro error
  if (estadoConexion === "error") {
    return (
      <div className="container-fluid vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="alert alert-danger">
            <h4>
              <i className="fas fa-exclamation-triangle me-2"></i>
              error de conexion
            </h4>
            <p>{error}</p>
            <button
              className="btn btn-danger"
              onClick={() => {
                setCargando(true);
                verificarConexion();
              }}
            >
              <i className="fas fa-sync-alt me-1"></i>
              reintentar conexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  // si todo esta bien muestro la app principal
  return (
    <div className="min-vh-100 bg-light">
      <Navegacion
        paginaActual={paginaActual}
        onCambiarPagina={cambiarPagina}
        estadoConexion={estadoConexion}
        onLogout={manejarLogout}
      />

      <main className="py-4">{renderizarContenido()}</main>
    </div>
  );
};
