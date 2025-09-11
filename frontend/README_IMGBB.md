# Configuração da API ImgBB para Upload de Imagens

## O que é a API ImgBB?

A API ImgBB é um serviço gratuito que permite fazer upload de imagens e obter URLs públicas para uso em aplicações web.

## Como obter a chave da API

1. Acesse [https://imgbb.com/](https://imgbb.com/)
2. Crie uma conta gratuita
3. Vá para "API" no menu
4. Copie sua chave da API

## Configuração no projeto

1. Crie um arquivo `.env.local` na raiz do projeto frontend (pasta `iepam_manager_frontend/frontend/`)

2. Adicione a seguinte linha ao arquivo:
```
IMGBB_IMAGES_API_KEY=sua_chave_da_api_aqui
```

3. Substitua `sua_chave_da_api_aqui` pela chave real que você obteve no ImgBB

4. Reinicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Verificação

Para verificar se a configuração está correta:

1. Abra o console do navegador (F12)
2. Tente criar um item no inventário ou um gasto extra com imagem
3. Você deve ver logs no console indicando se a chave está configurada

## Problemas comuns

- **Erro "Chave da API não configurada"**: Verifique se o arquivo `.env.local` existe e está na pasta correta
- **Erro de upload**: Verifique se a chave da API está correta e se você tem créditos disponíveis na conta ImgBB
- **Imagem não aparece**: Verifique se a URL retornada pela API está acessível

## Limites da API gratuita

- 32MB por upload
- 1000 uploads por mês
- Imagens são mantidas por tempo indeterminado 