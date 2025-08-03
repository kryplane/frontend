import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWeb3AuthConnect } from '@web3auth/modal/react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, Key, Copy, Check, Loader2 } from 'lucide-react';

interface LoginComponentProps {
  onSuccess?: (receiverHash: string) => void;
}

export function LoginComponent({ onSuccess }: LoginComponentProps) {
  const [secretInput, setSecretInput] = useState('');
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const { 
    login, 
    loading, 
    error, 
    isWalletConnected, 
    walletAddress 
  } = useAuth();
  
  const { connect, isConnected, loading: connectLoading } = useWeb3AuthConnect();

  const handleWalletLogin = async () => {
    try {
      if (!isWalletConnected) {
        await connect();
        return;
      }
      
      await login({ type: 'wallet' });
      toast({
        title: "Login Successful!",
        description: "Welcome to ShadowChat. Your receiver hash has been generated.",
      });
      onSuccess?.(walletAddress || '');
    } catch (err) {
      console.error('Wallet login failed:', err);
      toast({
        title: "Login Failed",
        description: err instanceof Error ? err.message : "Failed to login with wallet",
        variant: "destructive",
      });
    }
  };

  const handleSecretLogin = async () => {
    try {
      const result = await login({ 
        type: 'secret', 
        data: secretInput || undefined 
      });
      
      toast({
        title: "Login Successful!",
        description: "Welcome back to ShadowChat.",
      });
      
      if (result && 'secret' in result) {
        setGeneratedSecret(result.secret);
        onSuccess?.(result.receiverHash);
      }
    } catch (err) {
      console.error('Secret login failed:', err);
      toast({
        title: "Login Failed",
        description: err instanceof Error ? err.message : "Failed to login with secret",
        variant: "destructive",
      });
    }
  };

  const handleGenerateSecret = async () => {
    try {
      const result = await login({ type: 'secret' });
      if (result && 'secret' in result) {
        setGeneratedSecret(result.secret);
        toast({
          title: "Account Created!",
          description: "Your secret code has been generated. Please save it safely.",
        });
        onSuccess?.(result.receiverHash);
      }
    } catch (err) {
      console.error('Generate secret failed:', err);
      toast({
        title: "Generation Failed",
        description: err instanceof Error ? err.message : "Failed to generate secret",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Secret code copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to ShadowChat</CardTitle>
          <CardDescription>
            Choose your login method to start secure messaging
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {generatedSecret && (
            <Alert className="mb-4">
              <Key className="h-4 w-4" />
              <AlertDescription className="break-all">
                <div className="mb-2">
                  <strong>Your Secret Code (Save this!):</strong>
                </div>
                <div className="bg-gray-100 p-2 rounded text-sm font-mono flex items-center justify-between">
                  <span className="truncate mr-2">{generatedSecret}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generatedSecret)}
                    className="flex-shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Save this secret code safely. You'll need it to access your account later.
                </p>
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="wallet" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="secret">Secret Code</TabsTrigger>
            </TabsList>
            
            <TabsContent value="wallet" className="space-y-4">
              <div className="text-center">
                <Wallet className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <p className="text-sm text-gray-600 mb-4">
                  Connect your wallet and sign a message to generate your unique receiver hash.
                </p>
                
                {isWalletConnected && walletAddress && (
                  <div className="mb-4 p-2 bg-green-50 rounded">
                    <p className="text-sm text-green-700">
                      Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </p>
                  </div>
                )}
                
                <Button 
                  onClick={handleWalletLogin}
                  disabled={loading || connectLoading}
                  className="w-full"
                >
                  {connectLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {connectLoading ? 'Connecting...' : 
                   loading ? 'Signing...' : 
                   isWalletConnected ? 'Sign & Login' : 'Connect Wallet'}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="secret" className="space-y-4">
              <div className="text-center">
                <Key className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <p className="text-sm text-gray-600 mb-4">
                  Use an existing secret code or generate a new one.
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="secret">Existing Secret Code (optional)</Label>
                  <Input
                    id="secret"
                    type="password"
                    placeholder="Enter your secret code..."
                    value={secretInput}
                    onChange={(e) => setSecretInput(e.target.value)}
                    disabled={loading}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={handleSecretLogin}
                    disabled={loading || !secretInput.trim()}
                    className="w-full"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                  
                  <Button
                    onClick={handleGenerateSecret}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? 'Generating...' : 'Generate New'}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Your receiver hash ensures secure, private messaging
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
