import { Link } from 'react-router';
import { Container, Card, Button, Navbar } from 'react-bootstrap';

function Home() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar bg="primary" variant="dark">
        <Navbar.Brand className="fw-bold ps-4">
          Polito Esame2 Compiti
        </Navbar.Brand>
      </Navbar>
      <Container className="my-5 d-flex justify-content-center">
        <Card
          className="p-4 shadow-sm"
          style={{ maxWidth: 600, width: "100%", borderRadius: "10px" }}
        >
          <Card.Body className="text-center">
            <h1 className="mb-4">Benvenuto nell'applicazione di gestione compiti!</h1>
            <Link to="/login">
              <Button variant="primary" size="lg" style={{ color: "#fff" }}>
                Accedi
              </Button>
            </Link>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Home;