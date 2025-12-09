import { useEffect, useState } from "react";
import { Button, Chip, HeroUIProvider, Image } from "@heroui/react";
import { authenticate, deAuthenticate, getSession, isAuthed, userSession, waitForProvider } from "./lib/auth";
import { paymemtRequest } from "./lib/tx";
import { sendRequest } from "./lib/send";

function App() {
  const [authConfig, setAuthConfig] = useState({ request: '', providerKey: '' });
  const [authState, setAuthState] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [imageSrc] = useState('/ue5-loading.gif');
  const [isLoading, setIsLoading] = useState(true);
  const [providerReady, setProviderReady] = useState(false);

  useEffect(() => {
    if (!isLoading) return;
    setIsLoading(false);
  }, [isLoading]);

  // Wait for provider to be available
  useEffect(() => {
    let mounted = true;

    const checkProvider = async () => {
      // Wait for provider with a timeout
      const providerAvailable = await waitForProvider(3000, 100);

      if (mounted) {
        setProviderReady(providerAvailable);
        if (providerAvailable) {
          console.log('Provider is available:', {
            StacksProvider: !!window.StacksProvider,
            LeatherProvider: !!window.LeatherProvider,
            XverseProvider: !!window.XverseProviders?.StacksProvider,
            AsignaProvider: !!window.AsignaProvider
          });
        } else {
          console.warn('No wallet provider detected after timeout');
        }
      }
    };

    checkProvider();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // Don't proceed if provider is not ready or still loading
    if (isLoading || !providerReady) return;

    const params = new URLSearchParams(window.location.search);
    const payLoad = params.get("payload");

    console.log('payLoad', { payLoad });
    if (!payLoad) return;

    const rePayload = JSON.parse(decodeURIComponent(payLoad));
    console.log('payLoad', { payLoad, rePayload });

    if (typeof rePayload !== 'object' || rePayload === null) {
      // window.close();
      return;
    }

    const { request } = rePayload;
    switch (request) {
      case "connect":
        console.log({ userData: userSession, isAuthed });
        authenticate();
        break;
      case "disconnect":
        deAuthenticate();
        break;
      case "play-to-earn":
        paymemtRequest(rePayload);
        break;
      case "send":
        console.log('rePayload, whats good', { rePayload });
        sendRequest(rePayload);
        break;
      default:
        break;
    }
    setAuthState(isAuthed);
  }, [userSession, isLoading, providerReady]);

  return (
    <HeroUIProvider className="h-full w-full flex flex-col items-center justify-center bg-blue-500">

      <div className="flex-1 w-full flex items-center justify-center" style={{ backgroundColor: 'rgba(45, 163, 16, 0.5)' }}>
        <img
          src={imageSrc}
          width="100%"
          alt="Loading animation"
        />
      </div>

      {isDefault && (
        <Chip color={isAuthed ? 'success' : 'warning'} variant="dot" style={{ borderColor: '#5166f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Button variant="null" onPress={isAuthed ? deAuthenticate : authenticate} size="sm" style={{ color: "#ff7a00" }}>
            {isAuthed ? "Disconnect" : "Connect"}
          </Button>
        </Chip>
      )}
    </HeroUIProvider>
  );
}

export default App;