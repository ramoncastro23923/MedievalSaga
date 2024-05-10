/**
* Module dependencies.
*/
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , game = require('./routes/game')
  , simula = require('./routes/simula')
 // , http = require('http')
  , path = require('path');
//var methodOverride = require('method-override');

// ssh application@ag-br1-17.conteige.cloud -p 28031

//var session = require('express-session');
var session = require('cookie-session');
var app = express();
const http = require("http").Server(app);
var mysql = require('mysql');
var bodyParser=require("body-parser");
var cookieParser = require('cookie-parser');
let fs = require('fs');
// var sizeOf = require('image-size');  

var producao = true;

var map = new Map();
var connection;
var pool;
var carregou_imagens = false;
var mapTamanhoImagens = new Map();
var carregou_matriz_pecas = false;
/**
 * Este parametro somente deve ficar TRUE se for para remapear as pecas montadas do jogo. 
 * Para isto, todas as pecas do jogo precisam estar montadas corretamente antes de executar 
 * este remapeamento.
 */
var carregar_matriz_pecas = false;

// acesso local
// var url_sistema = '192.168.15.14:3000';
var url_sistema = 'localhost:3000';

if(producao){
    /** Conexao com mysql producao */
    console.log("Conectou prod");
    /*connection = mysql.createConnection({
        host     : 'mysql669.umbler.com',
        port     : 3306,
        user     : 'scrumblas', -- novo nome de usuario = scrumdco_scrumgame_u (2022)
        password : 'WesleySafadinho37',
        database : 'scrumblas' -- novo nome do banco = scrumdco_scrumgame (2022)
		
  });*/


/* 
ftp
endereco: ag-br1-17.conteige.cloud
qabedt_scrumgame
porta: 21
senha: joAoG0m3z45
*/

//   url_sistema = "https://scrum3d.com/";
  url_sistema = 'https://qabedt.conteige.cloud';

  pool = mysql.createPool({
    connectionLimit : 50,
    host: 'mysql-ag-br1-11.conteige.cloud',
    port: '3306', 
    user: 'qabedt_scrumgame',
    database: 'qabedt_scrumgame',
    password: 'joAoG0m3z45'
  });

  console.log("Criou o pool de conexoes");
} else {
    console.log("Conectou dev");
    pool = mysql.createPool({
        connectionLimit : 50,
        host: 'localhost',
        port: '3306', 
        user: 'cepheu_scrumBlas',
        // database: 'scrumbd',//banco do teste de 24/10/2020 em producao
        // database: 'scrumbd-prod',//banco do teste de 24/10/2020 em producao
        database: 'scrumbd-prod-20210128',//banco do teste de 28/01/2021 em producao
        password: 'WesleySafadinho37'
      });
}

global.db = pool;

global.url_sistema = url_sistema;

global.carregou_imagens = carregou_imagens;
// global.sizeOf = sizeOf;
// global.mapTamanhoImagens = mapTamanhoImagens;

var mapPecasMapeadas = new Map();

global.mpm = new Map();

process.on('SIGINT', () => 
    pool.end(err => {
        if(err) return console.log(err);
        console.log('pool => fechado');
        process.exit(0);
    })
); 

// guardo o mapImagensHistorias na variavel global para acesso de todo o sistema somente quando o servidor reiniciar
// e algum usuario entrar pelo menos uma vez na tela do quebra-cabecas
// armazena os dados das imagens do jogo
var mapImagensHistorias = new Map();
var arrayImagensHistorias = [];

global.mapImagensHistorias = mapImagensHistorias;
global.arrayImagensHistorias = arrayImagensHistorias;

var mapRoiHistorias = new Map();
global.mapRoiHistorias = mapRoiHistorias;

// guardo o mapHistorias na variavel global para acesso de todo o sistema somente quando o servidor reiniciar
// e algum usuario entrar pelo menos uma vez na tela do quebra-cabecas.
// Armazena todos os dados dos cards de historias do jogo
var mapHistorias = new Map();

global.mapHistorias = mapHistorias;

/**
// conexao postgres
// porta 5432
// dbname scrum
// user postgres

instalacao: npm install --save pg

fim setup postgres 
***/
/** 
const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'scrum',
    password: 'WesleySafadinho37',
    port: 5432,
});

client.connect();

global.db = client;
*/
 
// all environments
//app.set('port', process.env.PORT || 8080);// comentado para mudar a chamada do socket.io
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
              secret: 'h4%hh231^*',//keyboard cat
              resave: false,
              saveUninitialized: true,
              cookie: { maxAge: 12000000 }
            }))

app.use(session({
    secret: 'coordenadas',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 12000000 }
    }))
 
// development only
 
app.get('/', routes.index);//call for main index page
app.get('/signup', user.signup);//call for signup page
app.post('/signup', user.signup);//call for signup post 
app.get('/login', routes.index);//call for login page
app.post('/login', user.login);//call for login post
app.get('/home/dashboard', user.dashboard);//call for dashboard page after login
app.get('/home/logout', user.logout);//call for logout
app.get('/home/profile',user.profile);//to render users profile

//Middleware

// estrutura
app.get('/home', user.home);//call for home page after login

// simulacao
app.get('/home/simulacao', simula.carregar_simulacao);
app.post('/home/direcionar_mensagem', simula.direcionar_mensagem);
app.get('/simulation', simula.acessar);
app.post('/simulation', simula.acessar);

//jogo
app.get('/home/game', game.carregar);//call for game page
app.post('/home/new_game', game.cadastrar);//grava novos jogos
app.get('/home/new_game', game.editjogo);
app.post('/home/new_game/finalizar', game.finalizar);
app.get('/home/new_game/pontuar', game.pontuar_game);
app.get('/access', game.acessar);//call for signup page
app.post('/access', game.acessar);//call for signup post
app.get('/home/pre_game', game.carregar_pre_game);
app.post('/home/pre_game', game.direcionar_pre_game);
app.post('/home/pre_game/game', game.direcionar_game);
app.post('/home/retro', game.carregar_retro);
app.get('/home/control_game', game.carregar_controle);
app.post('/game_control/carregar_dados_control_game', game.carregar_dados_control_game);
app.post('/game/charts', game.carregar_charts);
app.post('/game/carregar_times', game.carregar_times);

app.post('/game/carregar_imagens', game.carregar_imagens);

app.post('/game_control/save_history', game.save_history);
app.post('/game_control/save_history_kanban', game.save_history_kanban);
app.post('/game_control/save_data_game', game.save_data_game);
app.post('/game/carregar_historias', game.carregar_game);
app.post('/game/carregar_historias_kanban', game.carregar_game_kanban);
app.post('/game_control/save_day_history', game.save_day_history);
app.post('/game_control/enviar_penalidade', game.registrar_penalidades);
app.post('/game_control/enviar_investimento', game.registrar_investimento);
app.post('/game_control/save_aval', game.save_avaliacao);
app.post('/game_control/adicionar_jogadores', game.adicionar_jogadores);

app.post('/game/carregar_nps', game.carregar_nps);
app.get('/users/list', user.carregar_usuarios);
app.post('/user/carregar_detalhe_user', user.carregar_detalhe_user);
app.post('/user/save_user', user.save_user);

app.get('/access/:codigo&:senha', function(req, res) { 
    const codigo = req.params.codigo; 
    const senha = req.params.senha; 
    console.log("Codigo: " + codigo); 
    console.log("Senha: " + senha); 

    res.render('access.ejs',{message: "", codigo: codigo, senha: senha});
});



//app.listen(8080)// comentado para mudar a chamada do socket.io


var server = http.listen(3000, function () {
// var server = app.listen(3000, function () {
    console.log('Listening on port %d', server.address().port);

    

    game.carregar_imagens();

            /** 
         * vou carregar o map com a matriz das pecas para ser utilizado no contador de pecas montadas durante o jogo. 
         * Somente carrega uma vez ao iniciar o sistema.
        */ 
       if(!carregou_matriz_pecas) {
        var millisecondsToWait = 15000;
        
        /**
         * So chamo esta funcao quando quero remapear as pecas montadas.
         */
        if(carregar_matriz_pecas){
            setTimeout(function() {
                mapearDiferencaPecas(data.room);
            }, millisecondsToWait);
        }
        
        /**
         * No dia a dia de uso do sistema, deve ser carregado o map de diferenças das pecas para o uso durante
         * o jogo, para contagem das peças ja montadas. Este metodo carrega o 'mapPecasMapeadas' para ficar carregado
         * na memoria. 
         */
        setTimeout(function() {
            carregarPecasMapeadas();
        }, millisecondsToWait);

        carregou_matriz_pecas = true;
    }
});

// const io = require("socket.io")(http);
//var io = require('socket.io')(server);// comentado enquanto testo a inclusao do socket.io

const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// var io = require('socket.io')(server, { origins: '*:*'});

// var cors = require('cors');

// use it before all route definitions
// app.use(cors({origin: url_sistema}));
// app.use(cors());


var log = console.log;
console.log = function(){};//Desativa
console.log = log;//Ativa novamente

// inicio do trecho de carregamento da tela do jogo
// We will store image data here, so users that
// connect after startup receive the current
// state of the image.
var imageData;

// Color palette by Skyblue2u: http://www.colourlovers.com/palette/580974/Adrift_in_Dreams
// Nice one!
var colors = [ "#990000", "#000000", "#CCC", "#3B8686", "#0B486B" ];
var lastPosition = { x: 0, y: 0 }; // whatever default data
var i = 0;

// este map vai armazenar todas as coordenadas de cada peca do jogo enquanto esta sessao do server estiver viva
// os jogadores que entrarem no jogo irao ter sua tela montada com base neste map
var mapCoords = new Map();



// taskboard
app.post('/retrospective/save', function (req, res, next) {
    let {uuid, tipo, conteudo, cor, room} = req.body;
    console.log('Server conteudo: ' + conteudo);

    // vamos gravar o valor do post-it
    var sql_insert = "INSERT INTO cards (id, tipo, cor, uuid, conteudo, room, data_atualizacao, ativo) "
        + "VALUES (null, '" + tipo + "','" + cor + "','" + uuid + "','" + conteudo + "', '"+room+"', now(), 's')";
      
    // db.query(sql_insert, function(err, result) {
    //    console.log("Card cadastrado no jogo com sucesso!");
      
    //     io.sockets.in(room).emit('update_card', { tipo: tipo, uuid: uuid, cor: cor, conteudo: conteudo });

    //     console.log("Enviou o card para a tela!");
    // });

    db.getConnection(function(err, connection) {
        if (err) throw err; // not connected!
      
        // Use the connection
        connection.query(sql_insert, function (error, results, fields) {
        // When done with the connection, release it.
        connection.release();
      
        // Handle error after the release.
        if (error) throw error;

        io.sockets.in(room).emit('update_card', { tipo: tipo, uuid: uuid, cor: cor, conteudo: conteudo });

        console.log("Enviou o card para a tela!");
      
        // Don't use the connection here, it has been returned to the pool.
        });
      });
   
    res.send(req.body);
})

var socket_geral;

// armazeno aqui todos os jogos que ja carreguei ao iniciar o jogo. Somente entra 
// neste map jogos que possuem salas ativas, ou seja, jogos que o facilitador abriu 
// a tela novamente após reinicio do sistema.
var mapJogoBanco = new Map();

// Setup emitters for each connection
io.sockets.on('connection', function (socket) {

    socket_geral = socket;

	// criando uma sala para cada grupo
	socket.on('subscribe', function(room) {
        console.log('joining room', room);
        socket.join(room); 
    });

    //  Each new user gets a different color
	if (i == 5) i = 0;
	socket.emit('setup', colors[i++], imageData);

	// Broadcast all draw clicks.
	socket.on('do-the-draw', function (data) {
		//console.log('do-the-draw');
		socket.broadcast.emit('draw', data);
		imageData = data.imageData;
	});

	// ...and clear clicks as well
	socket.on('clear', function () {
		socket.broadcast.emit('clear');
		imageData = null;
	});

	// Users modified image, let's save it
	socket.on('save-data', function (data) {
		imageData = data;
    });
	
	// Percorro todo o mapCoords para atualizar todos os objetos do jogo do usuario que esta carregando a tela
	//socket.on('carregar-jogo', function (data) {
	socket.on('carregar-jogo', function (data) {
        // se ainda nao existir, crio a variavel dinamica para a room
        if( ! exists( 'coords_' + (data.room.replace('-', '_')) ) ){
            // criando uma variavel dinamica
            (eval('coords_' + (data.room.replace('-', '_')) + ' = new Map()'));

            //console.log('Criou a variavel dinamica: ' + ('coords_' + (data.room.replace('-', '_'))) );
            if( ! mapJogoBanco.get( ('coords_' + (data.room.replace('-', '_'))) ) ){
                mapJogoBanco.set(('coords_' + (data.room.replace('-', '_'))), 's');

                console.log('Carregou map do jogo ao reiniciar o sistema para a room ' + data.room);

                // vou no banco de dados buscar uma vez por room a cada vez que carregar o jogo apos o reinicio
                var sql = "SELECT cast( coordenadas as char(100000) ) as coords FROM coordenadas "
                        +" WHERE  room = '"+data.room+"' ";

                db.query(sql, function(err, result_coord) {
                    if(result_coord.length > 0){
                        var jsonData = "";

                        try {
                            jsonData = JSON.parse(result_coord[0].coords);
                        } catch(e) {
                            console.log('Erro parse: ' + e);
                        }
        
                        for (var i = 0; i < jsonData.length; i++) {
                            var valor = jsonData[i][0];
        
                            eval('coords_' + (data.room.replace('-', '_'))).set(jsonData[i][0], {"x" : jsonData[i][1].x, "y": jsonData[i][1].y});
        
                            //console.log(valor);
                        }

                        for (const [key,value] of eval('coords_' + (data.room.replace('-', '_'))) ){
                            //console.log("*** chave: " + key + " - x: " + value.x + " - y: " + value.y + " ***");
                            data.div_atualizar = key;
                            data.x = value.x;
                            data.y = value.y;

                            socket.emit('update_position', data);
                        }
                    }
                });
            }
        }
        else {
            //console.log('Variavel dinamica existente: ' + ('coords_' + (data.room.replace('-', '_'))) + ' - tamanho: ' + eval('coords_' + (data.room.replace('-', '_'))).size );

            for (const [key,value] of eval('coords_' + (data.room.replace('-', '_'))) ){
                //console.log("*** chave: " + key + " - x: " + value.x + " - y: " + value.y + " ***");
                data.div_atualizar = key;
                data.x = value.x;
                data.y = value.y;
                
                //lastPosition = data;
                //console.log('Vai chamar o update_position: ' + data.div_atualizar);
                //nao preciso passar o room aqui porque so carrega a tela de quem chamou. Nao precisa replicar pra ninguem, somente
                // carregar a tela com as coordenadas de quem ja esta jogando.
                socket.emit('update_position', data);
            }
        }



    });

    socket.on('carregar-controle', function (data) {
        var sql = "SELECT coalesce(maior_dia, 0) as maior_dia FROM dados_jogos dj WHERE dj.id_jogo = " + data.id_jogo;

        db.query(sql, function(err, result_dia) {
            if(result_dia.length > 0){
                // agora atualizo as informacoes do jogo
                sql = "SELECT id, dj.id_jogo, coalesce(maior_dia, 0) as maior_dia, coalesce(ultimo_evento, '') as ultimo_evento, "
                    +"	coalesce(pontos_dia.pontos_dia, 0) as pontos_dia, coalesce(total_pontos.total_pontos, 0) as total_pontos "
                    +"FROM dados_jogos dj  "
                    +" 	left join ( "
                    +" 		SELECT id_jogo, sum(pontos) as pontos_dia FROM dias_jogadores WHERE id_jogo = "+data.id_jogo+" and dia = "+result_dia[0].maior_dia+" "
                    +" 	) as pontos_dia on pontos_dia.id_jogo = dj.id_jogo "
                    +"     left join ( "
                    +" 		SELECT id_jogo, sum(pontos) as total_pontos FROM dias_jogadores WHERE id_jogo = "+data.id_jogo+" and dia <= "+result_dia[0].maior_dia+" "
                    +" 	) as total_pontos on total_pontos.id_jogo = dj.id_jogo "
                    +" WHERE dj.id_jogo = "+data.id_jogo;

                //console.log('SQL consulta dados do jogo '+data.id_jogo+': ' + sql);
                    
                db.query(sql, function(err, result) {
                    if(result.length > 0){
                        /**
                         * REGRA IMPORTANTE PARA O ROI:
                         * somente gero ROI para passeios a partir do dia abaixo. Se o Time entregar antes do dia abaixo, vai gerar ROI zero para estes passeios 
                         * e comecara a gerar ROI positivo a partir do dia que for informado logo abaixo.
                         * Assim podemos validar a questão da priorização do PO para evitar desperdicio e foco na entrega do que vai
                         * gerar valor pro Cliente o quanto antes.
                         * Se o valor de passeios vier menor que ZERO, devemos ignorar na soma do total do RO, pois quer dizer que o passeio 
                         * foi entregue antes do dia minimo, conforme variavel abaixo.
                         */
                        var dia_gerar_roi_passeio = 6;

                        var sql = "SELECT query.room, sum(query.roi_total) as roi_total, sum(query.roi_total_passeio) as roi_total_passeio, "
                        +"	sum(query.total_investimento) as total_investimento, sum(query.total_multa) as total_multa "
                        +"FROM ("
                        +"	SELECT room, sum(total_roi_h) as roi_total, sum(total_roi_p) as roi_total_passeio, 0 as total_investimento, 0 as total_multa from ( "
                        +"		 SELECT hj.room, hj.numero, hj.dia_fim, coalesce(hist.total_roi_h, 0) as total_roi_h, "
                        +"			coalesce(passeio.total_roi_p, 0) as total_roi_p "
                        +"		 FROM historias_jogo hj "
                        +"		 LEFT JOIN ( "
                        +"					 SELECT hj_h.room, hj_h.numero, hj_h.etapa, ((("+result_dia[0].maior_dia+" + 1) - COALESCE(hj_h.dia_fim, 0)) * COALESCE(h.roi_diario, 0)) as total_roi_h "
                        +"					 FROM historias_jogo hj_h "
                        +"						INNER JOIN historias h on h.numero = hj_h.numero "
                        +"			WHERE h.passeio <> 's' "
                        +"			) hist on hist.room = hj.room and hist.numero = hj.numero and hist.etapa = hj.etapa "
                        +"			LEFT JOIN ( "
                        // +"					SELECT hj_p.room, hj_p.numero, hj_p.etapa, ((("+result_dia[0].maior_dia+" + 1) - COALESCE((CASE WHEN hj_p.dia_fim < "+dia_gerar_roi_passeio+" then "+dia_gerar_roi_passeio+" else hj_p.dia_fim end), 0)) * COALESCE(h.roi_diario, 0)) as total_roi_p "
                        +" 					SELECT hj_p.room, hj_p.numero, hj_p.etapa, "
                        +"	                    (CASE WHEN "+result_dia[0].maior_dia+" < "+dia_gerar_roi_passeio+" then 0 "
                        +"		                    else (((("+result_dia[0].maior_dia+" + 1) - COALESCE((CASE WHEN hj_p.dia_fim < "+dia_gerar_roi_passeio+" then "+dia_gerar_roi_passeio+" else hj_p.dia_fim end), 0)) *  COALESCE(h.roi_diario, 0))) end) as total_roi_p "
                        +"					FROM historias_jogo hj_p " 
                        +"						INNER JOIN historias h on h.numero = hj_p.numero "
                        +"			WHERE h.passeio = 's' "
                        +"			) passeio on passeio.room = hj.room and passeio.numero = hj.numero and passeio.etapa = hj.etapa " 
                        +"			WHERE hj.etapa = 'div-feito' and hj.dia_fim <= "+result_dia[0].maior_dia+" AND hj.room = '"+data.room+"' "
                        +"		 ) as roi "
                        +"	GROUP BY roi.room " 
                        +"	UNION "
                        +"	SELECT i.room, 0 as roi_total, 0 as roi_total_passeio, sum(COALESCE(i.valor, 0)) as total_investimento, 0 as total_multa "
                        +"	FROM investimentos i "
                        +"	WHERE i.dia <= "+result_dia[0].maior_dia+" AND i.room = '"+data.room+"' "
                        +"	GROUP BY i.room "
                        +"	UNION "
                        +"	SELECT p.room, 0 as roi_total, 0 as roi_total_passeio, 0 as total_investimento, sum(COALESCE(p.valor, 0)) as total_multa "
                        +"	FROM penalidades p "
                        +"	WHERE p.dia <=  "+result_dia[0].maior_dia+" AND p.room = '"+data.room+"' "
                        +"	GROUP BY p.room "
                        +") as query ";

                        // console.log("Busca financeiro das estorias 111: " + sql);
                    
                        db.query(sql, function(err, result_roi){
                            var roi_total = 0;

                            if(typeof result_roi !== 'undefined') {
                                for(var i=0; i < result_roi.length; i++) {
                                    // se existir roi para o time que retornou na busca, envio a atualizacao de valores
                                    roi_total = result_roi[i].roi_total > 0 ? result_roi[i].roi_total : 0;

                                    // calculo o total do ROI geral
                                    roi_total = roi_total + result_roi[i].roi_total_passeio 
                                        + result_roi[i].total_investimento - result_roi[i].total_multa;

                                    console.log("roi_total: " + result_roi[i].room + " - " + result_roi[i].roi_total);
                                }
                            }

                            socket.emit('update_control', { dia: result_dia[0].maior_dia, pontos_dia: result[0].pontos_dia, 
                                pontos_geral: result[0].total_pontos, info1: result[0].ultimo_evento, info2: "", 
                                info3: "", roi_total: roi_total });
                        });
                    }
                });
            }
        });
    });
    
	// inicio alterado
	// recebo o nome da div que deve ser atualizada nos clients
	socket.on('receive_positions', function (data) {
        lastPosition = data;

		//console.log('Nome do div a atualizar nos clients: ' + data.room);
		//socket.broadcast.emit('update_position', data); // envia mensagem para todos da connection do socket.io
		socket.to(data.room).emit('update_position', data); // envia mensagem para todos da room
        //io.in(data.room).emit('update_position', data); // envia mensagem para todos da room
        
        // insiro ou atualizo a posicao da imagem no map de Coordenadas da variavel dinamica da room
        if( exists( 'coords_' + (data.room.replace('-', '_')) ) ){
            //console.log('Input na variavel dinamica: ' + eval('coords_' + (data.room.replace('-', '_'))) );
            // var map =  eval(data.room.replace('-', '_'));
            eval('coords_' + (data.room.replace('-', '_'))).set(data.div_atualizar, {"x" : data.x, "y": data.y});
            // console.log("Tamanho mapCoords da room "+data.room+": " + ( eval(data.room.replace('-', '_')) ).size);
        }
		
		// insiro ou atualizo a posicao da imagem no mapCoords
		//mapCoords.set(data.room + '-' + data.div_atualizar, {"x" : data.x, "y": data.y});
		//mapCoords.set(data.div_atualizar, {"x" : data.x, "y": data.y});
		
        //console.log("Tamanho mapCoords da room "+data.room+": " + mapCoords.size);

        //gravarCoordsRoom(data);
	});

    socket.on('receive_pos_kanban', function (data) {

		socket.to(data.room).emit('update_position_kanban', data); // envia mensagem para todos da room
		//io.in(data.room).emit('update_position', data); // envia mensagem para todos da room
		
		// insiro ou atualizo a posicao da imagem no mapCoords
		//mapCoords.set(data.room + '-' + data.div_atualizar, {"x" : data.x, "y": data.y});
		//mapCoords.set(data.div_atualizar, {"x" : data.x, "y": data.y});
		
        //console.log("Tamanho mapCoords da room "+data.room+": " + mapCoords.size);

       // gravarCoordsRoom(data);
    });
    
    socket.on('receive_pos_kanban_new', function (data) {
        console.log('Valor: ' + data.destino);

		socket.to(data.room).emit('update_position_kanban_new', data); // envia mensagem para todos da room
	});

    // fim alterado

    // cards update
    // recebo as informacoes do card salvo via ajax e disparo para replicar para todos os jogadores da mesma room
	socket.on('enviar_card', function (data) {
        //lastPosition = data;
        
        console.log("Vai atualizar os cards:" + data.room + "-" + data.uuid);

        //socket.to(data.room).emit('update_card', data);
        socket.broadcast.emit('update_card', data);
	});
    
    app.post('/retrospective/carregar', function (req, res, next) {
        let {room} = req.body;
        console.log('Server carregando retrospectiva: ' + room);
    
        // vamos buscar os post-its deste quadro nesta room
        var sql = "SELECT id, coalesce(tipo, '') as tipo, coalesce(uuid, '') as uuid, coalesce(cor, '') as cor, "
                + " coalesce(conteudo, '') as conteudo, room FROM cards "
                + " WHERE room = '" + room + "' and ativo = 's' order by id ";
    
        console.log('SQL server carregando retrospectiva: ' + sql);
          
        db.query(sql, function(err, result) {
            for(var i=0; i < result.length; i++) {
                // envio um por um os cards ja existentes para esta sala gravados no banco de dados
                //io.sockets.in(room).emit('update_card', { tipo: result[i].tipo, uuid: result[i].uuid, cor: result[i].cor, conteudo: result[i].conteudo });
    
                // devo mandar carregar somente a tela que acaba de iniciar, para nao gerar duplicidade nas telas que ja estao carregadas corretamente
                socket_geral.emit('update_card', { tipo: result[i].tipo, uuid: result[i].uuid, cor: result[i].cor, conteudo: result[i].conteudo });
                console.log("Enviou o card "+result[i].uuid+" para a tela!");
            }
        });
       
        res.send(req.body);
    })

    function atualizarFinanceiro(dia, id_jogo){
        
        var dia_gerar_roi_passeio = 6;

        var sql = "SELECT financeiro.room, sum(financeiro.roi_total) as roi_total, sum(financeiro.investimento_total) as investimento_total, "
        +" 	sum(financeiro.multa_total) as multa_total "
        +" FROM ("
        +" 	SELECT room, (sum(total_roi_h) + sum(total_roi_p)) as roi_total, 0 as investimento_total, 0 as multa_total  from ( "
        +" 		 SELECT hj.room, hj.numero, hj.dia_fim, coalesce(hist.total_roi_h, 0) as total_roi_h, "
        +" 			coalesce(passeio.total_roi_p, 0) as total_roi_p "
        +" 		 FROM historias_jogo hj "
        +" 		 LEFT JOIN ( "
        +" 					 SELECT hj_h.room, hj_h.numero, hj_h.etapa, ((("+dia+" + 1) - COALESCE(hj_h.dia_fim, 0)) * COALESCE(h.roi_diario, 0)) as total_roi_h "
        +" 					 FROM historias_jogo hj_h "
        +" 						INNER JOIN historias h on h.numero = hj_h.numero "
        +" 			WHERE h.passeio <> 's' "
        +" 			) hist on hist.room = hj.room and hist.numero = hj.numero and hist.etapa = hj.etapa "
        +" 			LEFT JOIN ( "
        +" 					SELECT hj_p.room, hj_p.numero, hj_p.etapa, "
        // +"	((("+dia+" + 1) - COALESCE((CASE WHEN hj_p.dia_fim < "+dia_gerar_roi_passeio+" then "+dia_gerar_roi_passeio+" else hj_p.dia_fim end), 0)) * " 
        // +" COALESCE(h.roi_diario, 0)) as total_roi_p "
        +"	(CASE WHEN "+dia+" < "+dia_gerar_roi_passeio+" then 0 "
        +"		else (((("+dia+" + 1) - COALESCE((CASE WHEN hj_p.dia_fim < "+dia_gerar_roi_passeio+" then "+dia_gerar_roi_passeio+" else hj_p.dia_fim end), 0)) *  COALESCE(h.roi_diario, 0))) end) as total_roi_p "
        +" 					FROM historias_jogo hj_p " 
        +" 						INNER JOIN historias h on h.numero = hj_p.numero "
        +" 			WHERE h.passeio = 's' "
        +" 			) passeio on passeio.room = hj.room and passeio.numero = hj.numero and passeio.etapa = hj.etapa "
        +" 			WHERE hj.etapa = 'div-feito' and hj.dia_fim <= "+dia+" AND hj.id_jogo = "+id_jogo+" "
        +" 		 ) as roi "
        +" 	GROUP BY roi.room "
        +" 	UNION "
        +" 		SELECT p.room as room, 0 as roi_total, 0 as investimento_total, sum(COALESCE(p.valor, 0)) as multa_total "
        +" 		FROM penalidades p "
        +" 		WHERE p.dia <= "+dia+" and p.id_jogo = "+id_jogo+" and p.valor > 0 "
        +" 		GROUP BY p.room "
        +" 	UNION "
        +" 		SELECT i.room as room, 0 as roi_total, sum(COALESCE(i.valor, 0)) as investimento_total, 0 as multa_total "
        +" 		FROM investimentos i "
        +" 		WHERE i.dia <= "+dia+" and i.id_jogo = "+id_jogo+" and i.valor > 0 "
        +" 		GROUP BY i.room "
        +" ) as financeiro "
        +" GROUP BY financeiro.room";

        // console.log("Busca financeiro das estorias: " + sql);
    
        db.query(sql, function(err, result){
            if(typeof result !== 'undefined') {
                var roi_total = 0;
                for(var i=0; i < result.length; i++) {
                    // atualizo o roi_total somando os investimentos e debitando as multas ate o dia corrente
                    roi_total = result[i].roi_total + result[i].investimento_total - result[i].multa_total;

                    // se existir roi para o time que retornou na busca, envio a atualizacao de valores
                    // agora envio para todos os times (rooms) do jogo corrente
                    // room = codigo_jogo-time
                    socket.in(result[i].room).emit('update_financeiro', { roi_total: roi_total});

                    console.log("roi_total: " + result[i].room + " - " + roi_total);
                }
            }
        });
    }

    app.post('/retrospective/remove', function (req, res, next) {
        let {tipo, uuid, room} = req.body;
        console.log('Server removendo item retrospectiva: ' + uuid);
    
        // vamos buscar os post-its deste quadro nesta room
        var sql = "UPDATE cards SET ativo = 'n', data_atualizacao = now() "
                + " WHERE uuid = '" + uuid + "'";
    
        console.log('SQL server removendo retrospectiva: ' + sql);
          
        db.query(sql, function(err, result) {
            // devo mandar carregar somente a tela que acaba de iniciar, para nao gerar duplicidade nas telas que ja estao carregadas corretamente
            socket.in(room).emit('remove_card', { tipo: tipo, uuid: uuid });
            //socket_geral.to(room).emit('remove_card', { tipo: tipo, uuid: uuid });
            console.log("Remove o card "+uuid+" para todos da sala " + room);
        });
       
        res.send(req.body);
    })
    
    // game control
    app.post('/game_control/enviar', function (req, res, next) {
        let {dia, pontos_dia, pontos_geral, info1, info2, info3, lista_times, codigo_jogo, id_jogo} = req.body;
        //console.log('Server enviando info: ' + dia +", "+ pontos_dia+", "+ pontos_geral+", "
        //+ info1+", "+ info2+", "+ info3+", "+ codigo_jogo);

        if(typeof lista_times !== 'undefined') {
            for(var i=0; i < lista_times.length; i++) {
                //console.log('Time: ' + lista_times[i]);

                //console.log('Chegou no metodo enviar())');

                // agora envio para todos os times (rooms) do jogo corrente
                // room = codigo_jogo-time
                socket.in(codigo_jogo+"-"+lista_times[i]).emit('update_control', { dia: dia, pontos_dia: pontos_dia, pontos_geral: pontos_geral, 
                    info1: info1, info2: info2, info3: info3 });
            }
        }

        // chamo funcao para atualizar o financeiro
        atualizarFinanceiro(dia, id_jogo);
       
        res.send("Sucesso!");
    }); 

    // solicitar avaliacao
    app.post('/game_control/solicitarAval', function (req, res, next) {
        let { lista_times, codigo_jogo, id_jogo} = req.body;

        if(typeof lista_times !== 'undefined') {
            for(var i=0; i < lista_times.length; i++) {
                socket.in(codigo_jogo+"-"+lista_times[i]).emit('solicitar_aval', { room: codigo_jogo+"-"+lista_times[i] });
            }
        }
        
        res.send("Sucesso!");
    }); 

    // atualizar evento
    app.post('/game_control/atualizar_evento', function (req, res) {
        let {info2, lista_times, codigo_jogo} = req.body;

        if(typeof lista_times !== 'undefined') {
            for(var i=0; i < lista_times.length; i++) {
                //console.log('Time: ' + lista_times[i]);

                console.log('Chegou no metodo enviar evento');

                // agora envio para todos os times (rooms) do jogo corrente
                // room = codigo_jogo-time
                socket.in(codigo_jogo+"-"+lista_times[i]).emit('update_control_evento', { info1: info2 });
            }
        }
       
        res.send("Evento atualizado com sucesso!");
    });
    
    // game control
    app.post('/game_control/enviar_tempo', function (req, res, next) {
        let {tempo_adicional, lista_times, codigo_jogo} = req.body;
        //console.log('Server enviando info: ' + dia +", "+ pontos_dia+", "+ pontos_geral+", "
        //+ info1+", "+ info2+", "+ info3+", "+ codigo_jogo);

        if(typeof lista_times !== 'undefined') {
            for(var i=0; i < lista_times.length; i++) {
                //console.log('Time: ' + lista_times[i]);
    
                // agora envio o tmepo para iniciar a contagem regressica em todos os times (rooms) do jogo corrente
                // room = codigo_jogo-time
                socket.in(codigo_jogo+"-"+lista_times[i]).emit('update_tempo', { tempo_adicional: tempo_adicional });
            }
           
            res.send("Sucesso!");
        }
        else{
            res.send("Pendente criar a lista de Times.");
        }
        
    }) 


});

function exists(varname){
    try {
        var x = eval(varname);
        return true;
    } catch(e) { return false; }
}

app.post('/game/save_reg', function (req, res, next) {
    let {id_jogo, codigo_jogo, lista_times} = req.body;
    var coords = "";
    var room = "";
    var sql_insert = "INSERT INTO coordenadas (id, id_jogo, room, coordenadas, data_atualizacao) VALUES ";
    var sql_delete = "DELETE FROM coordenadas WHERE id_jogo = " + id_jogo;
    var values_query = "";

    if(typeof lista_times !== 'undefined') {
        var array_times_jogo = [];

        for(var i=0; i < lista_times.length; i++) {
            // somente tento gravar as coordenadas caso exista a variavel dinamica para a room
            if( exists( 'coords_' + ((codigo_jogo+"-"+lista_times[i]).replace('-', '_')) ) ){
                array_times_jogo[i] = lista_times[i];
            }
        }

        for(var i=0; i < array_times_jogo.length; i++) {

            // somente tento gravar as coordenadas caso exista a variavel dinamica para a room
            if( exists( 'coords_' + ((codigo_jogo+"-"+array_times_jogo[i]).replace('-', '_')) ) ){
                // pega sempre a variavel dinamica atualizada
                coords = eval('coords_' + ((codigo_jogo+"-"+array_times_jogo[i]).replace('-', '_')));

                coords = JSON.stringify([...coords]);

                room = codigo_jogo+"-"+array_times_jogo[i];

                values_query = values_query + "(null, "+ id_jogo +", '" + room + "', '"+ coords +"', now())";

                // enquanto nao for o ultimo registro eu vou incluindo virgula 
                if( (i + 1) < array_times_jogo.length){
                    values_query = values_query + ", ";
                } 
    
                //var coords = eval('coords_' + (room.replace('-', '_')));
                //console.log('CHAMOU GRAVACAO PARA A ROOM: ' + values_query);
            }
        }

        // somente deleto os registros se existirem dados de coordenadas para gravar
        if(values_query.length > 0){
            // delete todos os registros para as salas existentes no jogo
            db.query(sql_delete, function(err, result) {
                // insiro as coordenadas do jogo
                sql_insert = sql_insert + values_query;

                db.query(sql_insert, function(err, result_insert) {
                    //console.log('REGISTRO INSERIDO NA ROOM: ' + room + ' - SQL: ' + sql_insert);
                    res.send('Sucesso grava reg.');
                });
            });
        }
        else {
            res.send('Sem dados para gravar.');
        }

        
    }
});

var mapPosicoes = new Map();

// mapPosicoes.set('A1', {left: 'A2', top: 'B1'});
// mapPosicoes.set('A2', {left: 'A3', top: 'B2'});
// mapPosicoes.set('A3', {left: 'A4', top: 'B3'});
// mapPosicoes.set('A4', {left: 'A5', top: 'B4'});
// mapPosicoes.set('A5', {left: 'A6', top: 'B5'});
// mapPosicoes.set('A6', {left: 'A7', top: 'B6'});
// mapPosicoes.set('A7', {left: 'A8', top: 'B7'});
// mapPosicoes.set('A8', {left: '', top: 'B8'});
// mapPosicoes.set('B1', {left: 'B2', top: 'C1'});
// mapPosicoes.set('B2', {left: 'B3', top: 'C2'});
// mapPosicoes.set('B3', {left: 'B4', top: 'C3'});
// mapPosicoes.set('B4', {left: 'B5', top: 'C4'});
// mapPosicoes.set('B5', {left: 'B6', top: 'C5'});
// mapPosicoes.set('B6', {left: 'B7', top: 'C6'});
// mapPosicoes.set('B7', {left: 'B8', top: 'C7'});
// mapPosicoes.set('B8', {left: '', top: 'C8'});
// mapPosicoes.set('C1', {left: 'C2', top: 'D1'});
// mapPosicoes.set('C2', {left: 'C3', top: 'D2'});
// mapPosicoes.set('C3', {left: 'C4', top: 'D3'});
// mapPosicoes.set('C4', {left: 'C5', top: 'D4'});
// mapPosicoes.set('C5', {left: 'C6', top: 'D5'});
// mapPosicoes.set('C6', {left: 'C7', top: 'D6'});
// mapPosicoes.set('C7', {left: 'C8', top: 'D7'});
// mapPosicoes.set('C8', {left: '', top: 'D8'});
// mapPosicoes.set('D1', {left: 'D2', top: 'E1'});
// mapPosicoes.set('D2', {left: 'D3', top: 'E2'});
// mapPosicoes.set('D3', {left: 'D4', top: 'E3'});
// mapPosicoes.set('D4', {left: 'D5', top: 'E4'});
// mapPosicoes.set('D5', {left: 'D6', top: 'E5'});
// mapPosicoes.set('D6', {left: 'D7', top: 'E6'});
// mapPosicoes.set('D7', {left: 'D8', top: 'E7'});
// mapPosicoes.set('D8', {left: '', top: 'E8'});
// mapPosicoes.set('E1', {left: 'E2', top: 'F1'});
// mapPosicoes.set('E2', {left: 'E3', top: 'F2'});
// mapPosicoes.set('E3', {left: 'E4', top: 'F3'});
// mapPosicoes.set('E4', {left: 'E5', top: 'F4'});
// mapPosicoes.set('E5', {left: 'E6', top: 'F5'});
// mapPosicoes.set('E6', {left: 'E7', top: 'F6'});
// mapPosicoes.set('E7', {left: 'E8', top: 'F7'});
// mapPosicoes.set('E8', {left: '', top: 'F8'});
// mapPosicoes.set('F1', {left: 'F2', top: 'G1'});
// mapPosicoes.set('F2', {left: 'F3', top: 'G2'});
// mapPosicoes.set('F3', {left: 'F4', top: 'G3'});
// mapPosicoes.set('F4', {left: 'F5', top: 'G4'});
// mapPosicoes.set('F5', {left: 'F6', top: 'G5'});
// mapPosicoes.set('F6', {left: 'F7', top: 'G6'});
// mapPosicoes.set('F7', {left: 'F8', top: 'G7'});
// mapPosicoes.set('F8', {left: '', top: 'G8'});
// mapPosicoes.set('G1', {left: 'G2', top: 'H1'});
// mapPosicoes.set('G2', {left: 'G3', top: 'H2'});
// mapPosicoes.set('G3', {left: 'G4', top: 'H3'});
// mapPosicoes.set('G4', {left: 'G5', top: 'H4'});
// mapPosicoes.set('G5', {left: 'G6', top: 'H5'});
// mapPosicoes.set('G6', {left: 'G7', top: 'H6'});
// mapPosicoes.set('G7', {left: 'G8', top: 'H7'});
// mapPosicoes.set('G8', {left: '', top: 'H8'});
// mapPosicoes.set('H1', {left: 'H2', top: ''});
// mapPosicoes.set('H2', {left: 'H3', top: ''});
// mapPosicoes.set('H3', {left: 'H4', top: ''});
// mapPosicoes.set('H4', {left: 'H5', top: ''});
// mapPosicoes.set('H5', {left: 'H6', top: ''});
// mapPosicoes.set('H6', {left: 'H7', top: ''});
// mapPosicoes.set('H7', {left: 'H8', top: ''});
// mapPosicoes.set('H8', {left: '', top: ''});

mapPosicoes.set('A1', {left: 'A2', top: 'B1'});
mapPosicoes.set('A2', {left: 'A3', top: 'B2'});
mapPosicoes.set('A3', {left: 'A4', top: 'B3'});
mapPosicoes.set('A4', {left: 'A5', top: 'B4'});
mapPosicoes.set('A5', {left: 'A6', top: 'B5'});
mapPosicoes.set('A6', {left: 'A7', top: 'B6'});
mapPosicoes.set('A7', {left: 'A8', top: 'B7'});
mapPosicoes.set('A8', {left: 'A9', top: 'B8'});
mapPosicoes.set('A9', {left: '', top: 'B9'});
mapPosicoes.set('B1', {left: 'B2', top: 'C1'});
mapPosicoes.set('B2', {left: 'B3', top: 'C2'});
mapPosicoes.set('B3', {left: 'B4', top: 'C3'});
mapPosicoes.set('B4', {left: 'B5', top: 'C4'});
mapPosicoes.set('B5', {left: 'B6', top: 'C5'});
mapPosicoes.set('B6', {left: 'B7', top: 'C6'});
mapPosicoes.set('B7', {left: 'B8', top: 'C7'});
mapPosicoes.set('B8', {left: 'B9', top: 'C8'});
mapPosicoes.set('B9', {left: '', top: 'C9'});
mapPosicoes.set('C1', {left: 'C2', top: 'D1'});
mapPosicoes.set('C2', {left: 'C3', top: 'D2'});
mapPosicoes.set('C3', {left: 'C4', top: 'D3'});
mapPosicoes.set('C4', {left: 'C5', top: 'D4'});
mapPosicoes.set('C5', {left: 'C6', top: 'D5'});
mapPosicoes.set('C6', {left: 'C7', top: 'D6'});
mapPosicoes.set('C7', {left: 'C8', top: 'D7'});
mapPosicoes.set('C8', {left: 'C9', top: 'D8'});
mapPosicoes.set('C9', {left: '', top: 'D9'});
mapPosicoes.set('D1', {left: 'D2', top: 'E1'});
mapPosicoes.set('D2', {left: 'D3', top: 'E2'});
mapPosicoes.set('D3', {left: 'D4', top: 'E3'});
mapPosicoes.set('D4', {left: 'D5', top: 'E4'});
mapPosicoes.set('D5', {left: 'D6', top: 'E5'});
mapPosicoes.set('D6', {left: 'D7', top: 'E6'});
mapPosicoes.set('D7', {left: 'D8', top: 'E7'});
mapPosicoes.set('D8', {left: 'D9', top: 'E8'});
mapPosicoes.set('D9', {left: '', top: 'E9'});
mapPosicoes.set('E1', {left: 'E2', top: 'F1'});
mapPosicoes.set('E2', {left: 'E3', top: 'F2'});
mapPosicoes.set('E3', {left: 'E4', top: 'F3'});
mapPosicoes.set('E4', {left: 'E5', top: 'F4'});
mapPosicoes.set('E5', {left: 'E6', top: 'F5'});
mapPosicoes.set('E6', {left: 'E7', top: 'F6'});
mapPosicoes.set('E7', {left: 'E8', top: 'F7'});
mapPosicoes.set('E8', {left: 'E9', top: 'F8'});
mapPosicoes.set('E9', {left: '', top: 'F9'});
mapPosicoes.set('F1', {left: 'F2', top: 'G1'});
mapPosicoes.set('F2', {left: 'F3', top: 'G2'});
mapPosicoes.set('F3', {left: 'F4', top: 'G3'});
mapPosicoes.set('F4', {left: 'F5', top: 'G4'});
mapPosicoes.set('F5', {left: 'F6', top: 'G5'});
mapPosicoes.set('F6', {left: 'F7', top: 'G6'});
mapPosicoes.set('F7', {left: 'F8', top: 'G7'});
mapPosicoes.set('F8', {left: 'F9', top: 'G8'});
mapPosicoes.set('F9', {left: '', top: 'G9'});
mapPosicoes.set('G1', {left: 'G2', top: 'H1'});
mapPosicoes.set('G2', {left: 'G3', top: 'H2'});
mapPosicoes.set('G3', {left: 'G4', top: 'H3'});
mapPosicoes.set('G4', {left: 'G5', top: 'H4'});
mapPosicoes.set('G5', {left: 'G6', top: 'H5'});
mapPosicoes.set('G6', {left: 'G7', top: 'H6'});
mapPosicoes.set('G7', {left: 'G8', top: 'H7'});
mapPosicoes.set('G8', {left: 'G9', top: 'H8'});
mapPosicoes.set('G9', {left: '', top: 'H9'});
mapPosicoes.set('H1', {left: 'H2', top: ''});
mapPosicoes.set('H2', {left: 'H3', top: ''});
mapPosicoes.set('H3', {left: 'H4', top: ''});
mapPosicoes.set('H4', {left: 'H5', top: ''});
mapPosicoes.set('H5', {left: 'H6', top: ''});
mapPosicoes.set('H6', {left: 'H7', top: ''});
mapPosicoes.set('H7', {left: 'H8', top: ''});
mapPosicoes.set('H8', {left: 'H9', top: ''});
mapPosicoes.set('H9', {left: '', top: ''});


app.post('/game/contar', function (req, res, next) {
    let {room} = req.body;

    console.log('Server contador: ' + room + ' - Tamanho mapHistorias: ' + arrayImagensHistorias.length);

    // for (const [key,value] of mapTamanhoImagens){
    //     console.log('Peça-app.js: ' + key + ' - Largura: ' + value.largura + ' - Altura: ' + value.altura);
    //  }
    
    var array_letras_linhas = ['A','B','C','D','E','F','G','H'];
    var quantidade_max_colunas = 8;
    var valor_ajuste = 0;

    var mapPecasMontadas = new Map();
    var mapHistoriasIniciadas = new Map();

    /**
     * vou montar um map de historias que ja foram movimentadas no jogo, para nao ter 
     * que ficar percorrendo e mapeando peças de historias que nem foram iniciadas ainda. 
     * Isto vai ajudar na performance de contagem das peças.
     */
    for (const [key,value] of eval('coords_' + (room.replace('-', '_'))) ){
        //console.log('Split1: ' + key.split("-")[2]);
        if(!mapHistoriasIniciadas.has(key.split("-")[2])){
            mapHistoriasIniciadas.set(key.split("-")[2]);
        }
    }

	// mapa da peca
    // key = 1048-1-h2-A6
    
    var value = '';
    var peca_direita = '';
    var peca_abaixo = '';
    var coord_direita_x = '';
    var coord_direita_y = '';
    var coord_abaixo_x = '';
    var coord_abaixo_y = '';
    var diferenca_direita_x = '';
    var diferenca_direita_y = '';
    var diferenca_abaixo_x = '';
    var diferenca_abaixo_y = '';
    var coord_principal_x = 0;
    var coord_principal_y = 0;
    var diferenca_direita_x_map = 0;
    var diferenca_direita_y_map = 0;
    var diferenca_abaixo_x_map = 0;
    var diferenca_abaixo_y_map = 0;
    /**
     * a tolerancia em px (pixels) serve considerar peças que não estejam perfeitamente montadas
     */
    var margem_tolerancia = 10;

    // primeiro percorro o mapImagensHistorias
    for (const [keyh1,value1] of mapHistoriasIniciadas){       

        for(var i=0; i < array_letras_linhas.length; i++) {
            for(var j=1; j <= quantidade_max_colunas; j++) {
                // verifico se existe a chave pelo 'room_' + 'numero_historia' + '-' + 'peca'
                // 1048-1-h2-B2
                //console.log('Peça: ' + (room + '-' + keyh1 + '-' + array_letras_linhas[i] + j) );

                value = '';
                peca_direita = '';
                peca_abaixo = '';
                coord_principal_x = 0;
                coord_principal_y = 0;
                coord_direita_x = 0;
                coord_direita_y = 0;
                coord_abaixo_x = 0;
                coord_abaixo_y = 0;
                diferenca_direita_x = 0;
                diferenca_direita_y = 0;
                diferenca_abaixo_x = 0;
                diferenca_abaixo_y = 0;
                diferenca_direita_x_map = 0;
                diferenca_direita_y_map = 0;
                diferenca_abaixo_x_map = 0;
                diferenca_abaixo_y_map = 0;

                if( ( eval('coords_' + (room.replace('-', '_'))) ).has( room + '-' + keyh1 + '-' + array_letras_linhas[i] + j ) ){
                    // console.log('A peca ' + (room + '-' + keyh1 + '-' + array_letras_linhas[i] + j) + ' existe.');
                    // gerar txt com separacao por ;
                    // colunas: historia;left;top
                    value = ( eval('coords_' + (room.replace('-', '_'))) ).get( room + '-' + keyh1 + '-' + array_letras_linhas[i] + j );
                    
                    // console.log((room + '-' + keyh1 + '-' + array_letras_linhas[i] + j) + ';' + value.x + ';' + value.y );

                    if(typeof value.x !== 'undefined'){
                        coord_principal_x = parseFloat(value.x);
                    }

                    if(typeof value.y !== 'undefined'){
                        coord_principal_y = parseFloat(value.y);
                    }

                    // console.log('Peça no mapTamhnoImagens: ' + keyh1 + '-' + array_letras_linhas[i] + j);

                    // if(typeof mapTamanhoImagens.get( keyh1 + '-' + array_letras_linhas[i] + j ) !== 'undefined' ){
                    //     if(typeof mapTamanhoImagens.get( keyh1 + '-' + array_letras_linhas[i] + j ).altura !== 'undefined' ){
                    //         altura_principal = mapTamanhoImagens.get( keyh1 + '-' + array_letras_linhas[i] + j ).altura;
                    //         altura_principal = parseFloat(altura_principal);
                    //         // console.log('Altura na peça no mapTamhnoImagens: ' + altura_principal );
                    //     }

                    //     if(typeof mapTamanhoImagens.get( keyh1 + '-' + array_letras_linhas[i] + j ).largura !== 'undefined' ){
                    //         largura_principal = mapTamanhoImagens.get( keyh1 + '-' + array_letras_linhas[i] + j ).largura;
                    //         largura_principal = parseFloat(largura_principal);
                    //         // console.log('Largura na peça no mapTamhnoImagens: ' + largura_principal );
                    //     }
                    // }

                    // agora verifico se esta peca estah montada atraves de uma varredura nas posicoes de left e top do mapPosicoes
                    // 1048-1-h1-A1
                    peca_direita = mapPosicoes.get(array_letras_linhas[i] + j).left;
                    peca_abaixo = mapPosicoes.get(array_letras_linhas[i] + j).top;
                    // console.log('peca_direita: ' + peca_direita + '; peca_abaixo: ' + peca_abaixo);

                    // console.log('coord_direita_x: ' + room + '-' + keyh1 + '-' + peca_direita + '; coord_abaixo_y: ' + room + '-' + keyh1 + '-' + coord_abaixo_y);

                    // faco os calculos de diferenca da peca ah direita da principal, caso exista
                    if(typeof ( eval('coords_' + (room.replace('-', '_'))) ).get( room + '-' + keyh1 + '-' + peca_direita ) !== 'undefined'){
                        if(typeof ( eval('coords_' + (room.replace('-', '_'))) ).get( room + '-' + keyh1 + '-' + peca_direita ).x !== 'undefined'){
                            coord_direita_x = ( eval('coords_' + (room.replace('-', '_'))) ).get( room + '-' + keyh1 + '-' + peca_direita ).x;
                            coord_direita_x = parseFloat(coord_direita_x);
                        }

                        if(typeof ( eval('coords_' + (room.replace('-', '_'))) ).get( room + '-' + keyh1 + '-' + peca_direita ).y !== 'undefined'){
                            coord_direita_y = ( eval('coords_' + (room.replace('-', '_'))) ).get( room + '-' + keyh1 + '-' + peca_direita ).y;
                            coord_direita_y = parseFloat(coord_direita_y);
                        }
                        
                        // calculo diferenca da peca principal e a peca da direita
                        diferenca_direita_x = coord_direita_x - coord_principal_x;
                        diferenca_direita_y = coord_direita_y - coord_principal_y;

                        if(typeof mapPecasMapeadas.get( keyh1 + '-' + array_letras_linhas[i] + j ) !== 'undefined' 
                            && typeof mapPecasMapeadas.get( keyh1 + '-' + array_letras_linhas[i] + j ).diferenca_direita_x !== 'undefined'){
                            diferenca_direita_x_map = parseFloat(mapPecasMapeadas.get( keyh1 + '-' + array_letras_linhas[i] + j ).diferenca_direita_x);
                        }

                        if(typeof mapPecasMapeadas.get( keyh1 + '-' + array_letras_linhas[i] + j ) !== 'undefined' 
                            && typeof mapPecasMapeadas.get( keyh1 + '-' + array_letras_linhas[i] + j ).diferenca_direita_y !== 'undefined' ){
                            diferenca_direita_y_map = parseFloat(mapPecasMapeadas.get( keyh1 + '-' + array_letras_linhas[i] + j ).diferenca_direita_y);
                        }

                        // valido se a peca principal estah montada com uma peca ah sua direita e confronto com o mapPecasMapeadas
                        if(diferenca_direita_x > (diferenca_direita_x_map - margem_tolerancia) 
                            && diferenca_direita_x < (diferenca_direita_x_map + margem_tolerancia) 
                                && diferenca_direita_y > (diferenca_direita_y_map - margem_tolerancia) 
                                    && diferenca_direita_y < (diferenca_direita_y_map + margem_tolerancia)){
                            // incluo a peca principal como montada
                            // console.log("Montada: '" + (room + '-' + keyh1 + '-' + array_letras_linhas[i] + j) + "'");
                            mapPecasMontadas.set("'" + (room + '-' + keyh1 + '-' + array_letras_linhas[i] + j) + "'", 1);
                            // incluo a peca ah direita como montada
                            mapPecasMontadas.set("'"+(room + '-' + keyh1 + '-' + peca_direita)+"'", 1);
                        }
                    }
                    
                    // faco os calculos de diferenca da peca abaixo da principal, caso exista
                    if(typeof ( eval('coords_' + (room.replace('-', '_'))) ).get( room + '-' + keyh1 + '-' + peca_abaixo ) !== 'undefined'){
                        if(typeof ( eval('coords_' + (room.replace('-', '_'))) ).get( room + '-' + keyh1 + '-' + peca_abaixo ).x !== 'undefined'){
                            coord_abaixo_x = ( eval('coords_' + (room.replace('-', '_'))) ).get( room + '-' + keyh1 + '-' + peca_abaixo ).x;
                            coord_abaixo_x = parseFloat(coord_abaixo_x);
                        }

                        if(typeof ( eval('coords_' + (room.replace('-', '_'))) ).get( room + '-' + keyh1 + '-' + peca_abaixo ).y !== 'undefined'){
                            coord_abaixo_y = ( eval('coords_' + (room.replace('-', '_'))) ).get( room + '-' + keyh1 + '-' + peca_abaixo ).y;
                            coord_abaixo_y = parseFloat(coord_abaixo_y);
                        }

                        // calculo diferenca da peca principal e a peca debaixo
                        diferenca_abaixo_x = coord_abaixo_x - coord_principal_x;
                        diferenca_abaixo_y = coord_abaixo_y - coord_principal_y;

                        // console.log('diferenca_abaixo_x-map: ' + keyh1 + '-' + array_letras_linhas[i] + j);

                        if(typeof mapPecasMapeadas.get( keyh1 + '-' + array_letras_linhas[i] + j ) !== 'undefined' 
                            && typeof mapPecasMapeadas.get( keyh1 + '-' + array_letras_linhas[i] + j ).diferenca_abaixo_x !== 'undefined'){
                            diferenca_abaixo_x_map = parseFloat(mapPecasMapeadas.get( keyh1 + '-' + array_letras_linhas[i] + j ).diferenca_abaixo_x);
                        }

                        if(typeof mapPecasMapeadas.get( keyh1 + '-' + array_letras_linhas[i] + j ) !== 'undefined'
                            && typeof mapPecasMapeadas.get( keyh1 + '-' + array_letras_linhas[i] + j ).diferenca_abaixo_y !== 'undefined' ){
                            diferenca_abaixo_y_map = parseFloat(mapPecasMapeadas.get( keyh1 + '-' + array_letras_linhas[i] + j ).diferenca_abaixo_y);
                        }

                        

                        // valido se a peca principal estah montada com uma peca abaixo
                        // if(diferenca_abaixo_x > -43 && diferenca_abaixo_x < 41 && diferenca_abaixo_y > 24 && diferenca_abaixo_y < 147){
                        if(diferenca_abaixo_x > (diferenca_abaixo_x_map - margem_tolerancia) 
                            && diferenca_abaixo_x < (diferenca_abaixo_x_map + margem_tolerancia) 
                                && diferenca_abaixo_y > (diferenca_abaixo_y_map - margem_tolerancia) 
                                    && diferenca_abaixo_y < (diferenca_abaixo_y_map + margem_tolerancia)){
                            // incluo a peca principal como montada
                            mapPecasMontadas.set("'" + (room + '-' + keyh1 + '-' + array_letras_linhas[i] + j) + "'", 1);
                            // incluo a peca abaixo como montada
                            mapPecasMontadas.set("'"+(room + '-' + keyh1 + '-' + peca_abaixo)+"'", 1);
                        }
                    }

                    // console.log((room + '-' + keyh1 + '-' + array_letras_linhas[i] + j) + ' - diferenca_abaixo_x: ' + diferenca_abaixo_x 
                    //         + ' - diferenca_abaixo_x_map: ' + diferenca_abaixo_x_map + ' - diferenca_abaixo_y: ' + diferenca_abaixo_y
                    //             + ' - diferenca_abaixo_y_map: ' + diferenca_abaixo_y_map );
                    
                    // console.log( (room + '-' + keyh1 + '-' + array_letras_linhas[i] + j) + ';' + diferenca_direita_x + ';' + diferenca_direita_y + ';' + diferenca_abaixo_x + ';' + diferenca_abaixo_y);
                }
            }
        }
    }

    var pecas_motandas = 0;

    console.log('-----------------------------------------------------------');
    
    // imprimir o mapPecasMontadas
     for (const [key,value] of mapPecasMontadas){
        // console.log('peça montada: ' + key);
        pecas_motandas++;
     }

    

    console.log('-----------------------------------------------------------');

    console.log(new Date() + ' - Total de peças montadas: ' + pecas_motandas);
});

function mapearDiferencaPecas (room) {

    console.log('Mapeador de pecas montadas');
    
    var array_letras_linhas = ['A','B','C','D','E','F','G','H'];
    var quantidade_max_colunas = 9;

    var mapPecasMapeador = new Map();
    var mapHistoriasIniciadas = new Map();

    /**
     * vou montar um map de historias que ja foram movimentadas no jogo, para nao ter 
     * que ficar percorrendo e mapeando peças de historias que nem foram iniciadas ainda. 
     * Isto vai ajudar na performance de contagem das peças.
     */
    for (const [key,value] of eval('coords_' + (room.replace('-', '_'))) ){
        //console.log('Split1: ' + key.split("-")[2]);
        if(!mapHistoriasIniciadas.has(key.split("-")[2])){
            mapHistoriasIniciadas.set(key.split("-")[2]);
        }
    }

	// mapa da peca
	// key = 1048-1-h2-A6

    // primeiro percorro o mapImagensHistorias
    for (const [keyh1,value1] of mapHistoriasIniciadas){

        // console.log("Historia: " + keyh1);
        var value = '';
        peca_direita = '';
        peca_abaixo = '';
        coord_direita_x = '';
        coord_direita_y = '';
        coord_abaixo_x = '';
        coord_abaixo_y = '';
        diferenca_direita_x = '';
        diferenca_direita_y = '';
        diferenca_abaixo_x = '';
        diferenca_abaixo_y = '';
        coord_principal_x = 0;
        coord_principal_y = 0;

        for(var i=0; i < array_letras_linhas.length; i++) {
            for(var j=1; j <= quantidade_max_colunas; j++) {
                // verifico se existe a chave pelo 'room_' + 'numero_historia' + '-' + 'peca'
                // 1048-1-h2-B2
                //console.log('Peça: ' + (room + '-' + keyh1 + '-' + array_letras_linhas[i] + j) );

                value = '';
                peca_direita = '';
                peca_abaixo = '';
                coord_principal_x = 0;
                coord_principal_y = 0;
                coord_direita_x = 0;
                coord_direita_y = 0;
                coord_abaixo_x = 0;
                coord_abaixo_y = 0;
                diferenca_direita_x = 0;
                diferenca_direita_y = 0;
                diferenca_abaixo_x = 0;
                diferenca_abaixo_y = 0;

                if( ( eval('coords_' + (room.replace('-', '_'))) ).has( room + '-' + keyh1 + '-' + array_letras_linhas[i] + j ) ){
                    // console.log('A peca ' + (room + '-' + keyh1 + '-' + array_letras_linhas[i] + j) + ' existe.');
                    // gerar txt com separacao por ;
                    // colunas: historia;left;top
                    value = ( eval('coords_' + (room.replace('-', '_'))) ).get( room + '-' + keyh1 + '-' + array_letras_linhas[i] + j );
                    
                    // console.log((room + '-' + keyh1 + '-' + array_letras_linhas[i] + j) + ';' + value.x + ';' + value.y );

                    if(typeof value.x !== 'undefined'){
                        coord_principal_x = parseFloat(value.x);
                    }

                    if(typeof value.y !== 'undefined'){
                        coord_principal_y = parseFloat(value.y);
                    }

                    // agora verifico se esta peca estah montada atraves de uma varredura nas posicoes de left e top do mapPosicoes
                    // 1048-1-h1-A1
                    if(typeof mapPosicoes.get(array_letras_linhas[i] + j) !== 'undefined'){
                        if(typeof mapPosicoes.get(array_letras_linhas[i] + j).left !== 'undefined'){
                            peca_direita = mapPosicoes.get(array_letras_linhas[i] + j).left;
                        }

                        if(typeof mapPosicoes.get(array_letras_linhas[i] + j).top !== 'undefined'){
                            peca_abaixo = mapPosicoes.get(array_letras_linhas[i] + j).top;
                        }
                    }

                    // faco os calculos de diferenca da peca ah direita da principal, caso exista
                    if(typeof ( eval('coords_' + (room.replace('-', '_'))) ).get( room + '-' + keyh1 + '-' + peca_direita ) !== 'undefined'){
                        if(typeof ( eval('coords_' + (room.replace('-', '_'))) ).get( room + '-' + keyh1 + '-' + peca_direita ).x !== 'undefined'){
                            coord_direita_x = ( eval('coords_' + (room.replace('-', '_'))) ).get( room + '-' + keyh1 + '-' + peca_direita ).x;
                            coord_direita_x = parseFloat(coord_direita_x);
                        }

                        if(typeof ( eval('coords_' + (room.replace('-', '_'))) ).get( room + '-' + keyh1 + '-' + peca_direita ).y !== 'undefined'){
                            coord_direita_y = ( eval('coords_' + (room.replace('-', '_'))) ).get( room + '-' + keyh1 + '-' + peca_direita ).y;
                            coord_direita_y = parseFloat(coord_direita_y);
                        }
                        
                        // calculo diferenca da peca principal e a peca da direita
                        diferenca_direita_x = coord_direita_x - coord_principal_x;
                        diferenca_direita_y = coord_direita_y - coord_principal_y;
                    }
                    
                    // faco os calculos de diferenca da peca abaixo da principal, caso exista
                    if(typeof ( eval('coords_' + (room.replace('-', '_'))) ).get( room + '-' + keyh1 + '-' + peca_abaixo ) !== 'undefined'){
                        if(typeof ( eval('coords_' + (room.replace('-', '_'))) ).get( room + '-' + keyh1 + '-' + peca_abaixo ).x !== 'undefined'){
                            coord_abaixo_x = ( eval('coords_' + (room.replace('-', '_'))) ).get( room + '-' + keyh1 + '-' + peca_abaixo ).x;
                            coord_abaixo_x = parseFloat(coord_abaixo_x);
                        }

                        if(typeof ( eval('coords_' + (room.replace('-', '_'))) ).get( room + '-' + keyh1 + '-' + peca_abaixo ).y !== 'undefined'){
                            coord_abaixo_y = ( eval('coords_' + (room.replace('-', '_'))) ).get( room + '-' + keyh1 + '-' + peca_abaixo ).y;
                            coord_abaixo_y = parseFloat(coord_abaixo_y);
                        }

                        // calculo diferenca da peca principal e a peca debaixo
                        diferenca_abaixo_x = coord_abaixo_x - coord_principal_x;
                        diferenca_abaixo_y = coord_abaixo_y - coord_principal_y;
                    }

                    /** 
                     * montar uma matriz das pecas
                     * peca;dif_direita_x;dif_direita_y;dif_baixo_x; dif_baixo_y
                     */
                    // console.log((keyh1 + '-' + array_letras_linhas[i] + j) + ';' + diferenca_direita_x + ';' 
                    //     + diferenca_direita_y + ';' + diferenca_abaixo_x + ';'+ diferenca_abaixo_y);

                        mapPecasMapeador.set((keyh1 + '-' + array_letras_linhas[i] + j), { 'diferenca_direita_x': diferenca_direita_x, 'diferenca_direita_y': diferenca_direita_y, 
                    'diferenca_abaixo_x': diferenca_abaixo_x, 'diferenca_abaixo_y': diferenca_abaixo_y, 'x': coord_principal_x, 'y': coord_principal_y });
                }
            }
        }
    }

    var pecas_mapeadas = 0;

    console.log('-----------------------------------------------------------');
    
    // imprimir o mapPecasMapeador
     for (const [key,value] of mapPecasMapeador){
        pecas_mapeadas++;
     }

     console.log(new Date() + ' - Total de peças mapeadas: ' + pecas_mapeadas);

     gravarPecasMapeadas(mapPecasMapeador);
}

function carregarPecasMapeadas () {

    console.log('Carregando mapPecasMapeadas');
    
    var caminho = "./public/files/matriz_pecas.txt";

    // primeiro leio o arquivo com as coordenadas da sala do jogo que acaba de movimentar uma peca e
    // e remonto o map anterior do arquivo para depois inserir o novo valor, que pode ser um novo valor ou 
    // atualizacao da chave (room+historia+peca)
    var mp = new Map();

    try {
        fs.readFile(caminho, function(err,data_arquivo){
            //Enviando para o console o resultado da leitura
            // console.log('Leu arquivo: ' + data_arquivo);  
            if(typeof data_arquivo !== 'undefined' && data_arquivo !== null && data_arquivo.length > 0){
                mapPecasMapeadas = new Map();

                var dados = data_arquivo.toString();

                dados = dados.replace("]]]", "]]");

                // console.log('Dados: ' + dados);

                var jsonData = "";

                try {
                    jsonData = JSON.parse(dados);
                } catch(e) {
                    console.log('Erro parse: ' + e);
                }

                for (var i = 0; i < jsonData.length; i++) {
                    var valor = jsonData[i][0];

                    mapPecasMapeadas.set(jsonData[i][0], {"diferenca_direita_x" : jsonData[i][1].diferenca_direita_x, "diferenca_direita_y": jsonData[i][1].diferenca_direita_y, 
                        "diferenca_abaixo_x" : jsonData[i][1].diferenca_abaixo_x, "diferenca_abaixo_y": jsonData[i][1].diferenca_abaixo_y, 
                        "x" : jsonData[i][1].x, "y": jsonData[i][1].y });

                    mp.set(valor, jsonData[i][0]);

                    // console.log(valor + ' - ' +  jsonData[i][1].diferenca_direita_x);
                    // console.log('Peça: ' + jsonData[i][0]);
                }
            }
        });
    } catch (err) {
        console.error( err ) 
    }

    console.log('-----------------------------------------------------------');

    // for (const [key,value] of mapPecasMapeadas){
    //     console.log('Map: ' + key + ' - diferenca_direita_x:' + value.diferenca_direita_x 
    //         + ' - diferenca_direita_y:' + value.diferenca_direita_y 
    //             + ' - diferenca_abaixo_x:' + value.diferenca_abaixo_x 
    //                 + ' - diferenca_abaixo_x:' + value.diferenca_abaixo_y);
    // }

    setTimeout(function() {
        // for (const [key,value] of mp){
        //     console.log('Map mp: ' + key);
        // }
        global.mpm = mapPecasMapeadas;
    }, 20000);
    
    

    console.log(new Date() + ' - Carregou mapPecasMapeadas: ');

    
}

function gravarPecasMapeadas (map){
    var caminho = "./public/files/matriz_pecas.txt";

    //  for (const [key,value] of map){
    //      console.log('Map: ' + key + ' - x:' + value.x + ' - y:' + value.y);
    //  }
  
    /**
     * Gravo o conteudo do map com todas as pecas montadas e mapeadas na tela do jogo. 
     * Quando for montar este arquivo, todas as pecas mexidas devem estar na sua posicao correta, caso nao esteja,
     * vai prejudicar o jogo, pois o sistema vai se basear na posicao que estava incorreta e mesmo o jogador
     * colocando na posição correta, vai parecer estar errada.
     */
    var conteudo = JSON.stringify([...map]);
    
    /* No exemplo abaixo, informamos o local que será criado o arquivo
    toda a informação que esse arquivo conterá, e por ultimo temos nossa função callback */
    fs.writeFile(caminho, conteudo, function(err){
        //Caro ocorra algum erro
    if(err){
            return console.log('erro')
        }
    });

    console.log(new Date() + ' - Map de peças mapeadas mapeado com sucesso em ' + caminho);
}


function gravarCoordsRoom (data){
    var caminho = "./public/files/rooms/"+data.room+".txt";

    // primeiro leio o arquivo com as coordenadas da sala do jogo que acaba de movimentar uma peca e
    // e remonto o map anterior do arquivo para depois inserir o novo valor, que pode ser um novo valor ou 
    // atualizacao da chave (room+historia+peca)

    try {
        fs.readFile(caminho, function(err,data_arquivo){
            //Enviando para o console o resultado da leitura
        // console.log('Leu arquivo: ' + data);  
            if(typeof data_arquivo !== 'undefined' && data_arquivo !== null && data_arquivo.length > 0){
                map = new Map();    

                var dados = data_arquivo.toString();

                dados = dados.replace("]]]", "]]");

                //console.log('Dados: ' + dados);

                var jsonData = "";

                try {
                    jsonData = JSON.parse(dados);
                } catch(e) {
                    console.log('Erro parse: ' + e);
                }

                for (var i = 0; i < jsonData.length; i++) {
                    var valor = jsonData[i][0];

                    map.set(jsonData[i][0], {"x" : jsonData[i][1].x, "y": jsonData[i][1].y});

                    //console.log(valor);
                }
            }
        });
    } catch (err) {
        console.error( err ) 
    }

    //  for (const [key,value] of map){
    //      console.log('Map: ' + key + ' - x:' + value.x + ' - y:' + value.y);
    //  }

    //console.log('div:' + data.div_atualizar + ' - x: ' + data.x);

    map.set(data.div_atualizar, {"x" : data.x, "y": data.y});
   
    // em seguida atualizo o map de coordenadas com a posicao da peca, que pode ser um inclusao 
    // ou atualizacao para a chave da peca no map.
    var conteudo = JSON.stringify([...map]);
    
    /* No exemplo abaixo, informamos o local que será criado o arquivo
    toda a informação que esse arquivo conterá, e por ultimo temos nossa função callback */
    fs.writeFile(caminho, conteudo, function(err){
        //Caro ocorra algum erro
    if(err){
            return console.log('erro')
        }
    //Caso não tenha erro, retornaremos a mensagem de sucesso
        //console.log('Arquivo Criado');
    });
}

function Jogo(room, map) {
    this.room = room;
    this.map = map;
}


/**
Comunicar com salas especificas


io.on ( 'conectar' , onConnect);

função  onConnect ( soquete ) {

  // enviando para o cliente
   socket.emit ( 'olá' , 'você pode me ouvir?' , 1 , 2 , 'abc' );

  // enviando para todos os clientes, exceto o remetente
   socket.broadcast.emit ( 'broadcast' , 'olá amigos!' );

  // enviando para todos os clientes na sala 'game', exceto o remetente
   socket.to ( 'game' ) .emit ( 'nice game' , "vamos jogar um jogo" );

  // enviar a todos os clientes em 'game1' e / ou na sala 'game2', exceto remetente
   socket.to ( 'game1' ) .para ( 'game2' ) .emit ( 'bom jogo' , "vamos jogar um jogo ( também) " );

  // enviando para todos os clientes na sala 'game', incluindo o remetente
   io.in ( 'game' ) .emit ( 'big- Announcement ' , 'o jogo começará em breve' );

  // enviando para todos os clientes no espaço de nomes 'myNamespace', incluindo o remetente
   io.of ( 'myNamespace' ) .emit ( 'anúncio maior' , 'o torneio começará em breve' );

  // enviando para uma sala específica em um namespace específico, incluindo o remetente
   io.of ( 'myNamespace' ) .to ( 'room' ) .emit ( 'event' , 'message' );

  // enviando para socketid individual (mensagem privada)
   io.to (socketId) .emit ( 'hey' , 'eu te conheci' );

  // AVISO: `socket.to (socket.id) .emit ()` NÃO funcionará, pois será enviado a todos na sala // nomeados `socket.id`, exceto o remetente. Por favor, use o clássico `socket.emit ()`.
  

  // enviando com reconhecimento
   socket.emit ( 'question' , 'você acha?' , function ( answer ) {});

  // enviando sem compressão
   socket.compress ( false ) .emit ( 'descompactado' , "isso é difícil" );

  // enviando uma mensagem que pode ser descartada se o cliente não estiver pronto para receber mensagens
   socket.volatile.emit ( 'maybe' , 'você realmente precisa dela?' );

  // especificando se os dados a serem enviados possuem dados binários
   socket.binary ( false ) .emit ( 'what' , 'não tenho binários!' );

  // enviando para todos os clientes nesse nó (ao usar vários nós)
   io.local.emit ( 'hi' , 'my lovely babies' );

  // enviando para todos os clientes conectados
   io.emit ( 'um evento enviado para todos os clientes conectados' );

};

**/

