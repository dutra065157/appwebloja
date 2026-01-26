const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

// Verificação de segurança: Garante que as chaves existem
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error(
    "❌ ERRO CRÍTICO: Variáveis do Cloudinary não encontradas no arquivo .env!",
  );
  console.error(
    "Verifique se CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET estão definidos.",
  );
} else {
  console.log(
    "✅ Configuração do Cloudinary carregada para a nuvem:",
    process.env.CLOUDINARY_CLOUD_NAME,
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "loja_appweb",
    allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"],
  },
});

module.exports = storage;
