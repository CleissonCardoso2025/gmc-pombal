# Migração de API Keys para Supabase Secrets

## 📋 Resumo

As chaves de API do Google Maps e OpenAI foram migradas de variáveis de ambiente do frontend (Dokploy) para **Supabase Secrets**, acessadas através de **Edge Functions**. Isso garante que as chaves nunca sejam expostas no código frontend, aumentando significativamente a segurança da aplicação.

## 🔐 Arquitetura de Segurança

### Antes (Inseguro)

```
Frontend (Vite) → VITE_GOOGLE_MAPS_API_KEY → Exposta no bundle
Frontend (Vite) → VITE_OPENAI_API_KEY → Exposta no bundle
```

### Depois (Seguro)

```
Frontend → Edge Function (get-maps-api-key) → Supabase Secret (GOOGLE_MAPS_API_KEY)
Frontend → Edge Function (text-correction) → Supabase Secret (OPENAI_API_KEY)
```

## 📁 Arquivos Modificados

### 1. `src/services/envConfigService.ts`

- ✅ Convertido para usar Edge Functions assíncronas
- ✅ Adicionado cache de 1 hora para as chaves de API
- ✅ Função `getGoogleMapsApiKey()` agora é `async` e busca via Edge Function
- ✅ Função `correctTextWithAI()` criada para usar a Edge Function de correção de texto
- ✅ Função `getConfigStatus()` agora é `async`

### 2. `src/services/googleMapsService.ts`

- ✅ Atualizado para usar funções assíncronas
- ✅ Documentação atualizada para mencionar Supabase Secrets

### 3. `src/components/Configuracoes/ApiIntegrations.tsx`

- ✅ Interface atualizada para refletir uso de Supabase Secrets
- ✅ Instruções de configuração atualizadas
- ✅ Links diretos para configuração no Supabase adicionados
- ✅ `useEffect` atualizado para usar `getConfigStatus()` assíncrono

## 🚀 Edge Functions Utilizadas

### 1. `get-maps-api-key`

**Localização:** `supabase/functions/get-maps-api-key/index.ts`

**Função:** Retorna a chave do Google Maps de forma segura

**Secret necessário:** `GOOGLE_MAPS_API_KEY`

**Uso:**

```typescript
const { data } = await supabase.functions.invoke("get-maps-api-key");
const apiKey = data?.apiKey;
```

### 2. `text-correction`

**Localização:** `supabase/functions/text-correction/index.ts`

**Função:** Corrige textos usando GPT-4o-mini

**Secret necessário:** `OPENAI_API_KEY`

**Uso:**

```typescript
const { data } = await supabase.functions.invoke("text-correction", {
  body: { text: "texto para corrigir" },
});
const correctedText = data?.correctedText;
```

## ⚙️ Como Configurar os Secrets

### Passo a Passo:

1. **Acesse o Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/rdkugzjrvlvcorfsbdaz

2. **Navegue até Secrets**
   - Project Settings → Edge Functions → Secrets

3. **Adicione os Secrets:**

   **Google Maps:**
   - Nome: `GOOGLE_MAPS_API_KEY`
   - Valor: Sua chave do Google Maps API
   - Obter em: https://console.cloud.google.com/apis/credentials

   **OpenAI:**
   - Nome: `OPENAI_API_KEY`
   - Valor: Sua chave da OpenAI API
   - Obter em: https://platform.openai.com/api-keys

4. **Salvar**
   - As Edge Functions já estão configuradas para usar esses secrets
   - Não é necessário redeploy

## 🎯 Benefícios

✅ **Segurança Máxima:** Chaves nunca expostas no frontend
✅ **Fácil Rotação:** Altere as chaves sem redeploy da aplicação
✅ **Auditoria:** Logs de uso das Edge Functions no Supabase
✅ **Cache Inteligente:** Reduz chamadas desnecessárias às Edge Functions
✅ **Conformidade:** Melhor alinhamento com práticas de segurança

## 📊 Cache de API Keys

Para melhorar a performance, as chaves de API são cacheadas por **1 hora** após a primeira busca.

**Limpar o cache manualmente:**

```typescript
import { clearApiKeyCache } from "@/services/envConfigService";
clearApiKeyCache();
```

## 🔄 Compatibilidade

- ✅ Código existente que usa `correctTextWithAI` continua funcionando
- ✅ Componentes que usam Edge Functions diretamente não foram afetados
- ⚠️ Código que usava `getGoogleMapsApiKey()` agora precisa usar `await`

## 📝 Notas Importantes

1. **Email Config** ainda usa variáveis de ambiente do Dokploy (VITE*EMAIL*\*)
2. **Supabase URL e Key** continuam como variáveis de ambiente (obrigatórias)
3. As Edge Functions já existiam e estavam configuradas corretamente
4. Apenas a forma de acessar as chaves foi modificada no frontend

## 🎉 Conclusão

A migração foi concluída com sucesso! Agora todas as chaves sensíveis de API estão protegidas nos Supabase Secrets e são acessadas apenas através de Edge Functions seguras.
