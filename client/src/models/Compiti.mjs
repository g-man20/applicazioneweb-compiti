/**          STUDENTE         */
    function Studente(id,nome, cognome, email) {
    this.id = id;
    this.nome = nome;
    this.cognome = cognome;
    this.email = email;
    this.compiti = [];

    this.getMediaPonderata = () => {
        let totalePunti = 0;
        let totalePesi = 0;
        for (const compito of this.compiti) {
            if (compito.valutazione !== null) {
                const peso = 1 / compito.gruppo.length;
                totalePunti += compito.valutazione * peso;
                totalePesi += peso;
            }
        }
         return totalePesi > 0
        ? Math.round((totalePunti / totalePesi) * 100) / 100
        : null;
};

    this.getNumCompiti = () => this.compiti.length;

    this.getStatoCompiti = () => {
        let aperti = 0, chiusi = 0;
        for (const compito of this.compiti) {
            if (compito.valutato === false) aperti++;
            else if (compito.valutato === true) chiusi++;
        }
        return { aperti, chiusi };
    };
}
/**        COMPITO         */
function Compito(id,domanda, gruppo, risposta = "",valutazione = 0,valutato = false) {
    this.id = id;
    this.domanda = domanda;
    this.gruppo = gruppo;
    this.risposta = risposta;
    this.valutazione = valutazione; 
    this.valutato = valutato;
    

    this.addRisposta = (risposta) => {
        this.risposta = risposta;
    }
}



/**        DOCENTE         */
function Docente(id,nome, cognome, email) {
    this.id = id;
    this.nome = nome;
    this.cognome = cognome;
    this.email = email;
    this.compiti = []; 

    this.addCompito = (compito) => {
        if (!this.verificaGruppo(compito.gruppo)) {
            throw new Error("Gruppo non valido: almeno una coppia ha già lavorato insieme in 2 o più compiti.");
        }
        this.compiti.push(compito);
    };

    
    this.verificaGruppo = (nuovoGruppo) => {
        const coppie = [];
        for (let i = 0; i < nuovoGruppo.length; i++) {
            for (let j = i + 1; j < nuovoGruppo.length; j++) {
                coppie.push([nuovoGruppo[i], nuovoGruppo[j]]);
            }
        }

        for (const [s1, s2] of coppie) {
            let count = 0;
            for (const compito of this.compiti) {
                const gruppo = compito.gruppo;
                if (gruppo.some(s => s.id === s1.id) && gruppo.some(s => s.id === s2.id)) {
                    count++;
                }
            }
            if (count >= 2) return false;
        }

        return nuovoGruppo.length >= 2 && nuovoGruppo.length <= 6;
    };
}

export { Studente, Docente, Compito };