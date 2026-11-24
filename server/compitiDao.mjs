import db from './db.mjs';

export default function assignmentDao() {

  this.checkStudentPair = (docenteId, studentId1, studentId2) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM compiti
        WHERE IdProfessore = ?
      `;
      db.all(sql, [docenteId], (err, rows) => {
        if (err) reject(err);
        else {
          let count = 0;
          for (const row of rows) {
            try {
              const studenti = JSON.parse(row.IdStudenti);
              if (studenti.includes(Number(studentId1)) && studenti.includes(Number(studentId2))) {
                count++;
              }
            } catch {
            }
          }
          resolve(count);
        }
      });
    });
  };

  // Funzione di utilità per ottenere nome e cognome dato l'id studente
  this.getStudentFullNameById = (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT Nome, Cognome FROM utenti WHERE UserId = ?';
      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else if (row) resolve(`${row.Nome} ${row.Cognome}`);
        else resolve(`studente ${id}`);
      });
    });
  };

  this.validateNewGroup = async (docenteId, idStudenti) => {
    const coppie = [];
    for (let i = 0; i < idStudenti.length; i++) {
      for (let j = i + 1; j < idStudenti.length; j++) {
        coppie.push([idStudenti[i], idStudenti[j]]);
      }
    }
    for (const [s1, s2] of coppie) {
      const count = await this.checkStudentPair(docenteId, s1, s2);
      if (count >= 2) {
        const nomeCognome1 = await this.getStudentFullNameById(s1);
        const nomeCognome2 = await this.getStudentFullNameById(s2);
        return {
          valid: false,
          error: `Gli studenti ${nomeCognome1} e ${nomeCognome2} hanno già lavorato insieme in ${count} compiti. Non possono formare un nuovo gruppo.`
        };
      }
    }

    return { valid: true };
  };

  this.createAssignment = async (domanda, docenteId, idStudenti) => {
    const validation = await this.validateNewGroup(docenteId, idStudenti);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    return new Promise((resolve, reject) => {
      const jsonStudenti = JSON.stringify(idStudenti);
      const sql = `
        INSERT INTO compiti (Domanda, IdProfessore, IdStudenti, Completato, Valutato)
        VALUES (?, ?, ?, 0, 0)
      `;
      db.run(sql, [domanda, docenteId, jsonStudenti], function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  };

  //Compito 
  this.getCompitoById = (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM compiti WHERE Id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else if (!row) resolve({ error: 'Compito non trovato.' });
        else resolve(row);
      });
    });
  };

  // Compiti di un docente per un determinato studente
  this.getAssignmentsByTeacherAndStudent = (teacherId, studentId) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM compiti
        WHERE IdProfessore = ?
      `;
      db.all(sql, [teacherId], (err, rows) => {
        if (err) reject(err);
        else {
          const filtered = rows.filter(row => {
            try {
              const studenti = JSON.parse(row.IdStudenti);
              return studenti.includes(Number(studentId)); // <-- forza a numero!
            } catch {
              return false;
            }
          });
          resolve(filtered);
        }
      });
    });
  };

  // Compiti aperti per studente
  this.getOpenAssignmentsForStudent = (studentId) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM compiti
        WHERE Valutato = 0
      `;
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else {
          const filtered = rows.filter(row => {
            try {
              const studenti = JSON.parse(row.IdStudenti);
              return studenti.includes(studentId);
            } catch {
              return false;
            }
          });
          resolve(filtered);
        }
      });
    });
  };

  // Compiti valutati per studente
  this.getValuetedAssignmentsForStudent = (studentId) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM compiti
        WHERE Valutato = 1
      `;
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else {
          const filtered = rows.filter(row => {
            try {
              const studenti = JSON.parse(row.IdStudenti);
              return studenti.includes(studentId);
            } catch {
              return false;
            }
          });
          resolve(filtered);
        }
      });
    });
  };

  // Aggiorna risposta studente
  this.updateAssignmentResponse = (assignmentId, risposta) => {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE compiti
        SET Risposta = ?, Completato = 1
        WHERE Id = ?
      `;
      db.run(sql, [risposta, assignmentId], function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  };

  // Valuta compito
  this.gradeAssignment = (assignmentId, voto) => {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE compiti
        SET Valutato = 1, Valutazione = ?
        WHERE Id = ?
      `;
      db.run(sql, [voto, assignmentId], function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  };
}