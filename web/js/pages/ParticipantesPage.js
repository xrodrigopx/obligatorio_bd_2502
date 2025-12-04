const ParticipantesPage = () => {
  const [participantes, setParticipantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // aca cargo los participantes desde el backend
  const cargarParticipantes = async () => {
    setCargando(true);
    setError("");
    try {
      const respuesta = await fetch("/api/participants");
      if (respuesta.ok) {
        const datos = await respuesta.json();
        setParticipantes(datos);
      } else {
        setError("no se pudo cargar los participantes");
      }
    } catch (error) {
      setError("error de conexion: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  // cuando carga la pagina llamo a cargar participantes
  useEffect(() => {
    cargarParticipantes();
  }, []);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-4">
          <FormularioParticipante participanteAgregado={cargarParticipantes} />
        </div>
        <div className="col-md-8">
          {cargando ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">cargando...</span>
              </div>
              <p className="mt-2">Cargando participantes...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
              <button
                className="btn btn-outline-danger btn-sm ms-2"
                onClick={cargarParticipantes}
              >
                <i className="fas fa-sync-alt me-1"></i>
                Reintentar
              </button>
            </div>
          ) : (
            <ListaParticipantes
              participantes={participantes}
              recargar={cargarParticipantes}
            />
          )}
        </div>
      </div>
    </div>
  );
};
