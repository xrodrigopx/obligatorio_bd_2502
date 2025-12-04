const ModalEditarSala = ({ sala, onCerrar, onActualizar }) => {
  const [datos, setDatos] = useState({
    capacidad: sala.capacidad,
    tipo_sala: sala.tipo_sala,
  });
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");

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

    if (!datos.capacidad || !datos.tipo_sala) {
      setMensaje("Por favor complete todos los campos");
      return;
    }

    const cap = parseInt(datos.capacidad);
    if (isNaN(cap) || cap <= 0) {
      setMensaje("La capacidad debe ser un número positivo");
      return;
    }

    setEnviando(true);
    setMensaje("Actualizando sala...");

    try {
      const respuesta = await fetch(
        `/api/salas/${encodeURIComponent(
          sala.nombre_sala
        )}/${encodeURIComponent(sala.edificio)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datos),
        }
      );

      if (respuesta.ok) {
        setMensaje("Sala actualizada exitosamente");
        setTimeout(() => {
          onCerrar();
          onActualizar();
        }, 1500);
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
    <div
      className="modal show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-edit me-2"></i>
              Editar Sala
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCerrar}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={manejarEnvio}>
              <div className="mb-3">
                <label className="form-label">
                  <i className="fas fa-door-open me-1"></i>
                  Nombre (no modificable)
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={sala.nombre_sala}
                  disabled
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  <i className="fas fa-building me-1"></i>
                  Edificio (no modificable)
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={sala.edificio}
                  disabled
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  <i className="fas fa-users me-1"></i>
                  Capacidad
                </label>
                <input
                  type="number"
                  className="form-control"
                  name="capacidad"
                  min="1"
                  value={datos.capacidad}
                  onChange={manejarCambio}
                  disabled={enviando}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  <i className="fas fa-tag me-1"></i>
                  Tipo de Sala
                </label>
                <select
                  className="form-select"
                  name="tipo_sala"
                  value={datos.tipo_sala}
                  onChange={manejarCambio}
                  disabled={enviando}
                >
                  <option value="">Seleccione un tipo</option>
                  <option value="libre">Libre</option>
                  <option value="docente">Docente</option>
                  <option value="posgrado">Posgrado</option>
                </select>
              </div>

              {mensaje && (
                <div
                  className={`alert ${
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

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={enviando}
                >
                  {enviando ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1"></span>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-1"></i>
                      Actualizar
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onCerrar}
                  disabled={enviando}
                >
                  <i className="fas fa-times me-1"></i>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
