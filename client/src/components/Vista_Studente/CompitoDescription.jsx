import { Row, Col} from "react-bootstrap";
import RispostaForm from "./RispostaForm";


function CompitoDescription(props){

    return(<>
    <Row>
        <Col md={6}>
            <CompitoText compito={props.compito}></CompitoText>
        </Col>
    </Row>
    {props.compito.risposta && props.compito.risposta.trim() !== "" && (
        <Row className="mt-3">
            <Col>
                <CompitoRisposta risposta={props.compito.risposta} />
            </Col>
        </Row>
    )}
    <Row className="mt-4">
        <Col>
             <RispostaForm  compito={props.compito} onRispostaUpdated={props.onRispostaUpdated}/>
        </Col>
    </Row>
    </>)
}

function CompitoText(props){
    return (
        <>
            <Row>
                <Col>
                    <strong>Domanda # {props.compito.id}</strong>
                </Col>
            </Row>
            <Row>
                <Col>
                {props.compito.domanda}
                </Col>
                </Row>
        </>
    )
}

function CompitoRisposta(props){
    return(
        <Row>
            <Col>
                <div className="border-top pt-3">
                    <strong>Risposta:</strong>
                    <p className="mt-2 mb-0">{props.risposta}</p>
                </div>
            </Col>
        </Row>
    )
}
export default CompitoDescription;