import "./App.css";
import { useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser } from "@web3auth/modal/react";
// IMP START - Blockchain Calls  
import { useAccount } from "wagmi";
import { ChatInterface } from "@/components/chat-interface"
// import { SendTransaction } from "./components/sendTransaction";
// import { Balance } from "./components/getBalance";
// import { SwitchChain } from "./components/switchNetwork";
// IMP END - Blockchain Calls

function App() {
  // IMP START - Login  
  const { connect, isConnected, connectorName, loading: connectLoading, error: connectError } = useWeb3AuthConnect();
  // IMP END - Login
  // IMP START - Logout
  const { disconnect, loading: disconnectLoading, error: disconnectError } = useWeb3AuthDisconnect();
  // IMP END - Logout
  const { userInfo } = useWeb3AuthUser();
  // IMP START - Blockchain Calls
  const { address } = useAccount();
  // IMP END - Blockchain Calls

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
      console.log(...args);
    }
  }
  const user = {
        id: Math.random().toString(36).substr(2, 9),
        username: 'exampleUser',
        email: 'example@gmail.com',
        isOnline: true,
        lastSeen: new Date(),
      }

  if (isConnected) {
    return <ChatInterface user={user} onLogout={() => {}} />
  }

  const unloggedInView = (
    <div className="grid">
      <button onClick={() => connect()} className="card">
        Login
      </button>
      {connectLoading && <div className="loading">Connecting...</div>}
      {connectError && <div className="error">{connectError.message}</div>}
    </div>
  );

  return (
    <div className="container">
      <h1 className="title">
        Quick Start
      </h1>

      {unloggedInView}
      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>
    </div>
  );
}

export default App;
