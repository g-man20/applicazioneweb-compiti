import { Row, Col, Form, Button, Alert } from "react-bootstrap";
import { useState, useEffect, useActionState } from "react"; 
import { useParams } from "react-router";
import { Compito } from '../../models/Compiti.mjs';
import API from "../../API.mjs";
import NavHeader from '../NavHeader.jsx';


function ValutazionePage(props) {
    const { id } = useParams();
    const [compito, setCompito] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const studenti = props.studenti || [];

    useEffect(() => {
        API.getCompitoById(id)
            .then(setCompito)
            .catch(() => setError("Errore nel recupero del compito"))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div>Caricamento compito...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!compito) return <div>Compito non trovato</div>;

    return (
        <div>
            <NavHeader user={props.user} handleLogout={props.handleLogout} />
            
            <div className="ms-3">
                <Row>
                    <Col md={6}>
                        <CompitoInfo compito={compito} studenti={studenti} />
                    </Col>
                    <Col md={6}>
                        {compito.risposta && compito.risposta.trim() !== "" ? (
                            <ValutazioneForm compito={compito} setCompito={setCompito} />
                        ) : (
                            <Alert variant="info">
                                Non è stata ancora inserita una risposta dagli studenti.<br />
                                Questo compito non può ancora essere valutato.
                            </Alert>
                        )}
                    </Col>
                </Row>
                {compito.risposta && compito.risposta.trim() !== "" && (
                    <Row className="mt-3">
                        <Col>
                            <CompitoRisposta risposta={compito.risposta} />
                        </Col>
                    </Row>
                )}
            </div>
        </div>
    );
}

function CompitoInfo({ compito, studenti }) {
    const gruppoDettagliato = compito.gruppo.map(studentId =>
        studenti.find(s => String(s.id) === String(studentId))
    );

    return (
        <div>
            <h3>Domanda #{compito.id}</h3>
            <p>{compito.domanda}</p>
            <div className="mt-3">
                <strong>Gruppo studenti:</strong>
                <ul>
                    {gruppoDettagliato.map((studente, index) =>
                        studente ? (
                            <li key={studente.id}>
                                {studente.nome} {studente.cognome} ({studente.email})
                            </li>
                        ) : (
                            <li key={index}>Studente ID: {compito.gruppo[index]}</li>
                        )
                    )}
                </ul>
            </div>
        </div>
    );
}

function ValutazioneForm({ compito, setCompito }) {

    const initialState = {
        voto: compito.valutazione || ""
    };


    const validateVoto = (value) => {
        const num = parseInt(value);
        if (isNaN(num)) {
            return "Il voto deve essere un numero";
        }
        if (num < 0 || num > 30) {
            return "Il voto deve essere compreso tra 0 e 30";
        }
        return null;
    };


    const handleSubmit = async (prevState, formData) => {
        const { voto } = Object.fromEntries(formData.entries());


        const validationError = validateVoto(voto);
        if (validationError) {
            return {
                voto,
                error: validationError
            };
        }

        try {
            await API.valutaCompito(compito.id, parseInt(voto));
            setCompito(oldCompito => {
                const nuovoCompito = new Compito(
                    oldCompito.id,
                    oldCompito.domanda,
                    oldCompito.gruppo,
                    oldCompito.risposta,
                    parseInt(voto), 
                    true 
                );
                return nuovoCompito;
            });
            
            return {
                voto,
                success: `Compito valutato con successo! Voto: ${voto}/30`
            };
            
        } catch (err) {
            return {
                voto,
                error: "Errore nel salvataggio della valutazione. Riprova."
            };
        }
    };


    const [state, formAction, isPending] = useActionState(handleSubmit, initialState);


    return (
        <div className="border p-3 rounded">
            <h5 className="mb-3">Valutazione</h5>
            

            {state?.error && <Alert variant="danger">{state.error}</Alert>}
            {state?.success && <Alert variant="success">{state.success}</Alert>}
            
            {compito.valutato ? (
                <div className="alert alert-success">
                    <strong> Compito valutato</strong>
                    <div>Voto assegnato: <strong>{compito.valutazione}/30</strong></div>
                </div>
            ) : (
                
                <Form action={formAction}>
                    <Form.Group className="mb-3">
                        <Form.Label>Voto (da 0 a 30):</Form.Label>
                        <Form.Control
                            name="voto" 
                            type="number"
                            min="0"
                            max="30"
                            defaultValue={state?.voto} 
                            placeholder="Inserisci il voto"
                            required
                            disabled={isPending}
                        />
                        <Form.Text className="text-muted">
                            Inserisci un voto compreso tra 0 e 30
                        </Form.Text>
                    </Form.Group>
                    
                    <Button 
                        variant="success" 
                        type="submit"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Salvando...
                            </>
                        ) : (
                            "Conferma Valutazione"
                        )}
                    </Button>
                </Form>
            )}
        </div>
    );
}

function CompitoRisposta({ risposta }) {
    return (
        <div className="border-top pt-3">
            <h5>Risposta dello studente:</h5>
            <p className="mt-2 p-3 bg-light rounded">{risposta}</p>
        </div>
    );
}

export default ValutazionePage;