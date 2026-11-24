import { useEffect, useState } from "react";
import { Link } from "react-router";
import API from "../../API.mjs";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import NavHeader from "../NavHeader.jsx";

function HomeStudente(props) {
  const [compitiAperti, setCompitiAperti] = useState([]);
  const [compitiValutati, setCompitiValutati] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCompiti = async () => {
      try {
        const aperti = await API.getCompitiApertiStudente();
        const valutati = await API.getCompitiValutatiStudente();
        
        setCompitiAperti(aperti);
        setCompitiValutati(valutati);
      } catch (err) {
        setError("Errore nel recupero dei compiti");
      } finally {
        setLoading(false);
      }
    };

    loadCompiti();
  }, []);

  if (loading) return <div>Caricamento compiti...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const tuttiCompiti = [...compitiAperti, ...compitiValutati];

  function calcolaMediaPonderata(compitiValutati) {
    let totalePunti = 0;
    let totalePesi = 0;
    for (const compito of compitiValutati) {
      if (compito.valutazione !== null && compito.gruppo && compito.gruppo.length > 0) {
        const peso = 1 / compito.gruppo.length;
        totalePunti += compito.valutazione * peso;
        totalePesi += peso;
      }
    }
    return totalePesi > 0 ? (Math.round((totalePunti / totalePesi) * 100) / 100) : null;
  }

  return (
    <div>
      <NavHeader user={props.user} handleLogout={props.handleLogout} />
      <Container className="my-4">
        <Row>
          <Col as="h2">I tuoi compiti</Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <p className="lead">
              Totale compiti: {tuttiCompiti.length} 
              <span className="ms-3">
                <Badge bg="warning">Aperti: {compitiAperti.length}</Badge>
                <Badge bg="success" className="ms-2">Valutati: {compitiValutati.length}</Badge>
              </span>
            </p>
          </Col>
        </Row>
        <Row>
          {tuttiCompiti.length === 0 ? (
            <Col>
              <div className="alert alert-info">
                Non hai ancora compiti assegnati.
              </div>
            </Col>
          ) : (
            tuttiCompiti.map(compito => (
              <Col key={compito.id} md={4} className="mb-3">
                <CompitoCard compito={compito} />
              </Col>
            ))
          )}
        </Row>

        {compitiValutati.length > 0 ? (
          <Row>
            <Col>
              <div className="alert alert-info mt-4">
                <strong>Media ponderata dei compiti valutati:</strong>{" "}
                {calcolaMediaPonderata(compitiValutati)}
              </div>
            </Col>
          </Row>
        ) : (
          <Row>
            <Col>
              <div className="alert alert-secondary mt-4">
                <strong>Media:</strong> non disponibile perché ancora nessun compito è stato valutato.
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}

function CompitoCard({ compito }) {
  const isValutato = compito.valutato || compito.Valutato;
  const hasRisposta = compito.risposta && compito.risposta.trim() !== "";

  return (
    <Card className={`h-100 ${isValutato ? 'border-success' : 'border-warning'}`}>
      <Card.Body className="d-flex flex-column">
        <Card.Title className="d-flex justify-content-between align-items-center">
          Compito #{compito.id}
          {isValutato ? (
            <Badge bg="success">Valutato</Badge>
          ) : (
            <Badge bg="warning">Da completare</Badge>
          )}
        </Card.Title>
        
        <Card.Text className="flex-grow-1">
          {compito.domanda}
        </Card.Text>

        {isValutato && compito.valutazione && (
          <div className="mb-2">
            <strong>Voto: {compito.valutazione}/30</strong>
          </div>
        )}

        {hasRisposta && (
          <div className="mb-2 text-muted">
            <small>✓ Risposta inviata</small>
          </div>
        )}

        <div className="mt-auto">
          <Link 
            to={`/studenti/compiti/${compito.id}`} 
            className="btn btn-primary btn-sm"
          >
            {isValutato ? 'Visualizza' : 'Rispondi'}
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
}

export default HomeStudente;