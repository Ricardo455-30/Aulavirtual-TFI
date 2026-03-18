import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

const eventos = [
  {
    title: "Parcial Base de Datos",
    date: "2026-03-05",
  },
  {
    title: "Entrega TP Redes",
    date: "2026-03-10",
  },
  {
    title: "Reunión Virtual",
    date: "2026-03-15",
  },
];

const CalendarioWidget = () => {
  return (
    <div className="card calendario">
      <h3>Calendario Académico</h3>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="es"
        events={eventos}
        height="auto"
      />
    </div>
  );
};

export default CalendarioWidget;