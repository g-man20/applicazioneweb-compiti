import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import API from "../../API.mjs";
import { Row, Col, Table } from "react-bootstrap";
import NavHeader from '../NavHeader.jsx';

function CompitiStudente(props) {
  const { id } = useParams(); 
  const [compiti, setCompiti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const media = location.state?.media;
  const studente = props.studenti?.find(s => String(s.id) === String(id));

  useEffect(() => {
    API.getCompitiPerDocenteStudente(id)
      .then(setCompiti)
      .catch(() => setError("Errore nel recupero dei compiti"))
      .finally(() => setLoading(false));
  }, [id]
);

  if (loading) return <div>Caricamento compiti...</div>;
  if (error) return <div>{error}</div>;

  // Dividi i compiti in aperti e valutati
  const compitiAperti = compiti.filter(c => !c.valutato);
  const compitiValutati = compiti.filter(c => c.valutato);

  return (
    <div>
      <NavHeader user={props.user} handleLogout={props.handleLogout} />
      
      <Row>
        <Col as="h2" className="ms-4">Compiti di {studente?.nome} {studente?.cognome}</Col>
      </Row>
      <Row>
        <Col lg={10} className="mx-auto">
          <h4>Compiti aperti</h4>
          <CompitiTable compiti={compitiAperti} emptyMsg="Nessun compito aperto." />
          <h4 className="mt-4">Compiti valutati</h4>
          <CompitiTable compiti={compitiValutati} emptyMsg="Nessun compito valutato." />
          {compitiValutati.length > 0 && (
            <div className="mt-3">
              <strong>Media ponderata dei compiti valutati: </strong>
              {media ?? "N/A"}
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
}

function CompitiTable({ compiti, emptyMsg }) {
  if (compiti.length === 0)
    return <div className="alert alert-info">{emptyMsg}</div>;
  return (
    <Table striped>
      <thead>
        <tr>
          <th>ID</th>
          <th>Domanda</th>
          <th>Stato</th>
          <th>Valutazione</th>
        </tr>
      </thead>
      <tbody>
        {compiti.map((compito) => (
          <CompitoRow key={compito.id} compito={compito} />
        ))}
      </tbody>
    </Table>
  );
}

function CompitoRow({ compito }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const handleRowClick = () => {
    navigate(`/docenti/studenti/${id}/compiti/${compito.id}`);
  };
  return (
    <tr className="align-middle" onClick={handleRowClick} style={{ cursor: 'pointer' }}>
      <td>{compito.id}</td>
      <td><strong>{compito.domanda}</strong></td>
      <td>
        {compito.valutato ? (
          <span className="text-success">
            <i className="bi bi-check-circle-fill me-1"></i>
            Valutato
          </span>
        ) : (
          <span className="text-warning">
            <i className="bi bi-clock-fill me-1"></i>
            Non ancora valutato
          </span>
        )}
      </td>
      <td>
        {compito.valutato ? (
          <span className="badge bg-primary">
            {compito.valutazione}
          </span>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
    </tr>
  );
}

export default CompitiStudente;