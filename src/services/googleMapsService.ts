/**
 * Serviço para gerenciar a chave da API do Google Maps
 * 
 * IMPORTANTE: As chaves agora são gerenciadas através de Edge Functions do Supabase
 * As chaves são armazenadas de forma segura nos Supabase Secrets e nunca expostas no frontend
 */

import { getGoogleMapsApiKey, hasGoogleMapsKey as checkGoogleMapsKey } from './envConfigService';

/**
 * Obtém a chave da API do Google Maps através da Edge Function
 * @returns A chave da API ou null se não configurada
 */
export async function loadGoogleMapsKey(): Promise<string | null> {
  return await getGoogleMapsApiKey();
}

/**
 * Verifica se a chave do Google Maps está configurada
 * @returns true se a chave está configurada
 */
export async function hasGoogleMapsKey(): Promise<boolean> {
  return await checkGoogleMapsKey();
}

/**
 * Função mantida para compatibilidade com código existente
 * Agora apenas informa que as chaves devem ser configuradas nos Supabase Secrets
 * @deprecated Use Supabase Secrets para configurar GOOGLE_MAPS_API_KEY
 */
export async function saveGoogleMapsKey(apiKey: string): Promise<boolean> {
  console.warn('⚠️ AVISO: As chaves de API agora devem ser configuradas nos Supabase Secrets.');
  console.warn('⚠️ Configure GOOGLE_MAPS_API_KEY no painel do Supabase.');
  console.warn('⚠️ Esta função não salva mais chaves por questões de segurança.');
  return false;
}
