
var dia_corrente_c = 0;
var pontos_dia = 0;
var total_pontos = 0;
var roi_total = 0;
var mensagem_inicial = 'Início';

var passo = '';
var pontos_jogador = 0;
var qtde_execu_paralelo = 0;
var qtde_meta_atingida = 0;
var qtde_sprints_simuladas = 2;
var total_pontos_ajuste = 0;
var total_dias_simulados = 10;

var total_pecas_montadas = 0;

var pontos_simulacao = 0;
var mapPontosMelhoria = new Map();
var mapHistoriasMontadas = new Map();

var metaCorrente = '';
var pecent_ajuste_exec = 0.9;

var minutos_planning = 0.5;
var minutos_execucao = 0.5;
var minutos_daily = 0.2;
var minutos_review = 0.4;
var minutos_retro = 0.2;

var mapHistoriasTreinamento = new Map();
var mapRoiHistoriasL = new Map();
var mapPasseiosErrados = new Map();

const msgerForm = get(".msger-inputarea");
const msgerInput = get(".msger-input");
const msgerChat = get(".msger-chat");

const FACILITADOR = "Facilitador";
const ROBO = "Robo";
const SM = "Scrum Master";
const PO = "Product Owner";

const PLANNING = 'Sprint Planning';
const DAILY = 'Reunião Diária';
const EXECUCAO = 'Execução';
const REVIEW = 'Sprint Review';
const RETRO = 'Sprint Retrospective';

filterInt = function (value) {
  return value.replace(/[^\d]+/g,'');
}

// Icons made by Freepik from www.flaticon.com
const PO_IMG = "../../assets/images/po.png";
const SM_IMG = "../../assets/images/sm.png";
const DEVELOPERS_IMG = "../../assets/images/team.png";
const BOT_IMG = "../../assets/images/robot.png";
const PERSON_IMG = "../../assets/images/facilitator.png";
const BOT_NAME = "BOT";
const PERSON_NAME = "Facilitador";

msgerForm.addEventListener("submit", event => {
  event.preventDefault();

  const msgText = msgerInput.value;
  
  if (!msgText) return;

  appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText);
  msgerInput.value = "";
});

var papel_escolhido = '';

function direcionarMensagem(mensagem_jogador){

  if(passo == 'fechado'){
    return;
  }

  var direcao = 'left';
  var imagem = '';
  var mensagem = '';

  var evento = document.getElementById('info1').innerHTML;

  document.getElementsByClassName("msger-input")[0].value = '';
  document.getElementsByClassName("msger-input")[0].focus();

  console.log('Evento: ' + evento);
  console.log('Passo: ' + passo);

  if(mensagem_jogador !== ''){
    if(papel_escolhido == ''){
      appendMessage(ROBO, retornaImg(ROBO), 'right', mensagem_jogador);
    } else {
      appendMessage(papel_escolhido, retornaImg(papel_escolhido), 'right', mensagem_jogador);
    }
  }
	
  var type = 'POST';
  
  var jsonMap = '';

  var meta_corrente = '';

  if(passo == 'aguardando-meta' || passo == 'validar-meta-atingida'){
    meta_corrente = metaCorrente;
    console.log('Enviar meta ajax: ' + metaCorrente + ' - mapHistoriasTreinamento: ' + mapHistoriasTreinamento.size);

    jsonMap = JSON.stringify([...mapHistoriasTreinamento]);

    // console.log('Enviar meta json: ' + jsonMap);

    try {
      jsonData = JSON.parse(jsonMap);

      for (var i = 0; i < jsonData.length; i++) {
        if(jsonData[i][1].coluna_kanban == 'div-feito'){
           console.log('jsonDatax: ' + jsonData[i][1].coluna_kanban);
        }
     }
    } catch(e) {
        console.log('Erro parse: ' + e);
    }
  }

	$.ajax({
		url: "/home/direcionar_mensagem",
		crossDomain: true,
		//dataType: "json",
		type: type,
		timeout: 20000,
		//async: (async === undefined ? true : async),
		beforeSend: function() {
			//$("#" + formName).html(preloaderAzul);
		},
		retryMax: (type == "POST" ? 0 : 5),
    data: { 
          mensagem_jogador: mensagem_jogador, 
          evento: evento, 
          passo: passo, 
          papel_escolhido: papel_escolhido, 
          mapHistoriasTreinamento: jsonMap, 
          dia_corrente_c: dia_corrente_c, 
          meta: meta_corrente, 
          externo: acesso
			},
	}).done(function(response, status, xhr) {
    console.log('Resposta msg ajax:' + " - passo: " + response.passo 
      + " - papel_escolhido: " + response.papel_escolhido);

    passo = response.passo;

    if(passo == 'finalizar-jogo'){
      passo = 'fechado';
      consolidar();
      return;
    }

    if(papel_escolhido == '' && response.papel_escolhido !== ''){
      papel_escolhido = response.papel_escolhido;
    }
    
    // se tiver evento diferente de vazio, atualizo o info1
    if(response.label_evento !== ''){
      document.getElementById('info1').innerHTML = response.label_evento;
    }

    if(response.carregar_dados !== ''){
      response.mensagem_retorno = carregarDados(response.carregar_dados, response.mensagem_retorno);
    }

    // se mensagem_retorno vier diferente de vazio, escrevo no chat como FACILITADOR
    if(response.mensagem_retorno !== ''){
      appendMessage(FACILITADOR, PERSON_IMG, direcao, response.mensagem_retorno);
    }

    if(response.tempo_evento > 0){
      iniciarTempo(response.tempo_evento);
    }

    if(passo == 'concluiu-daily'){
      console.log('Dia: '+ dia_corrente_c +' - Passo: ' + passo + ' - pecent_ajuste_exec: ' + response.pecent_ajuste_exec);

      pecent_ajuste_exec = response.pecent_ajuste_exec;
    }

    if(response.execucao_paralelo > 0){
      console.log('Passo: ' + passo + ' - qtde_execu_paralelo: ' + response.execucao_paralelo);

      qtde_execu_paralelo = qtde_execu_paralelo + parseInt(response.execucao_paralelo);
    }

    if(response.montar_pecas){
      ordenarHistoriasMontar(pecent_ajuste_exec);
    }

    //console.log('response.carregar_dados: ' + response.carregar_dados);

    if(response.somar_pontos > 0){
      pontos_jogador = pontos_jogador + response.somar_pontos;
    }

    qtde_meta_atingida = qtde_meta_atingida + response.total_meta_atingida;

    if(response.meta_sprint !== ''){
      metaCorrente = response.meta_sprint;
      console.log('Meta dia ' + dia_corrente_c + ': ' + response.meta_sprint);
    }

    if(passo == 'info-inicial'){
      carregarMapRoi(response.mapRoi);
    }

    // if(dia_corrente_c == 2){
    //   var tot = totalizarHistoria();

    //   sleep(1000);

    //   console.log('Peças montadas evans: ' + tot);
    // }

	}).fail(function(xhr, textStatus, error) {
		console.log("Falhou: " + error);
	});
}

function retornaImg(papel_mensagem){
  // define a imagem que vai aparecer quando houver uma mensagem no chat
  if(papel_mensagem == PO){
    return imagem = PO_IMG;
  }
  else if(papel_mensagem == SM){
    return imagem = SM_IMG;
  }
  else if(papel_mensagem == 'Developers'){
    return imagem = DEVELOPERS_IMG;
  }
  else if(papel_mensagem == ROBO){
    return imagem = BOT_IMG;
  }
  else {
    return imagem = PERSON_IMG;
  }
}

function appendMessage(name, img, side, text) {

  if(name == FACILITADOR){
    var mp3Source1 = '<source src="/audio/new-message.mp3" type="audio/mpeg">';
		document.getElementById("div-som-chat").innerHTML='<audio autoplay="autoplay">' + mp3Source1 + '</audio>';
  }
  
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

function carregarDados(event, mensagem_retorno){
  dia_corrente_c++;

  console.log('CarregarDados: ' + dia_corrente_c);

  if(event == ''){
    event = mensagem_inicial;
  }

  document.getElementById('div_dia').innerHTML = dia_corrente_c;

  pontos_dia = 0;

  if(dia_corrente_c !== 5 && dia_corrente_c !== 10){
    for(var j=0; j <= 5; j++) {
      pontos_dia = pontos_dia + (7 + Math.floor(((12 + 1) - 7) * Math.random()));
    }
  }
  
  mensagem_retorno = mensagem_retorno.replace('%pontos_dia%', pontos_dia);

  total_pontos = total_pontos + pontos_dia;

  document.getElementById('div_total_dia').innerHTML = pontos_dia;
  document.getElementById('div_total_geral').innerHTML = total_pontos;

  if(dia_corrente_c > 1){
    roi_total = calcularROI();
  }

  document.getElementById('div_roi_total').innerHTML = '$ ' + roi_total;

  document.getElementById('info1').innerHTML = event;

  return mensagem_retorno;

}

function controleKanban(historia, atual, destino){

  console.log(historia +' - '+atual+' - '+destino);

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
        console.log('*** mapHistoriasTreinamento -> Key: ' + key + ' - value: ' + value.historia +' - '+ value.dia_inicio  +' - '+ value.dia_fim +' - '+ value.coluna_kanban);
      }
  }

  calcularROI();
  
}

function calcularROI(){
  var total_roi = 0;

  // for (var [key, value] of mapRoiHistoriasL) {
  //   console.log('ROI Key-----: ' + key + " - Value: " + value);
  // }

  for (var [key, value] of mapHistoriasTreinamento) {
    if(value.coluna_kanban == 'div-feito'){
      
      for(i = 1; i <= dia_corrente_c; i++){

        console.log('ROI Key: ' + key + " - Value: " + value.historia + " - Fim: " 
          + value.dia_fim + " - ROI: " + mapRoiHistoriasL.get(value.historia) + " - i: " + i);

        // ROI Key: 1-historia-1 - Value: historia-1 - Fim: 1 - ROI: 180

        // se fim == i entao soma o roi
        if(value.dia_fim <= i){

          if(value.passeio == 's'){
            if(i < 6){
              total_roi = total_roi;
              mapPasseiosErrados.set(value.historia, 1);

              console.log("Passeio antes da hora ROI: " + value.historia + " - Fim: " + value.dia_fim + " - ROI: " + mapRoiHistoriasL.get(value.historia) + " - i: " + i);
            } else {
              total_roi = total_roi + mapRoiHistoriasL.get(value.historia);
              console.log("Passeio gerando ROI: " + value.historia + " - Fim: " + value.dia_fim + " - ROI: " + mapRoiHistoriasL.get(value.historia) + " - i: " + i);
            }
          }
          else {
              total_roi = total_roi + mapRoiHistoriasL.get(value.historia);
              console.log("Historia normal ROI: " + value.historia + " - Fim: " + value.dia_fim + " - ROI: " + mapRoiHistoriasL.get(value.historia) + " - i: " + i);
          }
        }

        console.log('Total ROI: ' + key + " - Value: " + total_roi);

      }
    } 
  }

  return total_roi;
}

function ordenarHistoriasMontar(pecent_ajuste_exec){

  var mapHistFazendo = new Map();
  var qtde_hist_fazendo = 0;

  console.log('Chegou no ordenarHist...: ' + mapHistoriasTreinamento.size);

  for (var [key, value] of mapHistoriasTreinamento) {
    if(value.coluna_kanban == 'div-fazendo'){
      mapHistFazendo.set(value.historia.replace('historia-', 'h'), document.getElementById(value.historia).offsetTop)

      console.log('Adicionando historia ' +(value.historia.replace('historia-', '')).replaceAll(' ', '')+ ' como fazendo.');

      qtde_hist_fazendo++;
    }
  }

  const map2 = new Map([...mapHistFazendo.entries()].sort((a, b) => a[1] - b[1]));

  if(qtde_hist_fazendo > 0){
    pontos_jogador = pontos_jogador + 5;
  }

  var pecas_restantes = Math.round(pontos_dia * pecent_ajuste_exec);

  total_pontos_ajuste = total_pontos_ajuste + pecas_restantes;

  // console.log('Dia: '+ dia_corrente_c + ' - Peças restantes: ' + pecas_restantes + ' - Total dia: ' + pontos_dia + ' - % ajuste: ' + pecent_ajuste_exec);
  
  for (var [keyp, valuep] of map2) {
    // console.log('Hist: ' + keyp + ' - Top: ' + valuep);

    for (const [key,value] of mpm){
      // console.log('key: ' + key + ' - keyp: ' + keyp);

      if(key.includes(keyp+'-') && pecas_restantes > 0){
        // posiciono a peca na tela
        document.getElementById('0000-1-'+key).style.left = value.x;
        document.getElementById('0000-1-'+key).style.top = value.y;

        mapHistoriasMontadas.set(key, '');
        total_pecas_montadas++;

        // removo do mpm
        mpm.delete(key);

        pecas_restantes--;

        if(pecas_restantes == 0){
          break;
        }
      }

      if(pecas_restantes == 0){
        break;
      }
    }
  }

  console.log('Map atualizado: ' + mpm.size);
}

function consolidar(){


  var total_pecas_entregues = totalizarHistoria();

  sleep(2000);

  // agora vejo o percentual de aproveitamento da montagem de pecas
  var aproveitamento = Math.round( (total_pecas_entregues * 100) / total_pontos );

  var mensagem = "<b>Resultado da simulação:</b> <br><br>";

  console.log('total_pontos: ' + total_pontos);
  console.log('total_pontos_ajuste: ' + total_pontos_ajuste);
  console.log('pontos_jogador: ' + pontos_jogador);
  console.log('aproveitamento: ' + aproveitamento);
  console.log('qtde_meta_atingida: ' + qtde_meta_atingida);
  console.log('qtde_execu_paralelo: ' + qtde_execu_paralelo);

  mensagem = mensagem + "Total de peças sorteadas: " + total_pontos;
  mensagem = mensagem + "<br>Total de peças montadas: " + total_pecas_montadas;
  mensagem = mensagem + "<br>Total de peças em histórias prontas: " + total_pecas_entregues;
  mensagem = mensagem + "<br>Eficiencia (Total peças em histórias prontas / Total peças sorteadas): " + aproveitamento + "%";

  // contei pelo menos 128 pontos se o jogador colocar 2 historias por meta e se nao paralelizar nenhuma execucao e se bater as metas
  if(pontos_jogador < 100){
    mensagem = mensagem + "<br><br>Você jogou bem, mas precisa melhorar, pois teve um desempenho abaixo de 80% de aproveitamento. Seguem "
      +"alguns pontos que podem ser melhorados na próxima simulação: ";

    if(qtde_meta_atingida < 2){
      mensagem = mensagem + "<br> - Seu Time atingiu menos de 2 metas no jogo;";
    }

    if(aproveitamento < 80){
      mensagem = mensagem + "<br> - Você pode ter esquecido de posicionar historias suficientes para aproveitar toda a pontuação "
      +"do dia na coluna 'Fazendo' antes de iniciar a 'Execução';";
    }

    if(qtde_execu_paralelo > 4){
      mensagem = mensagem + "<br> - Você escolheu trabalhar em paralelo várias vezes nesta simulação. Mesmo com o trabalho focado,"
        +" ainda temos uma perda de 10% nesta simulação. No cenário de trabalho em paralelo, esta perda é de 20%.";
    }

    if(mapPasseiosErrados.size > 0){
      mensagem = mensagem + "<br> - Você entregou passeios antes da hora, gerando desperdício de capacity, pois passeios somente "+
        "geram ROI a partir do dia 6, conforme aviso no início do jogo.";
    }

  }
  else {
    mensagem = mensagem + "<br><br>Parabéns! Você jogou muito bem e atingiu um ótimo aproveitamento.";
  }

  appendMessage(FACILITADOR, PERSON_IMG, 'left', mensagem);
}

function carregarMapRoi(mapRoi){
  // console.log('Recebendo json: ' + JSON.parse(mapRoi));

  try {
    jsonData = JSON.parse(mapRoi);

    for (var i = 0; i < jsonData.length; i++) {
      // console.log('jsonData u: ' + jsonData[i][0] + ' - ' + jsonData[i][1]);
      
      mapRoiHistoriasL.set(jsonData[i][0], jsonData[i][1]);
   }
  } catch(e) {
      console.log('Erro parse mapRoi: ' + e);
  }
}

function totalizarHistoria(){
  
  var historia_montada = '';
  var total_pecas_entregues = 0;

 for (var [keyx, valuex] of mapHistoriasTreinamento) {

   if(valuex.coluna_kanban == 'div-feito'){
     for (const [key,value] of mapHistoriasMontadas){
       historia_montada = valuex.historia.replace('historia-','h');
       historia_montada = historia_montada + '-';

      //  console.log('valuex.historia xx: ' + valuex.historia + ' - key: ' + key);

       if( key.includes( historia_montada ) ){
         total_pecas_entregues++;
       }
     }
   }
 } 

 return total_pecas_entregues;
}

function validarHistoriaEntregue(historia){
  var entregue = true;

  historia = historia.replace('historia-','h');
  historia = historia + '-';

  for (const [key,value] of mpm){
    if( key.includes( historia ) ){
      entregue = false;
    }
  }

  return entregue;
}