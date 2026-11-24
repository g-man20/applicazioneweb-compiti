import {Form, Button, Alert} from 'react-bootstrap';
import { useActionState, useState } from 'react';
import API from '../../API.mjs';

function RispostaForm(props){
    const initialState = {
        text: props.compito.risposta || ""
    };

    const handleSubmit = async (prevState, formData) => {
        const risposta = Object.fromEntries(formData.entries());
        
        if(risposta.text.trim() === ""){
            risposta.error = "La risposta non può essere vuota";
            return risposta;
        }

        try {
            await API.inviaRispostaCompito(props.compito.id, risposta.text);
            setMode("view");

            if (props.onRispostaUpdated) {
                props.onRispostaUpdated(risposta.text);
            }
            
            return {
                text: risposta.text,
                success: "Risposta salvata con successo!"
            };
            
        } catch (err) {
            risposta.error = err
            return {
                text: risposta.text,
            };
        }
    };

    const [risposta, formAction, isPending] = useActionState(handleSubmit, initialState);
    const [mode, setMode] = useState("view");
    const hasExistingAnswer = props.compito && props.compito.risposta && props.compito.risposta.trim() !== "";
    
    const isValutato = props.compito && (
        props.compito.valutato === 1 || props.compito.valutazione > 0
    );
    
    return (
        <>
        {risposta?.error && <Alert variant='danger'>{risposta.error}</Alert>}
        {risposta?.success && <Alert variant='success'>{risposta.success}</Alert>}
        
        {isValutato ? (
            <div className="border p-3 rounded bg-light">
                <h5 className="text-success mb-3">
                    Compito valutato
                </h5>
                
                {hasExistingAnswer && (
                    <div className="mb-3">
                        <strong>La tua risposta:</strong>
                        <p className="mt-2 p-3 bg-white rounded border">
                            {props.compito.risposta}
                        </p>
                    </div>
                )}
                
                <div className="alert alert-success mb-0">
                    <strong>Valutazione: {props.compito.valutazione || props.compito.Valutazione}/30</strong>
                </div>
                
                <small className="text-muted">
                    Il compito è stato valutato e la risposta non può più essere modificata.
                </small>
            </div>
        ) : (
            <>
                {mode === "view" && !hasExistingAnswer && (
                    <Button 
                        variant="primary" 
                        className="mt-3" 
                        onClick={() => setMode("add")}
                        disabled={isPending}
                    >
                        Aggiungi Risposta
                    </Button>
                )}
                
                {mode === "view" && hasExistingAnswer && (
                    <Button 
                        variant="warning" 
                        className="mt-3" 
                        onClick={() => setMode("edit")}
                        disabled={isPending}
                    >
                        Modifica Risposta
                    </Button>
                )}
                
                {(mode === "add" || mode === "edit") && (
                    <Form className='mb-3' action={formAction}>
                        <Form.Group>
                            <Form.Label>Risposta</Form.Label>
                            <Form.Control 
                                name="text" 
                                as="textarea" 
                                required={true} 
                                minLength={2}
                                rows={6}
                                defaultValue={mode === "edit" ? props.compito.risposta : (risposta.text || "")}
                                placeholder="Scrivi qui la tua risposta..."
                                disabled={isPending}
                            />
                        </Form.Group>
                        <div className='mb-3'>
                            <Button 
                                variant='primary' 
                                type='submit'
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Invio in corso...
                                    </>
                                ) : (
                                    mode === "edit" ? "Aggiorna Risposta" : "Invia Risposta"
                                )}
                            </Button>
                            <Button 
                                variant='danger' 
                                type='button' 
                                onClick={() => setMode("view")} 
                                className="ms-2"
                                disabled={isPending}
                            >
                                Torna indietro
                            </Button>
                        </div>
                    </Form>
                )}
            </>
        )}
        </>
    );
}

export default RispostaForm;