import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { acceptInvitation, getPendingInvitation, type PendingInvitation } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const AcceptInvite = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [invitation, setInvitation] = useState<PendingInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getPendingInvitation();
        setInvitation(data ?? null);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Falha ao carregar convite');
        setInvitation(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await acceptInvitation();
      await refreshUser();
      toast.success('Convite aceite com sucesso');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao aceitar convite');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>Aceitar convite</CardTitle>
          <CardDescription>Finalize o acesso a sua conta SaaS.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">A carregar convite...</p>
          ) : !invitation ? (
            <p className="text-sm text-muted-foreground">Nenhum convite pendente encontrado.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm">
                Foi convidado para a empresa <strong>{invitation.account?.name ?? 'Empresa'}</strong> como{' '}
                <strong>{invitation.role}</strong>.
              </p>
              <p className="text-sm text-muted-foreground">Clique em aceitar para continuar.</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button disabled={!invitation || accepting} onClick={handleAccept}>
              {accepting ? 'A aceitar...' : 'Aceitar convite'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvite;
