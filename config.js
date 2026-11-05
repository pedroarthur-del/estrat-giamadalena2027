/* =====================================================================
   CONFIGURAÇÃO DO CLIENTE
   Este é o único arquivo que muda de um cliente para outro e entre
   versões. Ao atualizar a plataforma no GitHub, substitua os outros
   arquivos e MANTENHA este (ele guarda a conexão com o banco).
   ===================================================================== */
window.PLATAFORMA = {
  cliente: {
    nome: "Colégio Santa Madalena Sofia",
    curto: "Madalena Sofia",
    rede: "Rede Damas Educacional",
    cidade: "Maceió · AL",
    // Monograma usado no logo, no ícone da aba e no aplicativo do celular
    monograma: "M",
    // Logo oficial (msofia.com), versão branca: aparece sempre sobre o azul da marca, como no site
    logo: "assets/logo-msofia.png",
  },

  // Cores da marca (site msofia.com)
  cores: { primaria: "#093A72", secundaria: "#03B4D6", destaque: "#B5C628" },

  // Frase de abertura e frases que se alternam no painel
  abertura: {
    titulo: "Duc in altum",
    traducao: "Avança para águas mais profundas",
    fonte: "",
  },
  frases: [
    { texto: "Duc in altum. Avança para águas mais profundas.", autor: "Lc 5,4 · valor da Rede Damas" },
    { texto: "Consagrar-nos a Deus e sacrificar-nos inteiramente a serviço da juventude.", autor: "Madre Agathe Verhelle, fundadora das Religiosas da Instrução Cristã" },
    { texto: "Ser referência em Educação e expandir o Carisma Institucional para inspirar as pessoas e transformar o mundo.", autor: "Visão da Rede Damas Educacional" },
  ],

  /* Conexão com a nuvem (Firebase). Cole aqui o firebaseConfig do projeto.
     Enquanto estiver null, a plataforma funciona em MODO DEMONSTRAÇÃO:
     os dados ficam só no navegador de quem abriu e NÃO são compartilhados. */
  firebase: {
    apiKey: "AIzaSyChOOm6I0DjosN9AdhRNe0PXH16qxVq8CY",
    authDomain: "planejamento-madalena-sofia.firebaseapp.com",
    projectId: "planejamento-madalena-sofia",
    storageBucket: "planejamento-madalena-sofia.firebasestorage.app",
    messagingSenderId: "310012582768",
    appId: "1:310012582768:web:9e0e85457c343c8d69cdb5",
  },

  // Usado apenas no modo demonstração (sem Firebase). Senha: madalena2027
  senhaEquipeSha256: "174abb9c8bb9153b1ed9793b0b044c2655d4886e6e5e7d563f5fce1e425e0ac6",

  // Rodapé da tela de entrada
  desenvolvidoPor: "Desenvolvido por Gomes de Matos Consultoria",

  // Endereço público da plataforma (usado nos links dos e-mails e convites)
  urlPublica: "https://pedroarthur-del.github.io/estrat-giamadalena2027/",

  /* E-mails que entram como Administrador mesmo antes de existir cadastro
     (o primeiro acesso carrega o planejamento inicial). Precisam ser os
     mesmos da lista "adminsIniciais" no arquivo firestore.rules. */
  adminsIniciais: ["pedroarthur@gomesdematos.com.br", "arthurlidio@gomesdematos.com.br"],
};
