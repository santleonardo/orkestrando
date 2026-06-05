'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Settings, Building2, Users, Bell, Shield, Save, Upload, Camera } from 'lucide-react'
import { getInitials } from '@/lib/utils/format'
import { useAuth } from '@/lib/hooks/use-auth'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function SettingsPage() {
  const { profile, role, user } = useAuth()
  const [activeTab, setActiveTab] = useState('organization')

  const [orgForm, setOrgForm] = useState({
    name: 'Instituto ORKESTRANDO', slug: 'orkestrando',
    address: 'Rua da Educação, 123', city: 'São Paulo',
    state: 'SP', phone: '(11) 3456-7890', email: 'contato@orkestrando.edu.br',
    website: 'www.orkestrando.edu.br',
  })

  const [notifications, setNotifications] = useState({
    newEnrollment: true, scheduleChange: true, lowAttendance: true,
    newMaterial: false, newMessage: true, emailNotifications: true,
    pushNotifications: false, dailyDigest: true,
  })

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  })

  const handleSaveOrg = () => toast.success('Dados da organização salvos!')
  const handleSaveNotifications = () => toast.success('Preferências de notificação salvas!')
  const handleChangePassword = () => {
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error('Senhas não conferem!')
      return
    }
    toast.success('Senha alterada com sucesso!')
    setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações da plataforma"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Configurações' }]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="organization" className="text-xs sm:text-sm">
            <Building2 className="h-4 w-4 mr-1.5 hidden sm:inline" /> Organização
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs sm:text-sm">
            <Users className="h-4 w-4 mr-1.5 hidden sm:inline" /> Usuários
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm">
            <Bell className="h-4 w-4 mr-1.5 hidden sm:inline" /> Notificações
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs sm:text-sm">
            <Shield className="h-4 w-4 mr-1.5 hidden sm:inline" /> Segurança
          </TabsTrigger>
        </TabsList>

        {/* Organization Tab */}
        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados da Organização</CardTitle>
              <CardDescription>Atualize as informações da instituição</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">O</AvatarFallback>
                  </Avatar>
                  <Button size="icon" variant="outline" className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full">
                    <Camera className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div>
                  <h3 className="font-semibold">{orgForm.name}</h3>
                  <p className="text-sm text-muted-foreground">Logo e identidade visual</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Nome da Instituição</Label>
                  <Input value={orgForm.name} onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })} />
                </div>
                <div className="space-y-2"><Label>Endereço</Label><Input value={orgForm.address} onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })} /></div>
                <div className="space-y-2"><Label>Cidade</Label><Input value={orgForm.city} onChange={(e) => setOrgForm({ ...orgForm, city: e.target.value })} /></div>
                <div className="space-y-2"><Label>Estado</Label><Input value={orgForm.state} onChange={(e) => setOrgForm({ ...orgForm, state: e.target.value })} /></div>
                <div className="space-y-2"><Label>Telefone</Label><Input value={orgForm.phone} onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })} /></div>
                <div className="space-y-2"><Label>E-mail</Label><Input type="email" value={orgForm.email} onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })} /></div>
                <div className="space-y-2"><Label>Website</Label><Input value={orgForm.website} onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })} /></div>
                <div className="space-y-2"><Label>Slug</Label><Input value={orgForm.slug} onChange={(e) => setOrgForm({ ...orgForm, slug: e.target.value })} /></div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveOrg}><Save className="mr-2 h-4 w-4" /> Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gerenciamento de Usuários</CardTitle>
              <CardDescription>Visualize e gerencie os usuários da plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm bg-primary/10 text-primary font-medium">
                        {profile ? getInitials(profile.fullName) : 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{profile?.fullName || 'Administrador'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email || 'admin@orkestrando.edu.br'}</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-xs">Coordenador</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10"><AvatarFallback className="text-sm">CS</AvatarFallback></Avatar>
                    <div><p className="text-sm font-medium">Carlos Silva</p><p className="text-xs text-muted-foreground">carlos@escola.com</p></div>
                  </div>
                  <Badge variant="secondary" className="text-xs">Professor</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10"><AvatarFallback className="text-sm">MS</AvatarFallback></Avatar>
                    <div><p className="text-sm font-medium">Maria Santos</p><p className="text-xs text-muted-foreground">maria@escola.com</p></div>
                  </div>
                  <Badge variant="secondary" className="text-xs">Professor</Badge>
                </div>
                <p className="text-xs text-muted-foreground text-center pt-2">Gerenciamento completo de usuários disponível via página de Professores e Alunos.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preferências de Notificação</CardTitle>
              <CardDescription>Configure quais notificações deseja receber</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm font-semibold">Eventos Acadêmicos</p>
                {[
                  { key: 'newEnrollment' as const, label: 'Nova matrícula', desc: 'Quando um aluno se matricula' },
                  { key: 'scheduleChange' as const, label: 'Alteração de agenda', desc: 'Quando uma aula é remarcada' },
                  { key: 'lowAttendance' as const, label: 'Baixa frequência', desc: 'Alerta de baixa presença' },
                  { key: 'newMaterial' as const, label: 'Novo material', desc: 'Quando um material é publicado' },
                  { key: 'newMessage' as const, label: 'Nova mensagem', desc: 'Quando recebe uma mensagem' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch checked={notifications[item.key]} onCheckedChange={(c) => setNotifications({ ...notifications, [item.key]: c === true })} />
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <p className="text-sm font-semibold">Canais de Notificação</p>
                {[
                  { key: 'emailNotifications' as const, label: 'Notificações por e-mail', desc: 'Receber notificações no e-mail' },
                  { key: 'pushNotifications' as const, label: 'Notificações push', desc: 'Receber notificações no navegador' },
                  { key: 'dailyDigest' as const, label: 'Resumo diário', desc: 'Receber um resumo das atividades do dia' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch checked={notifications[item.key]} onCheckedChange={(c) => setNotifications({ ...notifications, [item.key]: c === true })} />
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveNotifications}><Save className="mr-2 h-4 w-4" /> Salvar Preferências</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Alterar Senha</CardTitle>
                <CardDescription>Atualize sua senha de acesso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Senha Atual</Label>
                  <Input type="password" value={securityForm.currentPassword} onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })} placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>Nova Senha</Label>
                  <Input type="password" value={securityForm.newPassword} onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })} placeholder="Mínimo 8 caracteres" />
                </div>
                <div className="space-y-2">
                  <Label>Confirmar Nova Senha</Label>
                  <Input type="password" value={securityForm.confirmPassword} onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })} placeholder="Repita a nova senha" />
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={handleChangePassword}><Shield className="mr-2 h-4 w-4" /> Alterar Senha</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Autenticação em Dois Fatores (2FA)</CardTitle>
                <CardDescription>Adicione uma camada extra de segurança</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Autenticação em Dois Fatores</p>
                    <p className="text-xs text-muted-foreground">Proteja sua conta com verificação adicional</p>
                  </div>
                  <Switch disabled />
                </div>
                <p className="text-xs text-muted-foreground mt-4 bg-muted/50 p-3 rounded-lg">
                  A autenticação em dois fatores estará disponível em breve.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
