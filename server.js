const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const multer = require("multer");
require("dotenv").config(); // Garante que as variáveis de ambiente sejam carregadas

// Configuração
const PORT = process.env.PORT || 8000;
const app = express();

// Configuração do WhatsApp
const WHATSAPP_CONFIG = {
  api_url: "https://api.whatsapp.com/send",
  phone_number: "5519987790800", // <-- Coloque aqui seu número (Ex: 55 + DDD + Numero)
  default_message: "Olá! Gostaria de mais informações sobre os produtos.",
};

// Middlewares
app.use(cors()); // Habilita CORS para todas as rotas
app.use(express.json({ limit: "10mb" })); // Aumenta o limite para receber imagens em base64

// --- 📂 Configuração de Upload (Cloudinary) ---
// Mantemos a pasta images apenas para servir imagens antigas que já existam localmente
const uploadDir = path.join(__dirname, "images");

// Importa a configuração do Cloudinary (substitui o diskStorage local)
const storage = require("./cloudinary");
const upload = multer({ storage: storage });

app.use("/images", express.static(uploadDir));
app.use(express.static(__dirname)); // Serve arquivos estáticos (html, css, js) da pasta raiz

// --- 🍃 Conexão com o MongoDB usando Mongoose ---
const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error(
    "❌ Erro: A variável de ambiente MONGODB_URI não foi definida.",
  );
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Conectado ao MongoDB com sucesso via Mongoose!"))
  .catch((err) => {
    console.error("❌ Erro ao conectar ao MongoDB:", err);
    process.exit(1);
  });

// Middleware de tratamento de erros
const errorHandler = (err, req, res, next) => {
  console.error("❌ Erro no Servidor:");
  console.error(err); // Loga o erro completo para debug

  // Retornar erro de validação do Mongoose como 400 com detalhes
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: Object.values(err.errors)
        .map((e) => e.message)
        .join(", "),
    });
  }

  // Erro de conversão de tipos (ex: número inválido)
  if (err.name === "CastError") {
    return res
      .status(400)
      .json({ error: `Dado inválido no campo ${err.path}` });
  }

  // Erros do Multer (ex: arquivo muito grande)
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Erro no upload: ${err.message}` });
  }

  res
    .status(500)
    .json({ error: err.message || "Ocorreu um erro inesperado no servidor." });
};

// Middleware de autenticação para rotas de admin
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    console.warn(
      `⚠️  Acesso negado (401): Token não fornecido para ${req.method} ${req.path}`,
    );
    return res
      .status(401)
      .json({ error: "Acesso não autorizado. Token não fornecido." });
  }

  // O frontend gera um token com btoa(`admin:${Date.now()}`).
  // O início do token codificado para "admin:" é "YWRtaW46".
  // Verificamos se o token começa com esse prefixo para validá-lo.
  // Esta é uma abordagem simples; JWT seria mais robusto para produção.
  if (token.startsWith("YWRtaW46")) {
    next(); // Token válido, continue
  } else {
    console.warn(
      `⚠️  Acesso negado (403): Token inválido para ${req.method} ${req.path}`,
    );
    return res.status(403).json({ error: "Token inválido." });
  }
};

// --- 📜 Mongoose Schemas e Models ---

// Schema para Produtos
const produtoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  preco: { type: Number, required: true },
  preco_original: Number,
  categoria: { type: String, required: true },
  descricao: String,
  imagem_url: String,
  icone: String,
  cor: String,
  cor_gradiente: String,
  desconto: { type: Number, default: 0 },
  novo: { type: Boolean, default: false },
  mais_vendido: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Adiciona um campo virtual 'id' que retorna o '_id' como string
produtoSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
produtoSchema.set("toJSON", { virtuals: true });

const Produto = mongoose.model("Produto", produtoSchema);

// Schema para Pedidos
const pedidoSchema = new mongoose.Schema({
  numero_pedido: { type: String, unique: true },
  cliente_nome: { type: String, required: true },
  cliente_email: String,
  cliente_telefone: String,
  endereco_entrega: String,
  observacoes: String,
  total: { type: Number, required: true },
  itens: [mongoose.Schema.Types.Mixed], // Array de itens
  status: { type: String, default: "recebido" },
  dataCriacao: { type: Date, default: Date.now },
});

// Adiciona um campo virtual 'id' que retorna o '_id' como string
pedidoSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
pedidoSchema.set("toJSON", { virtuals: true });

const Pedido = mongoose.model("Pedido", pedidoSchema);

// --- ROTAS DA API ---

// Rota de Health Check
app.get("/api/health", async (req, res, next) => {
  // Renomeado de /api/status para /api/health
  try {
    // Verifica o status da conexão do Mongoose
    const isConnected = mongoose.connection.readyState === 1;
    if (!isConnected) {
      throw new Error("Database not connected");
    }
    const products_count = await Produto.countDocuments();
    res.status(200).json({
      status: "OK",
      message: "Graça Presentes Backend rodando!",
      features: {
        whatsapp_integration: true,
        database: "MongoDB",
      },
    });
  } catch (error) {
    // Passa o erro para o próximo middleware (o errorHandler)
    next(error);
  }
});

// Rota para buscar todos os produtos
app.get("/api/produtos", async (req, res, next) => {
  try {
    const produtos = await Produto.find().sort({ createdAt: -1 });

    // Determina a URL base (Render ou Localhost) para corrigir o caminho das imagens
    const baseUrl = (
      process.env.RENDER_EXTERNAL_URL || `${req.protocol}://${req.get("host")}`
    ).replace(/\/$/, "");

    const produtosFormatados = produtos.map((produto) => {
      const p = produto.toJSON();
      if (p.imagem_url && !p.imagem_url.startsWith("http")) {
        // Normaliza o caminho: substitui contra-barras por barras normais e garante a barra inicial
        let caminhoImagem = p.imagem_url.replace(/\\/g, "/");
        if (!caminhoImagem.startsWith("/")) {
          caminhoImagem = `/${caminhoImagem}`;
        }
        p.imagem_url = `${baseUrl}${caminhoImagem}`;
      }
      return p;
    });

    if (produtosFormatados.length > 0) {
      console.log(
        "🔍 Debug URL Imagem (Exemplo):",
        produtosFormatados[0].imagem_url,
      );
    }

    res.status(200).json(produtosFormatados);
  } catch (error) {
    next(error);
  }
});

// Rota para cadastrar um novo produto
app.post(
  "/api/produtos",
  authMiddleware,
  upload.single("imagem"),
  async (req, res, next) => {
    try {
      const p = req.body;
      console.log("📝 Dados recebidos (body):", p); // Log para debug

      // Lógica para definir ícone e gradiente com base na categoria
      const categoryStyles = getCategoryStyles(p.categoria);

      // Se houver arquivo, cria a URL relativa
      let imagemUrl = null;
      if (req.file) {
        // Cloudinary retorna a URL completa na propriedade .path
        imagemUrl = req.file.path;
        console.log("📸 Upload realizado no Cloudinary:", imagemUrl);
      }

      // Helpers para converter números (trata vírgula e ponto e evita NaN)
      const parseNum = (v) => {
        if (!v) return 0;
        const num = parseFloat(String(v).replace(",", "."));
        return isNaN(num) ? 0 : num;
      };

      const parseNumOpt = (v) => {
        if (!v) return undefined;
        const num = parseFloat(String(v).replace(",", "."));
        return isNaN(num) ? undefined : num;
      };

      const newProduct = {
        nome: p.nome,
        preco: parseNum(p.preco),
        preco_original: parseNumOpt(p.preco_original),
        categoria: p.categoria,
        descricao: p.descricao,
        imagem_url: imagemUrl,
        icone: categoryStyles.icone,
        cor: categoryStyles.cor,
        cor_gradiente: categoryStyles.cor_gradiente,
        desconto: parseNum(p.desconto),
        novo: p.novo === "true" || p.novo === true,
        mais_vendido: p.mais_vendido === "true" || p.mais_vendido === true,
        // createdAt é definido por padrão pelo Schema
      };

      const produtoCriado = await new Produto(newProduct).save();

      res.status(201).json({
        success: true,
        produto_id: produtoCriado._id,
        message: "Produto cadastrado com sucesso",
      });
    } catch (error) {
      next(error);
    }
  },
);

// Rota para buscar todos os pedidos
app.get("/api/pedidos", async (req, res, next) => {
  try {
    const pedidos = await Pedido.find().sort({ dataCriacao: -1 });
    res.status(200).json(pedidos);
  } catch (error) {
    next(error);
  }
});

// Rota para criar um novo pedido
app.post("/api/pedidos", async (req, res, next) => {
  try {
    const { cliente, itens, total } = req.body;

    if (!cliente || !cliente.nome) {
      return res
        .status(400)
        .json({ success: false, error: "Dados do cliente são obrigatórios" });
    }

    // Gerar número do pedido (Ex: #123456)
    const numeroPedido = `#${Math.floor(100000 + Math.random() * 900000)}`;

    // No MongoDB, podemos "embutir" os itens dentro do próprio pedido.
    const newOrder = {
      numero_pedido: numeroPedido,
      cliente_nome: cliente.nome,
      cliente_email: cliente.email,
      cliente_telefone: cliente.telefone,
      endereco_entrega: cliente.endereco,
      observacoes: cliente.observacoes,
      total: total,
      itens: itens, // Array de itens diretamente no documento
      status: "recebido",
      // dataCriacao é definido por padrão pelo Schema
    };

    const pedidoCriado = await new Pedido(newOrder).save();

    res.status(201).json({
      success: true,
      message: "Pedido criado com sucesso!",
      pedido_id: pedidoCriado._id,
      numero_pedido: numeroPedido,
      vendedor_telefone: WHATSAPP_CONFIG.phone_number,
    });
  } catch (error) {
    next(error);
  }
});

// Rota para remover um produto
app.delete("/api/produtos/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Lógica para remover a imagem local antes de remover do DB
    const produto = await Produto.findById(id);
    if (produto && produto.imagem_url) {
      // Apenas tenta deletar do disco se for uma imagem local antiga (não começa com http)
      if (!produto.imagem_url.startsWith("http")) {
        try {
          // Remove a barra inicial se existir para o caminho do sistema de arquivos
          const imagePath = path.join(__dirname, produto.imagem_url);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        } catch (fsError) {
          // Loga o erro mas continua o processo de deleção do produto no DB
          console.error("Erro ao deletar imagem local:", fsError);
        }
      }
    }

    // Encontra e remove o produto pelo ID
    const produtoDeletado = await Produto.findByIdAndDelete(id);

    if (!produtoDeletado) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    res
      .status(200)
      .json({ success: true, message: "Produto removido com sucesso." });
  } catch (error) {
    next(error);
  }
});

// --- 🛠️ ROTA DE MANUTENÇÃO (NOVO) ---
// Acessar via navegador: http://localhost:8000/api/fix-images
// Verifica se as imagens dos produtos realmente existem no disco.
// Se não existirem, remove a referência do banco para mostrar o ícone padrão.
app.get("/api/fix-images", async (req, res) => {
  try {
    const produtos = await Produto.find();
    let corrigidos = 0;

    for (const produto of produtos) {
      if (produto.imagem_url && !produto.imagem_url.startsWith("http")) {
        // Extrai apenas o nome do arquivo (ex: /images/foto.png -> foto.png)
        const nomeArquivo = path.basename(produto.imagem_url);
        const caminhoArquivo = path.join(uploadDir, nomeArquivo);

        if (!fs.existsSync(caminhoArquivo)) {
          console.log(
            `🗑️ Imagem perdida encontrada: ${nomeArquivo}. Removendo referência do produto "${produto.nome}"...`,
          );
          produto.imagem_url = null; // Remove o link quebrado
          await produto.save();
          corrigidos++;
        }
      }
    }

    res.json({
      success: true,
      message: `Manutenção finalizada!`,
      detalhes: `${corrigidos} produtos com imagens quebradas foram corrigidos (agora mostram o ícone).`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota fallback para servir o index.html em rotas não encontradas (para SPAs)
// DEVE SER UMA DAS ÚLTIMAS ROTAS
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Adiciona o middleware de tratamento de erros no final, depois de todas as rotas
app.use(errorHandler);

// --- INICIALIZAÇÃO DO SERVIDOR ---

app.listen(PORT, () => {
  const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  console.log("🚀 GRAÇA PRESENTES - Servidor Node.js Iniciado!");
  console.log(`📍 URL: ${baseUrl}`);
  console.log("💾 Banco de dados: MongoDB (Mongoose)");
  console.log("☁️  Upload de Imagens: Cloudinary");
  console.log("⏹️ Para parar: Ctrl+C");
  console.log("=".repeat(60));
});

// Função auxiliar para estilos de categoria
function getCategoryStyles(categoria) {
  const styles = {
    Flores: {
      cor: "pink",
      icone: "sun",
      cor_gradiente: "from-pink-200 to-rose-300",
    },
    Doces: {
      cor: "yellow",
      icone: "box",
      cor_gradiente: "from-yellow-200 to-amber-300",
    },
    Pelúcias: {
      cor: "purple",
      icone: "heart",
      cor_gradiente: "from-purple-200 to-pink-300",
    },
    Cosméticos: {
      cor: "rose",
      icone: "star",
      cor_gradiente: "from-rose-200 to-pink-300",
    },
    Kits: {
      cor: "amber",
      icone: "package",
      cor_gradiente: "from-amber-200 to-orange-300",
    },
    Decoração: {
      cor: "blue",
      icone: "home",
      cor_gradiente: "from-blue-200 to-cyan-300",
    },
    Joias: {
      cor: "green",
      icone: "award",
      cor_gradiente: "from-green-200 to-emerald-300",
    },
    Românticos: {
      cor: "rose",
      icone: "heart",
      cor_gradiente: "from-rose-200 to-red-300",
    },
  };
  return (
    styles[categoria] || {
      cor: "gray",
      icone: "gift",
      cor_gradiente: "from-gray-400 to-gray-600",
    }
  );
}
