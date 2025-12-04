const ListaParticipantes = ({ participantes, recargar }) => {
  const [eliminando, setEliminando] = useState(null); // cual participante se esta borrando
  const [editando, setEditando] = useState(null); // cual participante estoy editando

  const eliminarParticipante = async (ci, nombreCompleto) => {
    if (!confirm(`seguro que queres eliminar a ${nombreCompleto}?`)) {
      return;
    }

    setEliminando(ci);

    try {
      const respuesta = await fetch(`/api/participants/${ci}`, {
        method: "DELETE",
      });

      if (respuesta.ok) {
        alert("participante eliminado correctamente");
        recargar(); // vuelvo a cargar la lista
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

  const iniciarEdicion = (participante) => {
    setEditando({ ...participante });
  };

  const cancelarEdicion = () => {
    setEditando(null);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>participantes ({participantes.length})</h4>
        <button className="btn btn-outline-primary btn-sm" onClick={recargar}>
          <i className="fas fa-sync-alt me-1"></i>
          recargar
        </button>
      </div>

      {participantes.length === 0 ? (
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          no hay participantes registrados
        </div>
      ) : (
        <div className="list-group">
          {participantes.map((participante, index) => (
            <div key={index} className="list-group-item">
              <div className="d-flex w-100 justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">
                    <i className="fas fa-user me-1 text-primary"></i>
                    {participante.nombre} {participante.apellido}
                  </h6>
                  <small className="text-muted">
                    <i className="fas fa-envelope me-1"></i>
                    {participante.email}
                  </small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <small className="me-3">
                    <i className="fas fa-id-card me-1"></i>
                    CI: {participante.ci}
                  </small>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => iniciarEdicion(participante)}
                  >
                    <i className="fas fa-edit me-1"></i>
                    Editar
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() =>
                      eliminarParticipante(
                        participante.ci,
                        `${participante.nombre} ${participante.apellido}`
                      )
                    }
                    disabled={eliminando === participante.ci}
                  >
                    {eliminando === participante.ci ? (
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

      {/* Modal para editar participante */}
      {editando && (
        <ModalEditarParticipante
          participante={editando}
          onCerrar={cancelarEdicion}
          onActualizar={recargar}
        />
      )}
    </div>
  );
};
