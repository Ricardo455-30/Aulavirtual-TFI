import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiCalendar, FiLayers, FiAlertCircle, FiLoader, FiChevronDown } from "react-icons/fi";
import "./CicloFiltro.css";

const CicloFiltro = ({ selectedCiclo, onChange }) => {
  const [ciclos, setCiclos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarCiclos = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/api/ciclo_lectivo", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const ciclosData = response.data || [];
        setCiclos(ciclosData);

        // No auto-seleccionar el ciclo activo, dejar que el usuario elija
        // if (!selectedCiclo && ciclosData.length > 0) {
        //   const activo = ciclosData.find((c) => c.estado === "Activo");
        //   onChange(activo?.id_ciclo || ciclosData[0]?.id_ciclo);
        // }
      } catch (err) {
        setError("No se pudieron cargar los ciclos lectivos.");
        console.error("Error CicloFiltro:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarCiclos();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cicloSeleccionado = ciclos.find((c) => String(c.id_ciclo) === String(selectedCiclo));

  return (
    <div className="ciclo-filtro-compact">
      <div className="ciclo-filtro-label-compact">
        <FiCalendar size={16} />
        <span>Ciclo lectivo:</span>
      </div>

      <div className="ciclo-filtro-select-wrapper">
        <select
          className="ciclo-filtro-select-compact"
          value={selectedCiclo ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading || !!error}
        >
          <option value="">Seleccionar ciclo</option>
          {ciclos.map((ciclo) => (
            <option key={ciclo.id_ciclo} value={ciclo.id_ciclo}>
              {ciclo.anio} · {ciclo.estado || "Desconocido"}
            </option>
          ))}
        </select>
        <FiChevronDown className="ciclo-filtro-arrow" />

        {loading && (
          <div className="ciclo-filtro-loading-compact">
            <FiLoader />
          </div>
        )}

        {error && (
          <div className="ciclo-filtro-error-compact">
            <FiAlertCircle />
          </div>
        )}
      </div>

      {cicloSeleccionado && (
        <div className="ciclo-filtro-status-compact">
          <span className="ciclo-status-text">{cicloSeleccionado.anio} - {cicloSeleccionado.estado || "Estado desconocido"}</span>
        </div>
      )}
    </div>
  );
};

export default CicloFiltro;
