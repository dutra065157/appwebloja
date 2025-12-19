// upload-service.js - Serviço de Upload para Cloudinary
class CloudinaryUploadService {
  constructor() {
    this.cloudName = null;
    this.apiKey = null;
    this.uploadPreset = "graca_presentes_produtos";
  }

  /**
   * Configura o serviço com credenciais do backend
   */
  async configurar() {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch("/api/cloudinary/config", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const config = await response.json();
      this.cloudName = config.cloud_name;
      this.apiKey = config.api_key;

      console.log("✅ Cloudinary configurado");
    } catch (error) {
      console.error("❌ Erro ao configurar Cloudinary:", error);
      throw error;
    }
  }

  /**
   * Faz upload de uma imagem para um produto específico
   * @param {File} file - Arquivo de imagem
   * @param {string} produtoId - ID do produto
   * @returns {Promise} - URL da imagem e public_id
   */
  async uploadImagemProduto(file, produtoId) {
    try {
      // 1. Validar arquivo
      this.validarArquivo(file);

      // 2. Obter assinatura do backend
      const assinatura = await this.obterAssinatura(produtoId);

      // 3. Preparar dados para upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", assinatura.api_key);
      formData.append("timestamp", assinatura.timestamp);
      formData.append("signature", assinatura.signature);
      formData.append("upload_preset", assinatura.upload_preset);
      formData.append("folder", assinatura.folder);
      formData.append("tags", `produto_${produtoId}`);

      // 4. Upload DIRETO para Cloudinary
      const uploadUrl = `https://api.cloudinary.com/v1_1/${assinatura.cloud_name}/image/upload`;

      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Erro no upload: ${uploadResponse.statusText}`);
      }

      const resultado = await uploadResponse.json();

      // 5. Salvar referência no seu banco
      await this.salvarNoBanco(produtoId, resultado);

      return {
        success: true,
        url: resultado.secure_url,
        public_id: resultado.public_id,
        width: resultado.width,
        height: resultado.height,
        format: resultado.format,
      };
    } catch (error) {
      console.error("❌ Erro no upload:", error);
      throw error;
    }
  }

  /**
   * Valida o arquivo antes do upload
   */
  validarArquivo(file) {
    // Tipos MIME permitidos
    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
    const tamanhoMaximo = 5 * 1024 * 1024; // 5MB

    if (!tiposPermitidos.includes(file.type)) {
      throw new Error("Tipo de arquivo não permitido. Use JPG, PNG ou WebP.");
    }

    if (file.size > tamanhoMaximo) {
      throw new Error("Arquivo muito grande. Tamanho máximo: 5MB.");
    }
  }

  /**
   * Obtém assinatura do backend
   */
  async obterAssinatura(produtoId) {
    const token = localStorage.getItem("adminToken");

    const response = await fetch(
      `/api/cloudinary/signature?produto_id=${produtoId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao obter assinatura de upload");
    }

    return await response.json();
  }

  /**
   * Salva a referência da imagem no seu banco
   */
  async salvarNoBanco(produtoId, cloudinaryData) {
    const token = localStorage.getItem("adminToken");

    const response = await fetch(`/api/produtos/${produtoId}/imagem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        imagem_url: cloudinaryData.secure_url,
        cloudinary_public_id: cloudinaryData.public_id,
        width: cloudinaryData.width,
        height: cloudinaryData.height,
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao salvar imagem no banco de dados");
    }

    return await response.json();
  }

  /**
   * Gera URL otimizada para exibição
   */
  gerarUrlOtimizada(publicId, options = {}) {
    if (!publicId) return "";

    const defaults = {
      width: 800,
      crop: "fill",
      quality: "auto",
      format: "auto",
    };

    const params = { ...defaults, ...options };
    const transformations = Object.entries(params)
      .map(([key, value]) => `${key}_${value}`)
      .join(",");

    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformations}/${publicId}`;
  }

  /**
   * Remove imagem do Cloudinary e do banco
   */
  async removerImagem(produtoId) {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(`/api/produtos/${produtoId}/imagem`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      return await response.json();
    } catch (error) {
      console.error("❌ Erro ao remover imagem:", error);
      throw error;
    }
  }
}

// Instância global para uso fácil
window.CloudinaryUploader = new CloudinaryUploadService();
