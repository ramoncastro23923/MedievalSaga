
//--------------------------------------------- external user simulate page call------------------------------------------------------
exports.acessar = function(req, res){
   message = '';

   console.log('Acesso simulation: ' + req.method);

   if(req.method == "POST"){
      var post = req.body;
      var email = post.email;

      // TODO: gravar e-mail numa tabela de leads que se interessaram e jogaram um pouco com o FREEMIUM

      res.render('game.ejs', {simulacao: 'true', time_email: '1', codigo_jogo: '0000', id_jogo: 0, 
         email_jogador: email, externo: 'pode-crer'});
      
   } else {
      console.log("caiu no GET da tela de Simulation FREEMIUM");

      res.render('simulation');
   }
};


//-----------------------------------------------game simulate page functionality----------------------------------------------

// const { carregar_imagens } = require("./game");

           
exports.carregar_simulacao = function(req, res){
           
   var user =  req.session.user,
   userId = req.session.userId;
   console.log('game_user='+userId);
   
   // valida se o usuario continua logado
   if(userId == null){
      res.redirect("/login");
      return;
   }

   // envio o resultado da consulta para a pagina .ejs mapeada abaixo com o array do resultado
   res.render('game.ejs', {simulacao: 'true', time_email: '1', codigo_jogo: '0000', id_jogo: 0, 
      email_jogador: req.session.email, externo: 'nao-meu-lindo'});
};


//---------------------------------------------direcionar mensagem pro chatbot ------------------------------------------------------

const PLANNING = 'Sprint Planning';
const DAILY = 'Reunião Diária';
const EXECUCAO = 'Execução';
const REVIEW = 'Sprint Review';
const RETRO = 'Sprint Retrospective';

var minutos_planning = 0.4;
var minutos_execucao = 0.3;
var minutos_daily = 0.2;
var minutos_review = 0.4;
var minutos_retro = 0.2;

const FACILITADOR = "Facilitador";
const ROBO = "Robo";
const SM = "Scrum Master";
const PO = "Product Owner";

// var dia_corrente_c = 0;

var mapRoiHistorias = new Map();


exports.direcionar_mensagem = function(req, res){ 

   console.log('*** '+new Date()+' - Chegou no metodo direcionar_mensagem');

   let { mensagem_jogador, evento, passo, papel_escolhido, mapHistoriasTreinamento, 
      dia_corrente_c, meta, externo } = req.body;

   console.log('*** '+new Date()+' - Externo: ' + externo);

   if(mapRoiHistorias.size == 0){
      console.log('*** '+new Date()+' - Vai carregar mapHistorias para a simulacao ***');

      setTimeout(function() {
         carregarMapHistorias();
         console.log('*** '+new Date()+' - Carregou mapHistorias ***');

         setTimeout(function() {
            console.log('*** '+new Date()+' - Carregou mapRoiHistorias *** Size: ' + mapRoiHistorias.size);

            setTimeout(function() {
               enviarMensagem (res, mensagem_jogador, evento, passo, papel_escolhido, mapHistoriasTreinamento, 
                  dia_corrente_c, meta, mapRoiHistorias);
            }, 2000);
         }, 2000);
      }, 2000);  
   }
   else {
      console.log('*** '+new Date()+' - Enviando mapRoiHistorias ja carregado anteriormente *** Size: ' + mapRoiHistorias.size);

      enviarMensagem (res, mensagem_jogador, evento, passo, papel_escolhido, mapHistoriasTreinamento, 
         dia_corrente_c, meta, mapRoiHistorias, externo);
   }
}

function enviarMensagem (res, mensagem_jogador, evento, passo, papel_escolhido, mapHistoriasTreinamento, 
   dia_corrente_c, meta, mapRoi, externo) {
   
   var total_pontos = 0;
   var roi_total = 0;
   var sprint_corrente = 1;
   var meta_sprint = '';
   var total_meta_atingida = 0;
   
   // var passo_meta = '';
   var pontos_jogador = 0;
   var pecent_ajuste_exec = 1;
   
   var qtde_meta_atingida = 0;
   var qtde_sprints_simuladas = 2;
   var total_pontos_ajuste = 0;
   var total_dias_simulados = 5;

   console.log(new Date()+' - Meta ajax dia '+dia_corrente_c+': ' + meta );

   var tempo_evento = 0;
   var montar_pecas = false;
   var carregar_dados = '';
   var somar_pontos = 0;
   var execucao_paralelo = 0;
   var tempo = '';

   if(dia_corrente_c == 5 && externo == 'pode-crer' && passo == 'retro-finalizada'){
      // mensagem = 'Esta simulação termina aqui, mas se você deseja treinar os seus Times com um jogo super engajante, '+
      //    'acesse o site <a href="https://engagetrix.com" target="_blank">engagetrix.com</a> e assine um dos nossos pacotes.';


      mensagem = 'Esta simulação termina aqui, mas se você deseja treinar os seus Times com este jogo super engajante, '+
         'acesse o site <a href="https://scrum3d.com" target="_blank">Scrum3D.com</a> e registre o seu interesse.';

      passo = 'freemium';

      enviarMensagemRetorno(res, mensagem, evento, passo, papel_escolhido, tempo_evento, montar_pecas, 
         carregar_dados, somar_pontos, pecent_ajuste_exec, execucao_paralelo, meta_sprint, mapRoi, total_meta_atingida);

      return;
   }

   if(dia_corrente_c > 5 && dia_corrente_c < 11){
      sprint_corrente = 2;
    } else if(dia_corrente_c > 10 && dia_corrente_c < 16){
      sprint_corrente = 3;
    }

    if(myTrim(mensagem_jogador) == 'finalizar jogo'){
      passo = 'finalizar-jogo';
      enviarMensagemRetorno(res, mensagem, evento, passo, papel_escolhido, tempo_evento, montar_pecas, carregar_dados, somar_pontos, pecent_ajuste_exec, execucao_paralelo, meta_sprint, mapRoi, total_meta_atingida);

      return;
    }

   // inicio

   if(passo == ''){

      console.log('Vai iniciar a primeira mensagem - externo: ' + externo);

      if(externo == 'pode-crer'){
         mensagem = "Seja bem vindo a uma pequena amostra gratuita do simulador do Jogo Scrum 3D Park! "
            +"Neste exercício vamos simular <b>1 Sprint (5 dias)</b> do jogo e todas as orientações serão dadas aqui neste bate-papo."
            +"<br><br>Utilize o botão <span><i class='fas fa-window-minimize'></i></span> "
            +"para minimizar este bate-papo para ler as mensagens e depois clique no botão "
            +"<span><i class='fas fa-window-maximize'></i></span> para restaurar. "
            +"<br><br>Por favor digite 1 no chat e clique no botão 'Enviar' para iniciar o jogo!";
      } else {
         mensagem = "Seja bem vindo ao simulador do Jogo Scrum 3D Park! "
            +"Neste exercício vamos simular <b>2 Sprints (10 dias)</b> do jogo e todas as orientações serão dadas aqui neste bate-papo."
            +"<br><br>Utilize o botão <span><i class='fas fa-window-minimize'></i></span> "
            +"para minimizar este bate-papo para ler as mensagens e depois clique no botão "
            +"<span><i class='fas fa-window-maximize'></i></span> para restaurar. "
            +"<br><br>Por favor digite 1 no chat e clique no botão 'Enviar' para iniciar o jogo!";
         // mensagem = "Utilize o botão <span><i class='fas fa-window-minimize'></i></span> "
         // +"para minimizar este bate-papo para ler as mensagens e depois clique no botão "
         // +"<span><i class='fas fa-window-maximize'></i></span> para restaurar. "
         // +"Teremos <b>10 dias</b> simulados e todo o treinamento será conduzido por este bate-papo.<br><br>Por favor digite 1 no chat e clique no botão 'Enviar' para iniciar o jogo!";

      }

      
      evento = PLANNING;

      passo = 'info-inicial';

      console.log('*** '+new Date()+' - Vai enviar mapRoiHistorias *** Size: ' + mapRoi.size);

      mapRoi = JSON.stringify([...mapRoi]);

      enviarMensagemRetorno(res, mensagem, evento, passo, papel_escolhido, tempo_evento, montar_pecas, carregar_dados, somar_pontos, pecent_ajuste_exec, execucao_paralelo, meta_sprint, mapRoi, total_meta_atingida);

      return;
   }

   console.log('Passo2: ' + passo);

   // console.log('papel_escolhido: ' + papel_escolhido);

   if(evento == PLANNING){
      console.log('Passo3: ' + passo);

      if(passo == 'info-inicial'){
         if(myTrim(mensagem_jogador) == '1'){
            mensagem = "Antes de iniciar o jogo, é necessário que os Times definam quem vai ser o PO e o SM. "
                  +"Qual destes papéis do Scrum você gostaria de exercitar nesta simulação? Digite o numero da opção desejada:"
                  +"<br><br>1. Product Owner - responsável por garatir o melhor ROI para o Produto."
                  +"<br>2. Scrum Master - O líder servidor que apoia o Time no uso das práticas ágeis, manter o foco e ajudar a remover os impedimentos."
                  +"<br>3. Developers - O pessoal que vai colocar a mão na massa para construir valor para a Organização."
                  +"<br><br>Obs.: Todos podem montar peças, mas os papéis de PO e SM devem focar nas suas atividades principais.";
         
            passo = 'escolha-papel';
            evento = '';

            enviarMensagemRetorno(res, mensagem, evento, passo, papel_escolhido, tempo_evento, montar_pecas, carregar_dados, somar_pontos, pecent_ajuste_exec, execucao_paralelo, meta_sprint, mapRoi, total_meta_atingida);

            return;
         } else {
            mensagem = "Opção inválida.<br><br>Digite 1 no chat para iniciar o jogo.";
         
            passo = 'info-inicial';
            evento = '';

            enviarMensagemRetorno(res, mensagem, evento, passo, papel_escolhido, tempo_evento, montar_pecas, carregar_dados, somar_pontos, pecent_ajuste_exec, execucao_paralelo, meta_sprint, mapRoi, total_meta_atingida);

            return;
         }
         
      }
      else if(passo == 'retro-finalizada'){
         if(myTrim(mensagem_jogador) == '1'){
            console.log('Iniciar proxima planning');

            if(papel_escolhido == PO){
               mensagem = 'Como <b>PO</b> você deve priorizar as histórias que vão garantir o maior ROI no jogo.<br><br>';
            }
            else if(papel_escolhido == SM){
               mensagem = 'Como <b>Scrum Master</b> você deve ajudar o PO a priorizar as histórias para garantir o maior ROI do jogo.<br><br>';
            }
            else {
               mensagem = "Como <b>Developer</b> você deve ajudar o PO a refinar as histórias para garantir o maior ROI do jogo.<br><br>";
            }

            mensagem = mensagem + "Arraste as histórias da coluna 'Backlog' para a 'Sprint Backlog' e escreva os números das histórias "
               +"que serão a meta da Sprint, somente os números e separados por virgula. Exemplo: 1, 2, 5";

            carregar_dados = PLANNING;
            tempo_evento = minutos_planning*60;
            passo = 'aguardando-meta';
         } else {
            mensagem = "O valor informado no chat NÃO é uma opção válida. Por favor digite o número 1 para iniciar a 'Sprint Planning'.";

            passo = 'retro-finalizada';
         }

         evento = PLANNING;


         enviarMensagemRetorno(res, mensagem, evento, passo, papel_escolhido, tempo_evento, montar_pecas, carregar_dados, 
            somar_pontos, pecent_ajuste_exec, execucao_paralelo, meta_sprint, mapRoi, total_meta_atingida);

         return;
      }
      else if(passo == 'escolha-papel' || passo == 'papel-nao-escolhido'){
         // verifico se existe uma questao com acao vindo do chat
         console.log('Papel escolhido antes: ' + papel_escolhido);

         // trata o papel escolhido e gera a mensagem de preparacao da planning
         mensagem_jogador = filterInt(mensagem_jogador);

         if(myTrim(mensagem_jogador) == '1' || myTrim(mensagem_jogador) == '2' || myTrim(mensagem_jogador) == '3'){

            if(myTrim(mensagem_jogador) == '1'){
               papel_escolhido = PO;
            } else if(myTrim(mensagem_jogador) == '2'){
               papel_escolhido = SM;
            } else if(myTrim(mensagem_jogador) == '3'){
               papel_escolhido = 'Developers';
            }  

            tempo = tratarTempo(minutos_planning);

            mensagem = "Agora que temos os papéis definidos, é hora de começar o nosso jogo pra valer. "
                     +"Vocês tem "+tempo+" para realizar a primeira reunião de Planejamento. O PO deve mover as historias da "
                     +"coluna 'Backlog' para a 'Sprint Backlog', priorizar por ordem de cima pra baixo e informar no chat a meta da Sprint "+sprint_corrente+". "
                     +'</br></br>Digite 1 no chat para iniciar o tempo da "Sprint Planning".';

            passo = 'papel-escolhido';
         } else {
            // ND = nao definido
            papel_escolhido = '';

            // mensagem = "O valor informado no chat NÃO é uma opção válida. Por favor informe os números 1, 2  ou 3 no chat, conforme a lista abaixo: "
            //             +"<br><br>1. Product Owner - responsável por garatir o melhor ROI para o Produto."
            //             +"<br>2. Scrum Master - O líder servidor que apoia o Time no uso das práticas ágeis, manter o foco e ajudar a remover os impedimentos."
            //             +"<br>3. Developers - O pessoal que vai colocar a mão na massa para construir valor para a Organização.";

            mensagem = "<b>Atenção: </b>Antes de iniciar o jogo, é necessário que os Times definam quem vai ser o PO e o SM. "
                     +"Qual destes papéis do Scrum você gostaria de exercitar nesta simulação? Digite o numero da opção desejada:"
                     +"<br><br>1. Product Owner - responsável por garatir o melhor ROI para o Produto."
                     +"<br>2. Scrum Master - O líder servidor que apoia o Time no uso das práticas ágeis, manter o foco e ajudar a remover os impedimentos."
                     +"<br>3. Developers - O pessoal que vai colocar a mão na massa para construir valor para a Organização."
                     +"<br><br>Obs.: Todos podem montar peças, mas os papéis de PO e SM devem focar nas suas atividades principais.";

            console.log('Papel nao escolhido');

            passo = 'papel-nao-escolhido';
         }

         evento = '';
         enviarMensagemRetorno(res, mensagem, evento, passo, papel_escolhido, tempo_evento, montar_pecas, carregar_dados, somar_pontos, pecent_ajuste_exec, execucao_paralelo, meta_sprint, mapRoi, total_meta_atingida);

         return;
      }
      else if(passo == 'papel-escolhido'){
         
         if(myTrim(mensagem_jogador) == '1'){
            console.log('Iniciar planning');

            tempo_evento = minutos_planning*60;

            if(papel_escolhido == PO){
               mensagem = 'Como <b>PO</b> você deve priorizar as histórias que vão garantir o maior ROI no jogo.<br><br>';
            }
            else if(papel_escolhido == SM){
               mensagem = 'Como <b>Scrum Master</b> você deve ajudar o PO a priorizar as histórias para garantir o maior ROI do jogo.<br><br>';
            }
            else {
               mensagem = "Como <b>Developer</b> você deve ajudar o PO a refinar as histórias para garantir o maior ROI do jogo.<br><br>";
            }

            mensagem = mensagem + "Arraste as histórias da coluna 'Backlog' para a 'Sprint Backlog' e escreva os números das histórias "
            +"que serão a meta da Sprint, somente os números e separados por virgula. Exemplo: 1, 2, 5";

            passo = 'aguardando-meta';
         } else {
            mensagem = "<b>Atenção: </b>Agora que temos os papéis definidos, é hora de começar o nosso jogo pra valer. "
                     +"O PO deve mover as historias da coluna 'Backlog' para a 'Sprint Backlog', "
                     +"priorizar por ordem de cima pra baixo e informar no chat a meta da Sprint "+sprint_corrente+". "
                     +'</br></br>Digite 1 no chat para iniciar o tempo da "Sprint Planning".';

            passo = 'papel-escolhido';
         }
         
         evento = '';
         enviarMensagemRetorno(res, mensagem, evento, passo, papel_escolhido, tempo_evento, montar_pecas, carregar_dados, somar_pontos, pecent_ajuste_exec, execucao_paralelo, meta_sprint, mapRoi, total_meta_atingida);

         return;
      } 
      else if(passo == 'aguardando-meta'){
         if(mensagem_jogador !== ''){
            console.log('Informando a meta');

            // registra a escolha do jogador e inicia a sprint planning
            retorno = tratarMeta(mensagem_jogador, mapRoiHistorias, mapHistoriasTreinamento, sprint_corrente);

            mensagem = retorno.mensagem_retorno;

            somar_pontos = pontos_jogador;

            passo = retorno.passo_meta;

            if(passo == 'confirmacao-meta'){
               meta_sprint = mensagem_jogador;
            }
         } else {
            passo = 'aguardando-meta';

            mensagem = 'Ainda não é o momento para interagir. Por favor aguarde novas instruções enquanto verificamos a meta informada.';
         }
         
         evento = '';
         enviarMensagemRetorno(res, mensagem, evento, passo, papel_escolhido, tempo_evento, montar_pecas, carregar_dados, somar_pontos, pecent_ajuste_exec, execucao_paralelo, meta_sprint, mapRoi, total_meta_atingida);

         return;
      }
      else if(passo == 'confirmacao-meta'){

         if(myTrim(mensagem_jogador) == '1'){
            console.log('Meta confirmada');

            if(papel_escolhido == PO){
               mensagem = 'Como <b>PO</b> você deve priorizar as histórias que vão garantir o maior ROI no jogo.<br><br>';
            }
            else if(papel_escolhido == SM){
               mensagem = 'Como <b>Scrum Master</b> você deve ajudar o PO a priorizar as histórias para garantir o maior ROI do jogo.<br><br>';
            }
            else {
               mensagem = "Como <b>Developer</b> você deve ajudar o PO a refinar as histórias para garantir o maior ROI do jogo.<br><br>";
            }

            mensagem = mensagem + "Agora arraste as histórias da coluna 'Sprint Backlog' para a coluna 'Fazer' e arraste para a coluna 'Fazendo' as "
                     + "histórias que vão começar a montar no dia " +dia_corrente_c+ ". Digite 1 no chat para iniciar o tempo da 'Execução'."
                     +"<br><br>As peças da coluna 'Fazendo' serão montadas automaticamente pela simulação, de acordo com os pontos do dia.";

            passo = 'meta-confirmada';
         } else if (myTrim(mensagem_jogador) == '2'){
            console.log('Meta alterada');

            if(papel_escolhido == PO){
               mensagem = 'Como <b>PO</b> você deve priorizar as histórias que vão garantir o maior ROI no jogo.<br><br>';
            }
            else if(papel_escolhido == SM){
               mensagem = 'Como <b>Scrum Master</b> você deve ajudar o PO a priorizar as histórias para garantir o maior ROI do jogo.<br><br>';
            }
            else {
               mensagem = "Como <b>Developer</b> você deve ajudar o PO a refinar as histórias para garantir o maior ROI do jogo.<br><br>";
            }
   
            mensagem = mensagem + "Arraste as histórias da coluna 'Backlog' para a 'Sprint Backlog' e escreva os números das histórias "
            +"que serão a meta da Sprint, somente os números e separados por virgula. Exemplo: 1, 2, 5";
   
            passo = 'aguardando-meta';
         } else {
            console.log('Opcao invalida');

            mensagem = 'Opção invalida! Por favor digite 1 para confirmar e 2 para enviar uma nova meta.';

            passo = 'confirmacao-meta';
         }

         evento = '';
         enviarMensagemRetorno(res, mensagem, evento, passo, papel_escolhido, tempo_evento, montar_pecas, carregar_dados, somar_pontos, pecent_ajuste_exec, execucao_paralelo, meta_sprint, mapRoi, total_meta_atingida);

         return;
      }
      else if(passo == 'meta-confirmada'){
         console.log('Confirmando Execucao depois da planning');

         if(myTrim(mensagem_jogador) == '1'){
            
            tempo = tratarTempo(minutos_execucao);

            // mensagem = "Seu Time tem "+tempo+" para montar as peças das histórias da coluna 'Fazendo'. "
            //          + "O tempo já está valendo! Observe a montagem automática das peças do dia " +dia_corrente_c+ " e atualize o "
            //          +"quadro Kanban caso seja concluída alguma história.<br><br>Serão enviadas novas instruções quando o tempo da Execução terminar.";

            mensagem = "A montagem das peças das histórias da coluna 'Fazendo' será realizada pelo robô (no jogo real, o Time é que monta as peças), no tempo dedicado (timebox) para a Execução, que são "+tempo+"."
                     + "<br>Verifique o quadro Kanban e mova as Histórias concluídas (quebra-cabeças montados completamente) "
                     +"para a coluna 'Feito'.<br><br>Serão enviadas novas instruções quando o tempo da Execução terminar.";

            tempo_evento = minutos_execucao*60;

            montar_pecas = true;

            // ganha 10 pontos por trabalhar focado - o sistema escolhe nesta primeira execucao
            somar_pontos = 10;

            // pecent_ajuste_exec = 0.9;

            evento = EXECUCAO;
            passo = 'inicio-execucao';
         } else {
            mensagem = 'Por favor siga a instrução anterior.';

            passo = 'meta-confirmada';
         }

         enviarMensagemRetorno(res, mensagem, evento, passo, papel_escolhido, tempo_evento, montar_pecas, carregar_dados, somar_pontos, pecent_ajuste_exec, execucao_paralelo, meta_sprint, mapRoi, total_meta_atingida);

         return;
      }
      
   // execucao
   } 
   else if(evento.includes("Execu")){
      console.log('Passo4: ' + passo + ' - dia_corrente_c: ' + dia_corrente_c);

      if(passo == 'inicio-execucao'){
         

         if(mensagem_jogador.replace(" ", "") == '' && dia_corrente_c !== '4' && dia_corrente_c !== '9'){
            console.log('Fim do dia ' + dia_corrente_c + ' e vai para a daily.');

            tempo = tratarTempo(minutos_daily);

            mensagem = "Fim do dia "+dia_corrente_c +". Veja os quebra-cabeças das histórias da coluna 'Fazendo' e mova para a coluna "
                     +"'Pronto' os que foram totalmente montados."
                     +"<br><br>Digite 1 no chat para iniciar a reunião diária do dia "+(parseInt(dia_corrente_c)+1)+". "
                     +"<br><br><b>Atenção: </b>Vocês terão "+tempo+" para falar da estratégia para atingir a meta da Sprint "
                     +sprint_corrente+".";

            passo = 'fim-dia-execucao';
         }
         else if(mensagem_jogador.replace(" ", "") == '' && (dia_corrente_c == '4' || dia_corrente_c == '9')){
            console.log('Fim da Sprint ' + dia_corrente_c + ' e vai para a review.');

            mensagem = "Fim da Sprint "+sprint_corrente +". Veja os quebra-cabeças das histórias da coluna 'Fazendo' e mova para a coluna "
                     +"'Pronto' os que foram totalmente montados."
                     +"<br><br>Digite 1 no chat para iniciar a Sprint Review no dia "+(parseInt(dia_corrente_c)+1)+". "
                     +"<br><br><b>Atenção: </b>No jogo, os POs dos times informam ao Facilitador se conseguiram bater a meta da Sprint "
                     +"e comentam sobre o valor entregue.";

            passo = 'inicio-review';
         }
         else {
            mensagem = "Ainda não é hora de novas ações. Observe a montagem automática das peças do dia " +dia_corrente_c
                     + " e atualize o quadro Kanban caso seja concluída alguma história."
                     +"<br><br>Serão enviadas novas instruções quando o tempo da Execução terminar.";

            passo = 'inicio-execucao';
         }

         evento = '';

         enviarMensagemRetorno(res, mensagem, evento, passo, papel_escolhido, tempo_evento, montar_pecas, carregar_dados, somar_pontos, pecent_ajuste_exec, execucao_paralelo, meta_sprint, mapRoi, total_meta_atingida);

         return;
      }
      else if(passo == 'fim-dia-execucao'){
         console.log('Iniciando daily do dia');

         // TODO: criar IF se o valor informado eh igual a 1 para iniciar a daily
         if(myTrim(mensagem_jogador) == '1'){
            
            carregar_dados = DAILY;

            tempo_evento = minutos_daily*60;

            mensagem = "Digite no chat o número da opção que define como o Time vai montar as %pontos_dia% peças no dia "
                     +dia_corrente_c+". Sempre pensando em como atingir a meta da Sprint "+sprint_corrente+": "
                     +"<br>1. Uma história Historia por vez (trabalho focado);"
                     +"<br>2. Mais de uma História por vez (trabalho em paralelo).";

            passo = 'iniciou-daily';
         } else {
            mensagem = "Opção inválida.<br><br>Digite 1 no chat para iniciar a reunião diária do dia "+(parseInt(dia_corrente_c+1))+".";
                     +sprint_corrente+".";

            passo = 'fim-dia-execucao';
         }

         evento = '';
         enviarMensagemRetorno(res, mensagem, evento, passo, papel_escolhido, tempo_evento, montar_pecas, carregar_dados, somar_pontos, pecent_ajuste_exec, execucao_paralelo, meta_sprint, mapRoi, total_meta_atingida);

         return;
      }
      else if(passo == 'inicio-review'){
         if(myTrim(mensagem_jogador) == '1'){
            console.log('Iniciada Review no dia ' + dia_corrente_c);

            mensagem = "Seu Time atingiu a meta da Sprint " +sprint_corrente+"?" 
                        +"<br><br>Digite 1 para SIM e 2 para NÃO.";
            
            passo = 'validar-meta-atingida';

            carregar_dados = REVIEW;

            tempo_evento = minutos_review*60;
         } else {
            console.log('Review no dia ' + dia_corrente_c + " não iniciada.");

            mensagem = "O valor informado no chat NÃO é uma opção válida. Por favor digite o número 1 para iniciar a 'Sprint Review'.";

            passo = 'inicio-review';
         }

         enviarMensagemRetorno(res, mensagem, evento, passo, papel_escolhido, tempo_evento, montar_pecas, carregar_dados, 
            somar_pontos, pecent_ajuste_exec, execucao_paralelo, meta_sprint, mapRoi, total_meta_atingida);

         return;
      }
   }
   else if(evento.includes("Reuni")){
      if(passo == 'iniciou-daily'){
         console.log('Iniciou a daily do dia');

         mensagem = "Arraste as histórias que devem ser montadas da coluna 'Fazer' para a coluna 'Fazendo'. As peças das histórias da "
                     + "coluna 'Fazendo' serão montadas automaticamente pela simulação, de acordo com os pontos do dia."
                     +"<br><br>Digite 1 no chat para iniciar a 'Execução'.";

         passo = 'concluiu-daily';

         if(myTrim(mensagem_jogador) == '1'){
            console.log('perda de 10% no dia '+dia_corrente_c+'.');

            // chama a funcao para montar pecas considerando o (total de pecas do dia - 10%)

            // ganha 10 pontos por trabalhar focado
            somar_pontos = 10;

            // pecent_ajuste_exec = 0.9;
         } else if(myTrim(mensagem_jogador) == '2'){
            console.log('perda de 20% no dia '+dia_corrente_c+'.');

            // chama a funcao para montar pecas considerando o (total de pecas do dia - 20%)
            pecent_ajuste_exec = 0.8;
            execucao_paralelo = 1;
         } else {
            mensagem = "O valor informado no chat NÃO é uma opção válida. Por favor informe os números 1 ou 2 no chat, "
                     +"conforme a lista abaixo: <br>1. Uma história Historia por vez (trabalho focado);"
                     +"<br>2. Mais de uma História por vez (trabalho em paralelo).";

            passo = 'iniciou-daily';
         }

         evento = '';
         enviarMensagemRetorno(res, mensagem, evento, passo, papel_escolhido, tempo_evento, montar_pecas, carregar_dados, somar_pontos, 
            pecent_ajuste_exec, execucao_paralelo, meta_sprint, mapRoi, total_meta_atingida);

         return;
      } 
      else if(passo == 'concluiu-daily'){
         console.log('Confirmando Execucao depois da daily do dia ' + dia_corrente_c);

         tempo = tratarTempo(minutos_execucao);

         if(myTrim(mensagem_jogador) == '1'){
            mensagem = "A montagem das peças das histórias da coluna 'Fazendo' será realizada pelo robô (no jogo real, o Time é que monta as peças), no tempo dedicado (timebox) para a Execução, que são "+tempo+"."
                     + "<br>Verifique o quadro Kanban e mova as Histórias concluídas (quebra-cabeças montados completamente) "
                     +"para a coluna 'Feito'.<br><br>Serão enviadas novas instruções quando o tempo da Execução terminar.";

            tempo_evento = minutos_execucao*60;
            montar_pecas = true;
            evento = EXECUCAO;
            passo = 'inicio-execucao';
         } else {
            mensagem = 'Por favor siga a instrução anterior.';

            passo = 'concluiu-daily';
         }

         enviarMensagemRetorno(res, mensagem, evento, passo, papel_escolhido, tempo_evento, montar_pecas, carregar_dados, 
            somar_pontos, pecent_ajuste_exec, execucao_paralelo, meta_sprint, mapRoi, total_meta_atingida);

         return;
      }
   }
   else if(evento.includes("Review")){

      if(passo == 'validar-meta-atingida'){
         console.log('Iniciada validação de meta na Review no dia ' + dia_corrente_c);

         if(myTrim(mensagem_jogador) == '1' || myTrim(mensagem_jogador) == '2'){
            // agora verifico se realmente o Time bateu a meta.

            console.log('Vai chamar a validacao da meta: ' + meta);

            if(validarAtingimentoMeta(mapHistoriasTreinamento, meta)){
               // se bateu a meta, somar 10 pontos para o jogador
               somar_pontos = 10;             

               console.log('Meta atingida');

               if(myTrim(mensagem_jogador) == '1'){
                  mensagem = "O seu Time bateu a meta da Sprint " +sprint_corrente+". Parabéns!" 
                              +"<br><br>Digite 1 para iniciar a 'Sprint Retrospective'.";
               } else {
                  mensagem = "Você disse que NÃO, mas o seu Time bateu a meta da Sprint " +sprint_corrente+". Parabéns!" 
                              +"<br><br>Digite 1 para iniciar a 'Sprint Retrospective'.";
               }

               total_meta_atingida = 1;
            } else {
               console.log('Meta não atingida');

               mensagem = "O seu Time NÃO bateu a meta da Sprint " +sprint_corrente+", mas vocês podem melhorar. "
                     +"Reflitam sobre os pontos que precisam melhorar e tome pelo menos UMA AÇÃO já." 
                     +"<br><br>Digite 1 para iniciar a 'Sprint Retrospective'.";
            }

            evento = RETRO;

            passo = 'iniciar-retro';
         } else {
            console.log('Retrospective no dia ' + dia_corrente_c + " não iniciada.");

            mensagem = "O valor informado no chat NÃO é uma opção válida. " +
                     "Seu Time atingiu a meta da Sprint " +sprint_corrente+"?" 
                     +"<br><br>Digite 1 para SIM e 2 para NÃO.";

            passo = 'validar-meta-atingida';
         }

         enviarMensagemRetorno(res, mensagem, evento, passo, papel_escolhido, tempo_evento, montar_pecas, carregar_dados, 
            somar_pontos, pecent_ajuste_exec, execucao_paralelo, meta_sprint, mapRoi, total_meta_atingida);

         return;
      }
      
   }
   else if(evento.includes("Retrospec")){
      if(passo == 'retro-finalizada'){
         if(dia_corrente_c == 10){
            passo = 'finalizar-jogo';

            console.log('Vai finalizar o jogo no dia ' + dia_corrente_c);
         } else {
            if(myTrim(mensagem_jogador) == '1'){
               console.log('Iniciar proxima planning');

               if(papel_escolhido == PO){
                  mensagem = 'Como <b>PO</b> você deve priorizar as histórias que vão garantir o maior ROI no jogo.<br><br>';
               }
               else if(papel_escolhido == SM){
                  mensagem = 'Como <b>Scrum Master</b> você deve ajudar o PO a priorizar as histórias para garantir o maior ROI do jogo.<br><br>';
               }
               else {
                  mensagem = "Como <b>Developer</b> você deve ajudar o PO a refinar as histórias para garantir o maior ROI do jogo.<br><br>";
               }

               mensagem = mensagem + "Arraste as histórias da coluna 'Backlog' para a 'Sprint Backlog' e escreva os números das histórias "
                  +"que serão a meta da Sprint, somente os números e separados por virgula. Exemplo: 1, 2, 5";

               carregar_dados = PLANNING;
               tempo_evento = minutos_planning*60;
               passo = 'aguardando-meta';
            } else {
               mensagem = "O valor informado no chat NÃO é uma opção válida. Por favor digite o número 1 para iniciar a 'Sprint Planning'.";

               passo = 'retro-finalizada';
            }

            evento = PLANNING;
         }

         enviarMensagemRetorno(res, mensagem, evento, passo, papel_escolhido, tempo_evento, montar_pecas, carregar_dados, 
            somar_pontos, pecent_ajuste_exec, execucao_paralelo, meta_sprint, mapRoi, total_meta_atingida);

         return;
      }
      else if(passo == 'iniciar-retro'){
      
         if(myTrim(mensagem_jogador) == '1'){
            console.log('Iniciada Retrospective no dia ' + dia_corrente_c);

            mensagem = "O seu Time deve discutir e tomar ações para melhorar seu resultado na próxima Sprint." 
                     +"<br><br>Quando concluir o tempo da reunião, você receberá uma nova instrução aqui no chat.";

            tempo_evento = minutos_retro*60;

            passo = 'retro-iniciada';
         } else {
            console.log('Retrospective no dia ' + dia_corrente_c + " não iniciada.");

            mensagem = "O valor informado no chat NÃO é uma opção válida. Por favor digite o número 1 para iniciar a 'Sprint Retrospective'.";

            passo = 'iniciar-retro';
         }

         enviarMensagemRetorno(res, mensagem, evento, passo, papel_escolhido, tempo_evento, montar_pecas, carregar_dados, 
            somar_pontos, pecent_ajuste_exec, execucao_paralelo, meta_sprint, mapRoi, total_meta_atingida);

         return;
      }
      else if(passo == 'retro-iniciada'){
         if(myTrim(mensagem_jogador) == ''){
            console.log('Retrospective no dia ' + dia_corrente_c + " finalizada.");

            mensagem = "Digite 1 para iniciar a 'Sprint Planning' no dia "+(parseInt(dia_corrente_c) + 1)+".";

            passo = 'retro-finalizada';

            // evento = PLANNING;
         } else {
            console.log('Retrospective no dia ' + dia_corrente_c + " não finalizada.");

            mensagem = "O valor informado no chat NÃO é uma opção válida. Por favor digite o número 1 para iniciar a 'Sprint Planning'.";

            passo = 'retro-iniciada';
         }

         enviarMensagemRetorno(res, mensagem, evento, passo, papel_escolhido, tempo_evento, montar_pecas, carregar_dados, 
            somar_pontos, pecent_ajuste_exec, execucao_paralelo, meta_sprint, mapRoi, total_meta_atingida);

         return;
      }
      
   }

   // fim
        
   
};

function enviarMensagemRetorno(res, mensagem, evento, passo, papel_escolhido, tempo_evento, montar_pecas, carregar_dados, 
      somar_pontos, pecent_ajuste_exec, execucao_paralelo, meta_sprint, mapRoi, total_meta_atingida){
   res.send({mensagem_retorno: mensagem, label_evento: evento, passo: passo, papel_escolhido: papel_escolhido, 
      tempo_evento, montar_pecas, carregar_dados, somar_pontos, pecent_ajuste_exec, execucao_paralelo, meta_sprint, mapRoi, total_meta_atingida});
}

filterInt = function (value) {
   return value.replace(/[^\d]+/g,'');
 }

 function tratarMeta(mensagem_jogador, mapRoiHistorias, mapHistoriasTreinamento, sprint_corrente){
   var hists_invalidas = '';
   var array_hists = [];
   var mensagem_retorno = '';
   var mensagem_check = "";
   
   // zero o pontos_jogador
   pontos_jogador = 0;
   var passo_meta = '';
 
   var mensagem_completa = mensagem_jogador;

   // console.log('Vai validar o mensagem_jogador: ' + mensagem_jogador);

   // for (const [key,value] of mapRoiHistorias){
   //    console.log('Key mapROI: ' + key + ' - ' + value);
   // }
 
   mensagem_jogador = replaceAll(mensagem_jogador, " ", "");
 
   console.log('Filter: ' + filterInt(mensagem_jogador));
 
   // mapMetaCorrente = new Map();
 
   if(mensagem_jogador !== '' && filterInt(mensagem_jogador) > 0){
     if(mensagem_jogador.includes(',')){
       array_hists = mensagem_jogador.split(",");
     } else {
       array_hists = mensagem_jogador.replace(' ', '');
     }
 
     // tratativa do array_hists
     console.log('array_hists: ' + array_hists);
     console.log('array_hists length: ' + array_hists.length);
 
     for(i = 0; i < array_hists.length; i++){
       console.log('Historia da meta: ' + array_hists[i]);
 
       if(!mapRoiHistorias.has("historia-"+array_hists[i])){
         if(hists_invalidas.length > 0){
           hists_invalidas = hists_invalidas + ', ';
         }
 
         hists_invalidas = hists_invalidas + array_hists[i];
       } else {
         // mapMetaCorrente.set(replaceAll(array_hists[i], ' ', ''), '1');
         // cada historia na meta ganha 2 pontos
         pontos_jogador = pontos_jogador + 2;
       }
     }
       
     if(hists_invalidas.length > 0){
       mensagem_retorno = "A meta da Sprint "+sprint_corrente+" possui as histórias '" + hists_invalidas + "' inválidas. Por favor "
         +"informe os número das histórias separados por vírgula. Exemplo: 1, 2, 4";
 
         passo_meta = 'aguardando-meta';
     } else {
       if(validarMeta(mapHistoriasTreinamento) == 0){
         mensagem_check = "<b>Atenção:</b> Percebi que você não puxou nenhuma história para a coluna 'Sprint Backlog'.<br><br>";
       }
 
       mensagem_retorno = mensagem_check + "Confirma a <b>meta da Sprint "+ sprint_corrente +"</b> como <b>Entregar as histórias " 
         + mensagem_completa + "</b>?<br><br>Digite 1 para confirmar e 2 para enviar uma nova meta.";
 
         passo_meta = 'confirmacao-meta';
     }
   }
   else{
     mensagem_retorno = "Por favor informe os números das histórias da meta da Sprint "+sprint_corrente+". Exemplo: 1, 2, 5";
 
     passo_meta = 'aguardando-meta';
   }

   // // meta_sprint = JSON.stringify(mapMetaCorrente);
   // meta_sprint = mapMetaCorrente;

   // console.log('Meta_Sprint x: ' + meta_sprint + ' - Array: ' + mapMetaCorrente);
 
   return {mensagem_retorno: mensagem_retorno, passo_meta: passo_meta};
 }

 function carregarMapHistorias(){
 
   var sql = "SELECT numero, roi_diario FROM historias WHERE ativo = 's' order by numero";

   console.log("Busca dados das historias do jogo: ");

   db.query(sql, function(err, result){
      console.log('Var carregar o mapRoiHistorias');
      for(var i=0; i < result.length; i++) {
         // console.log('Add historia ' + result[i].numero + ' - ROI: ' + result[i].roi_diario);
         mapRoiHistorias.set("historia-" + result[i].numero, result[i].roi_diario);
      }
   });
}

function replaceAll(string, search, replace) {
   return string.split(search).join(replace);
 }

function validarMeta(mapHistoriasTreinamento){
   console.log('mapHistoriasTreinamento: ' + mapHistoriasTreinamento.toString());
   var contador = 0;

   var jsonData = "";

   try {
      jsonData = JSON.parse(mapHistoriasTreinamento);
  } catch(e) {
      console.log('Erro parse: ' + e);
  }

   // ["1-historia-1",{"historia":"historia-1","coluna_kanban":"div-sprint-backlog","dia_inicio":"","dia_fim":"","passeio":"n"}]
  for (var i = 0; i < jsonData.length; i++) {
      if(jsonData[i][1].coluna_kanban == 'div-sprint-backlog'){
         console.log('jsonData: ' + jsonData[i][1].coluna_kanban);
         contador++;
      }
   }

  console.log('Qtde historias meta: ' + contador);
 
   // for (var [key, value] of mapHistoriasTreinamento) {
   //   if(value.coluna_kanban == 'div-sprint-backlog'){
   //     contador++;
   //   }
   // }
 
   return contador;
}

function validarAtingimentoMeta(mapHistoriasTreinamento, meta){

   console.log('Meta: ' + meta);

   var bateu_meta = true;
   var mapHistoriasProntas = new Map();

   console.log('mapHistoriasTreinamento x: ' + mapHistoriasTreinamento.toString());

   // inicio

   var jsonData = "";

   try {
      jsonData = JSON.parse(mapHistoriasTreinamento);
  } catch(e) {
      console.log('Erro parse: ' + e);
  }

  var historia = '';

   // ["1-historia-1",{"historia":"historia-1","coluna_kanban":"div-sprint-backlog","dia_inicio":"","dia_fim":"","passeio":"n"}]
  for (var i = 0; i < jsonData.length; i++) {
      if(jsonData[i][1].coluna_kanban == 'div-feito'){
         console.log('jsonData x: ' + jsonData[i][1].historia);

         if(typeof jsonData[i][1].historia !== 'undefined'){
            historia = replaceAll((replaceAll(jsonData[i][1].historia, 'historia-', '')), ' ', '');
         
            mapHistoriasProntas.set(historia, 1);
         }
      }
   }

   for (var [key, value] of mapHistoriasProntas) {
      console.log('historia pronta: ' + key);
   }

   // fim

   meta = replaceAll(meta, ' ', '');
   // meta = replaceAll(meta, '"', '');
   // meta = meta.replace("[", '').replace("]");
   meta = meta.split(",");

   // console.log('Vai validar meta u: ---' + meta + '----');

   // for (var [key, value] of mapHistoriasProntas) {
   //    console.log('Historia pronta t: ' + key + ' - ' + value);
   // }
 
   for(i = 0; i < meta.length; i++){
     console.log('Validando historia ' +meta[i]+ ' da meta.');
 
     // para cada historia da meta eu percorro todas as historias do quadro kanban da coluna 'feito'
     if(!mapHistoriasProntas.has(replaceAll(meta[i], ' ', ''))){
       bateu_meta = false;
       console.log('Historia não entregue: ' + meta[i]);
     }
   }
 
   return bateu_meta;
 }

 function tratarTempo(valor){
   var tempo_retorno = '';

   if((valor*60) < 60){
      tempo_retorno = (valor*60) + ' segundos';
   } else {
      tempo_retorno = valor + ' minutos';
   }

   return tempo_retorno;
 }

 function myTrim(x) {
   return x.replace(/^\s+|\s+$/gm,'');
 }