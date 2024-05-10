


ALTER TABLE `historias` ADD `passeio` varchar(1);
ALTER TABLE `penalidades` ADD `id_jogo` INT(10) NOT NULL AFTER `id`;
ALTER TABLE `investimentos` ADD `id_jogo` INT(10) NOT NULL AFTER `id`;


