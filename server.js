const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
require("dotenv").config(); // Garante que as variáveis de ambiente sejam carregadas

// Configuração
const PORT = process.env.PORT || 8000;
const app = express();

// Configuração do WhatsApp
const WHATSAPP_CONFIG = {
  api_url: "https://api.whatsapp.com/send",
  phone_number: "5519987790800",
  default_message: "Olá! Gostaria de mais informações sobre os produtos.",
};

// Middlewares
app.use(cors()); // Habilita CORS para todas as rotas
app.use(express.json({ limit: "10mb" })); // Aumenta o limite para receber imagens em base64

app.use(express.static(__dirname)); // Serve arquivos estáticos (html, css, js) da pasta raiz

// --- ☁️ Configuração do Cloudinary ---
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error(
    "❌ Erro: As variáveis de ambiente do Cloudinary (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) não foram definidas."
  );
  process.exit(1);
} else {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
  console.log("☁️  Cloudinary configurado com sucesso.");
}

// --- 몽 Conexão com o MongoDB usando Mongoose ---
const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error(
    "❌ Erro: A variável de ambiente MONGODB_URI não foi definida."
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
  console.error(`❌ Erro Inesperado: ${err.message}`);
  console.error(err.stack);
  res.status(500).json({ error: "Ocorreu um erro inesperado no servidor." });
};

// Middleware de autenticação para rotas de admin
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    console.warn(
      `⚠️  Acesso negado (401): Token não fornecido para ${req.method} ${req.path}`
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
      `⚠️  Acesso negado (403): Token inválido para ${req.method} ${req.path}`
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
  cloudinary_public_id: String, // ID da imagem no Cloudinary para podermos deletá-la
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
        products_count: products_count,
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
    res.status(200).json(produtos);
  } catch (error) {
    next(error);
  }
});

// Rota para cadastrar um novo produto
app.post("/api/produtos", authMiddleware, async (req, res, next) => {
  try {
    const p = req.body;

    // Lógica para definir ícone e gradiente com base na categoria
    const categoryStyles = getCategoryStyles(p.categoria);

    const newProduct = {
      nome: p.nome,
      preco: p.preco,
      preco_original: p.preco_original,
      categoria: p.categoria,
      descricao: p.descricao,
      imagem_url: null, // A imagem será adicionada depois
      icone: categoryStyles.icone,
      cor: categoryStyles.cor,
      cor_gradiente: categoryStyles.cor_gradiente,
      desconto: p.desconto || 0,
      novo: p.novo || false,
      mais_vendido: p.mais_vendido || false,
      // createdAt é definido por padrão pelo Schema
    };

    const produtoCriado = await new Produto(newProduct).save();

    res.status(200).json({
      success: true,
      produto_id: produtoCriado._id,
      message: "Produto cadastrado com sucesso",
    });
  } catch (error) {
    next(error);
  }
});

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

    // No MongoDB, podemos "embutir" os itens dentro do próprio pedido.
    const newOrder = {
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
    const mensagem = `📦 Novo pedido #${pedidoCriado._id
      .toString()
      .slice(-6)} recebido na Graça Presentes!`;
    const whatsapp_link = `https://api.whatsapp.com/send?phone=${
      WHATSAPP_CONFIG.phone_number
    }&text=${encodeURIComponent(mensagem)}`;

    res.status(200).json({
      success: true,
      message: "Pedido criado com sucesso!",
      pedido_id: pedidoCriado._id,
      whatsapp_link: whatsapp_link,
    });
  } catch (error) {
    next(error);
  }
});

// 🔐 Rota para gerar assinatura SEGURA para upload direto
app.get("/api/sign-upload", authMiddleware, (req, res, next) => {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const produtoId = req.query.produto_id || "temp";

    // ⚠️ Parâmetros para assinatura (Simplificado para corrigir erro)
    const params = {
      timestamp: timestamp,
      folder: `graca-presentes/produtos/${produtoId}`,
      public_id: `produto_${produtoId}_${timestamp}`,
    };

    // Gerar assinatura com sua API_SECRET
    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      success: true,
      signature: signature,
      timestamp: timestamp,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      folder: params.folder,
      public_id: params.public_id, // Importante: Enviar o public_id gerado para o frontend
    });
  } catch (error) {
    next(error);
  }
});

// 📸 Rota para salvar URL da imagem APÓS upload no Cloudinary
app.post("/api/produtos/:id/imagem", authMiddleware, async (req, res, next) => {
  try {
    const produtoId = req.params.id;
    const { imagem_url, cloudinary_public_id, width, height } = req.body;

    // 🔒 VALIDAÇÃO DE SEGURANÇA CRÍTICA
    if (!imagem_url || !cloudinary_public_id) {
      return res.status(400).json({
        error: "URL da imagem e public_id são obrigatórios.",
      });
    }

    // Verifica se a URL é DO SEU Cloudinary
    const seuDominioCloudinary = `${process.env.CLOUDINARY_CLOUD_NAME}.`;
    if (
      !imagem_url.includes(
        `res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`
      )
    ) {
      return res.status(400).json({
        error: "URL de imagem inválida. Deve ser do seu domínio Cloudinary.",
      });
    }

    // Verifica formato permitido
    const formato = imagem_url.split(".").pop().split("?")[0];
    const formatosPermitidos = ["jpg", "jpeg", "png", "webp"];
    if (!formatosPermitidos.includes(formato.toLowerCase())) {
      return res.status(400).json({
        error: "Formato de imagem não permitido.",
      });
    }

    // Busca produto
    const produto = await Produto.findById(produtoId);
    if (!produto) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    // 🔄 Remove imagem ANTIGA do Cloudinary se existir
    if (produto.cloudinary_public_id) {
      try {
        await cloudinary.uploader.destroy(produto.cloudinary_public_id);
        console.log(
          `🗑️  Imagem antiga removida: ${produto.cloudinary_public_id}`
        );
      } catch (deleteError) {
        console.error("⚠️  Erro ao remover imagem antiga:", deleteError);
        // Continua mesmo com erro na remoção
      }
    }

    // Atualiza produto
    produto.imagem_url = imagem_url;
    produto.cloudinary_public_id = cloudinary_public_id;
    produto.ultima_atualizacao = new Date();
    await produto.save();

    res.json({
      success: true,
      message: "Imagem do produto atualizada com sucesso!",
      produto: {
        id: produto._id,
        nome: produto.nome,
        imagem_url: produto.imagem_url,
        public_id: produto.cloudinary_public_id,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 🖼️ Rota para gerar URL otimizada (útil para frontend)
app.get("/api/cloudinary/otimizar-url", (req, res) => {
  const {
    public_id,
    width = 400,
    height,
    crop = "fill",
    quality = "auto",
  } = req.query;

  if (!public_id) {
    return res.status(400).json({ error: "public_id é obrigatório" });
  }

  const url = cloudinary.url(public_id, {
    width: parseInt(width),
    height: height ? parseInt(height) : null,
    crop: crop,
    quality: quality,
    format: "auto", // WebP se suportado
    secure: true,
  });

  res.json({ url });
});

// 📊 Rota para estatísticas (opcional)
app.get("/api/cloudinary/estatisticas", authMiddleware, async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "graca-presentes/",
      max_results: 10,
    });

    res.json({
      total_imagens: result.resources.length,
      tamanho_total: result.resources.reduce((sum, img) => sum + img.bytes, 0),
      ultimas_imagens: result.resources.map((img) => ({
        public_id: img.public_id,
        url: img.secure_url,
        tamanho: img.bytes,
        formato: img.format,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// --- INICIALIZAÇÃO DO SERVIDOR ---

app.listen(PORT, () => {
  console.log("🚀 GRAÇA PRESENTES - Servidor Node.js Iniciado!");
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log("💾 Banco de dados: MongoDB (Mongoose)");
  console.log("🖼️  Upload de Imagens: Cloudinary");
  console.log("⏹️ Para parar: Ctrl+C");
  console.log("=".repeat(60));
});

// Rota para remover um produto
app.delete("/api/produtos/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Lógica para remover a imagem do Cloudinary antes de remover do DB
    const produto = await Produto.findById(id);
    if (produto && produto.cloudinary_public_id) {
      try {
        await cloudinary.uploader.destroy(produto.cloudinary_public_id);
      } catch (cloudinaryError) {
        // Loga o erro mas continua o processo de deleção do produto no DB
        console.error("Erro ao deletar imagem no Cloudinary:", cloudinaryError);
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

// Rota fallback para servir o index.html em rotas não encontradas (para SPAs)
// DEVE SER UMA DAS ÚLTIMAS ROTAS
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Adiciona o middleware de tratamento de erros no final, depois de todas as rotas
app.use(errorHandler);

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
