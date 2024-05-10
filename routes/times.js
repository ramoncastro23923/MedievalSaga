 //-----------------------------------------------------------------------------------

 exports.salvar_time = function(req, res){
   message_erro = '';

   let {id_time, nome, ativo} = req.body;
   userID = req.session.userId;

   console.log('salvar_time: ' + new Date() + ' - id: ' + id_time);

   var sql = "SELECT id FROM times WHERE id = " +id_time+" ";

   if(ativo == 'true'){
     ativo = 's';
  } else {
     ativo = 'n';
  }
      
   db.query(sql, function(err, result) {
      if(result.length > 0){
            sql = "UPDATE times "
                  +"SET nome='"+nome+"',ativo='"+ativo+"',data_atualizacao=now() "
                  +"WHERE id = "+id_time;

            db.getConnection(function(err, connection) {
               if (err) throw err; // not connected!

               console.log("Query update data: "+sql);
               //console.log("Query update times");
             
               connection.query(sql, function (error, results, fields) {
                  connection.release();
               
                  // if (error) throw error;
                  if(error){
                    console.log("Erro ao atualizar time: " + error);
                     res.send({message_erro: "Erro ao atualizar time: " + error});
                  }
                  else {
                    console.log("Sucesso ao atualizar time: ");
                     res.send({message_erro: ""});  
                  }
               });
            });

      }
      else {
            sql = "INSERT INTO times (nome, ativo, data_atualizacao) "
               +" VALUES ('"+nome+"', 's', now())";

            db.query(sql, function(err, result_insert) {
               console.log("Query insert dados room: "+sql);

               if(err){
                  res.send({message_erro:"Erro ao inserir time: " + err});
               }
               else {
                  res.send({message_erro:""});
               }
            });
      }
   });

};



//--------------------------------------------- carregar times cadastrados ------------------------------------------------------
exports.carregar_times = function(req, res){
  message = '';

  var user =  req.session.user;


     console.log('Chegou no metodo carregar_times');

     var sql="SELECT id, nome, ativo FROM `times` order by nome ASC";

     db.query(sql, function(err, result){
        res.render('users.ejs',{data:result});
     });

};

//--------------------------------------------- carregar tarefas cadastrados ------------------------------------------------------
exports.carregar_times = function(req, res){

  var user =  req.session.user,
     tipo = req.session.tipo;

 console.log('Chegou no metodo carregar_times');


 var sql = "SELECT id, nome, ativo FROM `times`  "
       // +"WHERE `ativo` = 's' "
        +"ORDER BY data_atualizacao DESC ";

    console.log('query: ' + sql)

 db.query(sql, function(err, result){
    res.render('times.ejs',{data_times:result, user:user, tipo: tipo}); 
 });                                                                                     

};


//---------------------------------------------carregar detalhe tarefa------------------------------------------------------
exports.carregar_detalhe_time = function(req, res){

  console.log('Chegou no metodo carregar_detalhe_time');

  let { id_time } = req.body;

  var sql = "SELECT `id`, `nome`, ativo FROM `times` WHERE id ='"+id_time+"'";    

  db.query(sql, function(err, result) {  
     console.log('carregar detalhe time: ' + sql);
     res.send({ data_time: result });
  });
};

