# Documentação de Problemas Identificados

Este arquivo deve ser preenchido pelo candidato com todos os problemas encontrados no código.

## Formato de Documentação

Para cada problema identificado, documente seguindo o formato abaixo:

```markdown
## Problema #X: [Título do Problema]

**Localização**: `caminho/do/arquivo.ts:linha`

**Categoria**: [Segurança / Performance / Lógica de Negócio / Tratamento de Erros / Validação / Integridade]

**Descrição**: 
Descrição detalhada do problema encontrado.

**Por que é um problema**: 
Explicação do porquê este código representa um problema.

**Impacto**: 
Qual o impacto potencial deste problema na aplicação.

**Solução aplicada**: 
Como você corrigiu o problema (após a correção).
```

---

## Problemas Identificados

*Preencha abaixo com os problemas que você encontrou...*

## Problema #1: Erros de validação retornam resposta genérica sem mensagens úteis

**Localização**: `src/middleware/validation.middleware.ts:1` e `src/validators/user.validator.ts:1`

**Categoria**: Validação / Tratamento de Erros / Experiência do Usuário

**Descrição**:  
Ao tentar cadastrar um usuário, o servidor respondia apenas com `{ "error": "Validation error" }` sem detalhes sobre qual campo falhou (ex.: senha muito curta). O middleware de validação não estava expondo as mensagens do Zod para a resposta, e o schema de usuário não fornecia mensagem clara para validação de tamanho da senha.

**Por que é um problema**:  
Sem mensagens de erro explícitas o cliente não consegue corrigir a requisição (pior experiência). Também dificulta debug e testes automatizados que esperam mensagens previsíveis de validação.

**Impacto**:  
- Cliente recebe resposta genérica e não sabe qual campo ajustar.  
- Fragiliza UX do formulário de cadastro.  
- Aumenta o tempo para detectar e corrigir dados inválidos.

**Solução aplicada**:  
- Alterado `src/middleware/validation.middleware.ts` para capturar `ZodError`, mapear e retornar detalhes (campo + mensagem) no corpo da resposta e logar o erro para facilitar debug.  
- Ajustado `src/validators/user.validator.ts` para garantir validação do tamanho da senha com mensagem clara, por exemplo: `password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres')`.  
- Verificado que o app usa `express.json()` para garantir que o body chegue ao middleware.

---

## Problema #2: Falta de validação de email duplicado

**Localização**: `src/services/user.service.ts:25`

**Categoria**: Validação / Lógica de Negócio

**Descrição**: 
O método `createUser` não verifica se já existe um usuário com o email fornecido antes de criar um novo registro.

**Por que é um problema**: 
Isso pode resultar em emails duplicados no banco de dados, violando a constraint de unicidade e causando erros ou inconsistências.

**Impacto**: 
- Erro ao tentar criar usuário com email duplicado
- Possível inconsistência de dados
- Má experiência do usuário

**Solução aplicada**: 
Adicionada verificação antes de criar o usuário, retornando erro apropriado se o email já existir.

---

## Problema #3: Para todas as rotas de usuario o status code de erro padrão era 500

**Localização**: `src/services/user.controller.ts`

**Categoria**: Tratamento de Erros 

**Descrição**: 
O método `createUser`,`addUserToGroup`, `updateUser` e `deleteUser`retornam um unico status code de erro: 500

**Por que é um problema**:
Retornar sempre 500 mata a semântica do protocolo, impede tratamento correto no cliente, atrapalha monitoramento e debugging, e mistura erro de usuário com bug de servidor

**Impacto**: 
- Monitoramento perde valor
- Debug e análise de logs ficam caóticos
- Quebra padrões de HTTP e integrações

**Solução aplicada**: 
passado a retornar o status code de erro.
---

## Problema #4: Ao deletar usuario não verificava se ele existia.

**Localização**: `src/services/user.service.ts`

**Categoria**: Tratamento de Erros / Relacionamentos e Integridade

**Descrição**:
O método `deleteUser` tentava deletar o usuário sem verificar se o mesmo existia, quando ele não existia retornava o status 200 porem nenhum operação havia sido feita de fato

**Por que é um problema**:
o problema não é apenas não verificar se existe, é responder sucesso para uma operação que não foi realizada, quebrando a semântica do HTTP e do seu contrato de API. Se você responde 200 sem garantir que algo foi de fato apagado, está mascarando uma possível falha de conformidade

**Impacto**:
- Viola o contrato da API
- Dificulta debug e monitoramento
- Impacta regras de negócio e compliance
- Quebra expectativas de quem consome a API

**Solução aplicada**:
Implementado a verificação, deleta apenas se o usuário realmente existe

---

## Problema #5: Ao adicionar usuário a um grupo não verificava exitencia nem do usuario nem do grupo.

**Localização**: `src/services/user.service.ts`

**Categoria**: Lógica de Negócio / Relacionamentos e Integridade

**Descrição**:
O método `addUserToGroup` tentava associar um usuario a um grupo sem verificar a existencia de ambos.

**Por que é um problema**:
Sem verificar a existência de usuário e grupo, você quebra integridade, esconde bugs e abre brecha para comportamento errado e possivelmente inseguro

**Impacto**:
- Integridade de dados
- Problemas de segurança
- Impacta regras de negócio.
- Quebra expectativas de quem consome a API

**Solução aplicada**:
Implementado a verificação, associa apenas se ambos existirem.

---

## Problema #6: Falta de validação na rota de associação de um usario a um grupo e de remover um usuario de um grupo

**Localização**: `src/routes/user.route.ts` e `srv/validators/user.validator`

**Categoria**: Validação de Dados

**Descrição**:
não existia uma validação do payload passado `groupId`.

**Por que é um problema**:
A falta de validação gera erros não tratados.

**Impacto**:
- Integridade de dados
- Experiência do usuário dificultando entendimento claro de erros

**Solução aplicada**:
Implementado `addUserToGroupSchema` e `removeUserFromGroupSchema` em `user.validator.ts` validação de tipo de dado, aceitando numero inteiro e string numerico.

---

## Problema #7: Ao adicionar usuário a um grupo não verificava se o mesmo ja estava associado ao grupo.

**Localização**: `src/services/user.service.ts`

**Categoria**: Lógica de Negócio / Relacionamentos e Integridade 

**Descrição**:
A aplicação não validava se o usuario ja estava associado ao grupo. podendo criar a mesma relação sem limites.

**Por que é um problema**:
Isso cria a mesma relação no banco varias vezes, quando apenas uma é suficiente, gerando dados inuteis, e comprometendo a integridade.

**Impacto**:
- Dados duplicados e inconsistentes
- Performance e custo
- Falta de clareza no contrato da API

**Solução aplicada**:
Implementado a verificação no `user.service.ts`, associa apenas se essa relação ainda não existir.

---

## Problema #8: Ao Remover usuário de um grupo não verificava se o mesmo estava associado ao grupo.

**Localização**: `src/services/user.service.ts`

**Categoria**: Lógica de Negócio / Relacionamentos e Integridade

**Descrição**:
A aplicação não validava se o usuario estava associado ao grupo antes de tentar remover a relação.

**Por que é um problema**:
Você passa a “remover” algo que pode nem existir, e isso estraga previsibilidade, integridade e debug.

**Impacto**:
- Erros de banco desnecessários
- Bugs escondidos

**Solução aplicada**:
Implementado a verificação no `user.service.ts`, verifica se usuario e grupo estão associados antes de tentar remover a relação.

---

## Problema #9: Expondo senha do usuario
**Localização**: `src/services/user.repository.ts`

**Categoria**: Segurança

**Descrição**:
Nos metodos `findAll`, `findById` e `findByEmail` esta todos os dados de usuario inclusive sua senha.

**Por que é um problema**:
Porque você está vazando um dado extremamente sensível para camadas que não têm que saber disso

**Impacto**:
- Quebra de responsabilidade
- Risco de vazamento de dado sensivel

**Solução aplicada**:
Implementado select no `user.repository.ts`, para trazer dados importantes e retornar sem senha.
---

## Problema #10: Remoção de usuário não limpa associações em userGroups

**Localização**: `src/repositories/user.repository.ts`

**Categoria**: Integridade / Lógica de Negócio

**Descrição**:  
Ao deletar um usuário o código tentava remover diretamente o registro do usuário sem primeiro excluir os registros de associação na tabela `userGroups`. Se existirem referências em `userGroups`, a operação pode falhar (dependendo da constraint FK) ou deixar dados órfãos/causar inconsistências.

**Por que é um problema**:  
Relacionamentos não limpos podem quebrar a aplicação (erro de FK) ou deixar dados inconsistentes no banco. Além disso, tentativas de remover sem tratar as associações resultam em erros 500.

**Impacto**:
- DELETE /users/:id pode retornar 500 em produção.
- Dados relacionados permanecem e causam inconsistência.
- Possível falha em operações subsequentes que assumem integridade referencial.

**Solução aplicada**:  
No `delete` do repository:
- Buscar associações via `getUserGroups` e remover cada associação (`removeUserFromGroup`) antes de remover o usuário.
- Remover o usuário após as associações terem sido excluídas.

---

## Problema #11: Possivel criar e atulizar um grupo nome que ja existe.

**Localização**: `src/repositories/group.service.ts`

**Categoria**: Integridade / Lógica de Negócio / Validação de Dados

**Descrição**:  
Ao criar e atualizar um grupo é possivel fazer com nome de um grupo ja cadastrado.

**Por que é um problema**:  
Isso gera dados duplicados, e compromete futaras consultas e relatórios.

**Impacto**:
- Ambiguidade total
- Duplicação de dados.
- Fácil apagar ou alterar o grupo “errado”.

**Solução aplicada**:  
No `create` do service chamando novo metodo  implementado`findByName` criado no repository para filtrar grupo por nome.

---

## Problema #12: Ao deletar um grupo não verificava se ele existia.

**Localização**: `src/services/group.service.ts`

**Categoria**: Tratamento de Erros / Relacionamentos e Integridade

**Descrição**:
O método `deleteGroup` tentava deletar o grupo sem verificar se o mesmo existia, quando ele não existia retornava o status 200 porem nenhum operação havia sido feita de fato

**Por que é um problema**:
o problema não é apenas não verificar se existe, é responder sucesso para uma operação que não foi realizada, quebrando a semântica do HTTP e do seu contrato de API. Se você responde 200 sem garantir que algo foi de fato apagado, está mascarando uma possível falha de conformidade

**Impacto**:
- Viola o contrato da API
- Dificulta debug e monitoramento
- Impacta regras de negócio e compliance
- Quebra expectativas de quem consome a API

**Solução aplicada**:
Implementado a verificação, deleta apenas se o Grupo realmente existe

---

## Problema #13: Ao deletar um grupo não verificava se existia produtos assiados ao grupo.

**Localização**: `src/services/group.service.ts`

**Categoria**: Tratamento de Erros / Relacionamentos e Integridade

**Descrição**:
O método `deleteGroup` tentava deletar o grupo sem verificar se algum produto estava associado ao grupo.

**Por que é um problema**:
Causa grave erro de integridade do banco não tratado.

**Impacto**:
- Possivel retorno de 500 na aplicação.
- Regra de negócio violada
- viola integridade do banco.

**Solução aplicada**:
Implementado a verificação no service, caso grupo tenha produtos associados retornar mensagem.
---

## Problema #14: Ao deletar um grupo não verificava se existia usuários assiados ao grupo.

**Localização**: `src/services/group.service.ts`

**Categoria**: Tratamento de Erros / Relacionamentos e Integridade

**Descrição**:
O método `deleteGroup` tentava deletar o grupo sem verificar se algum usuário estava associado ao grupo.

**Por que é um problema**:
Causa grave erro de integridade do banco não tratado.

**Impacto**:
- Possivel retorno de 500 na aplicação.
- Regra de negócio violada
- viola integridade do banco.

**Solução aplicada**:
Implementado a verificação no service, caso grupo tenha usários associados retornar mensagem.
---

## Problema #15: N+1 queries.

**Localização**: `src/services/group.repository.ts`

**Categoria**: Performance

**Descrição**:
1 query para buscar os vínculos do grupo (userGroups)
+1 query para cada usuário vinculado

**Por que é um problema**:
Causa grave erro de integridade do banco não trado.

**Impacto**:
- Se o grupo tiver 100 usuários, você faz 101 queries. Se tiver 1.000, faz 1.001. Isso não escala, pesa no banco e aumenta muito a latência.

**Solução aplicada**:
transformado em 1 query que busque todos os usuários de uma vez, via JOIN
---

## Problema #16: Falta de paginação no findAll de Product.

**Localização**: `src/services/product.repository.ts`

**Categoria**: Performance

**Descrição**:
Com poucos dados não ha diferença significativa, mas pensando a longo prazo essa tabela ira crescer muito, sendo nescessario aplicar paginação.

**Por que é um problema**:
A longo prazo causará consultas extremamente lentas tornando impossivel usar o metodo.

**Impacto**:
- listagem de produtos muito lenta.
- possivelmente a tela de listagem nem abra.

**Solução aplicada**:
aplicado paginação trazendo 20 itens por pagina, pensando na escalabilidade do produto.
---

## Problema #17: Não valida se grupo existe antes de criar o produto.

**Localização**: `src/repositories/produtc.service.ts`

**Categoria**: Integridade / Lógica de Negócio / Validação de Dados

**Descrição**:  
Ao criar um produto passando o `groupId` não valida se o grupo realmente existe.

**Por que é um problema**:  
Isso causa erro grave na integridade do banco, tentando relacionar a uma entidade que não existe.

**Impacto**:
- Erro não tratado na integridade do banco
- possivel erro 500 na aplicação.

**Solução aplicada**:  
Aplicado a verificação antes de criar o produto, caso tente associar verifica se existe o grupo.
---

## Problema #18: Falta de validação para Preço negativo

**Localização**: `src/services/produtc.validator.ts`

**Categoria**: Validação / Lógica de Negócio

**Descrição**:
É possivel cadastrar e atualizar produto com preço negativo.

**Por que é um problema**:
Erro grave de validação, não existe preço negativo.

**Impacto**:
- Informação absolutamente errada

**Solução aplicada**:
Adicionada validação no validator para verificar se o numero é negativo.
---

## Problema #19: Falta de validação para Estoque negativo

**Localização**: `src/services/produtc.validator.ts`

**Categoria**: Validação / Lógica de Negócio

**Descrição**:
É possivel cadastrar e atualizar produto com Estoque negativo.

**Por que é um problema**:
Erro grave de validação, não existe Estoque negativo.

**Impacto**:
- Informação absolutamente errada

**Solução aplicada**:
Adicionada validação no validator para verificar se o numero é negativo.
---

## Problema #20: Ao deletar um produto não verificava se ele existia.

**Localização**: `src/services/product.service.ts`

**Categoria**: Tratamento de Erros / Relacionamentos e Integridade

**Descrição**:
O método `deleteProduct` tentava deletar o produto sem verificar se o mesmo existia, quando ele não existia retornava o status 200 porem nenhum operação havia sido feita de fato

**Por que é um problema**:
o problema não é apenas não verificar se existe, é responder sucesso para uma operação que não foi realizada, quebrando a semântica do HTTP e do seu contrato de API. Se você responde 200 sem garantir que algo foi de fato apagado, está mascarando uma possível falha de conformidade

**Impacto**:
- Viola o contrato da API
- Dificulta debug e monitoramento
- Impacta regras de negócio e compliance
- Quebra expectativas de quem consome a API

**Solução aplicada**:
Implementado a verificação, deleta apenas se o produto realmente existe

---

## Problema #21: Ao deletar um produto não verificava se ele existia.

**Localização**: `src/services/product.repository.ts`

**Categoria**: Tratamento de Erros / Relacionamentos e Integridade

**Descrição**:
O método searchByName monta a query SQL concatenando diretamente o termo de busca na string, usando interpolação (${searchTerm}) dentro do LIKE e executando via sql.raw, sem uso de parâmetros/bindings seguros

**Por que é um problema**:
o inserir o valor de searchTerm diretamente na query, qualquer entrada do usuário é interpretada pelo banco como parte do comando SQL. Isso abre brecha para SQL Injection, permitindo que um usuário mal-intencionado quebre a consulta, leia dados sensíveis ou até altere/apague informaçõe

**Impacto**:
- Possível vazamento de dados sensíveis
- Risco de alteração/remoção indevida de dados

**Solução aplicada**:
Foi criado um termo de busca (likeTerm) com % antes e depois do texto e, em vez de montar a SQL na mão com interpolação de string, a consulta passou a usar sql\...`com${likeTerm}` como parâmetro, fazendo o banco tratar o valor de forma segura e evitando SQL injection.
---

## Problema #22: Para todas as rotas de group o status code de erro padrão era 500

**Localização**: `src/services/group.controller.ts`

**Categoria**: Tratamento de Erros

**Descrição**:
Todos os metodos retornando 500 como para para erro.

**Por que é um problema**:
Retornar sempre 500 mata a semântica do protocolo, impede tratamento correto no cliente, atrapalha monitoramento e debugging, e mistura erro de usuário com bug de servidor

**Impacto**:
- Monitoramento perde valor
- Debug e análise de logs ficam caóticos
- Quebra padrões de HTTP e integrações

**Solução aplicada**:
passado a retornar o status code de erro.
---

## Problema #23: Para todas as rotas de Product o status code de erro padrão era 500

**Localização**: `src/services/group.controller.ts`

**Categoria**: Tratamento de Erros

**Descrição**:
Todos os metodos retornando 500 como para para erro.

**Por que é um problema**:
Retornar sempre 500 mata a semântica do protocolo, impede tratamento correto no cliente, atrapalha monitoramento e debugging, e mistura erro de usuário com bug de servidor

**Impacto**:
- Monitoramento perde valor
- Debug e análise de logs ficam caóticos
- Quebra padrões de HTTP e integrações

**Solução aplicada**:
passado a retornar o status code de erro.
---
