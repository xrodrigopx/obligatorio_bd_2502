const ListaSalas = ({ salas, recargar }) => {
  const [eliminando, setEliminando] = useState(null);
  const [editando, setEditando] = useState(null);

  const eliminarSala = async (nombre_sala, edificio) => {
    if (
      !confirm(
        `¿Está seguro que desea eliminar la sala ${nombre_sala} del edificio ${edificio}?`
      )
    ) {
      return;
    }

    setEliminando(`${nombre_sala}-${edificio}`);

    try {
      const respuesta = await fetch(
        `/api/salas/${encodeURIComponent(nombre_sala)}/${encodeURIComponent(
          edificio
        )}`,
        {
          method: "DELETE",
        }
      );

      if (respuesta.ok) {
        alert("Sala eliminada exitosamente");
        recargar();
      } else {
        const datos = await respuesta.json();
        alert("Error: " + (datos.error || "Error desconocido"));
      }
    } catch (error) {
      alert("Error de conexión: " + error.message);
    } finally {
      setEliminando(null);
    }
  };

  const iniciarEdicion = (sala) => {
    setEditando({ ...sala });
  };

  const cancelarEdicion = () => {
    setEditando(null);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>
          <i className="fas fa-door-open me-2"></i>
          Salas ({salas.length})
        </h4>
        <button className="btn btn-outline-primary btn-sm" onClick={recargar}>
          <i className="fas fa-sync-alt me-1"></i>
          Recargar
        </button>
      </div>

      {salas.length === 0 ? (
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          no hay salas registradas
        </div>
      ) : (
        <div className="list-group">
          {salas.map((sala, index) => (
            <div key={index} className="list-group-item">
              <div className="d-flex w-100 justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">
                    <i className="fas fa-door-open me-2"></i>
                    {sala.nombre_sala} - {sala.edificio}
                  </h6>
                  <small className="text-muted">
                    <i className="fas fa-users me-1"></i>
                    capacidad: {sala.capacidad} personas |
                    <i className="fas fa-tag ms-2 me-1"></i>
                    tipo: {sala.tipo_sala}
                  </small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => iniciarEdicion(sala)}
                  >
                    <i className="fas fa-edit me-1"></i>
                    Editar
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() =>
                      eliminarSala(sala.nombre_sala, sala.edificio)
                    }
                    disabled={
                      eliminando === `${sala.nombre_sala}-${sala.edificio}`
                    }
                  >
                    {eliminando === `${sala.nombre_sala}-${sala.edificio}` ? (
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
        <ModalEditarSala
          sala={editando}
          onCerrar={cancelarEdicion}
          onActualizar={recargar}
        />
      )}
    </div>
  );
};
