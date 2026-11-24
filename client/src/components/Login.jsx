import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg('');
    try {
      const user = await onLogin({ username, password });
      if (user.Ruolo === 'docente') {
        navigate('/docenti/studenti');
      } else if (user.Ruolo === 'studente') {
        navigate('/studenti/compiti');
      } else {
        setErrorMsg('Ruolo utente non riconosciuto');
      }
    } catch (err) {
      setErrorMsg('Credenziali non valide');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <Card className="p-4 shadow-sm" style={{ maxWidth: 350, width: "100%" }}>
        <Card.Body>
          <h2 className="mb-4 text-center">Login</h2>
          {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100">
              Accedi
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;