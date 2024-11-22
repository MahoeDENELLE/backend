const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const app = express();
const port = 5000;

const cors = require('cors');
app.use(cors());
app.use(express.json());


const connection = mysql.createConnection({
    host: '194.164.202.129', 
    user: 'icr_telecom',
    password: 'icr_telecom_2024',
    database: 'icrtelecombd'
});


app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    const query = 'SELECT * FROM users WHERE username = ?';
    connection.query(query, [username], (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération de l\'utilisateur', err);
        res.status(500).json({ success: false, message: 'Erreur du serveur' });
      } else if (results.length > 0) {
        const user = results[0];
        const passwordMatch = bcrypt.compareSync(password, user.password);
        if (passwordMatch) {
          res.json({ success: true, username: user.username, role: user.role });
        } else {
          res.json({ success: false, message: 'Nom d\'utilisateur ou mot de passe incorrect' });
        }
      } else {
        res.json({ success: false, message: 'Nom d\'utilisateur ou mot de passe incorrect' });
      }
    });
  });
  
  

  app.post('/create-account', (req, res) => {
    const { username, password, role } = req.body;
  
    const hashedPassword = bcrypt.hashSync(password, 10);
  
    const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
    connection.query(query, [username, hashedPassword, role], (err, result) => {
      if (err) {
        console.error('Erreur lors de la création du compte', err);
        res.status(500).json({ success: false, message: 'Erreur du serveur' });
      } else {
        res.json({ success: true, message: 'Compte créé avec succès' });
      }
    });
  });


  
  app.post('/create-type-tvc', (req, res) => {
    const { name, price } = req.body;
  
    const query = 'INSERT INTO TypesTVC (name, price) VALUES (?, ?)';
    connection.query(query, [name, price], (err, result) => {
      if (err) {
        console.error('Erreur lors de l\'insertion du type de TVC', err);
        res.status(500).json({ success: false, message: 'Erreur du serveur' });
      } else {
        res.json({ success: true, message: 'Type de TVC ajouté avec succès' });
      }
    });
  });

  app.get('/types-tvc', (req, res) => {
    const query = 'SELECT * FROM TypesTVC';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des types de TVC', err);
            res.status(500).json({ success: false, message: 'Erreur du serveur' });
        } else {
            res.json({ success: true, types: results });
        }
    });
});

app.put('/update-type-tvc/:id', (req, res) => {
  const { id } = req.params;
  const { price } = req.body;

  const query = 'UPDATE TypesTVC SET price = ? WHERE id = ?';
  connection.query(query, [price, id], (err, result) => {
      if (err) {
          console.error('Erreur lors de la mise à jour du type de TVC', err);
          res.status(500).json({ success: false, message: 'Erreur du serveur' });
      } else {
          res.json({ success: true, message: 'Type de TVC mis à jour avec succès' });
      }
  });
});

app.delete('/delete-type-tvc/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM TypesTVC WHERE id = ?';
  connection.query(query, [id], (err, result) => {
      if (err) {
          console.error('Erreur lors de la suppression du type de TVC', err);
          res.status(500).json({ success: false, message: 'Erreur du serveur' });
      } else {
          res.json({ success: true, message: 'Type de TVC supprimé avec succès' });
      }
  });
});

app.post('/create-tvc', (req, res) => {
  const { firstName, lastName, phone, address, postalCode, city, appointmentDate, tvcTypes, commentaire } = req.body;

  if (!tvcTypes || tvcTypes.length === 0) {
      return res.status(400).json({ success: false, message: 'Veuillez sélectionner au moins un type de TVC.' });
  }

  const appointmentDateToInsert = appointmentDate ? appointmentDate : null;

  const queryTVC = 'INSERT INTO TVCDossiers (firstName, lastName, phone, address, postalCode, city, appointmentDate, commentaire) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  connection.query(queryTVC, [firstName, lastName, phone, address, postalCode, city, appointmentDateToInsert, commentaire], (err, result) => {
      if (err) {
          console.error('Erreur lors de la création du dossier TVC', err);
          res.status(500).json({ success: false, message: 'Erreur du serveur' });
      } else {
          const tvcId = result.insertId;
          const queryTypes = 'INSERT INTO TVCDetails (tvcId, typeId, quantity) VALUES ?';
          const values = tvcTypes.map(type => [tvcId, type.id, type.quantity]);

          connection.query(queryTypes, [values], (err) => {
              if (err) {
                  console.error('Erreur lors de l\'ajout des types de TVC au dossier', err);
                  res.status(500).json({ success: false, message: 'Erreur du serveur' });
              } else {
                  res.json({ success: true, message: 'Dossier TVC créé avec succès' });
              }
          });
      }
  });
});



app.get('/types-tvc', (req, res) => {
  const query = 'SELECT * FROM TypesTVC';
  connection.query(query, (err, results) => {
      if (err) {
          console.error('Erreur lors de la récupération des types de TVC', err);
          res.status(500).json({ success: false, message: 'Erreur du serveur' });
      } else {
          res.json({ success: true, types: results });
      }
  });
});



app.get('/tvc-dossiers', (req, res) => {
  const query = 'SELECT * FROM TVCDossiers';
  connection.query(query, (err, results) => {
      if (err) {
          console.error('Erreur lors de la récupération des dossiers TVC', err);
          return res.status(500).json({ success: false, message: 'Erreur du serveur' });
      }
      res.json({ success: true, dossiers: results });
  });
});


app.get('/tvc-dossiers', (req, res) => {
  const query = 'SELECT * FROM TVCDossiers';
  connection.query(query, (err, results) => {
      if (err) {
          console.error('Erreur lors de la récupération des dossiers TVC', err);
          return res.status(500).json({ success: false, message: 'Erreur du serveur' });
      }
      res.json({ success: true, dossiers: results });
  });
});


app.get('/tvc-dossier/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM TVCDossiers WHERE id = ?';
  connection.query(query, [id], (err, results) => {
      if (err) {
          console.error('Erreur lors de la récupération du dossier TVC', err);
          return res.status(500).json({ success: false, message: 'Erreur du serveur' });
      }
      if (results.length === 0) {
          return res.status(404).json({ success: false, message: 'Dossier non trouvé' });
      }

      const dossier = results[0];

      
      const queryTypes = 'SELECT * FROM TVCDetails WHERE tvcId = ?';
      connection.query(queryTypes, [id], (err, typeResults) => {
          if (err) {
              console.error('Erreur lors de la récupération des types de TVC', err);
              return res.status(500).json({ success: false, message: 'Erreur du serveur' });
          }

          res.json({ success: true, dossier, types: typeResults });
      });
  });
});



app.put('/tvc-dossier/:id', (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phone, address, postalCode, city, appointmentDate, commentaire, types } = req.body;

  if (!Array.isArray(types)) {
      return res.status(400).json({ success: false, message: 'Les types fournis sont invalides.' });
  }

  const updateDossierQuery = 'UPDATE TVCDossiers SET firstName = ?, lastName = ?, phone = ?, address = ?, postalCode = ?, city = ?, appointmentDate = ?, commentaire = ? WHERE id = ?';
  connection.query(updateDossierQuery, [firstName, lastName, phone, address, postalCode, city, appointmentDate, commentaire, id], (err) => {
      if (err) {
          console.error('Erreur lors de la mise à jour du dossier TVC', err);
          return res.status(500).json({ success: false, message: 'Erreur du serveur' });
      }

      const deleteTypesQuery = 'DELETE FROM TVCDetails WHERE tvcId = ?';
      connection.query(deleteTypesQuery, [id], (err) => {
          if (err) {
              console.error('Erreur lors de la suppression des types de TVC', err);
              return res.status(500).json({ success: false, message: 'Erreur du serveur' });
          }

          if (types.length === 0) {
              return res.json({ success: true, message: 'Dossier TVC mis à jour avec succès (sans types).' });
          }

          const insertTypesQuery = 'INSERT INTO TVCDetails (tvcId, typeId, quantity) VALUES ?';
          const values = types.map(type => [id, type.typeId, type.quantity]);
          connection.query(insertTypesQuery, [values], (err) => {
              if (err) {
                  console.error('Erreur lors de l\'ajout des types de TVC au dossier', err);
                  return res.status(500).json({ success: false, message: 'Erreur du serveur', error: err.message });
              }
              res.json({ success: true, message: 'Dossier TVC mis à jour avec succès' });
          });
      });
  });
});

app.delete('/tvc-dossier/:id', (req, res) => {
  const { id } = req.params;

  const deleteDetailsQuery = 'DELETE FROM TVCDetails WHERE tvcId = ?';
  connection.query(deleteDetailsQuery, [id], (err) => {
      if (err) {
          console.error('Erreur lors de la suppression des détails du dossier', err);
          return res.status(500).json({ success: false, message: 'Erreur du serveur' });
      }

      const deleteDossierQuery = 'DELETE FROM TVCDossiers WHERE id = ?';
      connection.query(deleteDossierQuery, [id], (err) => {
          if (err) {
              console.error('Erreur lors de la suppression du dossier', err);
              return res.status(500).json({ success: false, message: 'Erreur du serveur' });
          }

          res.json({ success: true, message: 'Dossier supprimé avec succès' });
      });
  });
});


  
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
