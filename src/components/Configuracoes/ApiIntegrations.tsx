import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle2, Lock, Mail, BrainCircuit, MapPin, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getConfigStatus } from '@/services/envConfigService';

interface ConfigStatusState {
  googleMaps: { configured: boolean; message: string };
  openai: { configured: boolean; message: string };
  email: { configured: boolean; message: string };
}

const ApiIntegrations = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [configStatus, setConfigStatus] = useState<ConfigStatusState>({
    googleMaps: { configured: false, message: '' },
    openai: { configured: false, message: '' },
    email: { configured: false, message: '' }
  });

  // Carregar status das configurações
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const status = await getConfigStatus();
        setConfigStatus(status);
      } catch (error) {
        console.error('Erro ao carregar status das configurações:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatus();
  }, []);

  const openDokployDocs = () => {
    window.open('https://docs.dokploy.com/docs/core/domain#environment-variables', '_blank');
  };

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integrações com APIs</h1>
          <p className="text-muted-foreground mt-1">
            Configure as chaves de API de forma segura através dos Supabase Secrets
          </p>
        </div>
        <Lock className="h-6 w-6 text-gcm-600" />
      </div>

      {/* Alert informativo */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Por questões de segurança, as chaves de API do Google Maps e OpenAI 
          são gerenciadas através de <strong>Supabase Secrets</strong> e acessadas via Edge Functions. 
          As chaves nunca são expostas no frontend. Esta interface apenas exibe o status das configurações.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="google_maps" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="google_maps">Google Maps</TabsTrigger>
          <TabsTrigger value="openai">OpenAI</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        {/* Google Maps */}
        <TabsContent value="google_maps">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Google Maps API
              </CardTitle>
              <CardDescription>
                Necessária para funcionalidades de mapa e geolocalização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                {configStatus.googleMaps.configured ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
                <div className="flex-1">
                  <p className="font-medium">Status da Configuração</p>
                  <p className="text-sm text-muted-foreground">{configStatus.googleMaps.message}</p>
                </div>
              </div>

              {!configStatus.googleMaps.configured && (
                <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    Como configurar no Supabase:
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <li>Acesse o painel do Supabase</li>
                    <li>Navegue até o projeto gmc-Ribeiradopombal</li>
                    <li>Vá em "Project Settings" → "Edge Functions" → "Secrets"</li>
                    <li>Adicione o secret: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">GOOGLE_MAPS_API_KEY</code></li>
                    <li>Cole sua chave da API do Google Maps</li>
                    <li>Salve - a Edge Function já está configurada para usar este secret</li>
                  </ol>
                  <div className="pt-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Obter chave no Google Cloud
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://supabase.com/dashboard/project/rdkugzjrvlvcorfsbdaz/settings/functions', '_blank')}
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Configurar no Supabase
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* OpenAI */}
        <TabsContent value="openai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5" />
                OpenAI API
              </CardTitle>
              <CardDescription>
                Necessária para recursos de inteligência artificial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                {configStatus.openai.configured ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
                <div className="flex-1">
                  <p className="font-medium">Status da Configuração</p>
                  <p className="text-sm text-muted-foreground">{configStatus.openai.message}</p>
                </div>
              </div>

              {!configStatus.openai.configured && (
                <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    Como configurar no Supabase:
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <li>Acesse o painel do Supabase</li>
                    <li>Navegue até o projeto gmc-Ribeiradopombal</li>
                    <li>Vá em "Project Settings" → "Edge Functions" → "Secrets"</li>
                    <li>Adicione o secret: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">OPENAI_API_KEY</code></li>
                    <li>Cole sua chave da API OpenAI</li>
                    <li>Salve - a Edge Function já está configurada para usar este secret</li>
                  </ol>
                  <div className="pt-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://platform.openai.com/api-keys', '_blank')}
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Obter chave na OpenAI
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://supabase.com/dashboard/project/rdkugzjrvlvcorfsbdaz/settings/functions', '_blank')}
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Configurar no Supabase
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configuração de Email
              </CardTitle>
              <CardDescription>
                Necessária para envio de notificações por email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                {configStatus.email.configured ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
                <div className="flex-1">
                  <p className="font-medium">Status da Configuração</p>
                  <p className="text-sm text-muted-foreground">{configStatus.email.message}</p>
                </div>
              </div>

              {!configStatus.email.configured && (
                <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    Como configurar no Dokploy:
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    Adicione as seguintes variáveis de ambiente no Dokploy:
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">
                      <code>VITE_EMAIL_HOST</code> - Servidor SMTP (ex: smtp.gmail.com)
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">
                      <code>VITE_EMAIL_PORT</code> - Porta SMTP (ex: 587)
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">
                      <code>VITE_EMAIL_USER</code> - Usuário/email de autenticação
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">
                      <code>VITE_EMAIL_PASSWORD</code> - Senha do email
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">
                      <code>VITE_EMAIL_FROM</code> - Email remetente (opcional)
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">
                      <code>VITE_EMAIL_FROM_NAME</code> - Nome do remetente (opcional)
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botão para documentação */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Precisa de ajuda?</h3>
              <p className="text-sm text-muted-foreground">
                Consulte a documentação do Dokploy sobre variáveis de ambiente
              </p>
            </div>
            <Button onClick={openDokployDocs} variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Documentação Dokploy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiIntegrations;
