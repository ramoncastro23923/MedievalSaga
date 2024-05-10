


//---------------------------------------------cadastro novo game page call------------------------------------------------------
const fs = require('fs').promises;

exports.cadastrar = function(req, res){
   message = '';

   console.log("Chamou o metodo cadastrar: " + req.method);

   if(req.method == "POST"){
      var post = req.body;
      var nome = post.nome;
      var senha = post.password;
      var email = post.email;
      var min_pontos_dev = post.min_pontos_dev;
      var max_pontos_dev = post.max_pontos_dev;
      var minutos_planning = post.minutos_planning;
      var minutos_daily = post.minutos_daily;
      var minutos_execucao = post.minutos_execucao;
      var minutos_review = post.minutos_review;
      var minutos_retrospective = post.minutos_retrospective;
      var jogo_fisico = 'n';

      console.log("vai gravar edicao com jogo_fisico: " + jogo_fisico);

      if(post.jogo_fisico == 'on'){
         jogo_fisico = 's';
      }
      

      var id_existente = post.jogo_id;

   
      var arrayJogadores;

      if(req.body.chklista){
         console.log("req.body.chklista: sim ");
         arrayJogadores = req.body.chklista;
      }
      else {
         console.log("req.body.chklista: nao ");
         // crio um array vazio
         arrayJogadores = [];

         console.log("arrayJogadores.length: " + arrayJogadores.length);

         // preciso identificar uma forma de validar o numero minimo de jogadores antes do submit na tela .ejs.
      }
      
      var userId = req.session.userId;
      var user =  req.session.user;
      var tipo =  req.session.tipo;

      // primeiro gravamos o registro do novo jogo, ainda sem o codigo
      var sql = "";
      
      // se for um jogo existente, devemos realizar o UPDATE na tabela jogos
      if(id_existente > 0){
         // se for uma edicao de tela, trazer os participantes ja cadastrados e armazeno num MAP  
         // para atualizar/setar os times para cada participantes
         sql = "SELECT id, email, coalesce(time, 0) as time FROM participantes_jogos WHERE id_jogo = " + id_existente + " order by id ASC ";
         
         var mapParticipantes = new Map();
         
         //console.log('Query:' + sql);

         // agora busco os e-mails dos participantes confirmados para o jogo
         db.query(sql, function(err, result_Participantes){
            //console.log('Adicionando participantes: ' + result_Participantes.length);
            var id_p = 0;
            var time_p = 0;
            
            // percorro os participantes do jogo e atualizo o time de acordo com os valores da tela de edicao de jogo
            var sql_update_p = "";

            for(var i=0; i < result_Participantes.length; i++) {
               id_p = result_Participantes[i].id;
               time_p = post["participante_" + id_p];

               // atualizo o registro corrente
               sql_update_p = "UPDATE participantes_jogos SET time = " + time_p + " WHERE id_jogo = " + id_existente + " AND id = " + id_p;
               db.query(sql_update_p);
              // console.log("Realizou update participante: " + sql_update_p);
               //console.log("Vai adicionar id: " + id_p);
               //console.log("Vai adicionar part: " + post["participante_" + id_p] );
               
               mapParticipantes.set(id_p, time_p );
            }

            /*for (var [key, value] of mapParticipantes) {
               console.log('Key: ' + key + " - Value: " + value);
            }*/
         });

         

         // agora que tenho os dados dos participantes deleto os registros da tabela "jogadores_jogos" para o id do jogo (para garantir que nao terao duplicidades)
         //var sql_delete = "DELETE from `jogadores_jogos` WHERE id_jogo = "+ id_existente;
         //console.log("Vai deletar: " + sql_delete);

         

         //console.log("Tipo: " + tipo_acao);
         // caso seja a edicao de um jogo, o usuario pode finalizar o jogo
         // nao sei porque vem a virgula, mas deixei aqui
         /* if(tipo_acao == ",finalizar"){
            console.log("Finalizando o jogo.");
            // direciono para o dashboard e mando o id do jogo existente

            sql = "UPDATE `jogos` SET data_atualizacao = now(), status = 'finalizado' WHERE id = " + id_existente;

            var query = db.query(sql, function(err, result) {
               console.log('Busca jogos retorno (finalizar): ' + id_existente);
               res.render('dashboard.ejs',{message: "Jogo finalizado com sucesso!", data:id_existente});
            });
         } else {*/
            sql = "UPDATE `jogos` SET data_atualizacao = now(), jogo_fisico='" + jogo_fisico + "' WHERE id = " + id_existente;
            console.log("Query UPDATE na tabela jogos: " + sql);

            var query = db.query(sql, function(err, result) {
               // UPDATE na tabela de configuracoes por jogo
               var sql_config = "UPDATE configuracoes SET min_pontos_dev = "+min_pontos_dev+", max_pontos_dev="+max_pontos_dev+", "
                  + "minutos_planning = "+minutos_planning+", minutos_daily="+minutos_daily+", minutos_execucao="+minutos_execucao+", "
                  + "minutos_review="+minutos_review+", minutos_retrospective="+minutos_retrospective+ 
                  + " WHERE id_jogo = " + id_existente;
               
               console.log("Vai atualizar a configuracao do jogo: " + sql_config);

               query = db.query(sql_config, function(err, result_config) {
                  console.log("Gravou config: " + sql_config);
               });

               // agora deleto os registros da tabela "jogadores_jogos" para o id do jogo (para garantir que nao terao duplicidades)
               var sql_delete = "DELETE from `jogadores_jogos` WHERE id_jogo = "+ id_existente;
              // console.log("Vai deletar: " + sql_delete);

               //query = db.query(sql_delete);

               db.query(sql_delete, function(err, result_delete) {
                  // montar o VALUES para os jogadores checados na tela de cadastro ou edicao de jogo para INSERT
                  var values_query = " ";

                  for(var i=0; i < arrayJogadores.length; i++) {
                     values_query = values_query + "(" + arrayJogadores[i] + ", "+id_existente+")";

                     // enquanto nao for o ultimo registro eu vou incluindo virgula 
                     if( (i + 1) < arrayJogadores.length){
                        values_query = values_query + ", ";
                     }                 
                  }

                  // coloquei para esperar um pouco porque nao esta gerando os registros de INSERT em alguns momentos.
                  var millisecondsToWait = 500;
                  setTimeout(function() {
                     // preciso esperar um pouco para recuperar o id inserido
                  }, millisecondsToWait);

                  // insert na tabela de configuracoes por jogo
                  var sql_jogadores = "INSERT INTO `jogadores_jogos` (id_jogador, id_jogo) "
                     + "VALUES " + values_query;
                  console.log("Vai gravar jogadores: " + sql_jogadores);

                  db.query(sql_jogadores, function(err, result_config) {
                     console.log("Atualizou config: " + sql_jogadores);
                     // direciono para o dashboard e mando o id do jogo existente
                     console.log('Busca jogos retorno (atualizacao): ' + id_existente);
                     // res.render('dashboard.ejs',{message: "Jogo atualizado com sucesso!", data:id_existente});
                     res.render('home.ejs',{message: "Jogo atualizado com sucesso!", data:id_existente, user: user, tipo: tipo});
                  });
               });
            });
         //}
      }
      else{
         /*
         * matriz contendo em cada linha indices (inicial e final) da tabela ASCII para retornar alguns caracteres.
         * [48, 57] = numeros;
         * [64, 90] = "@" mais letras maiusculas;
         * [97, 122] = letras minusculas;
         */
         var ascii = [[48, 57],[64,90],[97,122]];
         var i = Math.floor(Math.random()*ascii.length);
         var senha_jogo = "";
         var chars = 10;

         for(var j=0; j < chars; j++) {
            senha_jogo += String.fromCharCode(Math.floor(Math.random()*(ascii[i][1]-ascii[i][0]))+ascii[i][0]);
         }

         //console.log("Senha: " + senha_jogo);

         sql = "INSERT INTO `jogos`(id, `data_criacao`,`id_usuario`, `status`, senha_jogo, `data_atualizacao`) VALUES (null, now(), " + userId + ",'ativo', '"+senha_jogo+"', now())";

         //console.log("Query INSERT na tabela jogos: " + sql);

         db.query(sql, function(err, rows, fields) {
            if (err) {
               throw err;
            } else {
               //console.log("Vai pegar o id *** ");
               // pego o id do novo jogo
               console.log("Pegou o id: " + rows.insertId);



               // os codigos sempre serao o resultado do valor 1000 + id_jogo
               var codigo = 1000 + rows.insertId;
               var sql_update = "UPDATE `jogos` SET `codigo` = " + codigo + ", `data_atualizacao`= now(), jogo_fisico='" + jogo_fisico + "' WHERE id = "+ rows.insertId;
               //console.log("Vai atualizar: " + sql_update);

               var millisecondsToWait = 500;

               setTimeout(function() {
                  // agora faco o update 
                  query = db.query(sql_update, function(err, result) {

                     //message = "Succesfully! Your account has been created.";
                     console.log("Atualizou: " + sql_update);
                  });
               }, millisecondsToWait);

               setTimeout(function() {
                  // insert na tabela de configuracoes por jogo
                  var sql_config = "INSERT INTO configuracoes (min_pontos_dev, max_pontos_dev, minutos_planning, minutos_daily, minutos_execucao, " 
                  + "minutos_review, minutos_retrospective, id_usuario, id_jogo) "
                  + "VALUES ("+min_pontos_dev+", "+max_pontos_dev+", "+minutos_planning+", "+minutos_daily+", "
                  + minutos_execucao+", "+minutos_review+", "+minutos_retrospective+", "+userId+", "+rows.insertId+")";
                  //console.log("Vai inserir a configuracao do jogo: " + sql_config);

                  query = db.query(sql_config, function(err, result_config) {
                     console.log("Gravou config: " + sql_config);
                     //res.render('new_game.ejs',{message: message});
                  });
                  
               }, millisecondsToWait);

               

               // agora deleto os registros da tabela "jogadores_jogos" para o id do jogo (para garantir que nao terao duplicidades)
               var sql_delete = "DELETE from `jogadores_jogos` WHERE id_jogo = "+ rows.insertId;
               //console.log("Vai deletar: " + sql_delete);

               db.query(sql_delete);

               setTimeout(function() {
                  // montar o VALUES para os jogadores checados na tela de cadastro ou edicao de jogo para INSERT
                  var values_query = " ";

                  for(var i=0; i < arrayJogadores.length; i++) {
                     values_query = values_query + "(" + arrayJogadores[i] + ", "+rows.insertId+")";

                     // enquanto nao for o ultimo registro eu vou incluindo virgula 
                     if( (i + 1) < arrayJogadores.length){
                        values_query = values_query + ", ";
                     }                 
                  }

                  //console.log(values_query);

                  // insert na tabela de configuracoes por jogo
                  var sql_jogadores = "INSERT INTO `jogadores_jogos` (id_jogador, id_jogo) "
                     + "VALUES " + values_query;
                     //+ "VALUES (3, "+result.insertId+"), (4, "+result.insertId+"), (5, "+result.insertId+")";
                  //console.log("Vai gravar jogadores: " + sql_jogadores);

                  db.query(sql_jogadores, function(err, result_config) {
                     //console.log("Gravou config: " + sql_jogadores);
                     // direciono para o dashboard e mando o id
                     console.log('Busca jogos retorno (Cadastro): ' + rows.insertId);

                     setTimeout(function() {
                        // somente se for um jogo novo eu gero as pontuacoes para este usuario e jogo
                        pontuarJogo(rows.insertId, min_pontos_dev, max_pontos_dev, userId, "pontuar", res, req);

                        // res.render('dashboard.ejs',{message: "Jogo criado com sucesso!", data:rows.insertId});
                        res.render('home.ejs',{message: "Jogo criado com sucesso!", data:rows.insertId, user: user, tipo: tipo});
                     }, millisecondsToWait);
                  });

               }, millisecondsToWait);
            }
         });
      }

      
   } else {
      console.log("Caiu no else do cadastro do novo game. Entao estou numa tela de edicao.");
      res.render('new_game.ejs');
     
     // todo: acredito que devo enviar informacoes para a tela de edicao do registro
   }
};

//---------------------------------------------cadastro novo game page call------------------------------------------------------
exports.finalizar = function(req, res){
   message = '';
   console.log("Chamou o metodo finalizar: " + req.method);

   if(req.method == "POST"){
      var post = req.body;
      var id_existente = post.jogo_id;
      var userId = req.session.userId;
      var user =  req.session.user;
      var tipo =  req.session.tipo;

      console.log(id_existente);

      // se for um jogo existente, devemos realizar o UPDATE na tabela jogos
      if(id_existente > 0){

         console.log("Finalizando o jogo.");
         // direciono para o dashboard e mando o id do jogo existente

         var sql = "UPDATE `jogos` SET data_atualizacao = now(), status = 'finalizado' WHERE id = " + id_existente;

         var query = db.query(sql, function(err, result) {
            console.log('Busca jogos retorno (metodo finalizar): ' + id_existente);
            // res.render('dashboard.ejs',{message: "Jogo finalizado com sucesso!", data:id_existente});
            res.render('home.ejs',{message: "Jogo finalizado com sucesso!", data:id_existente, user: user, tipo: tipo});
         });
      } 
   } else {
      console.log("Caiu no else do cadastro do novo game. Entao estou numa tela de edicao.");
      res.render('new_game.ejs');
     
     // todo: acredito que devo enviar informacoes para a tela de edicao do registro
   }
};
 
//-----------------------------------------------login page call------------------------------------------------------
exports.login = function(req, res){
   var message = '';
   var sess = req.session; 

   if(req.method == "POST"){
      var post  = req.body;
      var name= post.user_name;
      var pass= post.password;
     
      //var sql="SELECT id, first_name, last_name, user_name FROM `users` WHERE `user_name`='"+name+"' and password = '"+pass+"'"; 
	  var sql="SELECT id, nome, `e-mail` as email FROM `usuarios` WHERE `e-mail`='"+name+"' and senha = '"+pass+"' and `ativo`='s' "; 
	  
      db.query(sql, function(err, results){      
         if(results.length){
            req.session.userId = results[0].id;
            req.session.user = results[0].nome;
			req.session.email = results[0].email;
            console.log(results[0].id);
            res.redirect('/home/dashboard');
         }
         else{
            message = 'Wrong Credentials.';
            res.render('index.ejs',{message: message});
         }
                 
      });
   } else {
      res.render('index.ejs',{message: message});
   }
           
};


//---------------------------------------------pre game page call------------------------------------------------------
exports.carregar_pre_game = function(req, res){
   message = '';
   if(req.method == "POST"){
      var post = req.body;
      var codigo_jogo = post.codigo_jogo;
      var email = post.email;
      var senha = post.password;

      // verifico primeiro se este participante ja nao existe para este jogo
      var sql = "SELECT p.id as id from participantes_jogos p "
            + "	inner join jogos j on j.id = p.id_jogo "
            + "WHERE p.email = '"+email+"' and j.codigo = '"+codigo_jogo+"' and j.senha_jogo ='"+senha+"' limit 1 ";
      
      db.query(sql, function(err, results_existente) {

         if(results_existente.length > 0){
            message = "O e-mail "+email+" ja existe para o jogo "+codigo_jogo+". Direcionando para a tela de espera do jogo.";
            console.log(message);
            // se ja este email ja estiver cadastrado e estiver com codigo e senha corretos, direciono para a tela de espera do jogo
            res.render('pre_game.ejs',{message: message});
         }
         else {
            var sql = "SELECT id from jogos WHERE codigo = " + codigo_jogo + " and senha_jogo = '" + senha + "' limit 1";
            console.log("Buscando jogo pelo código: " + sql);
   
            // faco uma busca pelo codigo e senha do jogo
            db.query(sql, function(err, results) {
               if(results.length){
                  console.log(results[0].id);
      
                  // depois de validar o e-mail, codigo e senha, insiro o e-mail para que este participante possa entrar no jogo
                  var sql_insert = "INSERT INTO participantes_jogos(id, email, id_jogo, data_atualizacao) VALUES (null, '" + email + "'," + results[0].id + ", now())";
      
                  db.query(sql_insert, function(err, result) {
                     message = "E-mail cadastrado no jogo com sucesso!";
                     res.render('access.ejs',{message: message});
                  });
               }
               else{
                  message = 'Este código e/ou senha não são válidos!';
                  res.render('access.ejs',{message: message});
               }
            });
         }
      });

   } else {
      res.render('access');
   }
};


//---------------------------------------------pre game page call------------------------------------------------------
exports.direcionar_pre_game = function(req, res){
   message = '';
   if(req.method == "POST"){
      var post = req.body;
      var codigo_jogo = post.codigo_jogo;
      var email = post.email;
      var senha = post.senha;

      //console.log("Cheguei na tela do jogo: " + codigo_jogo);
      

      // verifico agora se o TIME foi definido para este e-mail para o jogo que ele passou o codigo validado
      var sql = "SELECT p.id as id, p.id_jogo, COALESCE(p.time, 0) as time, COALESCE(j.jogo_fisico, 'n') as jogo_fisico "
            + "  From participantes_jogos p "
            + "	inner join jogos j on j.id = p.id_jogo "
            + "WHERE p.email = '"+email+"' and j.codigo = '"+codigo_jogo+"' and j.senha_jogo ='"+senha+"' limit 1 ";

      //console.log("Consulta de Time por e-mail validado para o jogo: " + sql);
      
      db.query(sql, function(err, results_existente) {

         if(results_existente.length > 0){
            if(results_existente[0].time > 0){
               // se tiver um time setado para este e-mail, direciono para a tela do jogo pratico
               console.log("Validou o time do e-mail: " + email);
               res.render('game.ejs',{message: message, codigo_jogo: codigo_jogo, time_email: results_existente[0].time,
                  id_jogo: results_existente[0].id_jogo, email_jogador: email, externo: 'normal', 
                  jogo_fisico: results_existente[0].jogo_fisico });
            }
            else{
               // retorno para a mesma tela e informo que o usuario deve aguardar a inclusao em um time
               console.log("Não validou o time do e-mail: " + email);
               message = "Por favor aguarde o Facilitador do jogo configurar o seu e-mail para o jogo " + codigo_jogo 
                  + " e clique novamente no botão para entrar no jogo.";
               res.render('pre_game.ejs',{message: "", message_erro: message, email: email, codigo_jogo: codigo_jogo, senha: senha});
            }
         }
      });

   } else {
      res.render('pre_game.ejs',{message: ""});
   }
};


var pathImagens = "./public/imagens/historias";

/**
 * 1. Montar map de imagensPorDiretorios
 * 2. Percorrer a lista de diretorios
 * 3. Gerar um array de imagens e popular dentro do map imagensPorDiretorios usando a pasta como chave e 
 * o array como valor.
*/

async function listarArquivosDoDiretorio(diretorio, arquivos) {

   var mapPosicoes = new Map();

   if(!arquivos)
       arquivos = [];

   // var dimensions = "";

   let listaDeArquivos = await fs.readdir(diretorio);
   for(let k in listaDeArquivos) {
       let stat = await fs.stat(diretorio + '/' + listaDeArquivos[k]);
       if(stat.isDirectory()){
           await listarArquivosDoDiretorio(diretorio + '/' + listaDeArquivos[k], arquivos);
       } else {
            // // pego a altura e largura das imagens
            // comentado porque comecou gerar erros em producao
            // (node:27) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
            // dimensions = sizeOf(diretorio + '/' + listaDeArquivos[k]);

            // mapTamanhoImagens.set((diretorio.replace(pathImagens + '/', '') +'-'+(listaDeArquivos[k]).replace(".png", "")), {"largura": dimensions.width, "altura": dimensions.height});


           arquivos.push(diretorio + '/' + listaDeArquivos[k]);
           mapPosicoes.set( (listaDeArquivos[k]).replace(".png", ""), 
            {"top": (Math.floor((Math.random() * 250) + 300)), "left": Math.floor((Math.random() * 380) + 600)});
       }
   }


   // for (const [key,value] of mapTamanhoImagens){
   //    console.log('Peça ' + key + ' - Largura: ' + value.largura + ' - Altura: ' + value.altura);
   // }

   // somente incluo na lista se possuir o valor './public/imagens/historias/h'
   if(diretorio.includes('./public/imagens/historias/h')){
      diretorio = diretorio.replace(pathImagens, "");
      mapImagensHistorias.set(diretorio.replace("/", ""), {"listaDeArquivos":listaDeArquivos, "mapPosicoes": mapPosicoes});

      arrayImagensHistorias.push(diretorio.replace("/h", ""));
   }

   return arquivos;

}

async function carregarmapImagensHistorias() {
   let arquivos = await listarArquivosDoDiretorio(pathImagens); // coloque o caminho do seu diretorio


   // for (const [key,value] of mapImagensHistorias){
   //    //console.log("Key: " + key + " - Value: " + value.listaDeArquivos);
   //    for (const [key1,value1] of value.mapPosicoes){
   //       //console.log("Map posicoes Key: " + key1 + " - top: " + value1.top + " - left: " + value1.left);
   //    }
   // }

   arrayImagensHistorias = arrayImagensHistorias.sort(compararNumeros);
  
   //console.log(arquivos);|
   return arquivos;
}

function compararNumeros(a, b) {
   return a - b;
 }

function carregarMapDadosHistorias(id_jogo) {
   
   //var sql1="SELECT id, coalesce(numero, 0) as numero, titulo, quantidade_pecas, coalesce(roi_diario, 0) as roi_diario, tamanho "
   //   + "FROM historias ORDER BY numero ";

   var sql = "SELECT h.id as id, coalesce(h.numero, 0) as numero, coalesce(h.titulo, '') as titulo, "
            +"	coalesce(h.quantidade_pecas, 0) as quantidade_pecas, coalesce(h.roi_diario, 0) as roi_diario, "
            +"	coalesce(h.tamanho, '') as tamanho, coalesce(hj.top, 10000) as top, coalesce(hj.etapa, '') as etapa "
            +"FROM historias h "
            +"	LEFT JOIN "
            +"		( "
            +"		SELECT coalesce(y, 10000) as top, coalesce(etapa, '') as etapa, coalesce(numero, 0) as numero "
            +"		FROM historias_jogo "
            +"		WHERE id_jogo = "+id_jogo+" "
            +"		) as hj on hj.numero = h.numero "
            +"ORDER BY top, etapa, numero";

  //console.log("Busca dados das estorias: " + sql);
   
   db.query(sql, function(err, results){
      for(var i=0; i < results.length; i++) {
         /*console.log("Nr. historia: " + results[i].numero + " - titulo: " + results[i].titulo 
         + " - titulo: " + results[i].quantidade_pecas
         + " - titulo: " + results[i].roi_diario
         + " - titulo: " + results[i].tamanho
         );*/

         mapHistorias.set(results[i].numero, 
            {
               "titulo" : results[i].titulo, 
               "quantidade_pecas" : results[i].quantidade_pecas, 
               "roi_diario" : results[i].roi_diario, 
               "tamanho" : results[i].tamanho,
               "top" : results[i].top,
               "etapa" : results[i].etapa
            });
      }

      //console.log("Map historia: " + mapHistorias.size);

      for (const [key,value] of mapHistorias){
         //console.log("Key historia: " + key + " - Values: " + value);
      }
   });

}


//---------------------------------------------direct to game page ------------------------------------------------------
exports.direcionar_game = function(req, res){
   message = '';
   if(req.method == "POST"){
      var post = req.body;
      var codigo_jogo = post.codigo_jogo;
      var id_jogo = post.jogo_id;
      var time_jogo = post.time_selecionado;
      var jogo_fisico = post.jogo_fisico;

      console.log("***Cheguei na tela do jogo: " + time_jogo);

      if(!carregou_imagens){
         carregarmapImagensHistorias();
         console.log("*** Carregou o mapImagensHistorias apos reinicializacao do servidor nodejs **** " );
         carregou_imagens = true;
      }
      
      // direciono para a tela do game selecionado pelo facilitador geral
      res.render('game.ejs',{message: "", codigo_jogo: codigo_jogo, time_email: time_jogo, id_jogo: id_jogo, 
         email_jogador: req.session.email, externo: 'normal', jogo_fisico: jogo_fisico});
   }
};

var map = new Map();


//---------------------------------------------direct to game page ------------------------------------------------------
exports.carregar_game = function(req, res){
   message = '';
   if(req.method == "POST"){
      // var id_jogo = req.body.id_jogo;
      // var room = req.body.room;
      // //map = new Map();

      // var sql = "SELECT h.id as id, coalesce(h.numero, 0) as numero, coalesce(h.titulo, '') as titulo, "
      //          +"	coalesce(h.quantidade_pecas, 0) as quantidade_pecas, coalesce(h.roi_diario, 0) as roi_diario, "
      //          +"	coalesce(h.tamanho, '') as tamanho, coalesce(hj.top, 10000) as top, coalesce(hj.etapa, '') as etapa "
      //          +"FROM historias h "
      //          +"	LEFT JOIN "
      //          +"		( "
      //          +"		SELECT coalesce(y, 10000) as top, coalesce(etapa, '') as etapa, coalesce(numero, 0) as numero "
      //          +"		FROM historias_jogo "
      //          +"		WHERE id_jogo = "+id_jogo+" and room = '"+room+"' "
      //          +"		) as hj on hj.numero = h.numero "
      //          +"WHERE ativo = 's' "
      //          +"ORDER BY top, etapa, numero";

      var sql = "SELECT h.id as id, coalesce(h.numero, 0) as numero, coalesce(h.titulo, '') as titulo, "
            +"	coalesce(h.quantidade_pecas, 0) as quantidade_pecas, coalesce(h.roi_diario, 0) as roi_diario, "
            +"	coalesce(h.tamanho, '') as tamanho "
            +"FROM historias h "
            +"WHERE h.ativo = 's' "
            +"ORDER BY top, etapa, numero";

      // console.log("Busca dados das estorias: " + sql);

      db.query(sql, function(err, results){

         res.send(results);
         
      });
   }
};


//---------------------------------------------direct to game page ------------------------------------------------------
exports.carregar_game_kanban = function(req, res){
   message = '';
   if(req.method == "POST"){
      var room = req.body.room;
      var jogo_fisico = req.body.jogo_fisico;

      /**
       * Busco todos os registros da tabela 'etapas_jogo' para a room da chamada.
       * //1. Se possuir registros, entao vou atualizar todas as colunas (etapas) que possuem informacoes
       * [correcao em 01/04/2023] 
       * 1. Se ja existirem post-its movimentados nas colunas do jogo, vou buscar as informacoes na tabela 
       * `historias_jogo` para carrregar na tela. Isso deve ocorrer quando o jogador entrar num jogo que 
       * ja esta em andamento ou atualizar a pagina com F5.
       * 2. Caso esteja vazio, eh porque eh o inicio do jogo e nao movimentaram nenhum cartao ainda, 
       * entao, busco as informacoes ordenadas e carrego a coluna 'div-backlog' com base na tabela 
       * das historias do jogo.
       */
      //[correcao em 01/04/2023] 
      //var sql = "SELECT room, etapa, valor, data_atualizacao FROM `etapas_jogo` WHERE room = '"+room+"'";

      var sql = "SELECT h.id as id, coalesce(h.numero, 0) as numero, coalesce(h.titulo, '') as titulo, "
               +"	coalesce(h.quantidade_pecas, 0) as quantidade_pecas, coalesce(h.roi_diario, 0) as roi_diario, "
               +"   coalesce(h.tamanho, '') as tamanho, hj.etapa, hj.room, hj.x, hj.y, hj.dia_inicio, hj.dia_fim, hj.data_atualizacao "
               +"FROM historias h "
               +"	LEFT JOIN ( select numero, etapa, room, x, y, dia_inicio, dia_fim, data_atualizacao "
               +"               from historias_jogo hj where room = '"+room+"' "
               +"              ) AS hj on hj.numero = h.numero "
               +"WHERE h.ativo = 's' and h.jogo_fisico = '" + jogo_fisico +"' "
               +"ORDER BY numero";

      console.log("Busca dados das estorias kanban: " + sql);

      db.query(sql, function(err, results){
         if(results.length > 0){
            // console.log("Busca historias kanban alterado: " + sql);
            console.log("Busca historias kanban alterado");
            res.send({inicial:'false', resultado:results});
         }
         else{
            sql = "SELECT h.id as id, coalesce(h.numero, 0) as numero, coalesce(h.titulo, '') as titulo, "
               +"	coalesce(h.quantidade_pecas, 0) as quantidade_pecas, coalesce(h.roi_diario, 0) as roi_diario, "
               +"	coalesce(h.tamanho, '') as tamanho "
               +"FROM historias h "
               //+"WHERE h.ativo = 's' "
               +"WHERE h.ativo = 's' and h.jogo_fisico = '" + jogo_fisico +"' "
               +"ORDER BY numero";

            db.query(sql, function(err, results_inicio){
               // console.log("Busca historias kanban inicial: " + sql);
               console.log("Busca historias kanban inicial");
               res.send({inicial:'true', resultado:results_inicio});
            });
         }
      });
   }
};


//---------------------------------------------direct to game page ------------------------------------------------------
/*exports.carregar_financeiro = function(req, res){
   message = '';
   if(req.method == "POST"){
      var dia = req.body.dia;
      var room = req.body.room;

      // a query abaixo esta comentada, mas pode ser usada para analisar se os valores estao corretos
      // var sql = "SELECT hj.numero, hj.dia_fim, (("+dia+" + 1) - COALESCE(hj.dia_fim, 0)) as dias_fatura, COALESCE(h.roi_diario, 0) as roi_diario, "
      //          +"	((("+dia+" + 1) - COALESCE(hj.dia_fim, 0)) * (COALESCE(h.roi_diario, 0))) as roi_total "
      //          +"FROM historias_jogo hj "
      //          +"	INNER JOIN historias h on h.numero = hj.numero "
      //          +"WHERE hj.room = '"+room+"' and hj.etapa = 'div-feito' "
      //          +"order by hj.dia_fim";

      // este calculo considera os valores de roi diario a partir do dia da entrega ja.
      var sql = "SELECT sum(((("+dia+" + 1) - COALESCE(hj.dia_fim, 0)) * (COALESCE(h.roi_diario, 0)))) as roi_total "
               +"FROM historias_jogo hj "
               +"	INNER JOIN historias h on h.numero = hj.numero "
               +"WHERE hj.room = '"+room+"' and hj.etapa = 'div-feito' ";

      console.log("Busca financeiro das estorias: " + sql);

      db.query(sql, function(err, result){
         res.send(result[0].roi_total);
      });
   }
};*/

//---------------------------------------------save history of kanban board ------------------------------------------------------
exports.save_history = function(req, res){
   message = '';

   let {numero, id_jogo, etapa, dia, x, y, room} = req.body;  

   numero = numero.replace('historia-', '');

   console.log('save_history: ' + new Date() + ' - ' + numero + ' para a room ' + room + ' na etapa ' + etapa);
        
        // vamos buscar os post-its deste quadro nesta room
        var sql = "SELECT id, coalesce(dia_inicio, 0) as dia_inicio, etapa as etapa_consulta "
                + " FROM historias_jogo "
                + " WHERE numero = "+numero+" and id_jogo = " +id_jogo + " and room = '" +room +"' ";
    
        //console.log('SQL consulta dados da historia: ' + sql);
          
        db.query(sql, function(err, result) {
            //if(true){
            if(typeof result !== 'undefined' && result.length > 0){
               // UPDATE

               console.log('Atualizando kanban - etapa_consulta: ' + result[0].etapa_consulta + " - etapa kanban: " + etapa + " - historia: " + numero);
               
                sql = "UPDATE historias_jogo "
                + "	SET etapa='"+etapa+"', data_atualizacao = now(), room = '"+room+"', x = "+x+", y = "+y+" "

                /**
                 * Somente alteramos o dia de inicio ou fim se for uma troca de coluna. Se for somente mudanca
                 * de posicao na mesma coluna, nao deve mexer nestas colunas.
                 */
                if(typeof result[0].etapa_consulta !== 'undefined' && result[0].etapa_consulta !== etapa){
                  

                  if(etapa == 'div-fazer'){
                     sql = sql + "	, dia_inicio="+dia+" "
                     console.log('*** Atualiza inicio: ' + result[0].etapa_consulta);
                  }
                  // se for a etapa fazendo, atualizo o dia de inicio
                  else if(etapa == 'div-fazendo' && result[0].dia_inicio == 0){
                     // atualizo o dia_inicio igual ao dia corrente
                     sql = sql + "	, dia_inicio="+dia+" "
                     console.log('*** Atualiza inicio: ' + result[0].etapa_consulta);
                  }
                  // se for a etapa final, atualizo o dia final
                  else if(etapa == 'div-feito'){
                     sql = sql + "	, dia_fim="+dia+" "
                     console.log('*** Atualiza fim: ' + result[0].etapa_consulta);


                     //console.log("data_inicio: "+result[0].data_inicio);
                     // console.log("Feito: " + result[0].dia_inicio);

                     /**
                      * se o jogador passar da coluna backlog ou product backlog direto para a coluna "pronto", entao 
                      * atualizo o dia_inicio igual ao dia_fim
                      */
                     if(result[0].dia_inicio == 0){
                        console.log("Validou Feito: " + result[0].dia_inicio);
                           sql = sql + "	, dia_inicio="+dia+" "
                           console.log('*** Atualiza inicio: ' + result[0].etapa_consulta);
                     }
                  }
               }
 
                sql = sql + " WHERE numero = "+numero+" and id_jogo = " +id_jogo + " and room = '" +room + "' ";

                db.query(sql, function(err, result_update) {
                    //console.log("Query update Historia: "+sql);
                    //console.log("Historia "+numero+" atualizada para o jogo " + room);

                    res.send("Atualizado com sucesso!");
                });

            }
            else {
               //INSERT 

                sql = " INSERT INTO historias_jogo(id, numero, id_jogo, etapa, x, y  "
                var values = " VALUES (null,"+numero+","+id_jogo+", '"+etapa+"', "+x+", "+y+" ";

                // se for a etapa inicial, ou seja, etapas fazer e fazendo
                if(etapa == 'div-fazer' || etapa == 'div-fazendo'){
                    sql = sql+ ", dia_inicio "
                    values = values + ", "+dia + " "
                } 
                else {
                  if(etapa == 'div-feito'){
                    // se o jogador passar da coluna backlog ou product backlog direto para a coluna "pronto", entao 
                    // atualizo o dia_inicio igual ao dia_fim
                    sql = sql+ ", dia_inicio , dia_fim "
                    values = values + ", "+dia+", "+dia + " "
                  }
                }
                
                sql = sql+ ", room, data_atualizacao) "
 
                values = values+ ", '"+room+"', now()) "

                sql = sql + values;

                db.query(sql, function(err, result_insert) {
                    console.log("Query insert Historia: "+sql);
                    console.log("Historia "+numero+" atualizada para o jogo " + room);

                     res.send("Inserido com sucesso!");
                });
            }


            // devo mandar carregar somente a tela que acaba de iniciar, para nao gerar duplicidade nas telas que ja estao carregadas corretamente
            //socket.in(room).emit('remove_card', { tipo: tipo, uuid: uuid });
            //socket_geral.to(room).emit('remove_card', { tipo: tipo, uuid: uuid });
            //console.log("Remove o card "+uuid+" para todos da sala " + room);

            
        });
};


//---------------------------------------------save history of kanban board ------------------------------------------------------
exports.save_history_kanban = function(req, res){
   message = '';

   // let {room, target, target_value, source, source_value} = req.body;
   let {room, 
      value_div_backlog, 
      value_div_sprint_backlog, 
      value_div_fazer, 
      value_div_fazendo, 
      value_div_feito} = req.body;

      value_div_backlog = value_div_backlog.replace("class='", 'class="').replace(' gu-transit', '');
      value_div_sprint_backlog = value_div_sprint_backlog.replace("class='", 'class="').replace(' gu-transit', '');
      value_div_fazer = value_div_fazer.replace("class='", 'class="').replace(' gu-transit', '');
      value_div_fazendo = value_div_fazendo.replace("class='", 'class="').replace(' gu-transit', '');
      value_div_feito = value_div_feito.replace("class='", 'class="').replace(' gu-transit', '');
   
   // source_value = source_value.replace("class='", 'class="').replace(' gu-transit', '');
   //console.log('source_value: ', source_value);

   // console.log('save_history_kanban: ' + new Date() + ' - ' + target + ' para a room ' + room);
   console.log('save_history_kanban: ' + new Date() + ' - room: ' + room);

   var sql_insert = "INSERT INTO etapas_jogo (id, etapa, valor, room, data_atualizacao) VALUES ";

   // var values_query = " (null, '"+source+"', '"+    source_value+"', '"+room+"', now()) ";

   // if(target !== source){
   //    target_value = target_value.replace("class='", 'class="').replace(' gu-transit', '');

   //    //console.log('target_value: ', target_value);

   //    values_query = values_query + ", (null, '"+target+"', '"+    target_value+"', '"+room+"', now()) ";
   // }

   var values_query = " (null, 'div-backlog', '"+    value_div_backlog+"', '"+room+"', now()) ";

   values_query = values_query + ", (null, 'div-sprint-backlog', '"+    value_div_sprint_backlog+"', '"+room+"', now()) ";
   values_query = values_query + ", (null, 'div-fazer', '"+    value_div_fazer+"', '"+room+"', now()) ";
   values_query = values_query + ", (null, 'div-fazendo', '"+    value_div_fazendo+"', '"+room+"', now()) ";
   values_query = values_query + ", (null, 'div-feito', '"+    value_div_feito+"', '"+room+"', now()) ";


   // var sql = "DELETE FROM etapas_jogo WHERE room = '"+room+"' AND etapa in ('"+target+"','"+source+"') ";
   var sql = "DELETE FROM etapas_jogo WHERE room = '"+room+"' ";
   
   sql_insert = sql_insert + values_query;

   /** 
    * deleto os registros das etapas que foram alteradas, que pode ser uma (quando mexe na mesma coluna) 
    * ou duas (quando move de uma coluna pra outra)
   */ 
   db.query(sql, function(err, result) {
      // console.log('Vai realizar o insert dados das historias: ' + sql_insert);
      console.log('Vai realizar o insert dados das historias');

      // espero 1 segundo para realizar o insert
      setTimeout(function() {
         /**
          * Agora insiro os registros atualizados
          */
         db.query(sql_insert, function(err, result_delete) {
            console.log('Realizado o insert dados das historias');
            res.send("Kanban atualizado com sucesso!");
         });
      }, 1000);
      
   });
};


//---------------------------------------------save history of kanban board ------------------------------------------------------
exports.save_avaliacao = function(req, res){
   message = '';

   console.log('Chegou no metodo save_avaliacao');  

   let {id_jogo, avaliacao, comentarios, email_jogador} = req.body;

        
        // vamos buscar os post-its deste quadro nesta room
        var sql = "SELECT id FROM avaliacoes WHERE id_jogo = " +id_jogo+" AND email_jogador = '"+email_jogador+"' ";
        var nps = -2;

        switch(avaliacao) {
            case 'feliz':
               nps = 1;
               break;
            case 'triste':
               nps = -1;
               break;
            default:
               nps = 0;
         }
          
        db.query(sql, function(err, result) {
            //if(true){
            if(typeof result !== 'undefined' && result.length > 0){
                sql = "UPDATE avaliacoes "
                  + "   SET nota="+nps+", data_atualizacao = now(), comentarios = '"+comentarios+"' "
                  + "   WHERE id_jogo = "+id_jogo+" and email_jogador = '" +email_jogador + "' ";

                  console.log("Query update Avaliacao: "+sql);

                db.query(sql, function(err, result_update) {
                    res.send("Avaliação atualizada com sucesso!");
                });
            }
            else {
                sql = "INSERT INTO avaliacoes (id, id_jogo, email_jogador, nota, comentarios, data_atualizacao)  "
                  + " VALUES (null,"+id_jogo+",'"+email_jogador+"', "+nps+",'"+comentarios+"', now())";

                  console.log("Query insert Avaliacao: "+sql);

                db.query(sql, function(err, result_insert) {
                    //console.log("Query insert Avaliacao: "+sql);

                     res.send("Av. inserida com sucesso!");
                });
            }
        });
};


//---------------------------------------------save data of games ------------------------------------------------------
exports.save_data_game = function(req, res){
   message = '';

   let {id_jogo, dia, info1} = req.body;
   userID = req.session.userId;

   console.log('save_data_game: ' + new Date() + ' - Dia ' + dia + ' para o jogo ' + id_jogo);

   // vamos buscar os post-its deste quadro nesta room
   var sql = "SELECT id FROM dados_jogos dj WHERE dj.id_jogo = " +id_jogo+" ";

  //console.log('SQL consulta dados da room: ' + sql);
      
   db.query(sql, function(err, result) {
      if(result.length > 0){
            sql = "UPDATE dados_jogos "
                  +"SET maior_dia="+dia+",ultimo_evento='"+info1+"',id_usuario="+userID+",data_atualizacao=now() "
                  +"WHERE id_jogo = "+id_jogo;
            
            // db.query(sql, function(err, result_update) {
            //    console.log("Query update data: "+sql);
            //    //console.log("Historia "+numero+" atualizada para o jogo " + room);

            //    if(err){
            //       res.send("Erro ao atualizar: " + err);
            //    }
            //    else {
            //       res.send("Atualizado com sucesso!");  
            //    }
            // });

            db.getConnection(function(err, connection) {
               if (err) throw err; // not connected!

               // console.log("Query update data: "+sql);
               console.log("Query update data");
             
               connection.query(sql, function (error, results, fields) {
                  connection.release();
               
                  // if (error) throw error;
                  if(error){
                     res.send("Erro ao atualizar: " + error);
                  }
                  else {
                     res.send("Atualizado com sucesso!");  
                  }
               });
            });

      }
      else {
            sql = "INSERT INTO dados_jogos(id, id_jogo, maior_dia, ultimo_evento, id_usuario, data_atualizacao) "
               +" VALUES (null,"+id_jogo+", "+dia+", '"+info1+"', "+userID+", now())";

            db.query(sql, function(err, result_insert) {
               //console.log("Query insert dados room: "+sql);

               if(err){
                  res.send("Erro ao inserir: " + err);
               }
               else {
                  res.send("Inserido com sucesso!");
               }
            });
      }
   });

};


//--------------------------------------------- search for data of game control  ------------------------------------------------------
exports.carregar_dados_control_game = function(req, res){
   message = '';

   console.log('Chegou no metodo carregar_dados_control_game');  

   let {id_jogo} = req.body;

   var sql = "SELECT coalesce(maior_dia, 0) as maior_dia FROM dados_jogos dj WHERE dj.id_jogo = " + id_jogo;

   db.query(sql, function(err, result_dia) {
      if(result_dia.length > 0){
         // agora atualizo as informacoes do jogo
         sql = "SELECT id, dj.id_jogo, coalesce(maior_dia, 0) as maior_dia, coalesce(ultimo_evento, '') as ultimo_evento, "
            +"	coalesce(pontos_dia.pontos_dia, 0) as pontos_dia, coalesce(total_pontos.total_pontos, 0) as total_pontos, coalesce(diario.info2, '') as info2 "
            +"FROM dados_jogos dj  "
            +" 	left join ( "
            +" 		SELECT id_jogo, dia, sum(pontos) as pontos_dia FROM dias_jogadores WHERE id_jogo = "+id_jogo+" and dia = "+result_dia[0].maior_dia+" "
            +" 	) as pontos_dia on pontos_dia.id_jogo = dj.id_jogo "
            +"     left join ( "
            +" 		SELECT id_jogo, dia, sum(pontos) as total_pontos FROM dias_jogadores WHERE id_jogo = "+id_jogo+" and dia <= "+result_dia[0].maior_dia+" "
            +" 	) as total_pontos on total_pontos.id_jogo = dj.id_jogo "
            +"	left join ( "
            +"		SELECT d.dia, d.info2 from diario d where dia = " +result_dia[0].maior_dia 
            +"	) as diario on diario.dia = dj.maior_dia "
            +" WHERE dj.id_jogo = "+id_jogo;

         //console.log('SQL consulta dados do jogo '+id_jogo+': ' + sql);
            
         db.query(sql, function(err, result) {
            if(result.length > 0){
               // agora carrego os pontos por dia
               sql = "SELECT dj.dia, sum(dj.pontos) as total_dia FROM dias_jogadores dj "
                     +"    WHERE dj.id_jogo = "+id_jogo+ " and dj.dia <= " +result_dia[0].maior_dia+ " "
                     +"    group by dj.dia "
                     +"    order by dj.dia";

               db.query(sql, function(err, result_pontos) {
                  res.send({dados:result[0], pontos:result_pontos});
               }); 
            }
         });
      }
   });


};



//---------------------------------------------direct to game page ------------------------------------------------------

function pontuarJogo(id_jogo, min, max, userId, quem_chamou, res, req){
   console.log("Chegou na funcao pontuar jogo");

   var user =  req.session.user;
   var tipo =  req.session.tipo;

      // busco os jogadores e marco os que possuem jogo vinculado
      sql = "SELECT j.id as id_jogador, jj.id_jogo as id_jogo, j.nome "
         + "FROM jogadores j "
         + "	INNER JOIN jogadores_jogos jj on jj.id_jogador = j.id "
         + " WHERE jj.id_jogo = "+ id_jogo +" "
         + " ORDER BY j.nome ";

         //console.log("Query pontuar jogo:" + sql);

      // comeco
      var values_query_j = " ";

      min = parseInt(min, 10);
      max = parseInt(max, 10);

      // este numero deve vir do cadastro do jogo no futuro TODO
      var quantidade_dias_jogo = 20;
      var pontos_sorteados = 	0;

      db.query(sql, function(err, result_jogadores) {
         for(var i=0; i < result_jogadores.length; i++) {
           // console.log("Result: " + result_jogadores[i].id_jogador);
            
            // para cada jogador setado no jogo, devo gerar a pontuacao para a quantidade de dias maxima do jogo
            for(var j=1; j <= quantidade_dias_jogo; j++) {
               // somente os dias que nao sao final de sprints. No jogo, temos sprint de 5 dias.
               if(j % 5 > 0){
                  pontos_sorteados = min + Math.floor(((max + 1) - min) * Math.random());

                  //console.log("pontos_sorteados: " + pontos_sorteados + " - max: " + max + " - min: " + min);

                  // valores = jogador_id, dia, pontos, usuario, id_jogo
                  values_query_j = values_query_j + "(" +  result_jogadores[i].id_jogador + "," + j + ", " + pontos_sorteados 
                  + ", " + userId + ", " + id_jogo + ")";

                  //console.log("values_query: " + values_query);

                  // enquanto nao for o ultimo registro eu vou incluindo virgula 
                  if((j + 1) < quantidade_dias_jogo){
                     values_query_j = values_query_j + ", ";  
                  }
               }
            }

            if((i + 1) < result_jogadores.length){
               values_query_j = values_query_j + ", ";  
            }
         }
                 
         //console.log("values_query: " + values_query_j);

        // agora deleto todos os registros de pontos para este jogo
         var sql_delete = "DELETE FROM dias_jogadores WHERE id_usuario = "+userId+" AND id_jogo = " + id_jogo;
         //console.log("Vai delete dias jogadores: " + sql_delete);

         db.query(sql_delete, function(err, result_delete) {
            // insert na tabela de dias_jogadores por jogo
            var sql_dias_jogadores = "INSERT INTO dias_jogadores (id_jogador, dia, pontos, id_usuario, id_jogo) "
               + "VALUES " + values_query_j;
            //console.log("Vai gravar jogadores: " + sql_dias_jogadores);

            db.query(sql_dias_jogadores);
         });
      });

      // se quem_chamou = "repontuar", entao devo enviar uma mensagem de sucesso ao repontuar
      if(quem_chamou == "repontuar"){
         // passo o id do jogo
         // res.render('dashboard.ejs',{message:"Jogo repontuado com sucesso!", data: id_jogo});
         res.render('home.ejs',{message:"Jogo repontuado com sucesso!", data: id_jogo, user: user, tipo: tipo});
      }
}

exports.pontuar_game = function(req, res){

   var userId = req.session.userId;
   var jogo_id = 0;
   var min = 0;
   var max = 0;
   
   var sql="SELECT j.id as jogo_id, coalesce(conf.min_pontos_dev, 0) as min_pontos_dev, coalesce(conf.max_pontos_dev, 0) as max_pontos_dev "
      + "FROM jogos j "
         + "left join configuracoes conf on conf.id_jogo = j.id "
      + "WHERE j.id_usuario = "+userId+" and j.status = 'ativo' order by jogo_id DESC limit 1";

  //console.log("Busca de jogo e config por usuario: " + sql);
   
   db.query(sql, function(err, results){
      if (results.length > 0){
         jogo_id = results[0].jogo_id;
         min = results[0].min_pontos_dev;
         max = results[0].max_pontos_dev;

         // repontuar jogo
         pontuarJogo(jogo_id, min, max, userId, "repontuar", res, req);
      }
   });

   
};

// --------------------
exports.carregar_imagens = function(req, res){
   if(!carregou_imagens){
      carregarmapImagensHistorias();
      console.log("*** ||| Carregou o mapImagensHistorias apos reinicializacao do servidor nodejs ||||| **** " );
      carregou_imagens = true;
   }
}


// --------------------

exports.carregar_times = function(req, res){

   var userId = req.session.userId;

   if(userId == null){
      res.redirect("/login");
      return;
   }

   var jogo_id = req.body.id_jogo;
   
   var sql = "SELECT coalesce(time, 0) as time, coalesce(link, 0) as link FROM times_jogos "
            + " WHERE id_jogo = "+jogo_id+" "
            + " GROUP BY time ORDER BY time ";
   
   console.log('SQL Times: ' + sql);
   
   db.query(sql, function(err, result_times){
      if(typeof result_times !== 'undefined' && result_times.length > 0){
         console.log('Times: ' + result_times.length);
         res.send({response: result_times});
      }
      else {
         res.send({response: 0});
      }
   });
}; 

// --------------------


exports.registrar_penalidades = function(req, res){

   var userId = req.session.userId;

   if(userId == null){
      res.redirect("/login");
      return;
   }

   var id_jogo = req.body.id_jogo;
   var room = req.body.room;
   var dia = req.body.dia;
   var valor = req.body.valor;
   
   // var sql = "SELECT COALESCE(penalidades.total, 0) as total "
   //             + " FROM ( "
	//                      + "SELECT sum(COALESCE(valor, 0)) total FROM penalidades WHERE room = '"+room+"' ) as penalidades";

   var sql = "SELECT id, dia, COALESCE(valor, 0) total "
            + "FROM penalidades WHERE room = '"+room+"' and dia = "+dia+" " 
            + "order by dia";
   
   //console.log('SQL penalidades: ' + sql);
   
   db.query(sql, function(err, result){
      if(typeof result !== 'undefined' && result.length > 0){
         // se ja existe registro pro dia, entao atualizo o valor
         sql = "UPDATE penalidades SET valor = "+valor+", data_atualizacao = now() WHERE room = '"+room+"' and dia = "+dia+" ";

        // console.log('Penalidades: ' + result.length);

         db.query(sql, function(err, result){
            res.send('Registro atuallizado com sucesso!');
         });
      }
      else {
         sql = "INSERT INTO penalidades (id, id_jogo, room, dia, valor, data_atualizacao) "
               +" VALUES (null, "+id_jogo+", '"+room+"', "+dia+", "+valor+", now() ) ";

         db.query(sql, function(err, result){
            res.send('Registro inserido com sucesso!');
         });
      }
   });
}; 



// --------------------


exports.registrar_investimento = function(req, res){

   var userId = req.session.userId;

   if(userId == null){
      res.redirect("/login");
      return;
   }

   var id_jogo = req.body.id_jogo;
   var room = req.body.room;
   var dia = req.body.dia;
   var valor = req.body.valor;
   
   // var sql = "SELECT COALESCE(penalidades.total, 0) as total "
   //             + " FROM ( "
	//                      + "SELECT sum(COALESCE(valor, 0)) total FROM penalidades WHERE room = '"+room+"' ) as penalidades";

   var sql = "SELECT id, dia, COALESCE(valor, 0) total "
            + "FROM investimentos WHERE room = '"+room+"' and dia = "+dia+" " 
            + "order by dia";
   
   console.log('SQL investimentos: ' + sql);
   
   db.query(sql, function(err, result){
      if(typeof result !== 'undefined' && result.length > 0){
         // se ja existe registro pro dia, entao atualizo o valor
         sql = "UPDATE investimentos SET valor = "+valor+", data_atualizacao = now() WHERE room = '"+room+"' and dia = "+dia+" ";

        // console.log('Penalidades: ' + result.length);

         db.query(sql, function(err, result){
            res.send('Registro atuallizado com sucesso!');
         });
      }
      else {
         sql = "INSERT INTO investimentos (id, id_jogo, room, dia, valor, data_atualizacao) "
               +" VALUES (null, "+id_jogo+", '"+room+"', "+dia+", "+valor+", now() ) ";

         db.query(sql, function(err, result){
            res.send('Registro inserido com sucesso!');
         });
      }
   });
}; 


//---------------------------------------------direct to game page ------------------------------------------------------
exports.carregar_controle = function(req, res){
   message = '';

   console.log("Carregando controle");

   var userId = req.session.userId;
   if(userId == null){
      res.redirect("/login");
      return;
   }

   var sql="SELECT j.id as jogo_id, j.codigo as codigo_jogo, j.status as jogo_status, j.data_atualizacao as data_jogo, "
      + "coalesce(conf.min_pontos_dev, 0) as min_pontos_dev, coalesce(conf.max_pontos_dev, 0) as max_pontos_dev, "
      + "coalesce(conf.minutos_planning, 0) as minutos_planning, coalesce(conf.minutos_daily, 0) as minutos_daily, coalesce(conf.minutos_execucao, 0) as minutos_execucao, "
      + "coalesce(conf.minutos_review, 0) as minutos_review, coalesce(conf.minutos_retrospective, 0) as minutos_retrospective, "
      + "coalesce(j.jogo_fisico, 'n') as jogo_fisico "
   + "FROM jogos j "
      + "left join configuracoes conf on conf.id_jogo = j.id "
   + "WHERE j.id_usuario = "+userId+" and j.status = 'ativo' order by jogo_id "
   + "desc limit 1";

   //console.log("[Controle] Busca de jogos por usuario: " + sql);

   db.query(sql, function(err, results){
   // se for um jogo existente, devo carregar as informacoes para a tela de controle do jogo
   // console.log("Retorno de busca de jogos por usuario: " + results.length);

      if (results.length > 0){
         // busco os jogadores e marco os que possuem jogo vinculado
         sql = "SELECT jogadores.id as jogador_id, jogadores.nome as jogador_nome, jogadores.caminho_avatar, "
         + " 	jj.id_jogador_1 as jog_jogador_id "
         + " FROM jogadores jogadores "
         + " 	inner join "
         + " 	( "
         + " 	select j.id_jogador as id_jogador_1, j.id_jogo as id_jogo_1 "
         + " 	from jogadores_jogos j "
         + " 		inner join jogos jg on jg.id = j.id_jogo and jg.id_usuario = " + userId  + " and jg.id = "+results[0].jogo_id +" "
         + " 	) jj "
         + " 		on jj.id_jogador_1 = jogadores.id "
         + " order by jogador_nome";

         //console.log("[Controle] Consultou jogadores: " + sql);

         db.query(sql, function(err, result_jogadores){
            sql = "SELECT dia, pontos, id_jogador as jogador "
               + "FROM `dias_jogadores` "
               + "WHERE id_usuario = " + userId  + " and id_jogo = "+results[0].jogo_id +" "
               + " ORDER BY dia ASC, jogador ASC";

            // agora busco os e-mails dos participantes confirmados para o jogo
            db.query(sql, function(err, result_dias){
               console.log('Dias jogadores: ' + result_dias.length);

               // agora busco as mensagens por dias da tabela "diario"
               sql = "SELECT dia, info1, info2, info3 FROM diario " 
                  + "ORDER BY dia ASC limit 20";

               db.query(sql, function(err, result_diario){
                  console.log('Diario: ' + result_diario.length);
                  /** 
                   * o controle do jogo deve ser enviado para todos os times que possuem e-mails setados na tabela
                   * participantes_jogos para o jogo corrente. 
                  */
                  sql = "SELECT coalesce(time, 0) as time FROM participantes_jogos "
                     + " WHERE id_jogo = "+results[0].jogo_id+" "
                     + " GROUP BY time ORDER BY time ";

                     //console.log('SQL Times: ' + sql);
                  

                  db.query(sql, function(err, result_times){
                     console.log('Times: ' + result_times.length);
                     res.render('game_control.ejs',{message:"", message_erro:"", data: results, 
                        jogadores: result_jogadores, dias: result_dias, diario: result_diario, lista_times: result_times});
                  });
               });
            });
         });
      }else {
         // se for um novo jogo, ja devo ir direto para a tela de cadastro, sem tentar carregar informacoes
         console.log("Cadastro novo");

         sql = "SELECT jogadores.id as jogador_id, jogadores.nome jogador_nome, jogadores.caminho_avatar "
         + " FROM jogadores jogadores "
         + " order by jogador_nome";

         // crio um array vazio somente para evitar erros na tela de um novo cadastro

         let data_vazio = [
            ['id_jogo', 0],
            ['codigo_jogo', 0],
            ['senha_jogo', ''],
            ['jogo_fisico', 'n'],
            ['data_jogo', new Date()]
         ];

         console.log('Data: ' + data_vazio);

         db.query(sql, function(err, result_jogadores){
            res.render('new_game.ejs',{message:"", message_erro:"", data: data_vazio, data2: result_jogadores});
         });
      }
   });
};


//---------------------------------------------direct to game page ------------------------------------------------------
exports.carregar_retro = function(req, res){
   message = '';

   if(req.method == "POST"){
      var post = req.body;
      var codigo_jogo = post.codigo_jogo;
      var time_email = post.time_email;

      // nao inclui validacao de usuario, pois se o jogador esta nesta tela eh porque entrou com 
      // email validado ou eh uma admin/facilitador do jogo.

      console.log("Carregando retrospectiva: " + codigo_jogo + '-' + time_email);

      res.render('retro.ejs',{message:"", codigo_jogo: codigo_jogo, time_email: time_email});
   }
};

//---------------------------------------------direct to chart page ------------------------------------------------------
exports.carregar_charts = function(req, res){
   message = '';

   if(req.method == "POST"){
      var post = req.body;
      var codigo_jogo = post.codigo_jogo;
      var time_email = post.time_email;
      var jogo_fisico = 'n';

      if(post.jogo_fisico == 'on'){
         jogo_fisico = 's';
      }

      sql = "SELECT hj.dia as dia, hj.room as room, coalesce(sprint_backlog, 0) as sprint_backlog, "
            +"	coalesce(fazer, 0) as fazer, coalesce(fazendo, 0) as fazendo, coalesce(feito, 0) as feito "
            +"FROM historia_jogo_dia hj "
            +"	LEFT JOIN "
            +"			("
            +"			SELECT hj0.dia, count(hj0.numero) as sprint_backlog FROM historia_jogo_dia hj0 WHERE hj0.etapa = 'div-sprint-backlog' "
            +" and hj0.room = '"+codigo_jogo+"-"+time_email+"' GROUP BY hj0.dia "
            +"			) as sprint_backlog on sprint_backlog.dia = hj.dia "
            +"	LEFT JOIN "
            +"			("
            +"			SELECT hj1.dia, count(hj1.numero) as fazer FROM historia_jogo_dia hj1 WHERE hj1.etapa = 'div-fazer' "
            +" and hj1.room = '"+codigo_jogo+"-"+time_email+"' GROUP BY hj1.dia "
            +"			) as fazer on fazer.dia = hj.dia "
            +"	LEFT JOIN "
            +"			("
            +"			SELECT hj2.dia, count(hj2.numero) as fazendo FROM historia_jogo_dia hj2 WHERE hj2.etapa = 'div-fazendo' "
            +" and hj2.room = '"+codigo_jogo+"-"+time_email+"' GROUP BY hj2.dia "
            +"			) as fazendo on fazendo.dia = hj.dia "
            +"	LEFT JOIN "
            +"			("
            +"			SELECT hj3.dia, count(hj3.numero) as feito FROM historia_jogo_dia hj3 WHERE hj3.etapa = 'div-feito' "
            +" and hj3.room = '"+codigo_jogo+"-"+time_email+"' GROUP BY hj3.dia "
            +"			) as feito on feito.dia = hj.dia "
            +"WHERE hj.room = '"+codigo_jogo+"-"+time_email+"' and hj.dia > 0 "
            +"GROUP BY hj.dia, hj.room "
            +"ORDER BY hj.dia";

      console.log("Carregando retrospectiva: " + codigo_jogo + '-' + time_email);

      db.query(sql, function(err, result){
         sql = "SELECT hj.numero, COALESCE(hj.dia_inicio, 0) as inicio , COALESCE(hj.dia_fim, 0) as fim, "
               +"	(((COALESCE(hj.dia_fim, 0)) - (COALESCE(hj.dia_inicio, 0)))+1) as lt  "
               +"FROM historias_jogo hj "
               +"WHERE hj.etapa = 'div-feito' and hj.room = '"+codigo_jogo+"-"+time_email+"' "
               +"order by hj.data_atualizacao";

         db.query(sql, function(err, result_control){
         //    sql = "SELECT hj.dia_fim, hj.room, hj.numero, coalesce(h.roi_diario, 0) as roi_diario "
         //          +"FROM historias_jogo hj "
         //          +"   INNER JOIN historias h on h.numero = hj.numero "
         //          +"WHERE hj.room = '"+codigo_jogo+"-"+time_email+"' and hj.etapa = 'div-feito' "
         //          +"order by hj.dia_fim ";

            /**
             * Busco toda a movimentacao financeira dos 20 dias, que podem ser o roi, multa e investimento por dia.
             */
            sql = "SELECT room, dia_fim, roi_diario, investimento_dia, multa_dia "
                  +"FROM ( "
                  +"	SELECT hj.room as room, hj.dia_fim, hj.numero, coalesce(h.roi_diario, 0) as roi_diario, "
                  +"		0 as investimento_dia, 0 as multa_dia "
                  +"	FROM historias_jogo hj "
                  +"	   INNER JOIN historias h on h.numero = hj.numero "
                  +"	WHERE hj.room = '"+codigo_jogo+"-"+time_email+"' and hj.etapa = 'div-feito' and h.passeio <> 's' "
                  +"UNION "
                  +"	SELECT hj.room as room, (CASE WHEN hj.dia_fim < 6 then 6 else hj.dia_fim END) as dia_fim, hj.numero, coalesce(h.roi_diario, 0) as roi_diario, "
                  +"		0 as investimento_dia, 0 as multa_dia "
                  +"	FROM historias_jogo hj "
                  +"	   INNER JOIN historias h on h.numero = hj.numero "
                  +"	WHERE hj.room = '"+codigo_jogo+"-"+time_email+"' and hj.etapa = 'div-feito' and h.passeio = 's' and h.jogo_fisico = '" + jogo_fisico +"' "
                  +"UNION "
                  +"	SELECT i.room as room, i.dia as dia_fim, null as numero, 0 as roi_diario, "
                  +"		sum(COALESCE(i.valor, 0)) as investimento_dia, 0 as multa_dia "
                  +"	FROM investimentos i "
                  +"	WHERE i.dia <= 20 AND i.room = '"+codigo_jogo+"-"+time_email+"' and i.valor > 0 "
                  +"	GROUP BY i.room, i.dia "
                  +"UNION "
                  +"	SELECT p.room as room, p.dia as dia_fim, null as numero, 0 as roi_diario, "
                  +"		0 as investimento_dia, sum(COALESCE(p.valor, 0)) as multa_dia "
                  +"	FROM penalidades p "
                  +"	WHERE p.dia <= 20 AND p.room = '"+codigo_jogo+"-"+time_email+"' and p.valor > 0 "
                  +"	GROUP BY p.room, p.dia "
                  +"	) as financeiro "
                  +"order by financeiro.dia_fim";

            db.query(sql, function(err, result_financeiro){
               res.render('charts.ejs',{message:"", codigo_jogo: codigo_jogo, time_email: time_email, 
                  data_cfd: result, data_control: result_control, data_financeiro: result_financeiro 
               });
            });
         });
      });
   }
};


//---------------------------------------------add players on the game ------------------------------------------------------
exports.adicionar_jogadores = function(req, res){
   message = '';
   if(req.method == "POST"){
      var post = req.body;
      var codigo_jogo = post.codigo_jogo;
      var id_jogo = post.id_jogo;
      var email = post.email;

      // verifico primeiro se este participante ja nao existe para este jogo
      var sql = "SELECT p.id as id, id_jogo, COALESCE(time, 0) as time, j.status from participantes_jogos p "
            + "	inner join jogos j on j.id = p.id_jogo "
            + "WHERE p.email = '"+email+"' and j.codigo = '"+codigo_jogo+"' limit 1 ";
      
      var message = '';
      var message_erro = '';

      db.query(sql, function(err, results_existente) {

         if(results_existente.length > 0){

            console.log("O e-mail "+email+" está registrado para o time "+results_existente[0].time+" do jogo "+codigo_jogo+".");

            message_erro = "O e-mail "+email+" está registrado para o time "+results_existente[0].time+" do jogo "+codigo_jogo+".";

            res.send( {message: message, message_erro: message_erro} );   
         }
         else {
            // depois de validar o e-mail, codigo e senha, insiro o e-mail para que este participante possa entrar no jogo
            var sql_insert = "INSERT INTO participantes_jogos(id, email, id_jogo, data_atualizacao) VALUES (null, '" + email 
                     + "'," + id_jogo + ", now())";

            console.log('Vai gravar o participante ' + email + ' no jogo ' + codigo_jogo + '. SQL: ' + sql_insert);

            db.query(sql_insert, function(err, result) {
               message = "E-mail cadastrado no jogo com sucesso!";
               
               sql = "SELECT id, email, coalesce(time, 0) as time FROM participantes_jogos WHERE id_jogo = " + id_jogo + " order by id ASC ";

               // agora busco os e-mails dos participantes confirmados para o jogo
               db.query(sql, function(err, result_Participantes){
                  console.log('Participantes: ' + result_Participantes.length);

                  res.send( {message:message, message_erro:"", data: result_Participantes} );
               });
            });
         }
      });

   } else {
      console.log("caiu no GET adicionar_jogadores");
   }
};


//---------------------------------------------access page call------------------------------------------------------
exports.acessar = function(req, res){
   message = '';
   if(req.method == "POST"){
      var post = req.body;
      var codigo_jogo = post.codigo_jogo;
      var email = post.email;
      var senha = post.password;

      if(codigo_jogo == '0000'){
         console.log("Simulacao - codigo: " + codigo_jogo);
         
         res.render('game.ejs',{message: '', codigo_jogo: codigo_jogo, time_email: '1',
            id_jogo: 0, email_jogador: 'jogador@scrum3d.com', externo: 'normal'});
      }
      else {
         // verifico primeiro se este participante ja nao existe para este jogo
         var sql = "SELECT p.id as id, id_jogo, COALESCE(time, 0) as time, j.status, coalesce(j.jogo_fisico, 'n') as jogo_fisico "
         +" from participantes_jogos p "
         + "	inner join jogos j on j.id = p.id_jogo "
         + "WHERE p.email = '"+email+"' and j.codigo = '"+codigo_jogo+"' and j.senha_jogo ='"+senha+"' limit 1 ";

         db.query(sql, function(err, results_existente) {

            if(results_existente.length > 0){
               message = "";

               if(results_existente[0].status == 'finalizado'){
                  // retorno para a mesma tela e informo que o jogo nao estah ativo
                  console.log("O jogo " + codigo_jogo + " não está mais ativo.");
                  message = "O jogo " + codigo_jogo +" não está mais ativo.";
                  res.render('access.ejs',{message: message, email: email, codigo: codigo_jogo, senha: senha});
               }
               else {
                  /**
                   * caso o jogador ja tenha seu e-mail cadastrado para o jogo e tenha o time definido, ou seja, time maior 
                   * que 0, entao direciono direto para a tela do jogo de quebra-cabecas
                   */ 
                  if(results_existente[0].time > 0){
                     console.log("O e-mail "+email+" está registrado para o time "+results_existente[0].time+" do jogo "+codigo_jogo+". Direcionando para a tela do jogo.");

                     res.render('game.ejs',{message: message, codigo_jogo: codigo_jogo, time_email: results_existente[0].time,
                        id_jogo: results_existente[0].id_jogo, email_jogador: email, externo: 'normal', 
                        jogo_fisico: results_existente[0].jogo_fisico});
                  }
                  else {
                     console.log("O e-mail "+email+" ja existe para o jogo "+codigo_jogo+". Direcionando para a tela de espera do jogo.");
                     // se ja este email ja estiver cadastrado e estiver com codigo e senha corretos, direciono para a tela de espera do jogo
                     res.render('pre_game.ejs',{message: message, message_erro: "", email: email, codigo_jogo: codigo_jogo, senha: senha, id_jogo: results_existente[0].id});
                  }
               }
            }
            else {
               var sql = "SELECT id from jogos WHERE codigo = " + codigo_jogo + " and senha_jogo = '" + senha + "' limit 1";
               console.log("Buscando jogo pelo código: " + sql);

               // faco uma busca pelo codigo e senha do jogo
               db.query(sql, function(err, results) {
                  if(results.length){
                     console.log(results[0].id);

                     // depois de validar o e-mail, codigo e senha, insiro o e-mail para que este participante possa entrar no jogo
                     var sql_insert = "INSERT INTO participantes_jogos(id, email, id_jogo, data_atualizacao) VALUES (null, '" + email + "'," + results[0].id + ", now())";

                     db.query(sql_insert, function(err, result) {
                        message = "E-mail cadastrado no jogo com sucesso!";
                        //res.render('access.ejs',{message: message});
                        res.render('pre_game.ejs',{message: message, message_erro: "", email: email, codigo_jogo: codigo_jogo, senha: senha});
                     });
                  }
                  else{
                     message = 'Este código e/ou senha não são válidos!';
                     res.render('access.ejs',{message: message});
                  }
               });
            }
         });

      }

      
   } else {
      console.log("caiu no GET:" + req.params.id);

      res.render('access');
   }
};

//-----------------------------------------------game page functionality----------------------------------------------
           
exports.carregar = function(req, res){
           
   var user =  req.session.user,
   userId = req.session.userId;
   console.log('game_user='+userId);

   // devemos validar se este usuario teve seu email, codigo e senha do jogo validados
   // atraves da sessao 'req.session.participante_jogo = 1';
   // desta forma devo remover a validacao do login para jogadores. Esta validacao deve valer somente 
   // para facilitadores.

   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
   res.setHeader('Access-Control-Allow-Credentials', true); // If needed

   
   // valida se o usuario continua logado
   if(userId == null){
      res.redirect("/login");
      return;
   }

   //var sql="SELECT * FROM `usuarios` WHERE `id`='"+userId+"'";
   var sql="SELECT id, nome, caminho_avatar FROM `jogadores` where `ativo`='s'";

   db.query(sql, function(err, results){
      // chamo a lista de arquivos e incluo esta lista numa sessao e somente a recarrego em caso
      // de reinicar o servidor.
      // test();

	   // envio o resultado da consulta para a pagina .ejs mapeada abaixo com o array do resultado
      res.render('game.ejs', {jogadores:results, user:user, userId:userId, email_jogador: req.session.email, externo: 'normal'});    
   });
};

//------------------------------------logout functionality----------------------------------------------
exports.logout=function(req,res){
   req.session.destroy(function(err) {
      res.redirect("/login");
   })
};
//--------------------------------render user details after login--------------------------------
exports.profile = function(req, res){

   var userId = req.session.userId;
   if(userId == null){
      res.redirect("/login");
      return;
   }

   var sql="SELECT id, nome, `e-mail` as email FROM `usuarios` WHERE `id`='"+userId+"'";          
   db.query(sql, function(err, result){
      res.render('profile.ejs',{data:result});
   });
};
//---------------------------------edit users details after login----------------------------------
exports.editjogo=function(req,res){
   var userId = req.session.userId;
   if(userId == null){
      res.redirect("/login");
      return;
   }

   // o usuario vai entrar no jogo corrente que tem no usuario dele para facilitar. Cada usuario somente possuira 
   // um jogo por vez aberto na plataforma

   //var sql="SELECT id, codigo, status, `data_atualizacao` FROM `jogos` WHERE `id_usuario`='"+userId+"' order by id desc limit 1";
   
   var sql="SELECT j.id as jogo_id, j.codigo as codigo_jogo, j.status as jogo_status, j.data_atualizacao as data_jogo, "
         + "conf.min_pontos_dev as min_pontos_dev, conf.max_pontos_dev as max_pontos_dev, coalesce(senha_jogo, '') as senha_jogo, "
         + "conf.minutos_planning as minutos_planning, conf.minutos_daily as minutos_daily, conf.minutos_execucao as minutos_execucao, "
         + "conf.minutos_review as minutos_review, conf.minutos_retrospective as minutos_retrospective, coalesce(j.jogo_fisico, 'n') as jogo_fisico "
      + "FROM jogos j "
         + "left join configuracoes conf on conf.id_jogo = j.id "
      + "WHERE j.id_usuario = "+userId+" and j.status = 'ativo' order by jogo_id "
      + "desc limit 1";

  // console.log("Busca de jogos por usuario: " + sql);
   
   db.query(sql, function(err, results){
      // se for um jogo existente, devo carregar as informacoes para edicao
      //console.log("Retorno de busca de jogos por usuario: " + results.length);

      if (results.length > 0){
         // busco os jogadores e marco os que possuem jogo vinculado
         sql = "SELECT jogadores.id as jogador_id, jogadores.nome jogador_nome, jogadores.caminho_avatar, "
         + " 	test.id_jogador_1 as jog_jogador_id "
         + " FROM jogadores jogadores "
         + " 	left join "
         + " 	( "
         + " 	select j.id_jogador as id_jogador_1, j.id_jogo as id_jogo_1 "
         + " 	from jogadores_jogos j "
         + " 		inner join jogos jg on jg.id = j.id_jogo and jg.id_usuario = " + userId  + " and jg.id = "+results[0].jogo_id +" "
         + " 	) test "
         + " 		on test.id_jogador_1 = jogadores.id "
         + " order by jogador_nome";

         // console.log("Consultou jogadores: " + sql);

         db.query(sql, function(err, result_jogadores){
            sql = "SELECT id, email, coalesce(time, 0) as time FROM participantes_jogos WHERE id_jogo = " + results[0].jogo_id + " order by id ASC ";

            // agora busco os e-mails dos participantes confirmados para o jogo
            db.query(sql, function(err, result_Participantes){
               //console.log('Participantes: ' + result_Participantes.length);
               res.render('new_game.ejs',{message:"", message_erro:"", data: results, data2: result_jogadores, data3: result_Participantes});
            });
         });
      } else {
         // se for um novo jogo, ja devo ir direto para a tela de cadastro, sem tentar carregar informacoes
         console.log("Cadastro novo");

         sql = "SELECT jogadores.id as jogador_id, jogadores.nome jogador_nome, jogadores.caminho_avatar "
         + " FROM jogadores jogadores "
         + " order by jogador_nome";

         let data_vazio = [
            ['id_jogo', 0],
            ['codigo_jogo', 0],
            ['senha_jogo', ''],
            ['data_jogo', '']
         ];

         console.log('Data: ' + data_vazio);

         db.query(sql, function(err, result_jogadores){
            res.render('new_game.ejs',{message:"", message_erro:"", data: data_vazio, data2: result_jogadores});
         });
      }
   });
};

//---------------------------------------------save history day of kanban board ------------------------------------------------------
exports.save_day_history = function(req, res){
   message = '';

   console.log('Chegou no metodo save_day_history');  

   let {id_jogo, dia } = req.body;
        
   // vou buscar os registros das estorias do kanban da room para o dia que acabou de encerrar
   var sql = "SELECT hj.numero, coalesce(hj.etapa, '') as etapa, hj.room, hj.data_atualizacao "
            +"FROM historias_jogo hj "
            +"WHERE hj.id_jogo = " + id_jogo + " and etapa <> '' "
            +" ORDER BY hj.numero ";

   //console.log('SQL consulta dados do dia da historia: ' + sql);
      
   db.query(sql, function(err, result) {
      // antes de inserir os registros/foto do dia, verifico se o mesmo ja possui registro. Caso possua, quer dizer que o 
      // facilitador voltou os dias e esta avancando novamente e neste caso nao pode gerar novos registros para este dia
      sql = "SELECT count(hd.dia) as registros, hd.dia, hd.room FROM historia_jogo_dia hd "
               +"    INNER JOIN historias_jogo hj on hj.room = hd.room and hj.numero = hd.numero "
               +"where hj.id_jogo = "+ id_jogo +" and hd.dia = "+dia+" "
               +"group by hd.dia, hd.room";

      db.query(sql, function(err, result_dias) {
         // somente insiro registros para este dia caso este ainda nao possua registro na tabela historia_jogo_dia
         // *** Isto nao eh um erro, eh intencional que se grave as posicoes dos dias somente na primeira vez que o 
         // facilitador passa pelo dia ***
         if(typeof result_dias !== 'undefined' && result_dias.length > 0){
            res.send("Dia "+dia+" ja existente na tabela de controle de dias!");
         }
         else {
            for(var i=0; i < result.length; i++) {
               // agora insiro o registro de cada estoria que esta no kanban para aquele dia, desde o 
               // dia 1 do jogo
               sql = "INSERT INTO historia_jogo_dia(id, numero, dia, etapa, room, data_atualizacao) "
                  + " VALUES (null,"+result[i].numero+","+dia+", '"+result[i].etapa+"', '"+result[i].room+"', now()) ";
      
               db.query(sql, function(err, result_insert) {
                  console.log("Dia da história inserido com sucesso!" + sql);
               });
            }
      
            res.send("Dia "+dia+" inserido com sucesso!");
         }
      });

      
   });
};

//---------------------------------------------save history of kanban board ------------------------------------------------------
exports.carregar_nps = function(req, res){
   message = '';

   console.log('Chegou no metodo carregar_nps');  

   let { id_jogo } = req.body;

   // vamos buscar os post-its deste quadro nesta room
   var sql = "SELECT SUBSTRING_INDEX(email_jogador,'@',1) as e_mail, comentarios, nota, "
            +"DATE_FORMAT(data_atualizacao, '%d/%m/%Y %H:%i:%s') as data_atualizacao "
            +"FROM avaliacoes WHERE id_jogo = " +id_jogo+" ";
         
      db.query(sql, function(err, result) {
         res.send({list_aval: result});
      });
};


/**
 * Exemplo de INSERT com retorno do ID inserido
 * 
 * 

   let mysql = require('mysql');
   let config = require('./config.js');
   let connection = mysql.createConnection(config);

   let stmt = `INSERT INTO todos(title,completed)
               VALUES(?,?)`;
   let todo = ['Insert a new row with placeholders', false];

   // execute the insert statment
   connection.query(stmt, todo, (err, results, fields) => {
   if (err) {
      return console.error(err.message);
   }
   // get inserted id
   console.log('Todo Id:' + results.insertId);
   });

   connection.end();


   *****************

   COMO INSERIR VALORES E RECUPERAR A QUANTIDADE DE COLUNAS AFETADAS

   let mysql = require('mysql');
   let config = require('./config.js');

   let connection = mysql.createConnection(config);

   // insert statment
   let stmt = `INSERT INTO todos(title,completed)  VALUES ?  `;
   let todos = [
   ['Insert multiple rows at a time', false],
   ['It should work perfectly', true]
   ];

   // execute the insert statment
   connection.query(stmt, [todos], (err, results, fields) => {
   if (err) {
      return console.error(err.message);
   }
   // get inserted rows
   console.log('Row inserted:' + results.affectedRows);
   });

   // close the database connection
   connection.end();
 * 
 * 
 * 
 */