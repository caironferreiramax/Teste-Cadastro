import express from "express";
import { createConnection } from "mysql2";
import cors from "cors";
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); 

const db = createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "sistema",
});

app.get("/produto", (req, res) => {
  const sql = "SELECT * FROM produto";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ erro: "Erro ao consultar o banco" });
    }
    res.json(results);
  });
});

app.post("/produto", (req, res) => {
  const { NOME, PRECO, ESTOQUE } = req.body;
  const sql = "INSERT INTO produto (NOME, PRECO, ESTOQUE) VALUES (?, ?, ?)";
  db.query(sql, [NOME, PRECO, ESTOQUE], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: "Erro ao salvar no banco" });
    }
    res.status(201).json({
      mensagem: "Produto criado com sucesso!",
      id: result.insertId,
    });
  });
});

app.delete("/produto/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM produto WHERE id = ?";  
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: "Produto não encontrado" });
    }

    res.json({ mensagem: "Produto excluído com sucesso!" });
  });
});

app.put("/produto/:id", (req, res) => {
  const { id } = req.params;
  const { NOME, PRECO, ESTOQUE } = req.body;
   
  const sql =
    "UPDATE produto SET NOME = ?, PRECO = ?, ESTOQUE = ? WHERE id = ?";

  db.query(sql, [NOME, PRECO, ESTOQUE, id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: "Produto não encontrado" });
    }

    res.json({ mensagem: "Produto atualizado com sucesso!" });
  });
});
 
app.get("/cliente", (req, res) => {
  db.query("SELECT * FROM cliente", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.get("/pedido", (req, res) => {
  const sql = ` 
        SELECT 
    p.ID, 
    p.ID_CLIENTE,    
    p.ID_PRODUTO,  
    c.NOME AS CLIENTE, 
    prod.nome AS PRODUTO, 
    p.VALOR_TOTAL, 
    p.STATUS 
FROM pedido p
JOIN cliente c ON p.ID_CLIENTE = c.ID
JOIN produto prod ON p.ID_PRODUTO = prod.id
    `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.post("/pedido", (req, res) => {
  const { id_cliente, id_produto, valor_total, status } = req.body;
  const sql =
    "INSERT INTO pedido (ID_CLIENTE, ID_PRODUTO, VALOR_TOTAL, STATUS) VALUES (?, ?, ?, ?)";

  db.query(
    sql,
    [id_cliente, id_produto, valor_total, status],
    (err, result) => {
      if (err) {
        console.error("Erro no MySQL:", err);
        return res.status(500).json(err);
      }
      res.status(201).json({ mensagem: "Pedido craido!", id: result.insertId });
    },
  );
});
app.put("/pedido/:id", (req, res) => {
  const { id } = req.params;
  const { id_cliente, id_produto, valor_total, status } = req.body;

  const sql =
    "UPDATE pedido SET ID_CLIENTE = ?, ID_PRODUTO = ?, VALOR_TOTAL = ?, STATUS = ? WHERE ID = ?";

  db.query(
    sql,
    [id_cliente, id_produto, valor_total, status, id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ mensagem: "Pedido atualizado com sucesso!" });
    },
  );
});

app.delete("/pedido/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM pedido WHERE ID = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ mensagem: "Pedido removido!" });
  });
});

app.post("/cliente", (req, res) => {
  const { nome, data_nasc, email, telefone, login, senha } = req.body;
  const sql =
    "INSERT INTO cliente (NOME, DATA_NASC, EMAIL, TELEFONE, LOGIN, SENHA) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [nome, data_nasc, email, telefone, login, senha], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ mensagem: "Cliente cadastrado!", id: result.insertId });
  });
});

app.get("/cliente", (req, res) => {
  db.query("SELECT * FROM cliente", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.put("/cliente/:id", (req, res) => {
  const { id } = req.params;
  const { nome, data_nasc, email, telefone, login, senha } = req.body;
 
  
  const sql =
    "UPDATE cliente SET NOME = ?, DATA_NASC = ?, EMAIL = ?, TELEFONE = ?, LOGIN = ?, SENHA = ? WHERE ID = ?";
  db.query(
    sql,
    [nome, data_nasc, email, telefone, login, senha, id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ mensagem: "Cliente atualizado!" });
    },
  );
});

app.delete("/cliente/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM cliente WHERE ID = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ mensagem: "Cliente removido!" });
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}/produto `);
});
