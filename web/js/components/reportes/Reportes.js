const Reportes = () => {
  const [datosReporte, setDatosReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [tipoReporte, setTipoReporte] = useState("");

  // para los reportes que necesitan parametros
  const [parametrosConsulta, setParametrosConsulta] = useState({
    ci: "",
    fecha: "",
  });

  // funcion para cargar reportes simples (los que no necesitan parametros)
  const cargarReporteSimple = async (endpoint, nombre) => {
    setCargando(true);
    setError("");
    setTipoReporte(nombre);

    const url = `/api/reports/${endpoint}`;
    console.log("llamando a:", url); // debug

    try {
      const respuesta = await fetch(url);
      console.log("respuesta:", respuesta.status, respuesta.statusText); // debug

      if (respuesta.ok) {
        const datos = await respuesta.json();
        console.log("datos recibidos:", datos); // debug
        setDatosReporte(datos);
      } else {
        // leo la respuesta como texto una sola vez
        const textoRespuesta = await respuesta.text();
        console.log("respuesta de error:", textoRespuesta); // debug

        try {
          const errorData = JSON.parse(textoRespuesta);
          setError(
            errorData.error ||
              `error ${respuesta.status}: ${respuesta.statusText}`
          );
        } catch {
          setError(
            `error ${respuesta.status}: endpoint no encontrado o servidor no disponible`
          );
        }
      }
    } catch (error) {
      console.error("error de conexion:", error); // debug
      setError("error de conexion: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  // funcion para cargar reportes con parametros
  const cargarReporteConParametros = async (endpoint, nombre) => {
    if (!parametrosConsulta.ci || !parametrosConsulta.fecha) {
      setError("falta completar ci y fecha");
      return;
    }

    setCargando(true);
    setError("");
    setTipoReporte(nombre);

    try {
      const params = new URLSearchParams(parametrosConsulta);
      const url = `/api/reports/${endpoint}?${params}`;
      console.log("llamando a:", url); // debug

      const respuesta = await fetch(url);
      console.log("respuesta:", respuesta.status, respuesta.statusText); // debug

      if (respuesta.ok) {
        const datos = await respuesta.json();
        console.log("datos recibidos:", datos); // debug
        setDatosReporte(datos);
      } else {
        // leo la respuesta como texto una sola vez
        const textoRespuesta = await respuesta.text();
        console.log("respuesta de error:", textoRespuesta); // debug

        try {
          const errorData = JSON.parse(textoRespuesta);
          setError(
            errorData.error ||
              `error ${respuesta.status}: ${respuesta.statusText}`
          );
        } catch {
          setError(
            `error ${respuesta.status}: endpoint no encontrado o servidor no disponible`
          );
        }
      }
    } catch (error) {
      console.error("error de conexion:", error); // debug
      setError("error de conexion: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  // funcion para manejar cambios en los campos del formulario
  const manejarCambioParametros = (evento) => {
    const { name, value } = evento.target;
    setParametrosConsulta({
      ...parametrosConsulta,
      [name]: value,
    });
    if (error) setError("");
  };

  // funcion para limpiar resultados
  const limpiarResultados = () => {
    setDatosReporte(null);
    setError("");
    setTipoReporte("");
  };

  // funcion para formatear los datos del reporte para mostrar
  const formatearReporte = (datos) => {
    if (!datos) return "";

    // caso especial cuando no hay datos pero hay un mensaje informativo
    if (datos.mensaje && datos.sanciones && Array.isArray(datos.sanciones)) {
      return (
        <div className="alert alert-info">
          <strong>{datos.mensaje}</strong>
        </div>
      );
    }

    if (Array.isArray(datos)) {
      if (datos.length === 0) {
        return (
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            no se encontraron resultados
          </div>
        );
      }
      return datos.map((item, index) => (
        <div key={index} className="border p-2 mb-2 rounded">
          {Object.entries(item).map(([key, value]) => (
            <div key={key}>
              <strong>{key}:</strong> {value}
            </div>
          ))}
        </div>
      ));
    } else {
      return (
        <div className="border p-2 rounded">
          {Object.entries(datos).map(([key, value]) => (
            <div key={key}>
              <strong>{key}:</strong> {value}
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="mb-0">
          <i className="fas fa-chart-bar me-2"></i>
          reportes del sistema
        </h4>
      </div>
      <div className="card-body">
        {/* reportes simples sin parametros */}
        <div className="mb-4">
          <h6>
            <i className="fas fa-list me-1"></i>
            reportes generales
          </h6>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <button
              className="btn btn-primary btn-sm"
              onClick={() =>
                cargarReporteSimple("top_salas", "salas mas reservadas")
              }
              disabled={cargando}
            >
              <i className="fas fa-trophy me-1"></i>
              salas mas reservadas
            </button>
            <button
              className="btn btn-success btn-sm"
              onClick={() =>
                cargarReporteSimple(
                  "participantes_activos",
                  "participantes mas activos"
                )
              }
              disabled={cargando}
            >
              <i className="fas fa-users me-1"></i>
              participantes mas activos
            </button>
            <button
              className="btn btn-info btn-sm"
              onClick={() =>
                cargarReporteSimple(
                  "ocupacion_edificios",
                  "ocupacion por edificios"
                )
              }
              disabled={cargando}
            >
              <i className="fas fa-building me-1"></i>
              ocupacion por edificios
            </button>
            <button
              className="btn btn-warning btn-sm"
              onClick={() =>
                cargarReporteSimple(
                  "participantes_sancionados",
                  "participantes sancionados"
                )
              }
              disabled={cargando}
            >
              <i className="fas fa-ban me-1"></i>
              participantes sancionados
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() =>
                cargarReporteSimple("turnos_populares", "turnos mas populares")
              }
              disabled={cargando}
            >
              <i className="fas fa-clock me-1"></i>
              turnos mas populares
            </button>
          </div>
        </div>

        {/* reportes que requieren parametros */}
        <div className="mb-4">
          <h6>
            <i className="fas fa-user-circle me-1"></i>
            reportes por participante
          </h6>
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label small">
                <i className="fas fa-id-card me-1"></i>
                ci del participante
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                name="ci"
                placeholder="ej: 12345678"
                value={parametrosConsulta.ci}
                onChange={manejarCambioParametros}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small">
                <i className="fas fa-calendar me-1"></i>
                fecha de referencia
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                name="fecha"
                value={parametrosConsulta.fecha}
                onChange={manejarCambioParametros}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small">consultas</label>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() =>
                    cargarReporteConParametros(
                      "participante_dia",
                      "reservas del dia"
                    )
                  }
                  disabled={cargando}
                >
                  <i className="fas fa-calendar-day me-1"></i>
                  reservas del dia
                </button>
                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={() =>
                    cargarReporteConParametros(
                      "participante_semana",
                      "reservas de la semana"
                    )
                  }
                  disabled={cargando}
                >
                  <i className="fas fa-calendar-week me-1"></i>
                  reservas semana
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* boton para limpiar y prueba de conectividad */}
        <div className="mb-3 d-flex gap-2">
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={limpiarResultados}
          >
            <i className="fas fa-trash me-1"></i>
            limpiar resultados
          </button>
          <button
            className="btn btn-outline-info btn-sm"
            onClick={() =>
              cargarReporteSimple("top_salas", "prueba de conectividad")
            }
            disabled={cargando}
          >
            <i className="fas fa-wifi me-1"></i>
            probar conexion
          </button>
        </div>

        {/* estado de carga */}
        {cargando && (
          <div className="alert alert-info">
            <div className="d-flex align-items-center">
              <div
                className="spinner-border spinner-border-sm me-2"
                role="status"
              ></div>
              cargando reporte...
            </div>
          </div>
        )}

        {/* mostrar errores */}
        {error && (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* mostrar resultados */}
        {datosReporte && (
          <div className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">
                <i className="fas fa-chart-line me-1"></i>
                resultado: {tipoReporte}
              </h6>
              <small className="text-muted">
                <i className="fas fa-list-ol me-1"></i>
                {Array.isArray(datosReporte)
                  ? `${datosReporte.length} registros`
                  : "1 registro"}
              </small>
            </div>
            <div
              className="bg-light p-3 rounded"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              {formatearReporte(datosReporte)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
