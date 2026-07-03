export function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (const charCode of bytes) {
    str += String.fromCharCode(charCode);
  }
  const base64String = btoa(str);
  return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function base64urlToBuffer(base64url: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

export async function registerLocalPasskey(): Promise<string> {
  if (!window.PublicKeyCredential) {
    throw new Error('WebAuthn is not supported in this browser.');
  }

  const userId = crypto.getRandomValues(new Uint8Array(16));
  const challenge = crypto.getRandomValues(new Uint8Array(32));

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: {
        name: 'Chad Tutor Local Vault',
      },
      user: {
        id: userId,
        name: 'local-vault-user',
        displayName: 'Local Vault User',
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        userVerification: 'required',
        authenticatorAttachment: 'platform', // Force local device authenticator (e.g., Windows Hello)
      },
      timeout: 60000,
    },
  });

  if (!credential) {
    throw new Error('Registration failed.');
  }

  return bufferToBase64url((credential as PublicKeyCredential).rawId);
}

export async function verifyLocalPasskey(credentialIdBase64: string): Promise<boolean> {
  if (!window.PublicKeyCredential) {
    throw new Error('WebAuthn is not supported in this browser.');
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const credentialId = base64urlToBuffer(credentialIdBase64);

  try {
    const credential = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [
          {
            id: credentialId,
            type: 'public-key',
          },
        ],
        userVerification: 'required',
        timeout: 60000,
      },
    });

    return !!credential;
  } catch (error) {
    console.error('Passkey verification failed:', error);
    return false;
  }
}
