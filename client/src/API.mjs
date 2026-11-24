import { Compito, Docente, Studente } from "./models/Compiti.mjs";

const SERVER_URL = "http://localhost:3001";

// LOGIN
export const logIn = async (credentials) => {
  const response = await fetch(`${SERVER_URL}/api/sessions`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (response.ok) {
    return await response.json();
  }
  else {
    const errDetails = await response.text();
    throw errDetails;
  }
};

// LOGOUT
export const logOut = async () => {
  await fetch(`${SERVER_URL}/api/sessions/current`, {
    method: 'DELETE',
    credentials: 'include'
  });
};

// CHECK SESSION
export const getUserInfo = async () => {
  const response = await fetch(`${SERVER_URL}/api/sessions/current`, {
    credentials: 'include'
  });
  const user = await response.json();
  if (response.ok) {
    return user;
  } else {
    throw user;  // an object with the error coming from the server
  }
};

// CREA NUOVO COMPITO (docente)
export const creaCompito = async (domanda, idstudenti) => {
  const response = await fetch(`${SERVER_URL}/api/docenti/compiti`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domanda, idstudenti })
  });
  
  if (!response.ok) {
    let errMessage = await response.json();
    if (response.status === 422 && errMessage.validationErrors) {
      errMessage = Object.values(errMessage.validationErrors)[0];
    } else if (errMessage.error) {
      errMessage = errMessage.error;
    }
    throw errMessage;
  }
  return null;
};

// COMPITI APERTI PER STUDENTE
export const getCompitiApertiStudente = async () => {
  const response = await fetch(`${SERVER_URL}/api/studenti/compiti/aperti`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Errore nel recupero dei compiti aperti');
  const compiti = await response.json();
  return compiti.map(compito => new Compito(
    compito.Id,
    compito.Domanda,
    JSON.parse(compito.IdStudenti),
    compito.Risposta || "",  
    compito.Valutazione || 0,  // CORRETTO: usa Valutazione
    compito.Valutato || false
  ));
};

// COMPITI VALUTATI PER STUDENTE
export const getCompitiValutatiStudente = async () => {
  const response = await fetch(`${SERVER_URL}/api/studenti/compiti/valutati`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Errore nel recupero dei compiti valutati');
  const compiti = await response.json();
  return compiti.map(compito => new Compito(
    compito.Id,
    compito.Domanda,
    JSON.parse(compito.IdStudenti),
    compito.Risposta || "", 
    compito.Valutazione || 0,  // CORRETTO: usa Valutazione
    compito.Valutato || false
  ));
};

// INVIA RISPOSTA STUDENTE
export const inviaRispostaCompito = async (compitoId, risposta) => {
  const response = await fetch(`${SERVER_URL}/api/studenti/compiti/${compitoId}/risposta`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ risposta })
  });
  if(!response.ok) {
    let errMessage = await response.json();
    if(response.status === 422)
      errMessage = `${errMessage.errors[0].msg} for ${errMessage.errors[0].path}.`
    else
      errMessage = errMessage.error;
    throw errMessage;
  }
  else return null;
};

// VALUTA COMPITO (docente)
export const valutaCompito = async (compitoId, voto) => {
  const response = await fetch(`${SERVER_URL}/api/docenti/compiti/${compitoId}/valutazione`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voto })
  });
if(!response.ok) {
    let errMessage = await response.json();
    if(response.status === 422)
      errMessage = `${errMessage.errors[0].msg} for ${errMessage.errors[0].path}.`
    else
      errMessage = errMessage.error;
    throw errMessage;
  }
  else return null;
};

// OTTIENI UN COMPITO PER ID
export const getCompitoById = async (compitoId) => {
  const response = await fetch(`${SERVER_URL}/api/compiti/${compitoId}`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Compito non trovato');
  const compito = await response.json();
  return new Compito(
    compito.Id,                           
    compito.Domanda,                      
    JSON.parse(compito.IdStudenti || "[]"), 
    compito.Risposta || "",               
    compito.Valutazione || 0,             
    compito.Valutato || false            
  );
};

// OTTIENI TUTTI GLI STUDENTI (solo per docente)
export const getStudenti = async () => {
  const response = await fetch(`${SERVER_URL}/api/docenti/studenti`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Errore nel recupero degli studenti');
  return (await response.json()).map(student => new Studente(
    student.UserId,
    student.Nome,
    student.Cognome,
    student.Email
  ));
};

// OTTIENI COMPITI PER DOCENTE E STUDENTE
export const getCompitiPerDocenteStudente = async (studentId) => {
  const response = await fetch(`${SERVER_URL}/api/docenti/studenti/${studentId}/compiti`, {
    credentials: 'include',
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('Errore nel recupero dei compiti');
  const data = await response.json();
  return data.map(compito => new Compito(
    compito.Id,
    compito.Domanda,
    JSON.parse(compito.IdStudenti || "[]"),
    compito.Risposta || "",
    compito.Valutazione || 0,
    compito.Valutato || false
  ));
};

const API = {
  logIn,
  logOut,
  getUserInfo,
  creaCompito,
  getCompitiApertiStudente,
  getCompitiValutatiStudente,
  inviaRispostaCompito,
  valutaCompito,
  getCompitoById,
  getStudenti,
  getCompitiPerDocenteStudente,
};  
export default API;