/**
 * Serviço de Configuração de Ambiente - Versão Segura com Edge Functions
 * 
 * Este serviço gerencia as chaves de API e configurações sensíveis
 * através de Edge Functions do Supabase, garantindo que as chaves
 * nunca sejam expostas no frontend.
 */

import { supabase } from '@/integrations/supabase/client';

// Cache para as chaves de API (válido por 1 hora)
const API_KEY_CACHE_DURATION = 60 * 60 * 1000; // 1 hora em ms

interface CachedKey {
  value: string;
  timestamp: number;
}

const cache: {
  googleMaps?: CachedKey;
  openai?: CachedKey;
} = {};

// ============================================
// GOOGLE MAPS API
// ============================================

/**
 * Obtém a chave da API do Google Maps através da Edge Function
 * @returns A chave da API ou null se não configurada
 */
export const getGoogleMapsApiKey = async (): Promise<string | null> => {
  try {
    // Verifica cache
    if (cache.googleMaps && Date.now() - cache.googleMaps.timestamp < API_KEY_CACHE_DURATION) {
      return cache.googleMaps.value;
    }

    // Busca da Edge Function
    const { data, error } = await supabase.functions.invoke('get-maps-api-key');

    if (error) {
      console.error('❌ Erro ao buscar chave do Google Maps:', error);
      return null;
    }

    if (!data?.apiKey) {
      console.warn('⚠️ Google Maps API Key não configurada no Supabase Secrets.');
      return null;
    }

    // Atualiza cache
    cache.googleMaps = {
      value: data.apiKey,
      timestamp: Date.now()
    };

    return data.apiKey;
  } catch (error) {
    console.error('❌ Erro ao obter chave do Google Maps:', error);
    return null;
  }
};

/**
 * Verifica se a chave do Google Maps está configurada
 * @returns true se a chave está configurada
 */
export const hasGoogleMapsKey = async (): Promise<boolean> => {
  const key = await getGoogleMapsApiKey();
  return key !== null;
};

// ============================================
// OPENAI API
// ============================================

/**
 * Chama a Edge Function de correção de texto (que usa a API OpenAI internamente)
 * @param text Texto a ser corrigido
 * @returns Texto corrigido ou null em caso de erro
 */
export const correctTextWithAI = async (text: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('text-correction', {
      body: { text }
    });

    if (error) {
      console.error('❌ Erro ao corrigir texto:', error);
      return null;
    }

    return data?.correctedText || null;
  } catch (error) {
    console.error('❌ Erro ao chamar correção de texto:', error);
    return null;
  }
};

/**
 * Verifica se a API OpenAI está configurada (testando a Edge Function)
 * @returns true se a API está configurada
 */
export const hasOpenAIKey = async (): Promise<boolean> => {
  try {
    // Testa com um texto curto
    const result = await correctTextWithAI('teste');
    return result !== null;
  } catch {
    return false;
  }
};

// ============================================
// EMAIL CONFIGURATION
// ============================================

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  fromName: string;
  enabled: boolean;
}

/**
 * Obtém a configuração de email das variáveis de ambiente
 * @returns Configuração de email ou null se não configurada
 */
export const getEmailConfig = (): EmailConfig | null => {
  const host = import.meta.env.VITE_EMAIL_HOST;
  const port = import.meta.env.VITE_EMAIL_PORT;
  const user = import.meta.env.VITE_EMAIL_USER;
  const password = import.meta.env.VITE_EMAIL_PASSWORD;
  const from = import.meta.env.VITE_EMAIL_FROM;
  const fromName = import.meta.env.VITE_EMAIL_FROM_NAME;

  // Verifica se as configurações mínimas estão presentes
  if (!host || !user || !password) {
    console.warn('⚠️ Configuração de email incompleta. Configure as variáveis VITE_EMAIL_* no Dokploy.');
    return null;
  }

  return {
    host,
    port: parseInt(port || '587', 10),
    user,
    password,
    from: from || user,
    fromName: fromName || 'GMC Sentinela',
    enabled: true
  };
};

/**
 * Verifica se o email está configurado
 * @returns true se o email está configurado
 */
export const hasEmailConfig = (): boolean => {
  return getEmailConfig() !== null;
};

// ============================================
// STATUS DE CONFIGURAÇÃO
// ============================================

export interface ConfigStatus {
  googleMaps: {
    configured: boolean;
    message: string;
  };
  openai: {
    configured: boolean;
    message: string;
  };
  email: {
    configured: boolean;
    message: string;
  };
}

/**
 * Obtém o status de todas as configurações
 * @returns Status de configuração de todas as integrações
 */
export const getConfigStatus = async (): Promise<ConfigStatus> => {
  const googleMapsConfigured = await hasGoogleMapsKey();
  const openaiConfigured = await hasOpenAIKey();
  const emailConfigured = hasEmailConfig();

  return {
    googleMaps: {
      configured: googleMapsConfigured,
      message: googleMapsConfigured 
        ? '✅ Configurada via Edge Function' 
        : '⚠️ Não configurada - Configure GOOGLE_MAPS_API_KEY nos Supabase Secrets'
    },
    openai: {
      configured: openaiConfigured,
      message: openaiConfigured 
        ? '✅ Configurada via Edge Function' 
        : '⚠️ Não configurada - Configure OPENAI_API_KEY nos Supabase Secrets'
    },
    email: {
      configured: emailConfigured,
      message: emailConfigured 
        ? '✅ Configurado' 
        : '⚠️ Não configurado - Configure as variáveis VITE_EMAIL_* no Dokploy'
    }
  };
};

// ============================================
// VALIDAÇÃO DE AMBIENTE
// ============================================

/**
 * Valida se todas as configurações obrigatórias estão presentes
 * @returns true se todas as configurações obrigatórias estão presentes
 */
export const validateRequiredConfig = (): boolean => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Configurações obrigatórias faltando! Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Dokploy.');
    return false;
  }

  return true;
};

/**
 * Exibe um relatório de configuração no console
 */
export const logConfigReport = async (): Promise<void> => {
  console.log('📋 Relatório de Configuração GMC Sentinela');
  console.log('==========================================');
  
  const status = await getConfigStatus();
  
  console.log('🗺️  Google Maps:', status.googleMaps.message);
  console.log('🤖 OpenAI:', status.openai.message);
  console.log('📧 Email:', status.email.message);
  
  console.log('==========================================');
  
  if (!validateRequiredConfig()) {
    console.error('❌ ERRO: Configurações obrigatórias faltando!');
  } else {
    console.log('✅ Configurações obrigatórias OK');
  }
};

/**
 * Limpa o cache de chaves de API
 */
export const clearApiKeyCache = (): void => {
  delete cache.googleMaps;
  delete cache.openai;
  console.log('🗑️ Cache de chaves de API limpo');
};
