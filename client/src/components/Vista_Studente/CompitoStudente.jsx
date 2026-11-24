import 'bootstrap/dist/css/bootstrap.min.css';
import NavHeader from '../NavHeader.jsx';
import CompitoDescription from './CompitoDescription.jsx';
import { useState, useEffect  } from 'react';
import { useParams } from 'react-router';
import { Container } from 'react-bootstrap';
import API from "../../API.mjs";

function CompitoPage(props) {
  const { id } = useParams(); 
  const [compito, setCompito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    API.getCompitoById(id)
      .then(setCompito)
      .catch(() => setError("Errore nel recupero del compito"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRispostaUpdated = (nuovaRisposta) => {
    setCompito(prevCompito => ({
      ...prevCompito,
      risposta: nuovaRisposta
    }));
  };

  if (loading) return (
    <div className="text-center p-4">
      <i className="bi bi-hourglass-split fs-3 text-primary"></i>
      <p className="mt-2">Caricamento compito...</p>
    </div>
  );

  if (error) return (
    <div className="alert alert-danger text-center m-4">
      <i className="bi bi-exclamation-triangle me-2"></i>
      {error}
    </div>
  );

  if (!compito) return (
    <div className="alert alert-warning text-center m-4">
      Compito non trovato
    </div>
  );

  return (
    <div>
      <NavHeader user={props.user} handleLogout={props.handleLogout} />
      <Container className="my-4">
        <CompitoDescription compito={compito} onRispostaUpdated={handleRispostaUpdated}/>
      </Container>
    </div>
  )
}

export default CompitoPage;
