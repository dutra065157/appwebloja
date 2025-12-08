https://appwebloja-api.onrender.com

https://dutra065157.github.io/appwebloja/


# 🛍️ Graça Presentes - E-commerce Completo

> Um projeto Full Stack de uma loja virtual de presentes, construído com um front-end moderno e responsivo e uma API REST em Python.

<div align="center">

[![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.9%2B-blue?logo=python)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.0-black?logo=flask)](https://flask.palletsprojects.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-blue?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

<br>

<p align="center">
  <a href="[URL_DO_RENDER_AQUI]" target="_blank">
    <img src="https://img.shields.io/badge/Ver%20Demo%20Online-Acessar-brightgreen?style=for-the-badge&logo=render" alt="Ver Demo">
  </a>&nbsp;
  <a href="[URL_DO_SEU_GITHUB_AQUI]" target="_blank">
    <img src="https://img.shields.io/badge/C%C3%B3digo%20Fonte-GitHub-blue?style=for-the-badge&logo=github" alt="Repositório">
  </a>
</p>

<br>

<div align="center">
  <!-- IMPORTANTE: Substitua a URL abaixo por uma imagem ou GIF do seu projeto! -->
  <img src="https://res.cloudinary.com/dxgd62afy/image/upload/v1764743537/graca-presentes/logo.jpg" alt="Demonstração do Projeto Graça Presentes" width="80%">
</div>

## 💻 Sobre o Projeto

**Graça Presentes** é uma simulação de e-commerce totalmente funcional, projetada para demonstrar habilidades em desenvolvimento web front-end e back-end. A plataforma permite que usuários visualizem um catálogo de produtos, adicionem itens a um carrinho de compras persistente e finalizem um pedido, que é registrado em um painel administrativo.

O projeto foi desenvolvido com foco em uma experiência de usuário limpa, design responsivo e uma arquitetura desacoplada, onde o front-end consome uma API RESTful para gerenciar todos os dados.

---

## ✨ Funcionalidades Principais

### Front-end (Cliente)
- **Design Responsivo:** Interface adaptável para desktops, tablets e celulares, utilizando Tailwind CSS.
- **Catálogo de Produtos:** Página de produtos com busca em tempo real e filtros por categoria.
- **Carrinho de Compras:** Adicione, remova e atualize a quantidade de itens. O carrinho é salvo no `localStorage` para persistir entre as sessões.
- **Checkout Simplificado:** Coleta de dados do cliente através de `prompts` e confirmação do pedido.
- **Integração com WhatsApp:** Ao finalizar um pedido, um link do WhatsApp é gerado para notificar o vendedor.
- **Notificações Dinâmicas:** Feedbacks visuais para ações como "adicionar ao carrinho" e "login".

### Back-end (Painel Administrativo)
- **Autenticação Segura:** Acesso ao painel administrativo protegido por senha.
- **Dashboard de Produtos (CRUD):**
  - **Criar:** Adicionar novos produtos com nome, preço, categoria, imagem, etc.
  - **Ler:** Visualizar todos os produtos cadastrados.
  - **Atualizar:** Editar informações de produtos existentes.
  - **Deletar:** Remover produtos do catálogo.
- **Upload de Imagens:** Integração com o serviço **Cloudinary** para armazenamento de imagens dos produtos na nuvem.
- **Visualização de Pedidos:** Painel para acompanhar os pedidos recebidos dos clientes em tempo real.

---

## 🚀 Tecnologias Utilizadas

O projeto foi construído utilizando as seguintes tecnologias:

| Tecnologia | Descrição |
|---|---|
| **HTML5** | Estrutura e semântica das páginas. |
| **CSS3 / Tailwind CSS** | Estilização moderna, responsiva e utilitária. |
| **JavaScript (ES6+)** | Interatividade, manipulação do DOM e consumo de API (`fetch`). |
| **Python** | Linguagem principal do back-end. |
| **Flask** | Micro-framework para criação da API RESTful. |
| **Feather Icons** | Biblioteca de ícones SVG leves e customizáveis. |
| **Cloudinary** | Plataforma para gerenciamento e upload de imagens na nuvem. |
| **Render** | Plataforma de nuvem para hospedar a API back-end. |

---

## 🛠️ Como Executar o Projeto Localmente

Siga os passos abaixo para rodar o projeto em sua máquina.

### Pré-requisitos

- Git
- Python 3.9+

### Passos

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/dutra065157/Appwebloja.git
   cd Appwebloja
   ```

2. **Configure e execute o Back-end (API):**
   ```bash
   # Crie um ambiente virtual
   python -m venv venv

   # Ative o ambiente virtual
   # No Windows:
   venv\Scripts\activate
   # No macOS/Linux:
   source venv/bin/activate

   # Instale as dependências
   pip install -r requirements.txt

   # Execute o servidor Flask
   python server.py
   ```
   O servidor back-end estará rodando em `http://127.0.0.1:5000`.

3. **Abra o Front-end:**
   - Navegue até a pasta raiz do projeto.
   - Abra o arquivo `index.html` diretamente no seu navegador.

> **Nota:** Para que o front-end se comunique com sua API local, abra o arquivo `config.js` e deixe a variável `API_BASE_URL` em branco:
> `const API_BASE_URL = '';`

---

## ⚙️ Configuração

- **URL da API:** A URL da API é gerenciada no arquivo `config.js`. Para produção, ela aponta para o link do Render. Para desenvolvimento local, deve ser deixada em branco.
- **Senha de Admin:** A senha de acesso ao painel administrativo está definida no arquivo `login.html` e validada no `server.py`. A senha padrão é `graca123`.
- **Cloudinary:** As credenciais do Cloudinary devem ser configuradas como variáveis de ambiente no `server.py` para o upload de imagens funcionar.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

## 👨‍💻 Autor

<a href="https://github.com/dutra065157">
 <img style="border-radius: 50%;" src="https://avatars.githubusercontent.com/u/104192667?v=4" width="100px;" alt="Foto de Renato Santos"/>
 <br />
 <sub><b>Renato Santos</b></sub>
</a>
<br />

Feito com ❤️ por Renato Santos. Entre em contato!

[!Linkedin](https://www.linkedin.com/in/SEU_LINKEDIN_AQUI/)
[!Gmail](mailto:SEU_EMAIL_AQUI)


