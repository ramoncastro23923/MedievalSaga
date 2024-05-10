
 //--------------------------------------------- carregar tarefas cadastrados ------------------------------------------------------
 exports.carregar_tarefas = function(req, res){
 
    var user =  req.session.user,
    tipo = req.session.tipo,
        time = req.session.time;
 
   console.log('Chegou no metodo carregar_tarefas');

   // var userId = req.session.userId;

   var sql = "SELECT t.`id` as id, t.`nome` as nome, t.`descricao` as descricao, t.`esforco` as esforco, t.`responsavel` as responsavel, t.`time` as time, "
   +"      DATE_FORMAT(t.`data_inicio`, '%d/%m/%Y') as `data_inicio`, "
   +"      DATE_FORMAT(t.`data_fim`, '%d/%m/%Y') as `data_fim`, t.`ativo` as ativo, "
   +"      t.`data_atualizacao` as data_atualizacao, t.`etapa` as etapa, u.nome as nome_responsavel "
   +"FROM `tarefas` as t "
   +"	LEFT JOIN `usuarios` as u on u.id = t.responsavel "
   +"WHERE t.`ativo` = 's' AND t.time = 1 "
   +"ORDER BY data_atualizacao DESC ";

      console.log('query: ' + sql)

   db.query(sql, function(err, result){
      res.render('backlog.ejs',{data_tarefas:result, user:user, tipo: tipo}); //Modificar depois senha 10993
      //res.send({data_tarefas: result});
   });                                                                                     

 };
 

 //--------------------------------------------- carregar tarefas cadastrados ------------------------------------------------------
 exports.carregar_tarefas_quadro = function(req, res){
 
   var user =  req.session.user,
   tipo = req.session.tipo,
   time = req.session.time;

  console.log('Chegou no metodo carregar_tarefas');

  // var userId = req.session.userId;

  var sql = " SELECT t.id as id, t.nome as nome, t.descricao as descricao, "
  +" 	t.esforco as esforco, t.responsavel as responsavel, u.nome as nome_responsavel, "
  +"     t.time as time, DATE_FORMAT(t.data_inicio, '%d/%m/%Y') as data_inicio, "
  +"      DATE_FORMAT(t.data_fim, '%d/%m/%Y') as data_fim, t.ativo as ativo, "
  +"      t.data_atualizacao as data_atualizacao, t.etapa as etapa, coalesce(ti.nome, '') as nome_time "
  +" FROM tarefas t "
  +" 	LEFT JOIN usuarios u on u.id = t.responsavel "
  +" 	LEFT JOIN times ti on ti.id = t.time "
  +" WHERE t.ativo = 's' AND t.time = " + time
  +" ORDER BY t.data_atualizacao DESC"

     console.log('query montar quadro: ' + sql)

  db.query(sql, function(err, result){
      res.render('quadro.ejs',{data_tarefas:result, user:user, tipo: tipo, time:time});
  });                                                                                     
   
   //res.render('quadro.ejs',{user:user, tipo: tipo});
};
 
 //---------------------------------------------carregar detalhe tarefa------------------------------------------------------
 exports.carregar_detalhe_tarefa = function(req, res){
 
    console.log('Chegou no metodo carregar_detalhe_tarefa');  
 
    let { id_tarefa } = req.body;
    var time = req.session.time;
 
    // vamos buscar os post-its deste quadro nesta room
    var sql = "SELECT `id`, `nome`, `descricao`, `esforco`, `responsavel`, "
    +"DATE_FORMAT(`data_inicio`, '%d/%m/%Y') as `data_inicio`, "
    +"DATE_FORMAT(`data_fim`, '%d/%m/%Y') as `data_fim`, `ativo`, "
    +"`data_atualizacao` FROM `tarefas` WHERE id ='"+id_tarefa+"'";    
 
       db.query(sql, function(err, result) {

         // Começo de membros dos times 
        console.log('Chegou no metodo carregar_times');
     //   console.log()

         var sql1="SELECT id, nome, `id_time` as time, `e-mail` as email, tipo, ativo FROM `usuarios`" 
         + " WHERE ativo = 's' AND id_time = " +time+ " ORDER by nome ASC";//alterar para buscar os usuarios do time
      
         db.query(sql1, function(err, result_membros_time) {
            console.log('vai imprimir: ' + sql1)
            res.send({data_tarefa: result, data_membros_time:result_membros_time});
         });
         // Fim de membros dos times

       //   res.send({data_tarefa: result});
       });
 };
 
 
 //--------------------------------------------- salvar tarefa (update) ------------------------------------------------------
 exports.salvar_tarefa = function(req, res){ 

    usuario_logado = req.session.userId;
    var time = req.session.time;

    console.log('usuario logado = '+usuario_logado);
    if(usuario_logado == null){
       res.redirect("/login");
       return;
    }


    if(req.method == "POST"){
 
       let {id_tarefa, nome, descricao, esforco, responsavel, ativo} = req.body;

      //data_inicio = convertData(data_inicio);
      //data_fim = convertData(data_fim);  
       
       if(id_tarefa == 0){
          
          //ativo = 's';
          
          var sql =  "INSERT INTO `tarefas`(`nome`,`descricao`, `esforco`, `responsavel`, "
        +" `ativo`, `time`, `data_atualizacao`, "
         +" `criador`, `usuario_atualizacao`) VALUES ('"+nome+"', '"+descricao+"', '"+esforco+"','"
         +responsavel+"','" +ativo+"', '"+time+"', now()," +usuario_logado+ ", "+usuario_logado+")";
 
         console.log('Insert na tarefa: ' + sql ); //Vai mostrar a query
         db.query(sql, function(err, result) {
            console.log('metodo salvar tarefa nova:');
            res.send( {message: 'sucesso', message_erro: '', ultimo_id: result.insertId} );   
         });      
      } else {
         if(ativo == 'true'){
            ativo = 's';
         } else {
            ativo = 'n';
         }
         
        var sql = "UPDATE `tarefas` SET nome = '"+nome+"', `descricao` = '"+descricao+"', `esforco` = '"+esforco
        +"', `responsavel` = '"+responsavel+"', ativo = '"
        +ativo+"' , time = "+time+", usuario_atualizacao = "+usuario_logado+" WHERE id = '" + id_tarefa + "'";
 
         console.log('update na tarefa: ' + sql ); //Vai mostrar a query
         var query = db.query(sql, function(err, result) {
            console.log('metodo salvar tarefa: ' + id_tarefa);
            res.send( {message: 'sucesso', message_erro: ''} );   
         });        
       }

    }
     
 };

 function convertData (valor){
    
   var partesData = valor.split("/");
   var ano = partesData[2];
   var mes = partesData[1];
   var dia = partesData[0];
   
   return ano + '-' + mes + '-' + dia;
} 

//---------------------------------------------save history of kanban board ------------------------------------------------------
exports.atualizar_etapa = function(req, res){
   message = '';

   let {id_tarefa, etapa} = req.body;  
   usuario_logado = req.session.userId;
   var time = req.session.time;

   id_tarefa = id_tarefa.replace('historia-', '');

   console.log('atualizar_etapa: ' + new Date() + ' - ' + id_tarefa + ' para o time ' + time + ' na etapa ' + etapa);
        
        // vamos buscar os post-its deste quadro nesta room
        var sql = "SELECT `id`, `nome`, `descricao`, `esforco`, `responsavel`, "
        +"DATE_FORMAT(`data_inicio`, '%d/%m/%Y') as `data_inicio`, "
        +"DATE_FORMAT(`data_fim`, '%d/%m/%Y') as `data_fim`, `ativo`, `etapa`, "
        +"`data_atualizacao` FROM `tarefas` WHERE id ='"+id_tarefa+"'";   
    
        console.log('SQL consulta dados da historia: ' + sql);
          
        db.query(sql, function(err, result) {
            //if(true){
            if(typeof result !== 'undefined' && result.length > 0){
               // UPDATE

               console.log("Atualizando kanban - etapa: " + etapa + " - historia: " + id_tarefa);
               
                sql = "UPDATE tarefas "
                + "	SET etapa='"+etapa+"', data_atualizacao = now(), usuario_atualizacao = " +usuario_logado+ " ";

                /**
                 * Somente alteramos o dia de inicio ou fim se for uma troca de coluna. Se for somente mudanca
                 * de posicao na mesma coluna, nao deve mexer nestas colunas.
                 */
                if(typeof result[0].etapa !== 'undefined' && result[0].etapa !== etapa){  
                  

                  if(etapa == 'div-fazer'){
                     sql = sql + "	, data_inicio= now(), data_fim= '' "
                     console.log('*** Atualiza inicio: ' + etapa);
                  }
                  // se for a etapa fazendo, atualizo o dia de inicio com a data de hoje
                  else if(etapa == 'div-backlog' || etapa == 'div-sprint-backlog'){ 
                     // atualizo o dia_inicio igual ao dia de hoje
                     sql = sql + "	, data_inicio= '', data_fim= '' "
                     console.log('*** reinicia inicio e fim: ' + etapa);
                  }
                  // se for a etapa fazendo, atualizo o dia de inicio com a data de hoje
                  else if(etapa == 'div-fazendo' && result[0].data_inicio == ''){
                     // atualizo o dia_inicio igual ao dia de hoje
                     sql = sql + "	, data_inicio= now(), data_fim= '' "
                     console.log('*** Atualiza inicio: ' + etapa);
                  }
                  // se for a etapa final, atualizo o dia final
                  else if(etapa == 'div-feito'){
                     sql = sql + "	, data_fim= now() "
                     console.log('*** Atualiza fim: ' + etapa);


                     //console.log("data_inicio: "+result[0].data_inicio);
                     // console.log("Feito: " + result[0].dia_inicio);

                     /**
                      * se o jogador passar da coluna backlog ou product backlog direto para a coluna "pronto", entao 
                      * atualizo o dia_inicio igual ao dia_fim
                      */
                     if(typeof result[0].data_inicio !== 'undefined' || result[0].data_inicio == ''){
                        console.log("Validou Feito: " + result[0].data_inicio);
                           sql = sql + "	, data_inicio= now() "
                           console.log('*** Atualiza inicio: ' + etapa);
                     }
                  }
               }
 
                sql = sql + " WHERE id = "+id_tarefa;

                db.query(sql, function(err, result_update) {
                    console.log("Query update Historia: "+sql);
                    //console.log("Historia "+numero+" atualizada para o jogo " + room);

                    res.send("Atualizado com sucesso!");
                });

            }
      });
};