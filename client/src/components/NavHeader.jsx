import { Navbar, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from "react-router";

function NavHeader(props) {
  const navigate = useNavigate();

  const homePath = props.user?.Ruolo === 'docente' ? '/docenti/studenti' : '/studenti/compiti';

  return (
    <Navbar bg='primary' variant='dark' className='mb-3' data-bs-theme='dark'>
      <Container fluid className="justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <span className="text-white fw-bold">
            {( props.user?.Nome) || ""} {(props.user?.Cognome) || ""}
          </span>
        </div>

        <div>
          <Button variant="light" onClick={() => navigate(homePath)}>
            Home
          </Button>
        </div>

        <div>
          <Button variant="outline-light" onClick={props.handleLogout}>
            Logout
          </Button>
        </div>
      </Container>
    </Navbar>
  );
}

export default NavHeader;