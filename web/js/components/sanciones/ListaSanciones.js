const ListaSanciones = ({ sanciones, recargar }) => {
  const [eliminando, setEliminando] = useState(null);
  const [editando, setEditando] = useState(null);

  const eliminarSancion = async (id_sancion, participanteNombre) => {
    if (
      !confirm(
        `seguro que queres eliminar la sancion de ${participanteNombre}?`
      )
    ) {
      return;
    }

    setEliminando(id_sancion);

    try {
      const respuesta = await fetch(`/api/sanciones/${id_sancion}`, {
        method: "DELETE",
      });

      if (respuesta.ok) {
        alert("sancion eliminada correctamente");
        recargar();
      } else {
        const datos = await respuesta.json();
        alert("error: " + (datos.error || "error desconocido"));
      }
    } catch (error) {
      alert("error de conexion: " + error.message);
    } finally {
      setEliminando(null);
    }
  };

  const iniciarEdicion = (sancion) => {
    setEditando({ ...sancion });
  };

  const cancelarEdicion = () => {
    setEditando(null);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>
          <i className="fas fa-ban me-2"></i>
          Sanciones ({sanciones.length})
        </h4>
        <button className="btn btn-outline-primary btn-sm" onClick={recargar}>
          <i className="fas fa-sync-alt me-1"></i>
          Recargar
        </button>
      </div>

      {sanciones.length === 0 ? (
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          No hay sanciones registradas
        </div>
      ) : (
        <div className="list-group">
          {sanciones.map((sancion, index) => (
            <div
              key={index}
              className={`list-group-item ${
                esActiva(sancion.fecha_fin)
                  ? "border-warning"
                  : "border-secondary"
              }`}
            >
              <div className="d-flex w-100 justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <h6 className="mb-1">
                    <i className="fas fa-user me-1"></i>
                    {sancion.nombre} {sancion.apellido}
                    <span
                      className={`badge ms-2 ${
                        esActiva(sancion.fecha_fin)
                          ? "bg-warning text-dark"
                          : "bg-secondary"
                      }`}
                    >
                      {esActiva(sancion.fecha_fin) ? "ACTIVA" : "EXPIRADA"}
                    </span>
                  </h6>
                  <p className="mb-1 small">
                    <i className="fas fa-id-card me-1"></i>
                    <strong>CI:</strong> {sancion.ci_participante} |
                    <i className="fas fa-envelope ms-2 me-1"></i>
                    <strong>Email:</strong> {sancion.email}
                  </p>
                  <p className="mb-1 small">
                    <i className="fas fa-calendar-alt me-1"></i>
                    <strong>Período:</strong>{" "}
                    {formatearFecha(sancion.fecha_inicio)} -{" "}
                    {formatearFecha(sancion.fecha_fin)}
                  </p>
                  {sancion.motivo && (
                    <p className="mb-1 small text-muted">
                      <i className="fas fa-comment me-1"></i>
                      <strong>Motivo:</strong> {sancion.motivo}
                    </p>
                  )}
                </div>
                <div className="d-flex align-items-center gap-2 ms-3">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => iniciarEdicion(sancion)}
                  >
                    <i className="fas fa-edit me-1"></i>
                    Editar
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() =>
                      eliminarSancion(
                        sancion.id_sancion,
                        `${sancion.nombre} ${sancion.apellido}`
                      )
                    }
                    disabled={eliminando === sancion.id_sancion}
                  >
                    {eliminando === sancion.id_sancion ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                        ></span>
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-trash me-1"></i>
                        Eliminar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editando && (
        <ModalEditarSancion
          sancion={editando}
          onCerrar={cancelarEdicion}
          onActualizar={recargar}
        />
      )}
    </div>
  );
};
