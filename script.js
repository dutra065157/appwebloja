// Classe Carrinho (mantida igual ao index.html)
class Carrinho {
  constructor() {
    this.itens = JSON.parse(localStorage.getItem("carrinho")) || [];
    this.atualizarContador();
  }

  adicionarItem(produto) {
    const itemExistente = this.itens.find((item) => item.id === produto.id);

    if (itemExistente) {
      itemExistente.quantidade += 1;
    } else {
      this.itens.push({
        ...produto,
        quantidade: 1,
      });
    }

    this.salvar();
    this.atualizarContador();
    this.mostrarFeedback(produto);
  }

  mostrarFeedback(produto) {
    const feedbackAnterior = document.querySelector(".cart-feedback");
    if (feedbackAnterior) {
      feedbackAnterior.remove();
    }

    const feedback = document.createElement("div");
    feedback.className =
      "cart-feedback fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg transform translate-x-full transition-transform duration-300 bg-gradient-to-r from-green-500 to-emerald-600 text-white";
    feedback.innerHTML = `
                    <div class="flex items-center">
                        <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                            <i data-feather="check" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <p class="font-semibold">Adicionado ao carrinho!</p>
                            <p class="text-sm opacity-90">${produto.nome}</p>
                        </div>
                    </div>
                `;

    document.body.appendChild(feedback);
    feather.replace();

    setTimeout(() => feedback.classList.remove("translate-x-full"), 100);

    setTimeout(() => {
      feedback.classList.add("translate-x-full");
      setTimeout(() => feedback.remove(), 300);
    }, 3000);
  }

  atualizarContador() {
    const contadores = document.querySelectorAll("#cart-count");
    const totalItens = this.itens.reduce(
      (total, item) => total + item.quantidade,
      0,
    );

    contadores.forEach((contador) => {
      contador.textContent = totalItens;
      if (totalItens > 0) {
        contador.classList.add("animate-pulse");
      } else {
        contador.classList.remove("animate-pulse");
      }
    });
  }

  salvar() {
    localStorage.setItem("carrinho", JSON.stringify(this.itens));
  }
}

// Inicializar sistema
const carrinho = new Carrinho();
let produtos = [];

// Inicialização
document.addEventListener("DOMContentLoaded", function () {
  inicializar();
});

function inicializar() {
  console.log(
    "🔌 Conectando à API em:",
    API_BASE_URL || "Mesmo domínio (Produção)",
  );
  carregarProdutos();
  inicializarMobileMenu();
  inicializarFiltros();
  feather.replace();
}

function inicializarMobileMenu() {
  const menuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
      const icon = menuButton.querySelector("i");
      if (icon) {
        icon.setAttribute(
          "data-feather",
          mobileMenu.classList.contains("hidden") ? "menu" : "x",
        );
        feather.replace();
      }
    });

    document.addEventListener("click", (e) => {
      if (!menuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.add("hidden");
        const icon = menuButton.querySelector("i");
        if (icon) {
          icon.setAttribute("data-feather", "menu");
          feather.replace();
        }
      }
    });
  }
}

function inicializarFiltros() {
  // Filtros
  document
    .getElementById("search-input")
    .addEventListener("input", filtrarProdutos);
  document
    .getElementById("category-filter")
    .addEventListener("change", filtrarProdutos);

  // Botões de categoria rápida
  document.querySelectorAll(".category-filter-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const categoria = this.getAttribute("data-category");
      document.getElementById("category-filter").value = categoria;
      filtrarProdutos();

      document.querySelectorAll(".category-filter-btn").forEach((b) => {
        b.classList.remove("ring-2", "ring-pink-300", "ring-offset-2");
      });
      this.classList.add("ring-2", "ring-pink-300", "ring-offset-2");
    });
  });
}

// NOVO: Função para transformar URLs em links clicáveis na descrição
function formatarDescricaoComLinks(texto) {
  if (!texto) {
    return "Produto especial da Graça Presentes";
  }
  // Regex para encontrar URLs
  const urlRegex = /(https?:\/\/[^\s"'<>`]+)/g;
  return texto.replace(
    urlRegex,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-pink-500 hover:underline">$1</a>',
  );
}

// Carregar produtos da API
async function carregarProdutos() {
  const loadingState = document.getElementById("loading-state");
  const errorState = document.getElementById("error-state");
  const productsGrid = document.getElementById("products-grid");
  const emptyState = document.getElementById("empty-state");

  // Mostrar loading
  loadingState.classList.remove("hidden");
  errorState.classList.add("hidden");
  productsGrid.classList.add("hidden");
  emptyState.classList.add("hidden");

  try {
    // Usar a mesma URL da API que o index.html usa
    const url = API_BASE_URL ? `${API_BASE_URL}/api/produtos` : "/api/produtos";
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.statusText}`);
    }
    produtos = await response.json();

    // Esconder loading
    loadingState.classList.add("hidden");

    if (produtos.length === 0) {
      emptyState.classList.remove("hidden");
    } else {
      productsGrid.classList.remove("hidden");
      renderizarProdutos(produtos);
    }
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);

    loadingState.classList.add("hidden");
    errorState.classList.remove("hidden");
    document.getElementById("error-message").textContent =
      "Não foi possível carregar os produtos. Verifique sua conexão ou tente novamente mais tarde.";
  }
}

function renderizarProdutos(produtosParaRenderizar) {
  const container = document.getElementById("products-grid");

  container.innerHTML = produtosParaRenderizar
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .map((produto, index) => {
      const temImagem = !!produto.imagem_url;
      // Ajuste: Construir a URL completa da imagem usando a API_BASE_URL
      let imagemSrc = "";
      if (temImagem) {
        // Se a imagem já vier com http (do backend), usa ela direto. Senão, concatena.
        imagemSrc = produto.imagem_url.startsWith("http")
          ? produto.imagem_url
          : API_BASE_URL
            ? `${API_BASE_URL}${produto.imagem_url}`
            : produto.imagem_url;
      }

      // Determinar badges (MESMA LÓGICA DO INDEX.HTML)
      const badges = [];

      if (produto.desconto && produto.desconto > 0) {
        badges.push(`
                        <div class="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-2 py-1 rounded-full shadow-lg z-10">
                            -${produto.desconto}%
                        </div>
                    `);
      }
      if (produto.novo && !badges.length) {
        // Mostra 'Novo' apenas se não tiver outro badge
        badges.push(`
                        <div class="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full shadow-lg z-10">
                            Novo
                        </div>
                    `);
      }
      if (produto.mais_vendido && !badges.length) {
        // Mostra 'Mais Vendido' apenas se não tiver outro badge
        badges.push(`
                        <div class="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs px-2 py-1 rounded-full shadow-lg z-10">
                            🔥 Mais Vendido
                        </div>
                    `);
      }

      // Calcular preço com desconto (MESMA LÓGICA DO INDEX.HTML)
      const precoFinal =
        produto.desconto && produto.desconto > 0
          ? parseFloat(produto.preco) * (1 - parseFloat(produto.desconto) / 100)
          : parseFloat(produto.preco);

      return `
                <div class="product-card group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 animate-fade-in-up"
                     style="animation-delay: ${index * 100}ms"
                     data-categoria="${produto.categoria}" 
                     data-nome="${produto.nome.toLowerCase()}">
                    <div class="relative overflow-hidden">
                        <!-- Imagem do produto ou placeholder com gradiente (MESMA ESTRUTURA DO INDEX.HTML) -->
                        ${
                          temImagem
                            ? `<img src="${imagemSrc}" 
                                  alt="${produto.nome}" 
                                  class="w-full h-64 md:h-80 object-contain bg-white group-hover:scale-110 transition-transform duration-500 product-image">`
                            : `<div class="w-full h-64 md:h-80 ${
                                produto.cor_gradiente ||
                                "from-gray-400 to-gray-600"
                              } bg-gradient-to-br flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                <i data-feather="${
                                  produto.icone || "gift"
                                }" class="w-16 h-16 text-white opacity-75"></i>
                            </div>`
                        }
                        
                        <!-- Badges Container (MESMA ESTRUTURA DO INDEX.HTML) -->
                        <div class="absolute top-3 right-3 flex flex-col space-y-2">
                            ${badges.join("")}
                        </div>
                        
                        <!-- Overlay no hover -->
                        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                    </div>
                    
                    <div class="p-5">
                        <div class="flex justify-between items-start mb-3">
                            <h3 class="font-bold text-lg text-gray-800 group-hover:text-pink-600 transition-colors flex-1 mr-2">
                                ${produto.nome}
                            </h3>
                            <span class="bg-${produto.cor || "gray"}-100 text-${
                              produto.cor || "gray"
                            }-600 text-xs px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                                ${produto.categoria}
                            </span>
                        </div>
                        
                        <p class="text-gray-500 text-sm mb-4 leading-relaxed">
                            ${formatarDescricaoComLinks(produto.descricao)}
                        </p>
                        
                        <div class="flex justify-between items-center">
                            <div class="flex flex-col">
                                <span class="font-bold text-xl text-pink-500">
                                    R$ ${precoFinal
                                      .toFixed(2)
                                      .replace(".", ",")}
                                </span>
                                ${
                                  produto.preco_original &&
                                  parseFloat(produto.preco_original) >
                                    precoFinal
                                    ? `<span class="text-xs text-gray-400 line-through">
                                        De: R$ ${parseFloat(
                                          produto.preco_original,
                                        )
                                          .toFixed(2)
                                          .replace(".", ",")}
                                    </span>`
                                    : ""
                                }
                            </div>
                            <button class="add-to-cart bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white p-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 group/btn"
                                    data-produto-id="${produto.id}"
                                    aria-label="Adicionar ${
                                      produto.nome
                                    } ao carrinho">
                                <i data-feather="plus" class="w-4 h-4 group-hover/btn:rotate-90 transition-transform"></i>
                            </button>
                        </div>
                    </div>
                </div>
                `;
    })
    .join("");

  // Atualizar ícones do Feather
  feather.replace();

  // Adicionar eventos aos botões de adicionar ao carrinho (MESMA LÓGICA DO INDEX.HTML)
  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", function () {
      const produtoId = this.getAttribute("data-produto-id");
      const produto = produtos.find((p) => p.id === produtoId);
      if (produto) {
        carrinho.adicionarItem(produto);

        // Efeito visual no botão (MESMO EFEITO DO INDEX.HTML)
        const originalHTML = this.innerHTML;
        this.innerHTML = '<i data-feather="check" class="w-4 h-4"></i>';
        this.classList.remove("from-pink-500", "to-rose-500");
        this.classList.add("bg-green-500");
        feather.replace();

        setTimeout(() => {
          this.innerHTML = originalHTML;
          this.classList.remove("bg-green-500");
          this.classList.add("from-pink-500", "to-rose-500");
          feather.replace();
        }, 2000);
      }
    });
  });
}

function filtrarProdutos() {
  const termoBusca = document
    .getElementById("search-input")
    .value.toLowerCase();
  const categoriaSelecionada = document.getElementById("category-filter").value;

  const produtosFiltrados = produtos.filter((produto) => {
    const correspondeBusca =
      produto.nome.toLowerCase().includes(termoBusca) ||
      (produto.descricao &&
        produto.descricao.toLowerCase().includes(termoBusca)) ||
      produto.categoria.toLowerCase().includes(termoBusca);

    const correspondeCategoria =
      !categoriaSelecionada || produto.categoria === categoriaSelecionada;

    return correspondeBusca && correspondeCategoria;
  });

  const container = document.getElementById("products-grid");
  const emptyState = document.getElementById("empty-state");
  const loadingState = document.getElementById("loading-state");
  const errorState = document.getElementById("error-state");

  loadingState.classList.add("hidden");
  errorState.classList.add("hidden");

  if (produtosFiltrados.length === 0) {
    container.classList.add("hidden");
    emptyState.classList.remove("hidden");
  } else {
    container.classList.remove("hidden");
    emptyState.classList.add("hidden");
    renderizarProdutos(produtosFiltrados);
  }
}

function limparFiltros() {
  document.getElementById("search-input").value = "";
  document.getElementById("category-filter").value = "";

  // Remover destaque dos botões de categoria
  document.querySelectorAll(".category-filter-btn").forEach((btn) => {
    btn.classList.remove("ring-2", "ring-pink-300", "ring-offset-2");
  });

  filtrarProdutos();
}

// Permitir recarregar produtos manualmente
window.recarregarProdutos = function () {
  carregarProdutos();
  mostrarNotificacao("Produtos recarregados com sucesso!", "success");
};

// Função de notificação (como no index.html)
function mostrarNotificacao(mensagem, tipo) {
  const notificacaoAnterior = document.querySelector(".app-notification");
  if (notificacaoAnterior) {
    notificacaoAnterior.remove();
  }

  const notificacao = document.createElement("div");
  notificacao.className = `app-notification fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg transform translate-x-full transition-transform duration-300 ${
    tipo === "success"
      ? "bg-green-500"
      : tipo === "error"
        ? "bg-red-500"
        : "bg-blue-500"
  } text-white`;
  notificacao.innerHTML = `
                <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                        <i data-feather="${
                          tipo === "success"
                            ? "check"
                            : tipo === "error"
                              ? "alert-triangle"
                              : "info"
                        }" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <p class="font-semibold">${mensagem}</p>
                    </div>
                </div>
            `;

  document.body.appendChild(notificacao);
  feather.replace();

  setTimeout(() => notificacao.classList.remove("translate-x-full"), 100);

  setTimeout(() => {
    notificacao.classList.add("translate-x-full");
    setTimeout(() => notificacao.remove(), 300);
  }, 4000);
}
