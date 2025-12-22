// --- CONFIGURAÇÃO GLOBAL DA API ---
// Este é o ÚNICO lugar onde você precisa definir a URL do seu backend.
// Para produção, altere para a URL fornecida pelo Render (ex: 'https://seu-app.onrender.com').
// Se o frontend e backend estiverem no mesmo domínio (como no Render), você pode deixar vazio "".

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000" // Desenvolvimento (Local)
    : ""; // Produção (Render - Automático)
