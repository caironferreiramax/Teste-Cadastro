let idEdicao = null;
let idPedidoEdicao = null;
let idClienteEdicao = null;
let listaPrecosProdutos = {};

function carregarProdutos() {
  fetch("http://localhost:3000/produto")
    .then((res) => res.json())
    .then((produtos) => {
      const corpoTabela = document.querySelector("#tabelaProdutos tbody");
      corpoTabela.innerHTML = "";

      produtos.forEach((p) => {
        corpoTabela.innerHTML += `
                    <tr>
                        <td>${p.ID}</td>
                        <td>${p.NOME}</td>
                        <td>R$ ${p.PRECO}</td>
                        <td>${p.ESTOQUE}</td> 
                        <td>
                        <button onclick="preencherFormulario(${p.ID}, '${p.NOME}', ${p.PRECO}, ${p.ESTOQUE})">
                        Editar
                        </button>
                        <button onclick="excluirProduto(${p.ID})" style="background-color: red; color: white; border: none; cursor: pointer;">
                        Excluir
                        </button>
                        </td>
                    </tr>
                `;
      });
    });
}
carregarProdutos();

function preencherFormulario(id, nome, preco, estoque) {
  document.getElementById("nome").value = nome;
  document.getElementById("preco").value = preco.toFixed(2);
  document.getElementById("estoque").value = estoque;

  idEdicao = id;
  document.querySelector('button[type="submit"]').innerText =
    "Atualizar Produto";
  document.getElementById("btnCancelar").style.display = "inline-block";
}

const form = document.getElementById("formProduto");
const mensagem = document.getElementById("mensagemProduto");
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const dados = {
    NOME: document.getElementById("nome").value,
    PRECO: parseFloat(document.getElementById("preco").value),
    ESTOQUE: parseInt(document.getElementById("estoque").value),
  };

  const btn = document.getElementById("btnSalvar");
  btn.disabled = true;
  btn.innerText = "Processando...";

  if (idEdicao) {
    fetch(`http://localhost:3000/produto/${idEdicao}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Atualizado!");
        carregarProdutos();
        cancelarEdicao();
      });

    btn.disabled = false;
    btn.innerText = "Cadastrar Produto";
  } else {
    fetch("http://localhost:3000/produto", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    })
      .then((response) => response.json())
      .then((resultado) => {
        console.log("Sucesso:", resultado);
        mensagem.innerText =
          "Produto cadastrado com sucesso! ID: " + resultado.id;
        form.reset();
        carregarProdutos();
      })
      .catch((error) => {
        console.error("Erro ao cadastrar:", error);
        mensagem.innerText = "Erro ao conectar com o servidor.";
      });
    btn.disabled = false;
    btn.innerText = "Cadastrar Produto";
  }
});
function cancelarEdicao() {
  idEdicao = null;
  form.reset();
  document.getElementById("btnSalvar").innerText = "Cadastrar Produto";
  document.getElementById("btnCancelar").style.display = "none";
  mensagem.innerText = "";
}
document
  .getElementById("btnCancelar")
  .addEventListener("click", cancelarEdicao);

function excluirProduto(id) {
  if (confirm("Tem certeza que deseja excluir este produto?")) {
    fetch(`http://localhost:3000/produto/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((dados) => {
        alert(dados.mensagem);
        carregarProdutos();
      })
      .catch((err) => console.error("Erro ao excluir:", err));
  }
}

async function carregarSelects() {
  try {
    const resProdutos = await fetch("http://localhost:3000/produto");
    const produtos = await resProdutos.json();
    const selectP = document.getElementById("selectProduto");

    produtos.forEach((p) => {
      listaPrecosProdutos[p.ID] = p.PRECO || p.VALOR_TOTAL || p.PRECO;
      selectP.innerHTML += `<option value="${p.ID}">${p.NOME || p.PRODUTO}</option>`;
    });

    console.log("Produtos carregados no select com sucesso!");
  } catch (error) {
    console.error("Erro ao popular o select de produto:", error);
  }

  try {
    const resposta = await fetch("http://localhost:3000/cliente");
    const clientes = await resposta.json();
    const selectCliente = document.getElementById("selectCliente");
    selectCliente.innerHTML =
      '<option value="">Selecione um cliente...</option>';
    clientes.forEach((c) => {
      const option = document.createElement("option");
      option.value = c.ID;
      option.text = c.NOME;
      selectCliente.appendChild(option);
    });

    console.log("Clientes carregados no select com sucesso!");
  } catch (error) {
    console.error("Erro ao popular o select de clientes:", error);
  }
}
carregarSelects();

document.getElementById("selectProduto").addEventListener("change", (event) => {
  const idSelecionado = event.target.value;
  const campoValor = document.getElementById("valorTotal");

  if (idSelecionado && listaPrecosProdutos[idSelecionado]) {
    campoValor.value = listaPrecosProdutos[idSelecionado];
  } else {
    campoValor.value = "";
  }
});

function atualizarTotal() {
  const idProd = document.getElementById("selectProduto").value;
  const qtd = document.getElementById("quantidade").value;
  const campoTotal = document.getElementById("valorTotal");

  if (idProd && listaPrecosProdutos[idProd]) {
    const total = listaPrecosProdutos[idProd] * qtd;
    campoTotal.value = total.toFixed(2);
  }
}

document
  .getElementById("selectProduto")
  .addEventListener("change", atualizarTotal);
document.getElementById("quantidade").addEventListener("input", atualizarTotal);

function carregarPedidos() {
  fetch("http://localhost:3000/pedido")
    .then((res) => res.json())
    .then((pedidos) => {
      const corpoTabela = document.querySelector("#tabelaPedidos tbody");
      corpoTabela.innerHTML = "";

      pedidos.forEach((p) => {
        let corStatus = "black";
        if (p.STATUS === "Pago") corStatus = "green";
        if (p.STATUS === "Pendente") corStatus = "orange";
        if (p.STATUS === "Cancelado") corStatus = "red";

        corpoTabela.innerHTML += `
                    <tr>
                        <td>${p.ID}</td>
                        <td>${p.CLIENTE}</td>
                        <td>${p.PRODUTO}</td>
                        <td>R$ ${p.VALOR_TOTAL}</td>
                        <td style="color: ${corStatus}; font-weight: bold;">${p.STATUS}</td>
                        <td>
                        <button onclick="preencherFormPedido(${p.ID}, ${p.ID_CLIENTE}, ${p.ID_PRODUTO}, ${p.VALOR_TOTAL}, '${p.STATUS}')">
                        Editar
                         </button>
                            <button onclick="excluirPedido(${p.ID})" style="background-color: red; color: white;">
                                Excluir
                            </button>
                        </td>
                    </tr>
                `;
      });
    })
    .catch((err) => console.error("Erro ao carregar pedidos:", err));
}
carregarPedidos();

function preencherFormPedido(id, idCliente, idProduto, valor, status) {
  idPedidoEdicao = id;

  // Seleciona automaticamente nos selects
  document.getElementById("selectCliente").value = idCliente;
  document.getElementById("selectProduto").value = idProduto;
  document.getElementById("valorTotal").value = valor.toFixed(2);

  // Se você tiver um select de status, preencha-o também
  document.getElementById("selectStatus").value = status;

  document.getElementById("btnFinalizar").innerText = "Atualizar Pedido";
  document.getElementById("btnCancelarPedido").style.display = "inline"; // Se tiver o botão cancelar
}

const formPedido = document.getElementById("formPedido");
const mensagemPedido = document.getElementById("mensagemPedido");
formPedido.addEventListener("submit", (e) => {
  e.preventDefault();

  const dados = {
    id_cliente: document.getElementById("selectCliente").value,
    id_produto: document.getElementById("selectProduto").value,
    valor_total: document.getElementById("valorTotal").value,
    status: document.getElementById("selectStatus").value,
  };

  const metodo = idPedidoEdicao ? "PUT" : "POST";
  const url = idPedidoEdicao
    ? `http://localhost:3000/pedido/${idPedidoEdicao}`
    : "http://localhost:3000/pedido";

  fetch(url, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  })
    .then((res) => res.json())
    .then(() => {
      mensagemPedido.innerText = idPedidoEdicao
        ? "Pedido Atualizado!"
        : "Pedido Realizado!";
      idPedidoEdicao = null;
      document.getElementById("formPedido").reset();
      document.getElementById("btnFinalizar").innerText = "Finalizar Pedido";
      document.getElementById("btnCancelarPedido").style.display = "none";
      carregarPedidos();
    });
});

function excluirPedido(id) {
  if (confirm("Tem certeza que deseja excluir este pedido?")) {
    fetch(`http://localhost:3000/pedido/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((dados) => {
        alert(dados.mensagem);
        carregarPedidos();
      })
      .catch((err) => console.error("Erro ao excluir:", err));
  }
}

function cancelarEdicaoPedido() {
  idPedidoEdicao = null;
  formPedido.reset();
  document.getElementById("btnFinalizar").innerText = "Finalizar Pedido";
  document.getElementById("btnCancelarPedido").style.display = "none";
  mensagemPedido.innerText = "";
}
document
  .getElementById("btnCancelarPedido")
  .addEventListener("click", cancelarEdicaoPedido);

function carregarClientes() {
  fetch("http://localhost:3000/cliente")
    .then((res) => res.json())
    .then((clientes) => {
      const corpo = document.querySelector("#tabelaClientes tbody");
      corpo.innerHTML = "";
      clientes.forEach((c) => {
        const dataFormatada = new Date(c.DATA_NASC).toLocaleDateString("pt-BR");
        corpo.innerHTML += `
                    <tr>
                        <td>${c.ID}</td>
                        <td>${c.NOME}</td>
                        <td>${c.EMAIL}</td>
                        <td>${dataFormatada}</td>
                        <td>${c.TELEFONE}</td>
                        <td>${c.LOGIN}</td>
                        <td>${c.SENHA}</td>
                        <td>
                            <button onclick="preencherFormCliente(${c.ID}, '${c.NOME}', '${c.DATA_NASC.split("T")[0]}', '${c.EMAIL}', '${c.TELEFONE}','${c.LOGIN}','${c.SENHA}' )">Editar</button>
                              <button onclick="excluirCliente(${c.ID})" style="background-color: red; color: white;">
                                Excluir
                            </button>
                        </td>
                    </tr>`;
      });
    });
}
carregarClientes();

function excluirCliente(id) {
  if (confirm("Tem certeza que deseja excluir este cliente?")) {
    fetch(`http://localhost:3000/cliente/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((dados) => {
        alert(dados.mensagem);
        carregarClientes();
      })
      .catch((err) => console.error("Erro ao excluir:", err));
  }
}

function preencherFormCliente(id, nome, data, email, tel, usuario, senha) {
  idClienteEdicao = id;
  document.getElementById("cliNome").value = nome;
  document.getElementById("cliDataNasc").value = data;
  document.getElementById("cliEmail").value = email;
  document.getElementById("cliTelefone").value = tel;
  document.getElementById("cliUser").value = usuario;
  document.getElementById("cliPass").value = senha;
  document.getElementById("btnSalvarCliente").innerText = "Atualizar Cliente";
  document.getElementById("btnCancelarCliente").style.display = "inline";
}

const formCliente = document.getElementById("formCliente");
const mensagemCliente = document.getElementById("mensagemCliente");

formCliente.addEventListener("submit", (e) => {
  e.preventDefault();
  const dados = {
    nome: document.getElementById("cliNome").value,
    data_nasc: document.getElementById("cliDataNasc").value,
    email: document.getElementById("cliEmail").value,
    telefone: document.getElementById("cliTelefone").value,
    login: document.getElementById("cliUser").value,
    senha: document.getElementById("cliPass").value,
  };

  const metodo = idClienteEdicao ? "PUT" : "POST";
  const url = idClienteEdicao
    ? `http://localhost:3000/cliente/${idClienteEdicao}`
    : "http://localhost:3000/cliente";

  fetch(url, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  })
    .then((res) => res.json())
    .then(() => {
      mensagemCliente.innerText = idClienteEdicao
        ? "Cliente atualizado!"
        : "Cliente cadastrado!";
      idClienteEdicao = null;
      formCliente.reset();
      document.getElementById("btnSalvarCliente").innerText = "Cadastrar Cliente";
      document.getElementById("btnCancelarCliente").style.display = "none";
      carregarClientes();
      carregarSelects();
    });
});

function cancelarEdicaoCliente() {
  idClienteEdicao = null;
  formCliente.reset();
  document.getElementById("btnSalvarCliente").innerText = "Cadastrar Cliente";
  document.getElementById("btnCancelarCliente").style.display = "none";
  mensagemCliente.innerText = "";
}
document
  .getElementById("btnCancelarCliente")
  .addEventListener("click", cancelarEdicaoCliente);
