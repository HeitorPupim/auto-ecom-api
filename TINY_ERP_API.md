# TINY ERP API V3 — Structured Documentation (Markdown)

⸻

# Tiny ERP API v3 — Developer Documentation

Base URL

https://api.tiny.com.br/public-api/v3


⸻

## 1. Authentication & Authorization

The Tiny API uses OAuth2 Authorization Code Flow.

1.1 Authorization Request

Redirect the user to Tiny’s login page:

https://accounts.tiny.com.br/realms/tiny/protocol/openid-connect/auth?
client_id=CLIENT_ID&
redirect_uri=REDIRECT_URI&
scope=openid&
response_type=code

￼

⸻

1.2 Getting the Authorization Code

After login, Tiny redirects back to your app with:

?code=AUTHORIZATION_CODE


⸻

1.3 Exchanging the Code for an Access Token

curl --location 'https://accounts.tiny.com.br/realms/tiny/protocol/openid-connect/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=authorization_code' \
--data-urlencode 'client_id=CLIENT_ID' \
--data-urlencode 'client_secret=CLIENT_SECRET' \
--data-urlencode 'redirect_uri=REDIRECT_URI' \
--data-urlencode 'code=AUTHORIZATION_CODE'

￼

Returns:
	•	access_token (valid for 4 hours)
	•	refresh_token (valid for 1 day)

⸻

1.4 Using the Access Token

Authorization: Bearer {access_token}


⸻

1.5 Refreshing Tokens

curl --location 'https://accounts.tiny.com.br/realms/tiny/protocol/openid-connect/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=refresh_token' \
--data-urlencode 'client_id=CLIENT_ID' \
--data-urlencode 'client_secret=CLIENT_SECRET' \
--data-urlencode 'refresh_token=REFRESH_TOKEN'

￼

⸻

⸻

## 2. Categorias

2.1 GET /categorias/todas

Retrieve all categories.

Response:

{
  "id": 0,
  "descricao": "string",
  "filhas": ["string"]
}

￼

⸻

2.2 Categorias Receita/Despesa

GET /categorias-receita-despesa

Search filters:
	•	descricao
	•	grupo
	•	orderBy: asc | desc
	•	limit
	•	offset

⸻

⸻

## 3. Contas a Pagar

3.1 List contas a pagar

GET /contas-pagar

Filters include:
	•	nomeCliente
	•	situacao (aberto, cancelada, pago etc)
	•	dataInicialEmissao
	•	dataFinalVencimento
	•	marcadores
	•	orderBy
	•	pagination

⸻

3.2 Get one conta a pagar

GET /contas-pagar/{idContaPagar}

Returns full object with:
	•	datas
	•	valores
	•	cliente
	•	categoria
	•	recebimentos
￼

⸻

3.3 Create conta a pagar

POST /contas-pagar

Minimum body:

{
  "data": "string",
  "dataVencimento": "string",
  "valor": 0,
  "numeroDocumento": "string",
  "contato": { "id": 0 },
  "categoria": { "id": 0 }
}


⸻

3.4 Marcadores (tags)
	•	GET /contas-pagar/{id}/marcadores
	•	PUT /contas-pagar/{id}/marcadores
	•	POST /contas-pagar/{id}/marcadores
	•	DELETE /contas-pagar/{id}/marcadores

Each uses:

[{ "descricao": "string" }]


⸻

⸻

## 4. Contas a Receber

4.1 Get conta a receber

GET /contas-receber/{id}
Returns all fields including pagamento history.

⸻

4.2 Update conta a receber

PUT /contas-receber/{id}

⸻

4.3 Marcadores

Same as contas a pagar.

⸻

4.4 Baixar conta

POST /contas-receber/{id}/baixar

Body includes:

{
  "contaDestino": { "id": 0 },
  "data": "string",
  "categoria": { "id": 0 },
  "valorPago": 0
}


⸻

⸻

## 5. Contatos

5.1 Get contato

GET /contatos/{idContato}

Returns:
	•	nome, codigo, fantasia
	•	cpfCnpj
	•	telefones
	•	endereco & cobranca
	•	pessoas (sub-contatos)

⸻

5.2 Consultar contatos

GET /contatos

Filters:
	•	nome
	•	codigo
	•	situacao (A, B, I, E)
	•	cpfCnpj
	•	celular
	•	dataCriacao
	•	dataAtualizacao

⸻

5.3 Criar contato

POST /contatos

⸻

5.4 Pessoas de contato
	•	GET /contatos/{idContato}/pessoas
	•	POST /contatos/{idContato}/pessoas
	•	PUT /contatos/{idContato}/pessoas/{idPessoa}
	•	DELETE /contatos/{idContato}/pessoas/{idPessoa}

⸻

⸻

## 6. Estoque

6.1 Consultar estoque do produto

GET /estoque/{idProduto}

Response contains:
	•	nome, codigo, unidade
	•	saldo
	•	reservado
	•	disponivel
	•	depósitos detalhados

⸻

6.2 Criar movimentação de estoque

POST /estoque/{idProduto}

Body:

{
  "deposito": { "id": 0 },
  "tipo": "B",
  "data": "string",
  "quantidade": 0,
  "precoUnitario": 0
}


⸻

⸻

## 7. Expedição

7.1 Criar agrupamento

POST /expedicao

Accepts:
	•	idsNotasFiscais
	•	idsPedidos
	•	objetosAvulsos

⸻

7.2 Associar origens

POST /expedicao/{idAgrupamento}/origens

⸻

7.3 Atualizar expedição

PUT /expedicao/{idAgrupamento}/expedicao/{idExpedicao}

⸻

7.4 Concluir expedição

POST /expedicao/{idAgrupamento}/concluir

⸻

7.5 Etiquetas
	•	GET /expedicao/{id}/etiquetas
	•	GET /expedicao/{id}/expedicao/{idExpedicao}/etiquetas

⸻

⸻

## 8. Logística

8.1 Formas de Envio

GET /formas-envio

Supports filters:
	•	nome
	•	tipo (0–31)
	•	situacao
	•	pagination

Response includes:
	•	id
	•	nome
	•	tipo
	•	situacao
	•	gatewayLogistico

⸻

⸻

## 9. Formas de Pagamento

GET /formas-pagamento

Filters:
	•	nome
	•	situacao
	•	pagination

GET /formas-pagamento/{id}

⸻

⸻

## 10. Grupos de Tags
	•	PUT /grupos-tags/{id}
	•	GET /grupos-tags

⸻

## 11. Company Info

GET /info

Returns company details such as:
	•	nome
	•	cpfCnpj
	•	IE
	•	endereco
	•	telefone/email

⸻

⸻

## 12. Error Structure

Every error follows the same pattern:

{
  "mensagem": "string",
  "detalhes": [
    { "campo": "string", "mensagem": "string" }
  ]
}

