
//---------------------------------------------signup page call------------------------------------------------------
exports.signup = function(req, res){
   message = '';
   if(req.method == "POST"){
      var post = req.body;
      var nome = post.nome;
      var senha = post.password;
      var email = post.email;

      var sql = "INSERT INTO `usuarios`(id, `nome`,`e-mail`, `senha`) VALUES (null, '" + nome + "','" + email + "','" + senha + "')";

      var query = db.query(sql, function(err, result) {

         //message = "Succesfully! Your account has been created.";
         res.render('signup.ejs',{message: message});
      });

   } else {
      res.render('signup');
   }
};
 
//-----------------------------------------------login page call------------------------------------------------------
exports.login = function(req, res){
   var message = '';
   //var sess = req.session; 

   console.log('Chegou no metodo de login');

   if(req.method == "POST"){
      var post  = req.body;
      var name= post.user_name;
      var pass= post.password;
     
      //var sql="SELECT id, first_name, last_name, user_name FROM `users` WHERE `user_name`='"+name+"' and password = '"+pass+"'"; 
     var sql= "SELECT id, nome, `e-mail` as email, coalesce(tipo, 'não informado') as tipo, coalesce(id_time, 0) as time FROM `usuarios` WHERE `e-mail`='"+name+"' and senha = '"+pass+"' and `ativo`='s' ";
     
     console.log("Vai chamar a funcao da query: " + sql);

     /*var sql= "SELECT id, nome, email FROM usuarios WHERE email='"+name+"' and senha = '"+pass+"' and ativo='s'"; 

     console.log("Vai chamar a funcao da query: " + sql);

     db.query(sql, (err, result) => {
      //console.log("Result: " + result.rows);
      //console.log("Erro: " + err);

         if (err || result.rows == "") {
            console.error('Erro: ' + err);
            message = 'usuario e/ou senha incorreta!';
            res.render('index.ejs',{message: message});
         } else {
            for (let row of result.rows) {
               console.log("Rodou o sql: " + row.id);
               console.log(row);
               req.session.userId = row.id;
               req.session.user = row.nome;
               req.session.email = row.email;
               res.redirect('/home/dashboard');
            }
         }

         
         //db.end();
      });*/
     
      db.query(sql, function(err, rows, fields) {
         if (err) {
            throw err;
         } else {
            if(rows.length > 0){
               req.session.userId = rows[0].id;
               req.session.user = rows[0].nome;
               req.session.email = rows[0].email;
               req.session.tipo = rows[0].tipo;
               req.session.time = rows[0].time;
               console.log('Login id: ' + rows[0].id);
               // res.redirect('/home/dashboard');
               res.redirect('/tarefa/list');
            }
            else {
               message = 'Senha e/ou Usuário incorretos!';
               res.render('index.ejs',{message: message});
            }
         }       
      });
   } else {
      res.render('index.ejs',{message: message});
   }
           
};
//-----------------------------------------------dashboard page functionality----------------------------------------------
           
exports.dashboard = function(req, res){
           
   var user =  req.session.user,
   tipo =  req.session.tipo,
   userId = req.session.userId;
   console.log('usuario logado = '+userId);
   if(userId == null){
      res.redirect("/login");
      return;
   }

  // var sql="SELECT * FROM `usuarios` WHERE `id`='"+userId+"'";
   var sql="SELECT id FROM `jogos` WHERE `id_usuario`='"+userId+"' and status='ativo' order by id desc limit 1";

   //console.log('Busca jogos: ' + sql);

   var id_jogo = 0;

   db.query(sql, function(err, results){
     // console.log('Busca jogos retorno: ' + userId);

      if(results.length > 0){
         id_jogo = results[0].id;
      }

      // res.render('dashboard.ejs', {user:user, data: id_jogo, message_erro: "", message: ""});    
      res.render('home.ejs', {user:user, data: id_jogo, message_erro: "", message: "", tipo: tipo});    
   });  
   
   // o usuario vai entrar no jogo corrente que tem no usuario dele para facilitar. Cada usuario somente possuira 
   // um jogo por vez aberto na plataforma

   /*var sql="SELECT id FROM jogos WHERE id_usuario='"+userId+"' order by id desc limit 1";

   console.log('Estou aqui');

   db.query(sql, (err, result) => {
      // se nao existir jogos para este usuario, entao o data vai com o valor 0 para a tela de dashboard
      if (err || result.rows == "") {
         console.error('Erro ou nao possui jogos para este usuario: ' + err);
         res.render('dashboard.ejs',{user:user, data: 0});
      } else {
         for (let row of result.rows) {
            console.log("Consulta: " + result.rows);
            res.render('dashboard.ejs',{user:user, data: row.id});
         }
      }
   });*/

   /*db.query(sql, (err, result) => {
      if (err) {
         console.error(err);
         message = "Erro na consulta de jogos para o id "+userIs+".";
         res.render('index.ejs',{message: message});
      }
      for (let row of result.rows) {
         console.log("Consulta: " + result.rows);
         res.render('dashboard.ejs',{user:user, data: row.id});
      }
   });*/
};
//------------------------------------logout functionality----------------------------------------------
exports.logout=function(req,res){

   var usandoCookieSession = true;

   if(usandoCookieSession){
      // quando usar o cookie-session deve se usar o codigo abaixo
      // mato a sessao
      req.session = null;

      // depois redireciono
      res.redirect("/login");

   } else {
      // o codigo abaixo deve ser usando quando se usar o 'express-session'
      req.session.destroy(function(err) {
         res.redirect("/login");
      })
   }
   

   

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
exports.editprofile=function(req,res){
   var userId = req.session.userId;
   if(userId == null){
      res.redirect("/login");
      return;
   }

   var sql="SELECT * FROM `usuarios` WHERE `id`='"+userId+"'";
   db.query(sql, function(err, results){
      res.render('edit_profile.ejs',{data:results});
   });
};

//-----------------------------------------------dashboard page functionality----------------------------------------------
           
exports.home = function(req, res){

   if(req.session == null){ //Direcionar para a tela de login, certeza.
      res.redirect("/login");
      return;
   }
           
   var user =  req.session.user, //Se o usuário não estiver logado, então encerrar a tela de login. 
   tipo =  req.session.tipo,
   tipo = req.session.tipo;
   userId = req.session.userId;
   console.log('usuario logado new home = '+userId);
   if(userId == null){
      res.redirect("/login");
      return;
   }

  // var sql="SELECT * FROM `usuarios` WHERE `id`='"+userId+"'";
   var sql="SELECT id FROM `jogos` WHERE `id_usuario`='"+userId+"' and status='ativo' order by id desc limit 1";

   //console.log('Busca jogos: ' + sql);

   var id_jogo = 0;

   db.query(sql, function(err, results){
     // console.log('Busca jogos retorno: ' + userId);

      if(results.length > 0){
         id_jogo = results[0].id;
      }

      sql = "SELECT j.id, j.codigo, j.status, DATE_FORMAT(j.data_criacao, '%d/%m/%Y %H:%i:%s') as data_criacao, "
      + "	DATE_FORMAT(j.data_atualizacao, '%d/%m/%Y %H:%i:%s') as data_atualizacao, j.id_usuario "
      + "FROM `jogos` j "
      + "WHERE j.id_usuario = '" + userId + "' " 
      + "ORDER BY j.id DESC";

      db.query(sql, function(err, result_jogos){
         /*
            Agora busco os NPSs dos jogos
         */
         sql = "SELECT a.id_jogo, sum(a.nota) as total_notas, count(a.id) as total_avaliacoes, ((sum(a.nota) / count(a.id)) * 100) as nps "
               + "FROM `avaliacoes` a "
               + "	left join jogos j1 on j1.id = a.id_jogo "
               + "WHERE j1.id_usuario = '" + userId + "' "
               + "GROUP BY a.id_jogo "
               + "ORDER BY a.id_jogo DESC ";

         db.query(sql, function(err, result_nps){
            res.render('home.ejs', {user: user, tipo: tipo, data: id_jogo, message_erro: "", 
               message: "", games_list: result_jogos, nps_list: result_nps, tipo: tipo});
         });
         
      });

      
   });  
   
   // o usuario vai entrar no jogo corrente que tem no usuario dele para facilitar. Cada usuario somente possuira 
   // um jogo por vez aberto na plataforma

   /*var sql="SELECT id FROM jogos WHERE id_usuario='"+userId+"' order by id desc limit 1";

   console.log('Estou aqui');

   db.query(sql, (err, result) => {
      // se nao existir jogos para este usuario, entao o data vai com o valor 0 para a tela de dashboard
      if (err || result.rows == "") {
         console.error('Erro ou nao possui jogos para este usuario: ' + err);
         res.render('dashboard.ejs',{user:user, data: 0});
      } else {
         for (let row of result.rows) {
            console.log("Consulta: " + result.rows);
            res.render('dashboard.ejs',{user:user, data: row.id});
         }
      }
   });*/

   /*db.query(sql, (err, result) => {
      if (err) {
         console.error(err);
         message = "Erro na consulta de jogos para o id "+userIs+".";
         res.render('index.ejs',{message: message});
      }
      for (let row of result.rows) {
         console.log("Consulta: " + result.rows);
         res.render('dashboard.ejs',{user:user, data: row.id});
      }
   });*/
};


//--------------------------------------------- carregar usuarios cadastrados ------------------------------------------------------
exports.carregar_usuarios = function(req, res){
   message = '';

var user =  req.session.user,
      tipo =  req.session.tipo;
      time = req.session.time;

   if (tipo == 'admin'){


      console.log('Chegou no metodo carregar_usuarios');

      // var userId = req.session.userId;

      var sql="SELECT id, nome, `id_time` as time, `e-mail` as email, tipo, ativo FROM `usuarios` order by nome ASC";
      //         SELECT id, nome, ativo FROM `times` WHERE ativo = 's' order by nome ASC

      db.query(sql, function(err, result){
         res.render('users.ejs',{data:result, user:user, tipo: tipo, time:time});
      });
   } else {
      // res.render('home.ejs', {user:user, tipo: tipo});
      res.redirect('/home');
   }

   // // vamos buscar os post-its deste quadro nesta room
   // var sql = "SELECT email_jogador as e_mail, comentarios, nota, "
   //          +"DATE_FORMAT(data_atualizacao, '%d/%m/%Y %H:%i:%s') as data_atualizacao "
   //          +"FROM avaliacoes WHERE id_jogo = " +id_jogo+" ";
         
   //    db.query(sql, function(err, result) {
   //       res.send({list_aval: result});
   //    });
};


//---------------------------------------------carregar detalhe usuario  ------------------------------------------------------
exports.carregar_detalhe_user = function(req, res){
   message = '';

   console.log('Chegou no metodo carregar_detalhe_usuario');  

   let { id_user } = req.body;

   // vamos buscar os post-its deste quadro nesta room
   var sql="SELECT id, nome, `e-mail` as email, tipo, ativo, id_time as time FROM `usuarios` WHERE id = '"+id_user+"'";
   
         db.query(sql, function(err, result){

            // Começo de times 
            console.log('Chegou no metodo carregar_times');

            var sql1="SELECT id, nome, ativo FROM `times` WHERE ativo = 's' order by nome ASC";
         
            db.query(sql1, function(err, result_times) {
               res.send({data: result, data_times:result_times});
            });
            // Fim de times
       });
};


//--------------------------------------------- save user (update) ------------------------------------------------------
exports.save_user = function(req, res){ 
   message = '';
   if(req.method == "POST"){

      let {id_user, nome, email, tipo, ativo, time } = req.body;

      if(ativo == 'true'){
         ativo = 's';
      } else {
         ativo = 'n';
      }

      var sql = "UPDATE `usuarios` SET nome = '"+nome+"', `e-mail` = '"+email+"', tipo = '"+tipo+"', ativo = '"+ativo+"' , id_time = "+time+" WHERE id = '" + id_user + "'";

      console.log('update no usuario: ' + sql ); //Vai mostrar a query
      var query = db.query(sql, function(err, result) {
         console.log('metodo save_user: ' + id_user);
         
         // res.render('home.ejs',{message: "Jogo finalizado com sucesso!", data:id_existente, user: user, tipo: tipo});

         res.send( {message: 'sucesso', message_erro: ''} );   
      });      

   }
    
};

//
exports.carregar_membros_time = function(req, res){
 
   console.log('Chegou no metodo carregar_membros_time');  

   var time = req.session.time;
   usuario_logado = req.session.userId;

        var sql1="SELECT id, nome, `id_time` as time, `e-mail` as email, tipo, ativo FROM `usuarios`" 
        + " WHERE ativo = 's' AND id_time = " +time+ " ORDER by nome ASC";//alterar para buscar os usuarios do time
     
        db.query(sql1, function(err, result_membros_time) {
           console.log('vai imprimir membros time: ' + sql1)
           res.send({data_membros_time:result_membros_time,  usuario_logado: usuario_logado});
        });
        // Fim de membros dos times
};
