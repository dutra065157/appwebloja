class Carrinho {
  constructor() {
    this.itens = JSON.parse(localStorage.getItem("carrinho")) || [];
    this.desconto = JSON.parse(localStorage.getItem("carrinho_desconto")) || 0;
    this.adminToken = localStorage.getItem("admin_token"); // Armazenar token
    this.valorFrete = 20.0; // DEFINA AQUI O VALOR DO FRETE (Mude este valor para alterar em todo o site)
    this.atualizarContador();
  }

  adicionarItem(produto) {
    const itemExistente = this.itens.find((item) => item._id === produto._id);

    if (itemExistente) {
      itemExistente.quantidade += 1;
    } else {
      // Garante que o ID seja consistente
      const novoItem = { ...produto, id: produto._id, quantidade: 1 };
      this.itens.push(novoItem);
    }

    this.salvar();
    this.atualizarContador();

    // Retorna o item adicionado para feedback visual
    return itemExistente || this.itens[this.itens.length - 1];
  }

  removerItem(id) {
    this.itens = this.itens.filter((item) => item.id !== id);
    this.salvar();
    this.atualizarContador();
  }

  atualizarQuantidade(id, quantidade) {
    const item = this.itens.find((item) => item.id === id);
    if (item) {
      item.quantidade = quantidade;
      if (item.quantidade <= 0) {
        this.removerItem(id);
      } else {
        this.salvar();
      }
    }
    this.atualizarContador();
  }

  atualizarContador() {
    const contadores = document.querySelectorAll("#cart-count");
    const totalItens = this.itens.reduce(
      (total, item) => total + item.quantidade,
      0,
    );

    contadores.forEach((contador) => {
      if (contador) {
        contador.textContent = totalItens;
        if (totalItens > 0) {
          contador.classList.add("animate-pulse");
        } else {
          contador.classList.remove("animate-pulse");
        }
      }
    });
  }

  getSubtotal() {
    return this.itens.reduce(
      (total, item) => total + parseFloat(item.preco) * item.quantidade,
      0,
    );
  }

  getTotalFinal() {
    // Agora usa o this.valorFrete definido no construtor, ignorando valores passados externamente
    const subtotal = this.getSubtotal();
    return subtotal + this.valorFrete - this.desconto;
  }

  aplicarDesconto(valor, tipo = "percentual") {
    if (tipo === "percentual") {
      this.desconto = this.getSubtotal() * (valor / 100);
    } else {
      this.desconto = valor;
    }
    this.salvar();
  }

  salvar() {
    localStorage.setItem("carrinho", JSON.stringify(this.itens));
    localStorage.setItem("carrinho_desconto", JSON.stringify(this.desconto));
  }

  limpar() {
    this.itens = [];
    this.desconto = 0;
    this.salvar();
    this.atualizarContador();
  }

  async enviarPedido(dadosCliente) {
    try {
      const pedidoData = {
        cliente: {
          nome: dadosCliente.nome,
          email: dadosCliente.email,
          telefone: dadosCliente.telefone,
          endereco: dadosCliente.endereco,
          observacoes: dadosCliente.observacoes,
        },
        itens: this.itens.map((item) => ({
          produtoId: item.id || item._id,
          nome: item.nome,
          quantidade: item.quantidade,
          precoUnitario: item.preco,
        })),
        total: this.getTotalFinal(),
      };

      const response = await fetch(`${API_BASE_URL}/api/pedidos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pedidoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao enviar o pedido.");
      }

      const result = await response.json();
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      console.error("Erro ao enviar pedido:", error);
      return {
        success: false,
        error: error.message || "Erro ao conectar com o servidor.",
      };
    }
  }

  // NOVO: Método para verificar autenticação do admin
  verificarAutenticacaoAdmin() {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      // Redirecionar para login se não estiver autenticado
      window.location.href = "login.html";
      return false;
    }

    // Verificar se o token é válido (pode adicionar validação JWT se necessário)
    this.adminToken = token;
    return true;
  }

  // NOVO: Método para fazer logout
  fazerLogoutAdmin() {
    // Limpar token e redirecionar
    localStorage.removeItem("admin_token");
    this.adminToken = null;

    // Opcional: Limpar carrinho também no logout do admin
    if (window.location.pathname.includes("admin.html")) {
      this.limpar();
    }

    // Redirecionar para home
    window.location.href = "index.html";
  }

  // NOVO: Método para ações que requerem autenticação
  async acaoAutenticada(acao, dados) {
    if (!this.verificarAutenticacaoAdmin()) {
      return { success: false, error: "Não autenticado" };
    }

    try {
      const response = await fetch(`${API_BASE_URL}${acao}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.adminToken}`,
        },
        body: JSON.stringify(dados),
      });

      if (response.status === 401) {
        // Token expirado ou inválido
        localStorage.removeItem("admin_token");
        window.location.href = "login.html";
        return { success: false, error: "Sessão expirada" };
      }

      if (!response.ok) {
        throw new Error("Falha na requisição");
      }

      return await response.json();
    } catch (error) {
      console.error("Erro na ação autenticada:", error);
      return { success: false, error: error.message };
    }
  }
}

// NOVO: Sistema de detecção de navegação (tab/window close)
document.addEventListener("DOMContentLoaded", function () {
  // Detectar quando o usuário está saindo da página
  window.addEventListener("beforeunload", function (e) {
    // Não fazer nada especial aqui para não interferir na navegação normal
  });

  // Detectar quando a página fica visível/invisível
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      // Página voltou a ser visível
      // Verificar se ainda está autenticado
      const token = localStorage.getItem("admin_token");
      if (!token && window.location.pathname.includes("admin.html")) {
        // Se estiver na página admin sem token, redirecionar
        window.location.href = "login.html";
      }
    }
  });

  // Sistema de timeout de sessão (opcional)
  let idleTimer;
  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(
      () => {
        // Verificar se está na página admin
        if (window.location.pathname.includes("admin.html")) {
          const token = localStorage.getItem("admin_token");
          if (token) {
            // Logout automático após inatividade (30 minutos)
            localStorage.removeItem("admin_token");
            alert("Sessão expirada por inatividade");
            window.location.href = "login.html";
          }
        }
      },
      30 * 60 * 1000,
    ); // 30 minutos
  }

  // Iniciar timer de inatividade
  resetIdleTimer();

  // Resetar timer em eventos de interação
  ["click", "mousemove", "keypress", "scroll"].forEach((event) => {
    document.addEventListener(event, resetIdleTimer, { passive: true });
  });
});

// Função global para logout
function fazerLogout() {
  const carrinho = new Carrinho();
  carrinho.fazerLogoutAdmin();
}

// Inicializar carrinho globalmente
window.carrinhoGlobal = new Carrinho();
