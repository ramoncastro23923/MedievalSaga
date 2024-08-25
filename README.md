# Sistema de Kanban - MedievalSaga

## Descrição

Este sistema é projetado para gerenciar histórias de usuário em ambientes ágeis, como Scrum. Ele permite a configuração e validação de metas para sprints e o gerenciamento de histórias em um quadro Kanban.

## Requisitos

- **XAMPP**: Para gerenciar o servidor MySQL e Apache.
- **Node.js**: Para executar o código do servidor.
- **Visual Studio Code (VS Code)**: Editor de código-fonte.
- **MySQL**: Banco de dados para armazenar as informações das histórias.

## Instalação e Configuração

1. **Instale o XAMPP**: 
   - Baixe e instale a partir do [site oficial](https://www.apachefriends.org/index.html).

2. **Instale o Node.js**: 
   - Baixe e instale a partir do [site oficial](https://nodejs.org/).

3. **Baixe o Arquivo do Jogo**: 
   - Certifique-se de obter o arquivo necessário para o sistema.

4. **Instale o VS Code**: 
   - Baixe e instale a partir do [site oficial](https://code.visualstudio.com/).

5. **Configure o Banco de Dados**: 
   - Abra o MySQL Admin e crie um novo usuário e banco de dados com base nas informações do arquivo `index.js`.
   - Restaure o banco de dados do jogo usando o script de backup fornecido.

6. **Configure os Arquivos do Projeto**: 
   - Abra o projeto no VS Code e ajuste os arquivos de configuração para conectar ao banco de dados criado.

7. **Configure o Caminho da Aplicação**: 
   - Certifique-se de que os arquivos do projeto estejam corretamente configurados para reconhecer o caminho da aplicação no seu computador local.

## Funcionalidades

- **Validação de Metas**: O sistema permite a configuração de metas para sprints e valida a existência e validade das histórias incluídas.
- **Gerenciamento de Histórias**: Verifica e atualiza o status das histórias no quadro Kanban.
- **Relatórios e Mensagens**: Fornece mensagens de feedback sobre a validade das metas e o status das histórias.

## Acesso

Para acessar o sistema, use as seguintes credenciais:
- **Usuário**: facilitador@scrum3d.com
- **Senha**: abc123
