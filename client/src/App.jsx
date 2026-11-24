import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router";
import Home from "./components/HomeApp.jsx";
import Login from "./components/Login.jsx";
import API from "./API.mjs";
import CompitiStudente from "./components/Vista_Docente/CompitiStudente.jsx";
import FormNuovoCompito from "./components/Vista_Docente/FormNuovoCompito.jsx";
import HomeStudente from "./components/Vista_Studente/HomeStudente.jsx";
import HomeDocente from "./components/Vista_Docente/HomeDocente.jsx";
import CompitoPage from "./components/Vista_Studente/CompitoStudente.jsx";
import ValutazionePage from "./components/Vista_Docente/ValutazionePage.jsx";
import RispostarForm from "./components/Vista_Studente/RispostaForm.jsx";
import NotFound from "./components/NotFound.jsx";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [studenti, setStudenti] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
      } catch (err) {
        setLoggedIn(false);
        setUser(null);
        console.log('User not authenticated');
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (loggedIn && user?.Ruolo === 'docente') {
      API.getStudenti().then(setStudenti).catch(() => setStudenti([]));
    }
  }, [loggedIn, user]);

  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setLoggedIn(true);
      setUser(user);
      return user; 
    } catch (err) {
      throw err; 
    }
  };

  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser(null);
  };

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login onLogin={handleLogin} handleLogout={handleLogout}/>} />
      <Route path="/studenti/compiti/:id" element={loggedIn ? <CompitoPage user={user} handleLogout={handleLogout}/> : <Navigate replace to="/login" />} />
      <Route path="/studenti/compiti/:id/risposta" element={loggedIn ? <RispostarForm user={user} handleLogout={handleLogout}/> : <Navigate replace to="/login" />} />
      <Route path="/studenti/compiti" element={loggedIn && user?.Ruolo === 'studente' ? <HomeStudente user={user} handleLogout={handleLogout}/> : <Navigate replace to="/login" />} />
      <Route path="/docenti/studenti" element={loggedIn && user?.Ruolo === 'docente' ? <HomeDocente user={user} handleLogout={handleLogout} studenti={studenti}/> : <Navigate replace to="/login" />} />
      <Route path="/docenti/compiti/nuovo" element={loggedIn ? <FormNuovoCompito user={user} handleLogout={handleLogout} studenti={studenti} /> : <Navigate replace to="/login" />} />
      <Route path="/docenti/studenti/:id/compiti/:id" element={loggedIn && user?.Ruolo === 'docente' ? <ValutazionePage user={user} handleLogout={handleLogout} studenti={studenti} /> : <Navigate replace to="/login" />} />
      <Route path="/docenti/studenti/:id/compiti" element={loggedIn && user?.Ruolo === 'docente' ? <CompitiStudente user={user} handleLogout={handleLogout} studenti={studenti} /> : <Navigate replace to="/login" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;