// Classe Carrinho (compatível com produtos.html)
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
let produtosEmDestaque = [];

// Inicialização
document.addEventListener("DOMContentLoaded", function () {
  inicializar();
  feather.replace();

  // Garantir que os botões de login funcionem
  setupLoginButtons();

  // Forçar carregamento dos produtos mesmo se houver cache
  carregarProdutosEmDestaque(true);
});

function setupLoginButtons() {
  // Botão de usuário (ícone de usuário)
  const userButtons = document.querySelectorAll(
    'button[onclick*="login.html"]',
  );
  userButtons.forEach((button) => {
    // Remover o atributo onclick existente
    button.removeAttribute("onclick");
    // Adicionar novo evento
    button.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "login.html";
    });
  });

  // Links no menu mobile
  const adminLinks = document.querySelectorAll('a[href="login.html"]');
  adminLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "login.html";
    });
  });
}

function inicializar() {
  // Configuração automática para ambiente de desenvolvimento local
  if (!window.API_BASE_URL) {
    // Verifica se está rodando localmente (localhost, IP local ou arquivo direto)
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.protocol === "file:";

    if (isLocal) {
      console.warn(
        "⚠️ API_BASE_URL não definida. Usando http://localhost:3000 como padrão.",
      );
      window.API_BASE_URL = "http://localhost:3000";
    }
  }

  console.log(
    "🔌 Conectando à API em:",
    window.API_BASE_URL || "Mesmo domínio (Produção)",
  );
  carregarProdutosEmDestaque();
  inicializarMobileMenu();
  inicializarNewsletter();
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

function inicializarNewsletter() {
  const newsletterForm = document.getElementById("newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const emailInput = document.getElementById("newsletter-email");
      const email = emailInput.value.trim();

      if (!validarEmail(email)) {
        mostrarNotificacao("Por favor, insira um email válido.", "error");
        return;
      }

      const button = this.querySelector('button[type="submit"]');
      const originalText = button.innerHTML;
      button.innerHTML = "⏳ Enviando...";
      button.disabled = true;

      // Simular envio
      setTimeout(() => {
        mostrarNotificacao(
          `Obrigado por assinar nossa newsletter! Enviaremos novidades para: ${email}`,
          "success",
        );
        emailInput.value = "";
        button.innerHTML = originalText;
        button.disabled = false;
      }, 1500);
    });
  }
}

function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

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

// Carregar produtos em destaque
async function carregarProdutosEmDestaque(forcarCache = false) {
  const container = document.getElementById("featured-products");

  // Mostrar loading
  container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="animate-pulse">
                        <div class="w-16 h-16 bg-pink-200 rounded-full mx-auto mb-4"></div>
                        <div class="h-4 bg-pink-200 rounded w-48 mx-auto mb-2"></div>
                        <div class="h-3 bg-pink-200 rounded w-32 mx-auto"></div>
                    </div>
                </div>
            `;

  try {
    // Usar a URL base da API definida no config.js
    const baseUrl = window.API_BASE_URL || "";
    const url = baseUrl ? `${baseUrl}/api/produtos` : "/api/produtos";

    // Adicionar timestamp para evitar cache
    const urlComCache = forcarCache ? `${url}?_=${Date.now()}` : url;

    const response = await fetch(urlComCache, {
      method: "GET",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Erro na API (${urlComCache}): ${response.status} ${response.statusText}`,
      );
    }

    const todosProdutos = await response.json();

    // Lógica para selecionar produtos em destaque
    const maisVendidos = todosProdutos.filter((p) => p.mais_vendido);
    const novos = todosProdutos.filter(
      (p) => p.novo && !maisVendidos.some((mv) => mv.id === p.id),
    );
    const outros = todosProdutos.filter(
      (p) =>
        !maisVendidos.some((mv) => mv.id === p.id) &&
        !novos.some((n) => n.id === p.id),
    );

    produtosEmDestaque = [...maisVendidos, ...novos, ...outros].slice(0, 4);

    if (produtosEmDestaque.length === 0) {
      container.innerHTML = `
                        <div class="col-span-full text-center py-12">
                            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-feather="package" class="w-8 h-8 text-gray-400"></i>
                            </div>
                            <h3 class="font-semibold text-gray-800 mb-2">Nenhum produto cadastrado</h3>
                            <p class="text-gray-500 mb-4">Acesse o painel admin para cadastrar produtos.</p>
                            <button onclick="window.location.href='login.html'" 
                                    class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                Cadastrar Produtos
                            </button>
                        </div>
                    `;
      feather.replace();
      return;
    }

    // Renderizar produtos
    renderizarProdutosDestaque(produtosEmDestaque);
  } catch (error) {
    console.error("Erro ao carregar produtos em destaque:", error);

    // Tentar carregar do cache local se a API falhar
    const produtosCache = localStorage.getItem("produtos_cache");
    if (produtosCache) {
      try {
        const produtos = JSON.parse(produtosCache);
        produtosEmDestaque = produtos.slice(0, 4);
        renderizarProdutosDestaque(produtosEmDestaque);
        mostrarNotificacao("Carregando produtos do cache...", "info");
        return;
      } catch (cacheError) {
        console.error("Erro ao carregar cache:", cacheError);
      }
    }

    container.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i data-feather="alert-triangle" class="w-8 h-8 text-red-500"></i>
                        </div>
                        <h3 class="font-semibold text-gray-800 mb-2">Erro ao carregar produtos</h3>
                        <p class="text-gray-500 mb-4">Não foi possível carregar os produtos do servidor.</p>
                        <button onclick="recarregarProdutos()" 
                                class="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition">
                            Tentar Novamente
                        </button>
                    </div>
                `;
    feather.replace();
  }
}

function renderizarProdutosDestaque(produtos) {
  const container = document.getElementById("featured-products");

  container.innerHTML = produtos
    .map((produto, index) => {
      const temImagem = !!produto.imagem_url;
      // Ajuste: Construir a URL completa da imagem usando a API_BASE_URL
      let imagemSrc = "";
      if (temImagem) {
        // Se a imagem já vier com http (do backend corrigido), usa ela direto
        if (produto.imagem_url.startsWith("http")) {
          imagemSrc = produto.imagem_url;
        } else {
          // Senão, adiciona a URL base se ela existir
          const path = produto.imagem_url.startsWith("/")
            ? produto.imagem_url
            : `/${produto.imagem_url}`;
          imagemSrc = window.API_BASE_URL
            ? `${window.API_BASE_URL}${path}`
            : path;
        }
      }

      // Determinar badges
      const badges = [];

      if (produto.desconto && produto.desconto > 0) {
        badges.push(`
                        <div class="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-2 py-1 rounded-full shadow-lg z-10">
                            -${produto.desconto}%
                        </div>
                    `);
      }
      if (produto.novo && !badges.length) {
        badges.push(`
                        <div class="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full shadow-lg z-10">
                            Novo
                        </div>
                    `);
      }
      if (produto.mais_vendido && !badges.length) {
        badges.push(`
                        <div class="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs px-2 py-1 rounded-full shadow-lg z-10">
                            🔥 Mais Vendido
                        </div>
                    `);
      }

      // Calcular preço com desconto
      const precoFinal =
        produto.desconto && produto.desconto > 0
          ? parseFloat(produto.preco) * (1 - parseFloat(produto.desconto) / 100)
          : parseFloat(produto.preco);

      return `
                <div class="product-card group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 animate-fade-in-up"
                     style="animation-delay: ${index * 100}ms">
                    <div class="relative overflow-hidden">
                        <!-- Imagem do produto ou placeholder com gradiente -->
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
                        
                        <!-- Badges Container -->
                        <div class="absolute top-3 right-3 flex flex-col space-y-2">
                            ${badges.join("")}
                        </div>
                        
                        <!-- Overlay no hover -->
                        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                    </div>
                    
                    <div class="p-5">
                        <div class="flex justify-between items-start mb-3">
                            <h3 class="font-bold text-lg text-gray-800 group-hover:text-pink-600 transition-colors line-clamp-2 flex-1 mr-2">
                                ${produto.nome}
                            </h3>
                            <span class="bg-${produto.cor || "gray"}-100 text-${
                              produto.cor || "gray"
                            }-600 text-xs px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                                ${produto.categoria}
                            </span>
                        </div>
                        
                        <p class="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
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

  feather.replace();

  // Adicionar eventos aos botões de adicionar ao carrinho
  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", function () {
      const produtoId = this.getAttribute("data-produto-id");
      const produto = produtosEmDestaque.find((p) => p.id === produtoId);
      if (produto) {
        carrinho.adicionarItem(produto);

        // Efeito visual no botão
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

  // Salvar no cache local para fallback
  localStorage.setItem("produtos_cache", JSON.stringify(produtosEmDestaque));
}

// Permitir recarregar produtos manualmente
window.recarregarProdutos = function () {
  carregarProdutosEmDestaque(true);
  mostrarNotificacao("🔄 Recarregando produtos...", "info");
};

// Detectar quando a página ganha foco (usuário volta para a aba)
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible") {
    // Recarregar produtos se a página estiver visível há mais de 1 minuto
    const lastLoad = localStorage.getItem("last_product_load");
    const now = Date.now();

    if (!lastLoad || now - parseInt(lastLoad) > 60000) {
      // 1 minuto
      carregarProdutosEmDestaque(true);
      localStorage.setItem("last_product_load", now.toString());
    }
  }
});

// Recarregar produtos a cada 5 minutos se a página estiver visível
setInterval(
  () => {
    if (document.visibilityState === "visible") {
      carregarProdutosEmDestaque(true);
    }
  },
  5 * 60 * 1000,
); // 5 minutos
