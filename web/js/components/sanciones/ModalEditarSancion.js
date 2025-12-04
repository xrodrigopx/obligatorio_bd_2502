const ModalEditarSancion = ({ sancion, onCerrar, onActualizar }) => {
  const [datos, setDatos] = useState({
    fecha_inicio: sancion.fecha_inicio.split("T")[0],
    fecha_fin: sancion.fecha_fin.split("T")[0],
    motivo: sancion.motivo || "",
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

    if (!datos.fecha_inicio || !datos.fecha_fin) {
      setMensaje("Por favor complete las fechas");
      return;
    }

    if (new Date(datos.fecha_fin) <= new Date(datos.fecha_inicio)) {
      setMensaje("La fecha de fin debe ser posterior a la fecha de inicio");
      return;
    }

    setEnviando(true);
    setMensaje("Actualizando sanción...");

    try {
      const respuesta = await fetch(`/api/sanciones/${sancion.id_sancion}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      if (respuesta.ok) {
        setMensaje("Sanción actualizada exitosamente");
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
              Editar Sanción
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
                  <i className="fas fa-user me-1"></i>
                  Participante (no modificable)
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={`${sancion.nombre} ${sancion.apellido} (${sancion.ci_participante})`}
                  disabled
                />
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
