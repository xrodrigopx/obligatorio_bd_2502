const FormularioSancion = ({ sancionAgregada }) => {
  // aca guardo los datos de la sancion que el usuario escribe
  const [datos, setDatos] = useState({
    ci_participante: "",
    fecha_inicio: "",
    fecha_fin: "",
    motivo: "",
  });

  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [participantes, setParticipantes] = useState([]);
  const [cargandoParticipantes, setCargandoParticipantes] = useState(true);

  // cargo los participantes cuando se abre la pagina
  useEffect(() => {
    const cargarParticipantes = async () => {
      try {
        const respuesta = await fetch("/api/participants");
        if (respuesta.ok) {
          const datosParticipantes = await respuesta.json();
          setParticipantes(datosParticipantes);
        }
      } catch (error) {
        console.error("error cargando participantes:", error);
      } finally {
        setCargandoParticipantes(false);
      }
    };

    cargarParticipantes();
  }, []);

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;
    setDatos({
      ...datos,
      [name]: value,
    });
    if (mensaje) setMensaje("");
  };

  const manejarEnvio = async (evento) => {
    evento.preventDefault();

    if (!datos.ci_participante || !datos.fecha_inicio || !datos.fecha_fin) {
      setMensaje("Por favor complete todos los campos requeridos");
      return;
    }

    if (new Date(datos.fecha_fin) <= new Date(datos.fecha_inicio)) {
      setMensaje("La fecha de fin debe ser posterior a la fecha de inicio");
      return;
    }

    setEnviando(true);
    setMensaje("Agregando sanción...");

    try {
      const respuesta = await fetch("/api/sanciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      if (respuesta.ok) {
        setMensaje("Sanción agregada exitosamente");
        setDatos({
          ci_participante: "",
          fecha_inicio: "",
          fecha_fin: "",
          motivo: "",
        });
        setTimeout(() => setMensaje(""), 3000);
        if (sancionAgregada) sancionAgregada();
      } else {
        const datosError = await respuesta.json();
        setMensaje("Error: " + (datosError.error || "Error desconocido"));
      }
    } catch (error) {
      setMensaje("Error: " + error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="fas fa-ban me-2"></i>
          Agregar Sanción
        </h5>
      </div>
      <div className="card-body">
        {cargandoParticipantes ? (
          <div className="text-center">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="small mt-1">Cargando participantes...</p>
          </div>
        ) : (
          <form onSubmit={manejarEnvio}>
            <div className="mb-3">
              <label className="form-label">
                <i className="fas fa-user me-1"></i>
                Participante
              </label>
              <select
                className="form-select"
                name="ci_participante"
                value={datos.ci_participante}
                onChange={manejarCambio}
                disabled={enviando}
              >
                <option value="">Seleccione un participante</option>
                {participantes.map((participante) => (
                  <option key={participante.ci} value={participante.ci}>
                    {participante.nombre} {participante.apellido} (
                    {participante.ci})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">
                <i className="fas fa-calendar-alt me-1"></i>
                Fecha de Inicio
              </label>
              <input
                type="date"
                className="form-control"
                name="fecha_inicio"
                value={datos.fecha_inicio}
                onChange={manejarCambio}
                disabled={enviando}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                <i className="fas fa-calendar-check me-1"></i>
                Fecha de Fin
              </label>
              <input
                type="date"
                className="form-control"
                name="fecha_fin"
                value={datos.fecha_fin}
                onChange={manejarCambio}
                disabled={enviando}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                <i className="fas fa-comment me-1"></i>
                Motivo (opcional)
              </label>
              <textarea
                className="form-control"
                name="motivo"
                rows="3"
                placeholder="Descripción del motivo de la sanción"
                value={datos.motivo}
                onChange={manejarCambio}
                disabled={enviando}
              />
            </div>
            <button
              type="submit"
              className="btn btn-warning w-100"
              disabled={enviando}
            >
              {enviando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1"></span>
                  Agregando...
                </>
              ) : (
                <>
                  <i className="fas fa-plus me-1"></i>
                  Agregar Sanción
                </>
              )}
            </button>
          </form>
        )}

        {mensaje && (
          <div
            className={`alert mt-3 ${
              mensaje.includes("Error")
                ? "alert-danger"
                : mensaje.includes("exitosamente")
                ? "alert-success"
                : "alert-info"
            }`}
          >
            {mensaje}
          </div>
        )}
      </div>
    </div>
  );
};
