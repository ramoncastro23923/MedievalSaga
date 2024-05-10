exports.salvar_avaliacao = function(req, res){
    message = '';
    usuario_logado = req.session.userId;
    var time = req.session.time;
 
    console.log('Chegou no metodo save_avaliacao');  
 
    let {avaliado1, avaliado2, avaliado3, avaliado4, avaliado5} = req.body;
 
    var sql = "SELECT week(data_avaliacao) as semana_ultima_avaliacao, week(now()) as semana_atual  "
            +" FROM `avaliacao` "
            +" WHERE id_avaliador = " + usuario_logado 
            +" order by data_avaliacao DESC "
            +" LIMIT 1";

    console.log("Consulta data ultima avaliacao: "+sql);
    
    db.query(sql, function(err, result) {

        if(typeof result !== 'undefined' && result.length > 0 && 
            result[0].semana_ultima_avaliacao !== 'undefined' && result[0].semana_ultima_avaliacao == result[0].semana_atual){
            res.send({message: "Você já avaliou seus colegas esta semana. Volte na semana que vem!"});
        }
        else {
            var sql_insert = "INSERT INTO `avaliacao`(`id_avaliador`, `id_avaliado`, `id_time`, `data_avaliacao`)  "
            + " VALUES ("+usuario_logado+",'"+avaliado1+"','"+time+"', now()), "
            + " ("+usuario_logado+",'"+avaliado2+"', '"+time+"', now()), "
            + " ("+usuario_logado+",'"+avaliado3+"', '"+time+"', now()), "
            + " ("+usuario_logado+",'"+avaliado4+"', '"+time+"', now()), "
            + " ("+usuario_logado+",'"+avaliado5+"', '"+time+"', now()), "
            + " ("+usuario_logado+",'"+usuario_logado+"', '"+time+"', now()); "
    
            // console.log("Query insert Avaliacao: "+sql);
    
            db.query(sql_insert, function(err, result_insert) {
                console.log("Query insert Avaliacao: "+sql);
    
                res.send({message: "Avaliação realizada com sucesso!"});
            });
        }
    });
        
 };
 
 exports.carregar_ranking = function(req, res){
    var time = req.session.time;
 
    console.log('Chegou no metodo carregar_ranking');  
 
    var sql = "SELECT count(av.id) as total_estrelas, u.nome as nome_avaliado "
    +" FROM `avaliacao` av " 
    +" left join usuarios u on u.id = av.id_avaliado "
    +" WHERE av.id_time = " +time
    +" GROUP BY nome_avaliado " 
    +" ORDER BY total_estrelas DESC ";

    console.log("Consulta data ultima avaliacao: "+sql);
    
    db.query(sql, function(err, result) {
        console.log("Query ranking: "+sql);

        res.send({data_ranking: result});
    });
        
 };