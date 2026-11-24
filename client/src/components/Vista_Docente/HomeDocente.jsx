import "bootstrap-icons/font/bootstrap-icons.css";
import { useEffect, useState } from "react";
import { Container, Row, Col, Button, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router";
import API from "../../API.mjs";
import NavHeader from '../NavHeader.jsx';

function HomeDocente(props) {
  const [statisticheStudenti, setStatisticheStudenti] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingStatistiche, setLoadingStatistiche] = useState(false);
  const [error, setError] = useState('');
  
  const [sortOrders, setSortOrders] = useState({
    alfabetico: "none",
    totaleCompiti: "none", 
    media: "none"
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const caricaDati = async () => {
      try {
        setLoading(true);
        const studentiData = props.studenti || [];
        await calcolaStatisticheTuttiStudenti(studentiData);
      } catch (err) {
        console.error("Errore caricamento:", err);
        setError("Errore nel recupero degli studenti");
      } finally {
        setLoading(false);
      }
    };

    caricaDati();
  }, [props.studenti]);

  const calcolaStatisticheTuttiStudenti = async (studentiList) => {
    setLoadingStatistiche(true);
    try {
      const mappaStatistiche = {};
      for (const studente of studentiList) {
        try {
          const tuttiCompiti = await API.getCompitiPerDocenteStudente(studente.id);
          const compitiValutati = tuttiCompiti.filter(c => c.valutato && c.valutazione > 0);
          const compitiAperti = tuttiCompiti.filter(c => !c.valutato);
          const media = calcolaMediaPonderata(compitiValutati);
          mappaStatistiche[studente.id] = {
            totaleCompiti: tuttiCompiti.length,
            compitiValutati: compitiValutati.length,
            compitiAperti: compitiAperti.length,
            media: media
          };
        } catch (err) {
          console.error(`Errore calcolo statistiche per studente ${studente.id}:`, err);
          mappaStatistiche[studente.id] = {
            totaleCompiti: 0,
            compitiValutati: 0,
            compitiAperti: 0,
            media: null
          };
        }
      }
      setStatisticheStudenti(mappaStatistiche);
    } catch (err) {
      console.error("Errore nel calcolo delle statistiche:", err);
    } finally {
      setLoadingStatistiche(false);
    }
  };

  // Funzioni di ordinamento
  const sortByAlfabetico = () => {
    setSortOrders(old => ({
      ...old,
      alfabetico: old.alfabetico === "asc" ? "desc" : "asc",
      totaleCompiti: "none",
      media: "none"
    }));
  };

  const sortByTotaleCompiti = () => {
    setSortOrders(old => ({
      ...old,
      totaleCompiti: old.totaleCompiti === "asc" ? "desc" : "asc",
      alfabetico: "none",
      media: "none"
    }));
  };

  const sortByMedia = () => {
    setSortOrders(old => ({
      ...old,
      media: old.media === "asc" ? "desc" : "asc",
      alfabetico: "none",
      totaleCompiti: "none"
    }));
  };

  const getStudentiOrdinati = () => {
    const studentiConStatistiche = (props.studenti || []).map(studente => ({
      ...studente,
      statistiche: statisticheStudenti[studente.id] || {
        totaleCompiti: 0,
        compitiValutati: 0,
        compitiAperti: 0,
        media: null
      }
    }));

    const sortedStudenti = [...studentiConStatistiche];

    if (sortOrders.alfabetico !== "none") {
      if (sortOrders.alfabetico === "asc") {
        sortedStudenti.sort((a, b) => {
          const nomeA = `${a.cognome} ${a.nome}`.toLowerCase();
          const nomeB = `${b.cognome} ${b.nome}`.toLowerCase();
          return nomeA.localeCompare(nomeB);
        });
      } else {
        sortedStudenti.sort((a, b) => {
          const nomeA = `${a.cognome} ${a.nome}`.toLowerCase();
          const nomeB = `${b.cognome} ${b.nome}`.toLowerCase();
          return nomeB.localeCompare(nomeA);
        });
      }
    } else if (sortOrders.totaleCompiti !== "none") {
      if (sortOrders.totaleCompiti === "asc") {
        sortedStudenti.sort((a, b) => a.statistiche.totaleCompiti - b.statistiche.totaleCompiti);
      } else {
        sortedStudenti.sort((a, b) => b.statistiche.totaleCompiti - a.statistiche.totaleCompiti);
      }
    } else if (sortOrders.media !== "none") {
      if (sortOrders.media === "asc") {
        sortedStudenti.sort((a, b) => {
          if (a.statistiche.media === null && b.statistiche.media === null) return 0;
          if (a.statistiche.media === null) return 1;
          if (b.statistiche.media === null) return -1;
          return a.statistiche.media - b.statistiche.media;
        });
      } else {
        sortedStudenti.sort((a, b) => {
          if (a.statistiche.media === null && b.statistiche.media === null) return 0;
          if (a.statistiche.media === null) return 1;
          if (b.statistiche.media === null) return -1;
          return b.statistiche.media - a.statistiche.media;
        });
      }
    }

    return sortedStudenti;
  };

  if (loading) return <div>Caricamento studenti...</div>;
  if (loadingStatistiche) return <div>Calcolo statistiche...</div>;
  if (error) return <div>{error}</div>;

  const studentiOrdinati = getStudentiOrdinati();

  return (
    <div>
      <NavHeader user={props.user} handleLogout={props.handleLogout} />
      <Container className="my-4">
        <Row>
          <Col>
            <h1>Elenco studenti</h1>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <p className="lead mb-0">Totale studenti: {props.studenti.length}</p>
              </div>
              <Button variant="primary" onClick={() => navigate("/docenti/compiti/nuovo")}>
                Nuovo Compito
              </Button>
            </div>
            <div className="card shadow-sm rounded">
              <div className="card-body p-0">
                <Table striped hover responsive className="mb-0">
                  <thead className="table-primary">
                    <tr>
                      <th>
                        Studente
                        <Button variant="link" className="text-black" onClick={sortByAlfabetico}>
                          <i className={
                            sortOrders.alfabetico === "asc"
                              ? "bi bi-sort-alpha-down"
                              : "bi bi-sort-alpha-up"
                          }></i>
                        </Button>
                      </th>
                      <th width="250">Email</th>
                      <th width="120" className="text-center">
                        <div>Totale</div>
                        <div>Compiti
                          <Button variant="link" className="text-black p-0 ms-1" onClick={sortByTotaleCompiti}>
                            <i className={
                              sortOrders.totaleCompiti === "asc"
                                ? "bi bi-sort-numeric-up"
                                : "bi bi-sort-numeric-down"
                            }></i>
                          </Button>
                        </div>
                      </th>
                      <th width="120" className="text-center">
                        <div>Compiti</div>
                        <div>Aperti</div>
                      </th>
                      <th width="120" className="text-center">
                        <div>Compiti</div>
                        <div>Valutati</div>
                      </th>
                      <th width="100" className="text-center">
                        <div>Media
                          <Button variant="link" className="text-black p-0 ms-1" onClick={sortByMedia}>
                            <i className={
                              sortOrders.media === "asc"
                                ? "bi bi-sort-numeric-up"
                                : "bi bi-sort-numeric-down"
                            }></i>
                          </Button>
                        </div>
                      </th>
                      <th width="120" className="text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentiOrdinati.map((studente) => (
                      <StudenteRow 
                        key={studente.id}
                        studente={studente}
                        statistiche={studente.statistiche}
                      />
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

function StudenteRow({ studente, statistiche }) {
  const { totaleCompiti, compitiValutati, compitiAperti, media } = statistiche;

  return (
    <tr>
      <td>
        <strong>{studente.nome} {studente.cognome}</strong>
      </td>
      <td>
        <small className="text-muted">{studente.email}</small>
      </td>
      <td className="text-center">
        <strong>{totaleCompiti}</strong>
      </td>
      <td className="text-center">
        <strong>{compitiAperti}</strong>
      </td>
      <td className="text-center">
        <strong>{compitiValutati}</strong>
      </td>
      <td className="text-center">
        {media !== null ? (
          <strong>{media}</strong>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
      <td className="text-center">
        <Link 
          to={`/docenti/studenti/${studente.id}/compiti`}
          state={{ media: media }}
          className="btn btn-outline-primary btn-sm"
        >
          Visualizza
        </Link>
      </td>
    </tr>
  );
}

function calcolaMediaPonderata(compitiValutati) {
  if (!compitiValutati || compitiValutati.length === 0) return null;
  let totalePunti = 0;
  let totalePesi = 0;
  for (const compito of compitiValutati) {
    if (compito.valutazione !== null && compito.valutazione > 0 && compito.gruppo && compito.gruppo.length > 0) {
      const peso = 1 / compito.gruppo.length;
      totalePunti += compito.valutazione * peso;
      totalePesi += peso;
    }
  }
  return totalePesi > 0 ? Math.round((totalePunti / totalePesi) * 100) / 100 : null;
}

export default HomeDocente;