import db from "./db.mjs";
import crypto from "crypto";

export default function UserDao() {

    this.getUserById = (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM utenti WHERE UserId=?';
      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else if (!row) resolve({ error: 'User not found.' });
        else resolve(row);
      });
    });
  };

    this.getUserByCredentials = (email, password) => {
      return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM utenti WHERE Email=?';
        db.get(sql, [email], (err, row) => {
          if (err) reject(err);
          else if (!row) resolve(false);
          else {
            crypto.scrypt(password, row.Salt, 32, function (err, hashedPassword) {
              if (err) reject(err);
              if (!crypto.timingSafeEqual(Buffer.from(row.Password, 'hex'), hashedPassword))
                resolve(false);
              else
                resolve({
                  UserId: row.UserId,
                  Email: row.Email,
                  Nome: row.Nome,
                  Cognome: row.Cognome,
                  Ruolo: row.Ruolo
                });
            });
          }
        });
      });
    };

    this.getAllStudents = () => {
      return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM utenti WHERE Ruolo="studente"';
        db.all(sql, [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    }
}
