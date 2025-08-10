import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, LogOut, Wallet, Key, Hash } from 'lucide-react';

export function UserProfile() {
  const { user, receiverHash, walletAddress, logout } = useAuth();
  const [copied, setCopied] = React.useState<string | null>(null);

  if (!user) return null;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Card  className="w-full max-w-md border-0">
      <CardHeader className="text-center pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Profile</span>
          <Button variant="default" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <h3 className="font-semibold text-lg">{user.username}</h3>
          <p className="text-sm text-gray-600">{user.email}</p>
          <Badge variant="secondary" className="mt-2">
            {user.isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>

        <div className="space-y-3">
          {walletAddress && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <Wallet className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-sm font-medium">Wallet Address</span>
              </div>
              <div className="flex items-center justify-between">
                <code className="text-xs bg-white px-2 py-1 rounded border">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(walletAddress, 'wallet')}
                >
                  {copied === 'wallet' ? 
                    <Check className="h-4 w-4 text-green-600" /> : 
                    <Copy className="h-4 w-4" />
                  }
                </Button>
              </div>
            </div>
          )}

          {receiverHash && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <Hash className="h-4 w-4 mr-2 text-purple-600" />
                <span className="text-sm font-medium">Receiver Hash</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <code className="text-xs bg-white px-2 py-1 rounded border break-all">
                  {receiverHash}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(receiverHash, 'hash')}
                >
                  {copied === 'hash' ? 
                    <Check className="h-4 w-4 text-green-600" /> : 
                    <Copy className="h-4 w-4" />
                  }
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Share this with contacts to receive messages
              </p>
            </div>
          )}
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            Last seen: {user.lastSeen.toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
