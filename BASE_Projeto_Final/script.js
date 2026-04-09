const $ = (selector) => document.querySelector(selector);

const formProduto = $("#formProduto");
const mensagemProduto = $("#mensagemProduto");
const btnCancelarProduto = $("#btnCancelar");
const tabelaProdutos = $("#tabelaProdutos");
const selectProduto = $("#selectProduto");
const selectCliente = $("#selectCliente");
const quantidade = $("#quantidade");
const valorTotal = $("#valorTotal");
const formPedido = $("#formPedido");
const mensagemPedido = $("#mensagemPedido");
const btnCancelarPedido = $("#btnCancelarPedido");
const tabelaPedidos = $("#tabelaPedidos");
const formCliente = $("#formCliente");
const mensagemCliente = $("#mensagemCliente");
const btnCancelarCliente = $("#btnCancelarCliente");
const tabelaClientes = $("#tabelaClientes");

let idEdicao = null;
let idPedidoEdicao = null;
let idClienteEdicao = null;
let listaPrecosProdutos = {};

function carregarProdutos() {
  if (!tabelaProdutos) return;

  fetch("http://localhost:3006/produto")
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
                          <button onclick="preencherFormulario(${p.ID}, '${p.NOME}', ${p.PRECO}, ${p.ESTOQUE})">Editar</button>
                          <button onclick="excluirProduto(${p.ID})" style="background-color: red; color: white; border: none; cursor: pointer;">Excluir</button>
                        </td>
                    </tr>`;
      });
    })
    .catch((err) => console.error("Erro ao carregar produtos:", err));
}

function preencherFormulario(id, nome, preco, estoque) {
  if (!formProduto) return;

  document.getElementById("nome").value = nome;
  document.getElementById("preco").value = preco.toFixed(2);
  document.getElementById("estoque").value = estoque;

  idEdicao = id;
  document.querySelector('button[type="submit"]').innerText = "Atualizar Produto";
  if (btnCancelarProduto) btnCancelarProduto.style.display = "inline-block";
}

function cancelarEdicao() {
  if (!formProduto) return;

  idEdicao = null;
  formProduto.reset();
  const btnSalvar = document.getElementById("btnSalvar");
  if (btnSalvar) btnSalvar.innerText = "Cadastrar Produto";
  if (btnCancelarProduto) btnCancelarProduto.style.display = "none";
  if (mensagemProduto) mensagemProduto.innerText = "";
}

function excluirProduto(id) {
  if (!confirm("Tem certeza que deseja excluir este produto?")) return;

  fetch(`http://localhost:3006/produto/${id}`, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .then((dados) => {
      alert(dados.mensagem);
      carregarProdutos();
    })
    .catch((err) => console.error("Erro ao excluir:", err));
}

async function carregarSelects() {
  if (selectProduto) {
    try {
      const resProdutos = await fetch("http://localhost:3006/produto");
      const produtos = await resProdutos.json();
      selectProduto.innerHTML = '<option value="">Selecione um Plano...</option>';

      produtos.forEach((p) => {
        listaPrecosProdutos[p.ID] = p.PRECO || p.VALOR_TOTAL || p.PRECO;
        selectProduto.innerHTML += `<option value="${p.ID}">${p.NOME || p.PRODUTO}</option>`;
      });

      console.log("Produtos carregados no select com sucesso!");
    } catch (error) {
      console.error("Erro ao popular o select de produto:", error);
    }
  }

  if (selectCliente) {
    try {
      const resposta = await fetch("http://localhost:3006/cliente");
      const clientes = await resposta.json();
      selectCliente.innerHTML = '<option value="">Selecione um cliente...</option>';
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
}

function atualizarTotal() {
  if (!selectProduto || !quantidade || !valorTotal) return;

  const idProd = selectProduto.value;
  const qtd = quantidade.value;

  if (idProd && listaPrecosProdutos[idProd] !== undefined) {
    const total = listaPrecosProdutos[idProd] * qtd;
    valorTotal.value = total.toFixed(2);
  }
}

function carregarPedidos() {
  if (!tabelaPedidos) return;

  fetch("http://localhost:3006/pedido")
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
                          <button onclick="preencherFormPedido(${p.ID}, ${p.ID_CLIENTE}, ${p.ID_PRODUTO}, ${p.VALOR_TOTAL}, '${p.STATUS}')">Editar</button>
                          <button onclick="excluirPedido(${p.ID})" style="background-color: red; color: white;">Excluir</button>
                        </td>
                    </tr>`;
      });
    })
    .catch((err) => console.error("Erro ao carregar pedidos:", err));
}

function preencherFormPedido(id, idCliente, idProduto, valor, status) {
  if (!formPedido) return;

  idPedidoEdicao = id;
  if (selectCliente) selectCliente.value = idCliente;
  if (selectProduto) selectProduto.value = idProduto;
  if (valorTotal) valorTotal.value = valor.toFixed(2);
  if (document.getElementById("selectStatus")) document.getElementById("selectStatus").value = status;

  const btnFinalizar = document.getElementById("btnFinalizar");
  if (btnFinalizar) btnFinalizar.innerText = "Atualizar Pedido";
  if (btnCancelarPedido) btnCancelarPedido.style.display = "inline";
}

function excluirPedido(id) {
  if (!confirm("Tem certeza que deseja excluir este pedido?")) return;

  fetch(`http://localhost:3006/pedido/${id}`, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .then((dados) => {
      alert(dados.mensagem);
      carregarPedidos();
    })
    .catch((err) => console.error("Erro ao excluir:", err));
}

function cancelarEdicaoPedido() {
  if (!formPedido) return;

  idPedidoEdicao = null;
  formPedido.reset();
  const btnFinalizar = document.getElementById("btnFinalizar");
  if (btnFinalizar) btnFinalizar.innerText = "Finalizar Pedido";
  if (btnCancelarPedido) btnCancelarPedido.style.display = "none";
  if (mensagemPedido) mensagemPedido.innerText = "";
}

function carregarClientes() {
  if (!tabelaClientes) return;

  fetch("http://localhost:3006/cliente")
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
                          <button onclick="preencherFormCliente(${c.ID}, '${c.NOME}', '${c.DATA_NASC.split("T")[0]}', '${c.EMAIL}', '${c.TELEFONE}', '${c.LOGIN}', '${c.SENHA}')">Editar</button>
                          <button onclick="excluirCliente(${c.ID})" style="background-color: red; color: white;">Excluir</button>
                        </td>
                    </tr>`;
      });
    })
    .catch((err) => console.error("Erro ao carregar clientes:", err));
}

function preencherFormCliente(id, nome, data, email, tel, usuario, senha) {
  if (!formCliente) return;

  idClienteEdicao = id;
  document.getElementById("cliNome").value = nome;
  document.getElementById("cliDataNasc").value = data;
  document.getElementById("cliEmail").value = email;
  document.getElementById("cliTelefone").value = tel;
  document.getElementById("cliUser").value = usuario;
  document.getElementById("cliPass").value = senha;
  document.getElementById("btnSalvarCliente").innerText = "Atualizar Cliente";
  if (btnCancelarCliente) btnCancelarCliente.style.display = "inline";
}

function cancelarEdicaoCliente() {
  if (!formCliente) return;

  idClienteEdicao = null;
  formCliente.reset();
  document.getElementById("btnSalvarCliente").innerText = "Cadastrar Cliente";
  if (btnCancelarCliente) btnCancelarCliente.style.display = "none";
  if (mensagemCliente) mensagemCliente.innerText = "";
}

window.addEventListener("DOMContentLoaded", () => {
  if (formProduto) {
    formProduto.addEventListener("submit", (event) => {
      event.preventDefault();

      const dados = {
        NOME: document.getElementById("nome").value,
        PRECO: parseFloat(document.getElementById("preco").value),
        ESTOQUE: parseInt(document.getElementById("estoque").value),
      };

      const btn = document.getElementById("btnSalvar");
      if (btn) {
        btn.disabled = true;
        btn.innerText = "Processando...";
      }

      const request = idEdicao
        ? fetch(`http://localhost:3006/produto/${idEdicao}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados),
          })
        : fetch("http://localhost:3006/produto", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados),
          });

      request
        .then((response) => response.json())
        .then((resultado) => {
          if (idEdicao) {
            alert("Atualizado!");
            cancelarEdicao();
          } else if (mensagemProduto) {
            mensagemProduto.innerText = "Produto cadastrado com sucesso! ID: " + resultado.id;
            formProduto.reset();
          }
          carregarProdutos();
        })
        .catch((error) => {
          console.error("Erro ao cadastrar:", error);
          if (mensagemProduto) mensagemProduto.innerText = "Erro ao conectar com o servidor.";
        })
        .finally(() => {
          if (btn) {
            btn.disabled = false;
            btn.innerText = "Cadastrar Produto";
          }
        });
    });

    if (btnCancelarProduto) btnCancelarProduto.addEventListener("click", cancelarEdicao);
  }

  if (selectProduto) {
    selectProduto.addEventListener("change", (event) => {
      const idSelecionado = event.target.value;
      if (!valorTotal) return;

      if (idSelecionado && listaPrecosProdutos[idSelecionado] !== undefined) {
        valorTotal.value = listaPrecosProdutos[idSelecionado];
      } else {
        valorTotal.value = "";
      }
      atualizarTotal();
    });
  }

  if (quantidade) quantidade.addEventListener("input", atualizarTotal);

  if (formPedido) {
    formPedido.addEventListener("submit", (event) => {
      event.preventDefault();

      const dados = {
        id_cliente: selectCliente ? selectCliente.value : "",
        id_produto: selectProduto ? selectProduto.value : "",
        valor_total: valorTotal ? valorTotal.value : "",
        status: document.getElementById("selectStatus")
          ? document.getElementById("selectStatus").value
          : "",
      };

      const metodo = idPedidoEdicao ? "PUT" : "POST";
      const url = idPedidoEdicao
        ? `http://localhost:3006/pedido/${idPedidoEdicao}`
        : "http://localhost:3006/pedido";

      fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      })
        .then((res) => res.json())
        .then(() => {
          if (mensagemPedido) {
            mensagemPedido.innerText = idPedidoEdicao ? "Pedido Atualizado!" : "Pedido Realizado!";
          }
          idPedidoEdicao = null;
          formPedido.reset();
          const btnFinalizar = document.getElementById("btnFinalizar");
          if (btnFinalizar) btnFinalizar.innerText = "Finalizar Pedido";
          if (btnCancelarPedido) btnCancelarPedido.style.display = "none";
          carregarPedidos();
        })
        .catch((err) => console.error("Erro ao enviar pedido:", err));
    });

    if (btnCancelarPedido) btnCancelarPedido.addEventListener("click", cancelarEdicaoPedido);
  }

  if (formCliente) {
    formCliente.addEventListener("submit", (event) => {
      event.preventDefault();

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
        ? `http://localhost:3006/cliente/${idClienteEdicao}`
        : "http://localhost:3006/cliente";

      fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      })
        .then((res) => res.json())
        .then(() => {
          if (mensagemCliente) {
            mensagemCliente.innerText = idClienteEdicao ? "Cliente atualizado!" : "Cliente cadastrado!";
          }
          idClienteEdicao = null;
          formCliente.reset();
          const btnSalvarCliente = document.getElementById("btnSalvarCliente");
          if (btnSalvarCliente) btnSalvarCliente.innerText = "Cadastrar Cliente";
          if (btnCancelarCliente) btnCancelarCliente.style.display = "none";
          carregarClientes();
          carregarSelects();
        })
        .catch((err) => console.error("Erro ao enviar cliente:", err));
    });

    if (btnCancelarCliente) btnCancelarCliente.addEventListener("click", cancelarEdicaoCliente);
  }

  carregarProdutos();
  carregarPedidos();
  carregarClientes();
  carregarSelects();
});
