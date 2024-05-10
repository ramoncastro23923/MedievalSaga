
var dia_corrente_c = 0;
var pontos_dia = 0;
var total_pontos = 0;
var roi_total = 0;
var mensagem_inicial = 'Sprint Planning';
var sprint_corrente = 1;
var meta_sprint = '';

var pontos_simulacao = 0;
var mapPontosMelhoria = new Map();

var minutos_daily = 0.1;
var minutos_execucao = 0.1;

var mapHistoriasTreinamento = new Map();

const msgerForm = get(".msger-inputarea");
const msgerInput = get(".msger-input");
const msgerChat = get(".msger-chat");

const FACILITADOR = "Facilitador";
const ROBO = "Robo";
const SM = "Scrum Master";
const PO = "Product Owner";

const DAILY = 'Reunião Diária';
const EXECUCAO = 'Execução';

const BOT_MSGS = [
  "Hi, how are you?",
  "Ohh... I can't understand what you trying to say. Sorry!",
  "I like to play games... But I don't know how to play!",
  "Sorry if my answers are not relevant. :))",
  "I feel sleepy! :("
];

// inicio das mensagens
var mapMensagensFacilitador = new Map();
var mapMensagensRobo = new Map();

// dia 0 
mapMensagensFacilitador.set(1, {"mensagem":"Leia a mensagem inicial do jogo com atenção, pois a restrição informada é estratégica. "
  +"Em seguida clique no botão <span class='button-chat'>Fechar</span> da mensagem."
  +"<br><br>Use o botão <span><i class='fas fa-window-minimize'></i></span> "
  +"para minimizar este bate-papo para ler as mensagens e depois clique no botão "
  +"<span><i class='fas fa-window-maximize'></i></span> para restaurar. "
  +"Todo o treinamento será conduzido por este bate-papo.", 
"erro":"Por favor siga a instrução anterior."});

mapMensagensFacilitador.set(2, {"mensagem":"Antes de iniciar o jogo, é necessário que os Times definam quem vai ser o PO e o SM. "
  +"Qual destes papéis do Scrum você gostaria de exercitar nesta simulação? Digite o numero da opção desejada:"
  +"<br><br>1. Product Owner - responsável por garatir o melhor ROI para o Produto."
  +"<br>2. Scrum Master - O líder servidor que apoia o Time no uso das práticas ágeis, manter o foco e ajudar a remover os impedimentos."
  +"<br>3. Dev Team - O pessoal que vai colocar a mão na massa para construir valor para a Organização."
  +"<br><br>Obs.: Todos podem montar peças, mas os papéis de PO e SM devem focar nas suas atividades principais.",
  "erro":"Por favor siga a instrução anterior."});
   
function atualizarMap(){
  console.log('atualizarMap: ' + dia_corrente_c);

  mapMensagensFacilitador.set(3, {"mensagem":"Agora que temos os papéis definidos, é hora de começar o nosso jogo pra valer. "
  +"Vocês tem "+minutos_execucao+" minutos para realizar a primeira reunião de Planejamento. O PO mover as historias da "
  +"coluna 'Backlog' para a 'Sprint Backlog', priorizar por ordem de cima pra baixo e informar no chat a meta da Sprint "+sprint_corrente+". "
  +'</br></br>Digite 1 no chat para iniciar o tempo da "Sprint Planning".',
  "erro":"O valor informado no chat NÃO é uma opção válida. Por favor informe os números 1, 2  ou 3 no chat, conforme a lista abaixo: "
  +"<br><br>1. Product Owner - responsável por garatir o melhor ROI para o Produto."
  +"<br>2. Scrum Master - O líder servidor que apoia o Time no uso das práticas ágeis, manter o foco e ajudar a remover os impedimentos."
  +"<br>3. Dev Team - O pessoal que vai colocar a mão na massa para construir valor para a Organização."});

  mapMensagensFacilitador.set(4, {"mensagem":"Leia a mensagem que apareceu com atenção e "
  +"em seguida clique no botão <span class='button-chat'>Fechar</span> da mensagem. Inicie o planejamento, pois o tempo já está valendo!", 
  "erro":"Por favor siga a instrução anterior."});

  mapMensagensFacilitador.set(5, {"mensagem":"Arraste as histórias da coluna 'Backlog' para a 'Sprint Backlog' e escreva os números das histórias "
  +"que serão a meta da Sprint, somente os números e separados por virgula. Exemplo: 1, 2, 5", 
  "erro":"Por favor informe os números das histórias da meta da Sprint "+sprint_corrente+". Exemplo: 1, 2, 5"});

  mapMensagensFacilitador.set(6, {"mensagem":"Confirma a <b>meta da Sprint "+ sprint_corrente +"</b> como <b>Entregar as histórias ", 
  "erro":"A meta da Sprint "+sprint_corrente+" possui as histórias "});

  mapMensagensFacilitador.set(7, {"mensagem":"Agora arraste as histórias da coluna 'Sprint Backlog' para a coluna 'Fazer' "
    + "e arraste para a coluna 'Fazendo' as histórias que vão começar a montar no dia " +dia_corrente_c+ ". Digite 1 no chat para iniciar o tempo da 'Execução'."
    +"<br><br>As peças da coluna 'Fazendo' serão montadas automaticamente pela simulação, de acordo com os pontos do dia.",
    "erro":"O valor informado no chat NÃO é uma opção válida. Por favor digite o número 1 para iniciar a 'Execução'."});

  mapMensagensFacilitador.set(8, {"mensagem":"Seu Time tem "+minutos_execucao+" minutos para montar as peças das histórias da coluna 'Fazendo'. "
  + "O tempo já está valendo! Observe a montagem automática das peças do dia " +dia_corrente_c+ " e a atualização do "
  +"quadro Kanban caso seja concluída alguma história.<br><br>Serão enviadas novas instruções quando o tempo da Execução terminar.",
  "erro":"Ainda não é hora de novas ações. Observe a montagem automática das peças do dia " +dia_corrente_c+ " e a atualização do "
  +"quadro Kanban caso seja concluída alguma história.<br><br>Serão enviadas novas instruções quando o tempo da Execução terminar."});

  mapMensagensFacilitador.set(10, {"mensagem":"Fim do dia "+dia_corrente_c
  +". Digite 1 no chat para iniciar a reunião diária do dia "+(dia_corrente_c+1)+". "
  +"<br><br><b>Atenção:</b>Vocês terão "+minutos_daily+" minutos para falar da estratégia para atingir a meta da Sprint "+sprint_corrente+".",
  "erro":"O valor informado no chat NÃO é uma opção válida. Por favor digite o número 1 para iniciar a 'reunião diária' do dia "+(dia_corrente_c+1)+"."});

  mapMensagensFacilitador.set(11, {"mensagem":"Digite no chat o número da opção que define como o Time vai montar as "
  +pontos_dia+" peças no dia "+dia_corrente_c+". Sempre pensando em como atingir a meta da Sprint "+sprint_corrente+": "
  +"<br>1. Uma história Historia por vez (trabalho focado);"
  +"<br>2. Mais de uma História por vez (trabalho em parelelo).",
  "erro":"O valor informado no chat NÃO é uma opção válida. Por favor informe os números 1 ou 2 no chat, conforme a lista abaixo: "
  +"<br>1. Uma história Historia por vez (trabalho focado);"
  +"<br>2. Mais de uma História por vez (trabalho em parelelo)."});

  mapMensagensFacilitador.set(12, {"mensagem":"Arraste as histórias que devem ser montadas da coluna 'Fazer' "
    + "para a coluna 'Fazendo'. As peças das histórias da coluna 'Fazendo' serão montadas automaticamente pela simulação, de acordo com os pontos do dia."
    +"<br><br>Digite 1 no chat para iniciar a 'Execução'.",
    "erro":"O valor informado no chat NÃO é uma opção válida. Por favor digite o número 1 para iniciar a 'Execução'."});
}

// mapMensagensFacilitador.set(4, {"mensagem":"", "erro":""});


// mapMensagensRobo.set(1, '<a href="uol.com.br" onclick="proximoDia()>Clique aqui</a> para iniciar o tempo da "Sprint Planning".');

// fim das mensagens

filterInt = function (value) {
  return value.replace(/[^\d]+/g,'');
}


// Icons made by Freepik from www.flaticon.com
const PO_IMG = "../../assets/images/po.png";
const SM_IMG = "../../assets/images/sm.png";
const DEVTEAM_IMG = "../../assets/images/team.png";
const BOT_IMG = "https://image.flaticon.com/icons/svg/327/327779.svg";
const PERSON_IMG = "https://image.flaticon.com/icons/svg/145/145867.svg";
const BOT_NAME = "BOT";
const PERSON_NAME = "Facilitador";

msgerForm.addEventListener("submit", event => {
  event.preventDefault();

  const msgText = msgerInput.value;
  
  if (!msgText) return;

  appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText);
  msgerInput.value = "";

  botResponse();
});

var papel_escolhido = '';

function direcionarMensagem(papel_mensagem, numero_mensagem, mensagem_jogador){

  var direcao = 'left';
  var imagem = '';
  var mensagem = '';

    console.log('numero_mensagem: ' + numero_mensagem);


    msgerInput.value = "";

    var mensagem_completa = mensagem_jogador;

    mensagem_jogador = mensagem_jogador.replaceAll(" ", "");

    if(numero_mensagem == 1){
      /** 
       * DESABILITADO EM 09/11/2020 - VOU AVALIAR SE VOLTO ESTA ABERTURA
      */
      atualizarMap();

      // // se vier mensagem, eh erro
      // if(mensagem_jogador !== ''){
      //   appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(1).erro);
      //   return 1;
      // } else {
      //   appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(1).mensagem);
        return 2;
      // }
    } else if(numero_mensagem == 2){
      // se vier mensagem, eh erro
      if(mensagem_jogador !== ''){
        // jogador informou valor no chat e neste momento nao pode
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(2).erro);
        return 2;
      }
      else{
        // carrega a escolha do papel
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(2).mensagem);
        return 3;
      }
    }
    else if(numero_mensagem == 3){
    // verifico se existe uma questao com acao vindo do chat
      console.log('Papel escolhido antes: ' + papel_escolhido);

      // trata o papel escolhido e gera a mensagem de preparacao da planning
      mensagem_jogador = filterInt(mensagem_jogador);

      // se tiver sucesso, soma mais 1
      // papel_mensagem = papel_escolhido;

      if(mensagem_jogador == '1' || mensagem_jogador == '2' || mensagem_jogador == '3'){

        if(mensagem_jogador == '1'){
          papel_escolhido = PO;
        } else if(mensagem_jogador == '2'){
          papel_escolhido = SM;
        } else if(mensagem_jogador == '3'){
          papel_escolhido = 'DevTeam';
        } 

        appendMessage(papel_escolhido, retornaImg(papel_escolhido), 'right', mensagem_jogador);

        appendMessage(FACILITADOR, retornaImg(FACILITADOR), 'left', mapMensagensFacilitador.get(3).mensagem);

        return 4;
      } else {
        // ND = nao definido
        papel_escolhido = 'ND';

        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(3).erro);

        console.log('Papel nao escolhido');

        return 3;
      }
    } else if(numero_mensagem == 4){
      // se vier mensagem, eh erro
      if(mensagem_jogador == '1'){
        // registra a escolha do jogador e inicia a sprint planning
        appendMessage(papel_escolhido, retornaImg(papel_escolhido), 'right', mensagem_jogador);

        iniciarTempo(minutos_execucao*60);
        return 5;
      }
      else{
        // se usuario informar valor diferente de 1, exibe mensagem pedindo para seguir a instrução anterior
        appendMessage(FACILITADOR, retornaImg(FACILITADOR), direcao, mapMensagensFacilitador.get(4).erro);
        return 4;
      }
    } else if(numero_mensagem == 5){
      // se vier mensagem, eh erro
      if(mensagem_jogador !== ''){
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(4).erro);
        return 5;
      }
      else{
        // quando acaba o tempo da planning, exibe mensa
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(5).mensagem);
        console.log('meta primeira vez');
        
        return 6;
      }
    } 
    // else if(numero_mensagem == 1005){
    //   appendMessage(papel_escolhido, retornaImg(papel_escolhido), 'right', mensagem_jogador);

    //   // esta mensagem eh um retorno quando o usuario deseja informar novamente a meta da sprint
    //  // appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(5).mensagem);
    //   console.log('meta segunda vez');
    //   return 6;
    // } 
    else if(numero_mensagem == 6 || numero_mensagem == 1005){
      var hists_invalidas = '';
      var array_hists = [];

      console.log('Filter: ' + filterInt(mensagem_jogador));

      // se vier mensagem, eh erro
      if(mensagem_jogador !== '' && filterInt(mensagem_jogador) > 0){
        if(mensagem_jogador.includes(',')){
          array_hists = mensagem_jogador.split(",");

          console.log('array_hists: ' + array_hists);
          console.log('array_hists length: ' + array_hists.length);

          for(i = 0; i < array_hists.length; i++){
            console.log('Historia da meta: ' + array_hists[i]);

            if(!mapRoiHistorias.has("historia-"+array_hists[i])){
              if(hists_invalidas.length > 0){
                hists_invalidas = hists_invalidas + ', ';
              }

              hists_invalidas = hists_invalidas + array_hists[i];
            }
          }
        }
          
        if(hists_invalidas.length > 0){
          appendMessage(papel_escolhido, retornaImg(papel_escolhido), 'right', mensagem_jogador);

          appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(6).erro + "'" + hists_invalidas + "' inválidas. Por favor "
          +"informe os número das histórias separados por vírgula. Exemplo: 1, 2, 4");
          return 6;
        } else {
          appendMessage(papel_escolhido, retornaImg(papel_escolhido), 'right', mensagem_completa);

          var mensagem_check = "";

          if(validarMeta() == 0){
            mensagem_check = "<b>Atenção:</b> Percebi que você não puxou nenhuma história para a coluna 'Sprint Backlog'.<br><br>";
          }

          appendMessage(FACILITADOR, PERSON_IMG, direcao, mensagem_check + mapMensagensFacilitador.get(6).mensagem + mensagem_completa + "</b>?"
          +"<br><br>Digite 1 para confirmar e 2 para enviar uma nova meta.");

          mensagem_completa = '';

          return 7;
        }
      }
      else{
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(5).erro);
        
        return 6;
      }
    }
    else if(numero_mensagem == 7){
      

      appendMessage(papel_escolhido, retornaImg(papel_escolhido), 'right', mensagem_jogador);

      // se vier mensagem, eh erro
      if(mensagem_jogador == '1'){
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(7).mensagem);

        iniciarTempo(1);
        
        // direciona para a mensagem de inicio da execucao do dia
        return 8;
      }
      else{
        if(mensagem_jogador == '2'){
          appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(5).mensagem);
          return 1005;
        }
        else {
          appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(7).erro);
          return 7;
        }
      }
    } else if(numero_mensagem == 8){
      // execucao
      appendMessage(papel_escolhido, retornaImg(papel_escolhido), 'right', mensagem_jogador);

      // se vier mensagem, eh erro
      if(mensagem_jogador == '1'){
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(8).mensagem);

        document.getElementById('info1').innerHTML = EXECUCAO;

        iniciarTempo(minutos_execucao*60);
        
        return 9;
      }
      else{
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(8).erro);
        return 8;
      }
    }
    else if(numero_mensagem == 9){
      appendMessage(papel_escolhido, retornaImg(papel_escolhido), 'right', mensagem_jogador);

      // se vier mensagem, eh erro
      if(mensagem_jogador !== ''){
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(8).erro);
        return 9;
      }
    }
    else if(numero_mensagem == 10){
      // Fim do dia 1. Digite 1 no chat para iniciar a reunião diária do dia 2.
      // fim da execucao
      atualizarMap();

      // se vier mensagem, eh erro
      if(mensagem_jogador == ''){
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(10).mensagem);

        return 11;
      }
    }
    else if(numero_mensagem == 11){
      // Digite no chat o número da opção que define como o Time vai montar as 52
      appendMessage(papel_escolhido, retornaImg(papel_escolhido), 'right', mensagem_jogador);
      
      // daily
      atualizarMap();

      // se vier mensagem, eh erro
      if(mensagem_jogador !== '1'){
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(10).erro);

        return 11;
      } else {
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(11).mensagem);

        console.log('Numero msg: ' + numero_mensagem);

        carregarDados(DAILY);

        iniciarTempo(minutos_daily*60);

        return 12;
      }
    }
    else if(numero_mensagem == 12){
      appendMessage(papel_escolhido, retornaImg(papel_escolhido), 'right', mensagem_jogador);

      fecharModalDaily();

      // se vier mensagem, eh erro
      if(mensagem_jogador == '1'){
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(12).mensagem);

        // somo 10 pontos porque o jogador escolheu trabalhar com foco
        pontos_simulacao = pontos_simulacao + 10;

        return 13;
      }
      else{
        if(mensagem_jogador == '2'){
          appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(12).mensagem);

          // registro que o jogador pode melhorar na proxima simulacao se trabalhar focado
          mapPontosMelhoria.set('Foco', 'Realize execuções montando uma história por vez, o foco ajuda a aumentar a produtividade do Time.');

          return 13;
        }
        else {
          appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(10).erro);
          return 12;
        }
      }
    }
    else if(numero_mensagem == 13){
      // atualizarMap();

      appendMessage(papel_escolhido, retornaImg(papel_escolhido), 'right', mensagem_jogador);

      if(mensagem_jogador == '1' || mensagem_jogador == '2'){
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(8).mensagem);

        document.getElementById('info1').innerHTML = EXECUCAO;

        iniciarTempo(minutos_execucao*60);

        if(mensagem_jogador == '1'){
          // seta perda de 10%
          console.log('perda de 10%');

          // chama a funcao para montar pecas considerando o (total de pecas do dia - 10%)
  
        } else if(mensagem_jogador == '2'){
          // seta perda de 10%
          console.log('perda de 20%');
        
          // chama a funcao para montar pecas considerando o (total de pecas do dia - 20%)

        }

        return 15;
      } else{
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(8).erro);
        return 14;
      }
    }
    else if(numero_mensagem == 14){
      // fim da execucao
      console.log('fim da execucao');

      appendMessage(papel_escolhido, retornaImg(papel_escolhido), 'right', mensagem_jogador);

      // se vier mensagem, eh erro
      if(mensagem_jogador !== ''){
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(8).erro);

        return 14;
      }
    }
    else if(numero_mensagem == 15){
      console.log('erro do fim da execucao');
      appendMessage(papel_escolhido, retornaImg(papel_escolhido), 'right', mensagem_jogador);

      // se vier mensagem, eh erro
      if(mensagem_jogador !== ''){
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(8).erro);
        return 15;
      }
    }
    // preparacao para o dia 3
    else if(numero_mensagem == 16){
      // fim da execucao do dia 2
      atualizarMap();

      console.log('fim da execucao');

      // se vier mensagem, eh erro
      if(mensagem_jogador == ''){
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(10).mensagem);

        return 17;
      }
    }
    // inicio dia 3 - decisao da daily
    else if(numero_mensagem == 17){
      console.log('iniciar daily');
      // daily
      if(mensagem_jogador !== '1'){
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(10).erro);

        return 17;
      } else {
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(11).mensagem);

        console.log('Numero msg: ' + numero_mensagem);

        carregarDados(DAILY);

        iniciarTempo(minutos_daily*60);

        return 18;
      }
    }
    else if(numero_mensagem == 18){
      // aguardando inicio do dia 3
      appendMessage(papel_escolhido, retornaImg(papel_escolhido), 'right', mensagem_jogador);

      fecharModalDaily();

      // se vier mensagem, eh erro
      if(mensagem_jogador == '1'){
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(12).mensagem);

        // somo 10 pontos porque o jogador escolheu trabalhar com foco
        pontos_simulacao = pontos_simulacao + 10;

        return 19;
      }
      else{
        if(mensagem_jogador == '2'){
          appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(12).mensagem);

          // registro que o jogador pode melhorar na proxima simulacao se trabalhar focado
          mapPontosMelhoria.set('Foco', 'Realize execuções montando uma história por vez, o foco ajuda a aumentar a produtividade do Time.');

          return 19;
        }
        else {
          appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(10).erro);
          return 18;
        }
      }
    }
    else if(numero_mensagem == 19){
      // atualizarMap();
      // inicio da execucao do dia 3

      appendMessage(papel_escolhido, retornaImg(papel_escolhido), 'right', mensagem_jogador);

      if(mensagem_jogador == '1' || mensagem_jogador == '2'){
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(8).mensagem);

        document.getElementById('info1').innerHTML = EXECUCAO;

        iniciarTempo(minutos_execucao*60);

        if(mensagem_jogador == '1'){
          // seta perda de 10%
          console.log('perda de 10%');

          // chama a funcao para montar pecas considerando o (total de pecas do dia - 10%)
  
        } else if(mensagem_jogador == '2'){
          // seta perda de 10%
          console.log('perda de 20%');
        
          // chama a funcao para montar pecas considerando o (total de pecas do dia - 20%)

        }

        return 20;
      } else{
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(8).erro);
        return 17;
      }
    }
    else if(numero_mensagem == 20){
      // fim da execucao e retorno automatico
      appendMessage(papel_escolhido, retornaImg(papel_escolhido), 'right', mensagem_jogador);

      // se vier mensagem, eh erro
      if(mensagem_jogador !== ''){
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(8).erro);

        return 20;
      }
    }
    // preparacao para o dia 4
    else if(numero_mensagem == 21){
      // fim da execucao do dia 3
      atualizarMap();

      // se vier mensagem, eh erro
      if(mensagem_jogador == ''){
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(10).mensagem);

        return 22;
      }
    }
    else if(numero_mensagem == 22){
      // aguardando inicio do dia 3
      appendMessage(papel_escolhido, retornaImg(papel_escolhido), 'right', mensagem_jogador);

      fecharModalDaily();

      // se vier mensagem, eh erro
      if(mensagem_jogador == '1'){
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(12).mensagem);

        // somo 10 pontos porque o jogador escolheu trabalhar com foco
        pontos_simulacao = pontos_simulacao + 10;

        return 23;
      }
      else{
        if(mensagem_jogador == '2'){
          appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(12).mensagem);

          // registro que o jogador pode melhorar na proxima simulacao se trabalhar focado
          mapPontosMelhoria.set('Foco', 'Realize execuções montando uma história por vez, o foco ajuda a aumentar a produtividade do Time.');

          return 23;
        }
        else {
          appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(10).erro);
          return 22;
        }
      }
    }
    else if(numero_mensagem == 23){
      // atualizarMap();

      appendMessage(papel_escolhido, retornaImg(papel_escolhido), 'right', mensagem_jogador);

      if(mensagem_jogador == '1' || mensagem_jogador == '2'){
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(8).mensagem);

        document.getElementById('info1').innerHTML = EXECUCAO;

        iniciarTempo(minutos_execucao*60);

        if(mensagem_jogador == '1'){
          // seta perda de 10%
          console.log('perda de 10%');

          // chama a funcao para montar pecas considerando o (total de pecas do dia - 10%)
  
        } else if(mensagem_jogador == '2'){
          // seta perda de 10%
          console.log('perda de 20%');
        
          // chama a funcao para montar pecas considerando o (total de pecas do dia - 20%)

        }

        return 25;
      } else{
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(8).erro);
        return 23;
      }
    }
    else if(numero_mensagem == 24){
      // fim da execucao
      console.log('fim da execucao');

      appendMessage(papel_escolhido, retornaImg(papel_escolhido), 'right', mensagem_jogador);

      // se vier mensagem, eh erro
      if(mensagem_jogador !== ''){
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(8).erro);

        return 24;
      }
    }
    else if(numero_mensagem == 25){
      console.log('erro do fim da execucao');
      appendMessage(papel_escolhido, retornaImg(papel_escolhido), 'right', mensagem_jogador);

      // se vier mensagem, eh erro
      if(mensagem_jogador !== ''){
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(8).erro);
        return 25;
      }
    }
    // preparacao para o dia 3
    else if(numero_mensagem == 26){
      // fim da execucao do dia 2
      atualizarMap();

      console.log('fim da execucao');

      // se vier mensagem, eh erro
      if(mensagem_jogador == ''){
        appendMessage(FACILITADOR, PERSON_IMG, direcao, mapMensagensFacilitador.get(10).mensagem);

        return 27;
      }
    }
   










  

  // define o lado que aparece a mensagem do jogador
  if(papel_escolhido == papel_mensagem){
    direcao = 'right';
  }

  // // se for uma mensagem do chat do jogador, o sistema vai pegar a mensagem do chat ao invez de buscar 
  // // nos maps de mensagens

  


  appendMessage(papel_mensagem, imagem, direcao, mensagem);
}

function retornaImg(papel_mensagem){
// define a imagem que vai aparecer quando houver uma mensagem no chat
  if(papel_mensagem == PO){
    return imagem = PO_IMG;
  }
  else if(papel_mensagem == SM){
    return imagem = SM_IMG;
  }
  else if(papel_mensagem == 'DevTeam'){
    return imagem = DEVTEAM_IMG;
  }
  else if(papel_mensagem == ROBO){
    return imagem = BOT_IMG;
  }
  else {
    return imagem = PERSON_IMG;
  }
}

function appendMessage(name, img, side, text) {
  
  const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-img" style="background-image: url(${img})"></div>

      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${name}</div>
          <div class="msg-info-time">${formatDate(new Date())}</div>
        </div>

        <div class="msg-text">${text}</div>
      </div>
    </div>
  `;

  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  msgerChat.scrollTop += 500;
}

function botResponse() {
  const r = random(0, BOT_MSGS.length - 1);
  const msgText = BOT_MSGS[r];
  const delay = msgText.split(" ").length * 100;

  setTimeout(() => {
    appendMessage(BOT_NAME, BOT_IMG, "left", msgText);
  }, delay);
}

// Utils
function get(selector, root = document) {
  return root.querySelector(selector);
}

function formatDate(date) {
  const h = "0" + date.getHours();
  const m = "0" + date.getMinutes();

  return `${h.slice(-2)}:${m.slice(-2)}`;
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function proximoDia(){
  dia_corrente_c++;

  if(dia_corrente_c > 5 && dia_corrente_c < 11){
    sprint_corrente = 2;
  } else if(dia_corrente_c > 10 && dia_corrente_c < 16){
    sprint_corrente = 3;
  }
  
  document.getElementById('div_dia').innerHTML = dia_corrente_c;
}

function carregarDados(event){
  dia_corrente_c++;

  console.log('CarregarDados: ' + dia_corrente_c);

  if(event == ''){
    event = mensagem_inicial;
  }

  if(dia_corrente_c > 5 && dia_corrente_c < 11){
    sprint_corrente = 2;
  } else if(dia_corrente_c > 10 && dia_corrente_c < 16){
    sprint_corrente = 3;
  }

  document.getElementById('div_dia').innerHTML = dia_corrente_c;

  pontos_dia = 0;

  for(var j=0; j <= 5; j++) {
    pontos_dia = pontos_dia + (7 + Math.floor(((12 + 1) - 7) * Math.random()));
  }

  total_pontos = total_pontos + pontos_dia;

  document.getElementById('div_total_dia').innerHTML = pontos_dia;
  document.getElementById('div_total_geral').innerHTML = total_pontos;

  if(dia_corrente_c > 1){
    roi_total = calcularROI();
  }

  document.getElementById('div_roi_total').innerHTML = '$ ' + roi_total;

  document.getElementById('info1').innerHTML = event;


}

function controleKanban(historia, atual, destino){

  console.log(historia +' - '+atual+' - '+destino);
  //return;

  if(atual !== destino){
    var inicio = '';
    var fim = '';
    var passeio = 'n';

    // soh atualizo o dia inicio e fim se ainda nao existir valor no map para a historia
    if(mapHistoriasTreinamento.has(dia_corrente_c +'-'+historia)){
      inicio = mapHistoriasTreinamento.get(dia_corrente_c +'-'+historia).dia_inicio;
      fim = mapHistoriasTreinamento.get(dia_corrente_c +'-'+historia).dia_fim;
    }

    if((atual == 'div-backlog' && destino == 'div-fazer') || (atual == 'div-sprint-backlog' && destino == 'div-fazer')
      || (atual == 'div-backlog' && destino == 'div-fazendo') || (atual == 'div-sprint-backlog' && destino == 'div-fazendo')){
      inicio = dia_corrente_c;
    }
    else if((atual == 'div-backlog' && destino == 'div-feito') || (atual == 'div-sprint-backlog' && destino == 'div-feito')){
      inicio = dia_corrente_c;
      fim = dia_corrente_c;
    }
    else if((atual == 'div-fazer' && destino == 'div-feito') || (atual == 'div-fazendo' && destino == 'div-feito')){
      fim = dia_corrente_c;
    }

    if(historia.replace('historia-', '') > 12){
      passeio = 's';
    }

    // key: dia_corrente_c-historia
    mapHistoriasTreinamento.set(dia_corrente_c +'-'+historia, {historia: historia, 'coluna_kanban': destino, 'dia_inicio': inicio, 
      'dia_fim': fim, 'passeio': passeio});

      for (var [key, value] of mapHistoriasTreinamento) {
        console.log('Key: ' + key + ' - value: ' + value.historia +' - '+ value.dia_inicio  +' - '+ value.dia_fim +' - '+ value.coluna_kanban);
      }
  }

  calcularROI();
  
}

function validarMeta(){
  var contador = 0;

  for (var [key, value] of mapHistoriasTreinamento) {
    if(value.coluna_kanban == 'div-sprint-backlog'){
      contador++;
    }
  }

  return contador;
}

function calcularROI(){
  var total_roi = 0;

  // for (var [key, value] of mapRoiHistorias) {
  //   console.log('ROI Key-----: ' + key + " - Value: " + value);
  // }

  for (var [key, value] of mapHistoriasTreinamento) {
    if(value.coluna_kanban == 'div-feito'){
      
      for(i = 1; i <= dia_corrente_c; i++){

        console.log('ROI Key: ' + key + " - Value: " + value.historia + " - Fim: " 
          + value.dia_fim + " - ROI: " + mapRoiHistorias.get(value.historia));

        // ROI Key: 1-historia-1 - Value: historia-1 - Fim: 1 - ROI: 180

        // se fim == i entao soma o roi
        if(value.dia_fim == i){
          total_roi = total_roi + mapRoiHistorias.get(value.historia);

          console.log('ROI Key: ' + key + " - Value: " + " - Dia: " + i + " - ROI: " + mapRoiHistorias.get(value.historia));
        }

        console.log('Total ROI: ' + key + " - Value: " + total_roi);

      }
    } 
  }

  return total_roi;
}



function pontuar(){
  pontos_dia = 7 + Math.floor(((12 + 1) - 7) * Math.random());

  total_pontos = total_pontos + pontos_dia;

  document.getElementById('div_total_dia').innerHTML = pontos_dia;
  document.getElementById('div_total_geral').innerHTML = total_pontos;

  return pontos_dia;
}