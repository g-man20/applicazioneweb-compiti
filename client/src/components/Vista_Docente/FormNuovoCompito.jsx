import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import API from "../../API.mjs";
import { Form, Button, Alert } from "react-bootstrap";
import NavHeader from '../NavHeader.jsx';

function FormNuovoCompito(props) {
  const [selected, setSelected] = useState([]);
  const [domanda, setDomanda] = useState("");
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const studenti = props.studenti || [];

  const handleCheck = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(sid => sid !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    if (selected.length < 2 || selected.length > 6) {
      setError("Seleziona da 2 a 6 studenti.");
      setIsSubmitting(false);
      return;
    }
    
    if (!domanda.trim()) {
      setError("Inserisci una domanda.");
      setIsSubmitting(false);
      return;
    }
    
    try {
      await API.creaCompito(domanda, selected);
      setSuccess("Compito creato con successo!");
      setTimeout(() => navigate("/docenti/studenti"), 1000);
    } catch (err) {
      console.error('Errore creazione compito:', err);
      setError(typeof err === 'string' ? err : "Errore nella creazione del compito.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <NavHeader user={props.user} handleLogout={props.handleLogout} />
      
      <Form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: "2rem auto" }}>
        <h2>Crea nuovo compito</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form.Group>
          <Form.Label>Domanda</Form.Label>
          <Form.Control
            as="textarea"
            value={domanda}
            onChange={e => setDomanda(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mt-3">
          <Form.Label>Seleziona studenti (2-6):</Form.Label>
          <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #ccc", padding: 10 }}>
            {studenti.map(studente => (
              <Form.Check
                key={studente.id}
                type="checkbox"
                label={`${studente.nome} ${studente.cognome} (${studente.email})`}
                checked={selected.includes(studente.id)}
                onChange={() => handleCheck(studente.id)}
              />
            ))}
          </div>
        </Form.Group>
        <Button className="mt-3" type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Creando..." : "Crea Compito"}
        </Button>
      </Form>
    </div>
  );
}

export default FormNuovoCompito;