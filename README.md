# 🎁 Graça Presentes - E-commerce Full Stack

![Badge em Desenvolvimento](http://img.shields.io/static/v1?label=STATUS&message=EM%20DESENVOLVIMENTO&color=GREEN&style=for-the-badge)
![Badge License](http://img.shields.io/static/v1?label=LICENSE&message=MIT&color=BLUE&style=for-the-badge)

## 💻 Sobre o Projeto

**Graça Presentes** é uma aplicação web completa de catálogo e vendas online desenvolvida para facilitar a visualização de produtos e automatizar pedidos via WhatsApp.

O projeto conta com um **Painel Administrativo** seguro para cadastro de produtos com upload de imagens na nuvem, gerenciamento de categorias e controle de estoque visual.

### 🌐 Links do Projeto

- **Frontend (Aplicação):** [Acessar Loja Online](https://dutra065157.github.io/appwebloja/)
- **Backend (API):** [Documentação/API](https://appwebloja.onrender.com)

---

## 🛠️ Tecnologias Utilizadas

O projeto foi desenvolvido utilizando as seguintes tecnologias:

### Backend (Servidor & API)

- ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=flat&logo=node.js&logoColor=white) **Node.js**: Ambiente de execução JavaScript.
- ![Express](https://img.shields.io/badge/express.js-%23404d59.svg?style=flat&logo=express&logoColor=%2361DAFB) **Express**: Framework para construção da API REST.
- ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=flat&logo=mongodb&logoColor=white) **MongoDB & Mongoose**: Banco de dados NoSQL e modelagem de dados.
- ![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat&logo=cloudinary&logoColor=white) **Cloudinary**: Armazenamento e otimização de imagens na nuvem.
- **Multer**: Middleware para upload de arquivos.

### Frontend (Interface)

- ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=flat&logo=html5&logoColor=white) **HTML5 Semântico**.
- ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=flat&logo=css3&logoColor=white) **CSS3 & Tailwind**: Estilização moderna e responsiva.
- ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=flat&logo=javascript&logoColor=%23F7DF1E) **JavaScript (ES6+)**: Lógica de carrinho, gerenciamento de modais e interação com API.
- **Feather Icons**: Ícones leves e modernos.

---

## ✨ Funcionalidades

### 🛒 Para o Cliente

- **Catálogo Visual:** Visualização de produtos com filtros por categoria (Flores, Doces, Pelúcias, etc.).
- **Catálogo Visual:** Visualização de produtos com filtros por categoria (Perfumes, Doces, Pelúcias, etc.).
- **Carrinho de Compras:** Adição/remoção de itens com cálculo automático de total.
- **Fluxo de Checkout Completo:** Finalização de compra em etapas (Dados, Resumo e Sucesso) via Modais interativos.
- **Integração WhatsApp Aprimorada:** Geração de número de pedido único (#ID) e envio de uma mensagem **pré-formatada pelo servidor**, pronta para o cliente apenas clicar e enviar.
- **Responsividade:** Layout adaptado para Celulares, Tablets e Desktop com ajustes visuais dinâmicos.

### ⚙️ Painel Administrativo (Admin)

- **Autenticação:** Sistema de login para proteger as rotas administrativas.
- **CRUD de Produtos:** Criar, Ler e Deletar produtos.
- **Upload de Imagens:** Integração com Cloudinary para hospedagem de fotos dos produtos.
- **Gestão de Destaques:** Marcar produtos como "Novo", "Mais Vendido" ou aplicar descontos.
- **Dashboard de Pedidos:** Visualização de todos os pedidos recebidos com informações detalhadas do cliente e dos itens.
- **Gerenciamento de Pedidos:** Funcionalidade para limpar todo o histórico de pedidos com confirmação por senha.
- **Segurança de Sessão:** Logout automático por inatividade para proteger o painel.

---

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos

Você precisa ter instalado em sua máquina:

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [Git](https://git-scm.com/)

### Passo a Passo

1. **Clone o repositório**

   ```bash
   git clone https://github.com/dutra065157/appwebloja.git
   cd appwebloja
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

   _Nota: Se houver erro de dependência, use `npm install --legacy-peer-deps`_

3. **Configure as Variáveis de Ambiente**
   Crie um arquivo `.env` na raiz do projeto e preencha com suas credenciais (não compartilhe este arquivo):

   ```env
   PORT=8000
   MONGODB_URI=sua_string_de_conexao_mongodb

   # Configuração Cloudinary
   CLOUDINARY_CLOUD_NAME=seu_cloud_name
   CLOUDINARY_API_KEY=sua_api_key
   CLOUDINARY_API_SECRET=sua_api_secret

   # Opcional (para deploy)
   RENDER_EXTERNAL_URL=https://appwebloja.onrender.com
   ```

4. **Inicie o Servidor**

   ```bash
   node server.js
   ```

5. **Acesse a aplicação**
   - O backend rodará em: `http://localhost:8000`
   - Abra o arquivo `index.html` no seu navegador ou use uma extensão como "Live Server".

---

## 📂 Estrutura do Projeto

```
appwebloja/
│
├── 📁 images/           # Imagens locais (fallback)
├── 📁 style/            # Arquivos CSS
├── 📄 server.js         # Ponto de entrada do Backend (API)
├── 📄 cloudinary.js     # Configuração de upload na nuvem
├── 📄 carrinho.js       # Lógica do carrinho de compras
├── 📄 scriptindex.js    # Lógica da página inicial e produtos
├── 📄 index.html        # Página principal
├── 📄 admin.html        # Painel administrativo
└── 📄 .env              # Variáveis de ambiente (não versionado)
```

---

## 👨‍💻 Autor

Desenvolvido por **Renato Santos** (e/ou seu nome completo).

[!LinkedIn](https://www.linkedin.com/in/seu-linkedin)
[!GitHub](https://github.com/dutra065157)

---

_Este projeto é para fins de estudo e portfólio._
